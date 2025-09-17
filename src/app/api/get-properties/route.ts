import { Prisma } from "@prisma/client";
import { promises } from "dns";
import { NextRequest } from "next/server";
import { makeRange, toNum } from "../../../backend/use-cases/helpers";
import { prisma } from "../../../backend/database/prisma";

export type Weather = {
    temperature: number | null;
    humidity: number | null;
    code: number | null;
};

export function buildPropertyWhere(req: NextRequest) {
    const and: Prisma.PropertyWhereInput[] = [];

    const searchParams = req.nextUrl.searchParams;

    const searchText = searchParams.get("searchText");
    const temp = searchParams.get("temp");
    const tempMin = searchParams.get("tempMin");
    const tempMax = searchParams.get("tempMax");
    const humidity = searchParams.get("humidity");
    const humidityMin = searchParams.get("humidityMin");
    const humidityMax = searchParams.get("humidityMax");
    const wmoCode = searchParams.get("wmoCode");

    console.log("searchParams", searchParams.toString());

    if (typeof searchText === "string" && !!searchText.trim().length) {
        const query = searchText.trim();
        console.log("query", searchText);
        and.push({
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { city: { contains: query, mode: "insensitive" } },
                { state: { contains: query, mode: "insensitive" } },
            ],
        });
    }
    // weatherSnapshot filter
    const snapshot: Prisma.PropertyWeatherSnapshotWhereInput = {};
    const tRange = makeRange(toNum(tempMin), toNum(tempMax), toNum(temp));
    const hRange = makeRange(
        toNum(humidityMin),
        toNum(humidityMax),
        toNum(humidity),
    );
    const wmo = toNum(wmoCode);

    if (tRange) snapshot.temperatureC = tRange;
    if (hRange) snapshot.humidityPct = hRange;
    if (wmo) snapshot.wmoCode = wmo;

    console.log("tRange", tRange, hRange, wmo);
    if (Object.keys(snapshot).length > 0)
        and.push({ weatherSnapshot: { is: snapshot } });
    if (and.length < 1) return undefined;
    console.log("the object", { AND: and });
    return { AND: and };
}

export async function GET(req: NextRequest) {
    try {
        const properties = await prisma.property.findMany({
            take: 12,
            where: buildPropertyWhere(req),
            include: { weatherSnapshot: true },
        });

        return new Response(JSON.stringify(properties), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching properties:", error);

        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
    return new Response("Warden Weather Test: OK");
}
