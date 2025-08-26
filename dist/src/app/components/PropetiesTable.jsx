"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const Wmo_1 = require("./Wmo");
const PropertiesTable = ({ items, }) => {
    return (<div className="bg-white rounded-xl shadow-sm overflow-hidden lg:block">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <lucide_react_1.Home className="w-5 h-5"/>
                    Properties
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Property
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Temperature
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Humidity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Condition
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((p) => {
            const ws = p.weatherSnapshot;
            const wmo = (ws?.wmoCode ?? undefined);
            return (<tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <lucide_react_1.Home className="w-5 h-5 text-blue-600"/>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {p.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {p.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {[p.city, p.state, p.country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <lucide_react_1.Thermometer className="w-4 h-4 text-red-400 mr-2"/>
                                            <span className="text-sm font-medium text-gray-900">
                                                {ws?.temperatureC ?? "—"}
                                                {ws?.temperatureC != null
                    ? "°C"
                    : ""}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <lucide_react_1.Droplets className="w-4 h-4 text-blue-400 mr-2"/>
                                            <span className="text-sm font-medium text-gray-900">
                                                {ws?.humidityPct ?? "—"}
                                                {ws?.humidityPct != null
                    ? "%"
                    : ""}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-lg mr-2" title={wmo !== undefined
                    ? Wmo_1.WMO_CODES[wmo]
                    : "N/A"}>
                                                {wmo !== undefined
                    ? (0, Wmo_1.getWeatherIcon)(wmo)
                    : "—"}
                                            </span>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {wmo !== undefined
                    ? Wmo_1.WMO_CODES[wmo]
                    : "No weather"}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {ws?.updatedAt
                    ? `Updated: ${new Date(ws.updatedAt).toLocaleString()}`
                    : ""}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>);
        })}
                    </tbody>
                </table>
            </div>
        </div>);
};
exports.default = PropertiesTable;
