import { PropertyWeatherSnapshot } from "@prisma/client";
import { Weather } from "./getProperties";

export function snapshotToWeather(
    s: PropertyWeatherSnapshot | null | undefined,
): Weather {
    return {
        temperature: s?.temperatureC ?? null,
        humidity: s?.humidityPct ?? null,
        code: s?.wmoCode ?? null,
    };
}

export const toNum = (v: unknown): number | undefined => {
    let num = Number(v);
    return Number.isFinite(num) ? num : undefined;
};

export const makeRange = (
    min?: number,
    max?: number,
    equal?: number,
    tol: number = 0.5,
): { gte?: number; lte?: number } | undefined => {
    if (min !== undefined || max !== undefined) {
        const r: { gte?: number; lte?: number } = {};
        if (min !== undefined) r.gte = min;
        if (max !== undefined) r.lte = max;
        return r;
    }
    if (equal !== undefined)
        return {
            gte: equal - tol,
            lte: equal + tol,
        };
    return undefined;
};
