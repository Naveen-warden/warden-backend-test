"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const getProperties_1 = require("./use-cases/getProperties");
const cors_1 = __importDefault(require("cors"));
const weather_services_1 = require("./corns/weather-services");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "http://localhost:3000" })); // your Next dev URL
console.log("env", process.env.PORT);
const port = process.env.PORT || 5000;
(0, weather_services_1.startWeatherCron)();
app.get("/api/weather-cron/status", (_req, res) => {
    res.json((0, weather_services_1.getWeatherCronStatus)());
});
app.post("/api/weather-cron/stop", (_req, res) => {
    (0, weather_services_1.stopWeatherCron)();
    res.json({ success: true, message: "Weather cron job stopped" });
});
app.post("/api/weather-cron/start", (req, res) => {
    (0, weather_services_1.startWeatherCron)();
    res.json({ success: true, message: "Weather cron job started" });
});
app.get("/", (_req, res) => res.send("Warden Weather Test: OK"));
app.use(`/get-properties`, getProperties_1.getProperties);
app.listen(port, () => console.log(`Server on http://localhost:${port}`));
// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("🛑 Shutting down gracefully...");
    (0, weather_services_1.stopWeatherCron)();
    process.exit(0);
});
process.on("SIGINT", () => {
    console.log("🛑 Shutting down gracefully...");
    (0, weather_services_1.stopWeatherCron)();
    process.exit(0);
});
