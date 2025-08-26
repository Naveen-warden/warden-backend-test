"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const Wmo_1 = require("./Wmo");
const PropertyCard = ({ p }) => {
    const ws = p.weatherSnapshot;
    const wmo = (ws?.wmoCode ?? undefined);
    return (<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <lucide_react_1.Home className="w-6 h-6 text-blue-600"/>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">
                            {p.name}
                        </h3>
                        <span className="text-xl" title={wmo !== undefined ? Wmo_1.WMO_CODES[wmo] : "N/A"}>
                            {wmo !== undefined ? (0, Wmo_1.getWeatherIcon)(wmo) : "—"}
                        </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                            <lucide_react_1.MapPin className="w-4 h-4 text-gray-400"/>
                            {[p.city, p.state, p.country]
            .filter(Boolean)
            .join(", ") || "—"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <lucide_react_1.Thermometer className="w-4 h-4 text-red-400"/>
                            <span className="font-medium text-gray-900">
                                {ws?.temperatureC ?? "—"}
                                {ws?.temperatureC != null ? "°C" : ""}
                            </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <lucide_react_1.Droplets className="w-4 h-4 text-blue-400"/>
                            <span className="font-medium text-gray-900">
                                {ws?.humidityPct ?? "—"}
                                {ws?.humidityPct != null ? "%" : ""}
                            </span>
                        </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        {wmo !== undefined ? Wmo_1.WMO_CODES[wmo] : "No weather"} •
                        ID: {p.id}
                    </div>
                </div>
            </div>
        </div>);
};
exports.default = PropertyCard;
