"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRange = exports.toNum = void 0;
exports.snapshotToWeather = snapshotToWeather;
function snapshotToWeather(s) {
    return {
        temperature: s?.temperatureC ?? null,
        humidity: s?.humidityPct ?? null,
        code: s?.wmoCode ?? null,
    };
}
const toNum = (v) => {
    let num = Number(v);
    return Number.isFinite(num) ? num : undefined;
};
exports.toNum = toNum;
const makeRange = (min, max, equal, tol = 0.5) => {
    if (min !== undefined || max !== undefined) {
        const r = {};
        if (min !== undefined)
            r.gte = min;
        if (max !== undefined)
            r.lte = max;
        return r;
    }
    if (equal !== undefined)
        return {
            gte: equal - tol,
            lte: equal + tol,
        };
    return undefined;
};
exports.makeRange = makeRange;
