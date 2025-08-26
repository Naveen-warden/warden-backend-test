import {
    PrismaClient,
    Property,
    PropertyWeatherSnapshot,
} from "@prisma/client";
import { Weather } from "../use-cases/getProperties";
import { prisma } from "../database/prisma";
import { CronJob } from "cron";

const CRON_SCHEDULE = process.env.WEATHER_CRON_SCHEDULE || "0 */1 * * * *";

export enum PWConstents {
    TTL_MINUTES = 45,
    CONCURRENCY = 8,
    BATCH_SIZE = 200,
}
interface JobStatus {
    isRunning: boolean;
    lastRun: Date | null;
    nextRun: Date | null;
    lastDuration: number | null;
    totalPropertiesProcessed: number;
    successCount: number;
    errorCount: number;
    currentBatch: number;
    totalBatches: number;
}

let jobStatus: JobStatus = {
    isRunning: false,
    lastRun: null,
    nextRun: null,
    lastDuration: null,
    totalPropertiesProcessed: 0,
    successCount: 0,
    errorCount: 0,
    currentBatch: 0,
    totalBatches: 0,
};

type PropertyWithWeather = Property & {
    weatherSnapshot: PropertyWeatherSnapshot | null;
};

const getWeather = async (
    lat: number | null,
    lng: number | null,
): Promise<Weather> => {
    // If no coordinates, return empty weather payload
    if (lat == null || lng == null) {
        return { temperature: null, humidity: null, code: null };
    }

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${encodeURIComponent(lat)}` +
        `&longitude=${encodeURIComponent(lng)}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code` +
        `&timezone=auto`;

    const r = await fetch(url); // Node 18+: global fetch; no DOM-only types needed
    const j = (await r.json()) as {
        current?: {
            temperature_2m?: number;
            relative_humidity_2m?: number;
            weather_code?: number;
        };
    };

    return {
        temperature: j?.current?.temperature_2m ?? null,
        humidity: j?.current?.relative_humidity_2m ?? null,
        code: j?.current?.weather_code ?? null,
    };
};

const isStale = (w: PropertyWeatherSnapshot | null | undefined) => {
    if (!w?.updatedAt) return true;
    const ageInMs = Date.now() - new Date(w.updatedAt).getTime();
    return ageInMs > PWConstents.TTL_MINUTES * 60 * 1000;
};
const getGeoKey = (p: Pick<Property, "geohash5" | "lat" | "lng">) => {
    if (p.geohash5) return p.geohash5;
    const { lat, lng } = p;
    if (lat == null || lng == null) return "none";
    const round = (n: number) => Math.round(n * 5) / 5; //~22km range
    return `${round(lat)},${round(lng)}`;
};

const chunk = <T>(arr: T[], size: number): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
};

const processBatches = async (pw: PropertyWithWeather[]) => {
    const geoKeyMap = new Map<string, PropertyWithWeather[]>();
    for (const p of pw) {
        const key = getGeoKey(p);
        if (key == "none") continue;
        (geoKeyMap.get(key) ?? geoKeyMap.set(key, []).get(key)!).push(p);
    }
    const keys = Array.from(geoKeyMap.keys());
    const batches = chunk(keys, PWConstents.CONCURRENCY);
    const prisma = new PrismaClient();
    for (const batch of batches) {
        await Promise.allSettled(
            batch.map(async (key) => {
                const group = geoKeyMap.get(key);
                const ref = group![0];
                try {
                    const w = await getWeather(ref.lat, ref.lng);
                    await prisma.$transaction(
                        async (tx) => {
                            await Promise.all(
                                group!.map(async (p) => {
                                    await tx.propertyWeatherSnapshot.upsert({
                                        where: { propertyId: p.id },
                                        create: {
                                            property: { connect: { id: p.id } },
                                            temperatureC: w.temperature,
                                            humidityPct: w.humidity,
                                            wmoCode: w.code,
                                        },
                                        update: {
                                            temperatureC: w.temperature,
                                            humidityPct: w.humidity,
                                            wmoCode: w.code,
                                        },
                                    });
                                }),
                            );
                            jobStatus.successCount += group!.length;
                            // a small break after a batch
                            await new Promise((resolve) =>
                                setTimeout(resolve, 1000),
                            );
                        },
                        { timeout: 20_000, maxWait: 20_000 }, // increase bot
                    );
                } catch (e) {
                    jobStatus.errorCount += group!.length;
                    console.error("[weather refresh] key failed:", key, e);
                }
            }),
        );
    }
};

// ====== Main Cron Job Function ======
async function weatherCronJob(): Promise<void> {
    if (jobStatus.isRunning) {
        console.warn(
            "⚠️ Weather cron job already running, skipping this execution",
        );
        return;
    }

    const startTime = Date.now();
    jobStatus.isRunning = true;
    jobStatus.lastRun = new Date();
    const prisma = new PrismaClient();
    try {
        console.log("🚀 Starting weather cron job...");

        const staleProperties = await prisma.property.findMany({
            include: { weatherSnapshot: true },
            where: {
                OR: [
                    { weatherSnapshot: null },
                    {
                        weatherSnapshot: {
                            updatedAt: {
                                lt: new Date(
                                    Date.now() -
                                        PWConstents.TTL_MINUTES * 60 * 1000,
                                ),
                            },
                        },
                    },
                ],

                lat: { not: null },
                lng: { not: null },
            },
            orderBy: { id: "asc" },
        });
        // await new Promise((resolve) =>
        //     setTimeout(() => {
        //         console.log("staleProperties", staleProperties);
        //         resolve;
        //     }, 1000),
        // );
        const batches = chunk<PropertyWithWeather>(
            staleProperties,
            PWConstents.BATCH_SIZE,
        );
        jobStatus.totalBatches = batches.length;
        jobStatus.totalPropertiesProcessed = staleProperties.length;

        // Process each batch
        for (let i = 0; i < batches.length; i++) {
            jobStatus.currentBatch = i + 1;
            await processBatches(batches[i]);

            // Small break between batches
            if (i < batches.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        const duration = Date.now() - startTime;
        jobStatus.lastDuration = duration;

        console.log(`🎉 Weather cron job completed!`);
        console.log(
            `📊 Results: ${jobStatus.successCount} success, ${jobStatus.errorCount} errors`,
        );
        console.log(`⏱️ Duration: ${Math.round(duration / 1000)}s`);
    } catch (error) {
        console.error("💥 Weather cron job failed:", error);
        jobStatus.errorCount += 1;
    } finally {
        jobStatus.isRunning = false;
        jobStatus.currentBatch = 0;
    }
}

// ====== Cron Job Setup ======
let cronJob: CronJob | null = null;

export function startWeatherCron(): void {
    if (cronJob) {
        console.warn("⚠️ Weather cron job already started");
        return;
    }

    console.log(`🕐 Starting weather cron job with schedule: ${CRON_SCHEDULE}`);

    cronJob = new CronJob(
        CRON_SCHEDULE,
        weatherCronJob,
        null,
        true,
        "America/New_York",
    );

    jobStatus.nextRun = cronJob.nextDate().toJSDate();
    console.log(`✅ Weather cron job started. Next run: ${jobStatus.nextRun}`);
}

export function stopWeatherCron(): void {
    if (cronJob) {
        cronJob.stop();
        cronJob = null;
        jobStatus.nextRun = null;
        console.log("🛑 Weather cron job stopped");
    }
}

// ====== Status API ======
export function getWeatherCronStatus(): JobStatus & {
    schedule: string;
    enabled: boolean;
} {
    return {
        ...jobStatus,
        nextRun: cronJob?.nextDate()?.toJSDate() || null,
        schedule: CRON_SCHEDULE,
        enabled: false,
    };
}
