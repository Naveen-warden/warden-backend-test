import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import {
    Prisma,
    PrismaClient,
    Property,
    PropertyWeatherSnapshot,
} from "@prisma/client";
import { promises } from "dns";
import { makeRange, toNum } from "./helpers";

export type Weather = {
    temperature: number | null;
    humidity: number | null;
    code: number | null;
};

export function buildPropertyWhere(req: Request) {
    const and: Prisma.PropertyWhereInput[] = [];

    console.log("the object", { AND: and });
    const {
        searchText,
        temp,
        tempMin,
        tempMax,
        humidity,
        humidityMin,
        humidityMax,
        wmoCode,
    } = req.query as Record<string, unknown>;
    console.log({ humidity, humidityMax, humidityMin });
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

export const getProperties = async (req: Request, res: Response) => {
    try {
        const properties = await prisma.property.findMany({
            take: 12,
            where: buildPropertyWhere(req),
            include: { weatherSnapshot: true },
        });

        return res.json(properties);
    } catch (error) {
        console.error("Error fetching properties:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
