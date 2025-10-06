"use client";
import React from "react";
import { Home, MapPin, Thermometer, Droplets } from "lucide-react";
import type { PropertyWithWeather, WmoCode } from "../types";
import { WMO_CODES, getWeatherIcon } from "./Wmo";

const PropertyCard: React.FC<{ p: PropertyWithWeather }> = ({ p }) => {
    const ws = p.weatherSnapshot;
    const wmo = (ws?.wmoCode ?? undefined) as WmoCode | undefined;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">
                            {p.name}
                        </h3>
                        <span
                            className="text-xl"
                            title={wmo !== undefined ? WMO_CODES[wmo] : "N/A"}
                        >
                            {wmo !== undefined ? getWeatherIcon(wmo) : "—"}
                        </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {[p.city, p.state, p.country]
                                .filter(Boolean)
                                .join(", ") || "—"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Thermometer className="w-4 h-4 text-red-400" />
                            <span className="font-medium text-gray-900">
                                {ws?.temperatureC ?? "—"}
                                {ws?.temperatureC != null ? "°C" : ""}
                            </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Droplets className="w-4 h-4 text-blue-400" />
                            <span className="font-medium text-gray-900">
                                {ws?.humidityPct ?? "—"}
                                {ws?.humidityPct != null ? "%" : ""}
                            </span>
                        </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        {wmo !== undefined ? WMO_CODES[wmo] : "No weather"} •
                        ID: {p.id}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
