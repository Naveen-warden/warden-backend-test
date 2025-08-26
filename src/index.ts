import "dotenv/config";
import express from "express";

import { getProperties } from "./use-cases/getProperties";
import { CronJob } from "cron";
import cors from "cors";
import {
    getWeatherCronStatus,
    startWeatherCron,
    stopWeatherCron,
} from "./corns/weather-services";

const app = express();

const ALLOW = new Set([
    "https://warden-backend-test.vercel.app",
    "http://localhost:3000",
]);

app.use((_req, res, next) => {
    res.header("Vary", "Origin");
    next();
});

app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin) return cb(null, true); // non-browser clients
            cb(null, ALLOW.has(origin)); // reflect only if allowed
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false, // true only if you use cookies
    }),
);

app.options("*", cors()); // preflight

console.log("env", process.env.PORT);
const port = process.env.PORT || 5000;

startWeatherCron();
app.get("/api/weather-cron/status", (_req, res) => {
    res.json(getWeatherCronStatus());
});
app.post("/api/weather-cron/stop", (_req, res) => {
    stopWeatherCron();
    res.json({ success: true, message: "Weather cron job stopped" });
});

app.post("/api/weather-cron/start", (req, res) => {
    startWeatherCron();
    res.json({ success: true, message: "Weather cron job started" });
});
app.get("/", (_req, res) => res.send("Warden Weather Test: OK"));
app.use(`/get-properties`, getProperties);

app.listen(port, () => console.log(`Server on http://localhost:${port}`));

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("🛑 Shutting down gracefully...");
    stopWeatherCron();
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("🛑 Shutting down gracefully...");
    stopWeatherCron();
    process.exit(0);
});
