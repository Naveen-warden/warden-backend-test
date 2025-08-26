"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperties = void 0;
exports.buildPropertyWhere = buildPropertyWhere;
const prisma_1 = require("../database/prisma");
const helpers_1 = require("./helpers");
function buildPropertyWhere(req) {
    const and = [];
    console.log("the object", { AND: and });
    const { searchText, temp, tempMin, tempMax, humidity, humidityMin, humidityMax, wmoCode, } = req.query;
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
    const snapshot = {};
    const tRange = (0, helpers_1.makeRange)((0, helpers_1.toNum)(tempMin), (0, helpers_1.toNum)(tempMax), (0, helpers_1.toNum)(temp));
    const hRange = (0, helpers_1.makeRange)((0, helpers_1.toNum)(humidityMin), (0, helpers_1.toNum)(humidityMax), (0, helpers_1.toNum)(humidity));
    const wmo = (0, helpers_1.toNum)(wmoCode);
    if (tRange)
        snapshot.temperatureC = tRange;
    if (hRange)
        snapshot.humidityPct = hRange;
    if (wmo)
        snapshot.wmoCode = wmo;
    console.log("tRange", tRange, hRange, wmo);
    if (Object.keys(snapshot).length > 0)
        and.push({ weatherSnapshot: { is: snapshot } });
    if (and.length < 1)
        return undefined;
    console.log("the object", { AND: and });
    return { AND: and };
}
const getProperties = async (req, res) => {
    try {
        const properties = await prisma_1.prisma.property.findMany({
            take: 12,
            where: buildPropertyWhere(req),
            include: { weatherSnapshot: true },
        });
        return res.json(properties);
    }
    catch (error) {
        console.error("Error fetching properties:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getProperties = getProperties;
