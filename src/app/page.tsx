"use client";
import React, { useMemo, useState, useEffect, JSX } from "react";
import {
    Search,
    Home,
    MapPin,
    Thermometer,
    Droplets,
    Cloud,
    RotateCcw,
    LayoutGrid,
    List,
    ArrowUpDown,
} from "lucide-react";
import { useForm, Controller, useWatch } from "react-hook-form";
import axios from "axios";

/** ---------------- Types from your schema ---------------- */
type JsonValue =
    | string
    | number
    | boolean
    | null
    | { [key: string]: JsonValue }
    | JsonValue[];

type PropertyWeatherSnapshot = {
    propertyId: number;
    temperatureC: number | null;
    humidityPct: number | null;
    wmoCode: number | null;
    updatedAt: string | Date;
};

type PropertyWithWeather = {
    name: string;
    id: number;
    updatedAt: string | Date;
    city: string | null;
    state: string | null;
    country: string | null;
    lat: number | null;
    lng: number | null;
    geohash5: string | null;
    isActive: boolean;
    tags: JsonValue | null;
    createdAt: string | Date;
} & {
    weatherSnapshot: PropertyWeatherSnapshot | null;
};

/** UI helper types */
type WmoCode = 0 | 51 | 61 | 71 | 80;

type SvgIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;
type SortKey = "name" | "temperatureC" | "humidityPct" | "city";
type SortDir = "asc" | "desc";
type ViewMode = "grid" | "table";

/** react-hook-form shape */
type FiltersForm = {
    searchPlace: string;
    tempRange: [number, number];
    humidityRange: [number, number];
    wmoCode: "" | `${WmoCode}`;
    sortKey: SortKey;
    sortDir: SortDir;
    view: ViewMode;
};

/** ---------------- Constants ---------------- */
const WMO_CODES: Record<WmoCode, string> = {
    0: "Clear sky",
    51: "Light drizzle",
    61: "Slight rain",
    71: "Slight snow",
    80: "Slight rain showers",
};

/** ---------------- Utils ---------------- */
const getWeatherIcon = (code: WmoCode): string => {
    if (code === 0) return "☀️"; // Clear
    if (code >= 1 && code <= 3) return "⛅"; // Cloudy
    if (code >= 51 && code <= 57) return "🌫️"; // Drizzle
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "🌧️"; // Rainy
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "❄️"; // Snow
    return "🌤️"; // Default
};

const safeIncludes = (hay: string | null | undefined, needle: string) =>
    (hay ?? "").toLowerCase().includes(needle);

/** ---------------- Reusable Range ---------------- */
type RangeSliderProps = {
    label: string;
    value: [number, number];
    onChange: (range: [number, number]) => void;
    min: number;
    max: number;
    unit: string;
    icon: SvgIcon;
    step?: number;
};

const RangeSlider: React.FC<RangeSliderProps> = ({
    label,
    value,
    onChange,
    min,
    max,
    unit,
    icon: Icon,
    step = 1,
}) => {
    const [minVal, maxVal] = value;
    const setMinVal = (v: number) =>
        onChange([Math.max(min, Math.min(v, maxVal)), maxVal]);
    const setMaxVal = (v: number) =>
        onChange([minVal, Math.min(max, Math.max(v, minVal))]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                    {label}
                </span>
            </div>

            <div className="space-y-2">
                <div className="relative h-6">
                    <input
                        aria-label={`${label} min`}
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={minVal}
                        onChange={(e) =>
                            setMinVal(parseInt(e.target.value, 10))
                        }
                        className="absolute inset-0 h-2 w-full bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                </div>
                <div className="relative h-6 -mt-6">
                    <input
                        aria-label={`${label} max`}
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={maxVal}
                        onChange={(e) =>
                            setMaxVal(parseInt(e.target.value, 10))
                        }
                        className="absolute inset-0 h-2 w-full bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 w-10">
                            Min
                        </label>
                        <input
                            type="number"
                            value={Number(minVal)}
                            min={min}
                            max={max}
                            step={step}
                            onChange={(e) =>
                                setMinVal(parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">{unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 w-10">
                            Max
                        </label>
                        <input
                            type="number"
                            value={maxVal}
                            min={min}
                            max={max}
                            step={step}
                            onChange={(e) =>
                                setMaxVal(parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">{unit}</span>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                    {minVal}
                    {unit} – {maxVal}
                    {unit}
                </div>
            </div>
        </div>
    );
};

/** ---------------- Card ---------------- */
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

/** ---------------- Main ---------------- */
export default function PropertyWeatherUI(): JSX.Element {
    const [properties, setProperties] = useState<PropertyWithWeather[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    console.log("properties", properties);
    const { control, register, handleSubmit, reset } = useForm<FiltersForm>({
        defaultValues: {
            searchPlace: "",
            tempRange: [0, 40],
            humidityRange: [0, 100],
            wmoCode: "",
            sortKey: "name",
            sortDir: "asc",
            view: "grid",
        },
        mode: "onChange",
    });

    const values = useWatch({ control });
    useEffect(() => {
        const controller = new AbortController();

        const params = {
            // map your form values to API query params
            searchText: values.searchPlace || undefined,
            tempMin: values.tempRange![0] || 0,
            tempMax: values.tempRange![1] || 40,
            humidityMin: values.humidityRange![0],
            humidityMax: values.humidityRange![1],
            wmoCode: values.wmoCode || undefined,
        };

        setLoading(true);
        setError(null);

        axios
            .get("http://localhost:5000/get-properties", {
                params,
                signal: controller.signal,
            })
            .then(({ data }) => {
                const list = Array.isArray(data?.properties)
                    ? data.properties
                    : Array.isArray(data)
                      ? data
                      : [];
                setProperties(list);
            })
            .catch((err: any) => {
                if (err?.name === "CanceledError") return; // ignore aborts
                setError(err?.message || "Failed to load");
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [
        values.searchPlace,
        values.tempRange,
        values.humidityRange,
        values.wmoCode,
    ]);
    /** Sort client-side (server already filtered) */
    const filtered = useMemo(() => {
        const { sortKey, sortDir } = values;
        const sorted = [...properties].sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case "name":
                    cmp = a.name.localeCompare(b.name);
                    break;
                case "city":
                    cmp = (a.city ?? "").localeCompare(b.city ?? "");
                    break;
                case "temperatureC":
                    cmp =
                        (a.weatherSnapshot?.temperatureC ?? -Infinity) -
                        (b.weatherSnapshot?.temperatureC ?? -Infinity);
                    break;
                case "humidityPct":
                    cmp =
                        (a.weatherSnapshot?.humidityPct ?? -Infinity) -
                        (b.weatherSnapshot?.humidityPct ?? -Infinity);
                    break;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });
        return sorted;
    }, [values.sortKey, values.sortDir, properties]);

    const stats = useMemo(() => {
        const temps = filtered
            .map((p) => p.weatherSnapshot?.temperatureC)
            .filter((v): v is number => v != null);
        const hums = filtered
            .map((p) => p.weatherSnapshot?.humidityPct)
            .filter((v): v is number => v != null);
        const avg = (arr: number[]) =>
            arr.length
                ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
                : 0;
        return { avgTemp: avg(temps), avgHumidity: avg(hums) };
    }, [filtered]);

    const onReset = (): void => reset();
    const onSubmit = () => {};

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Property Weather Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Monitor weather conditions across your properties
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Filters
                            </h2>

                            <div className="flex items-center gap-2">
                                {/* View toggle */}
                                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                                    <label
                                        className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${values.view === "grid" ? "bg-gray-50" : ""}`}
                                    >
                                        <input
                                            {...register("view")}
                                            type="radio"
                                            value="grid"
                                            className="hidden"
                                        />
                                        <LayoutGrid className="w-4 h-4" /> Grid
                                    </label>
                                    <label
                                        className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 border-l border-gray-200 ${values.view === "table" ? "bg-gray-50" : ""}`}
                                    >
                                        <input
                                            {...register("view")}
                                            type="radio"
                                            value="table"
                                            className="hidden"
                                        />
                                        <List className="w-4 h-4" /> Table
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={onReset}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Search across city/state/country */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    <label className="text-sm font-medium text-gray-700">
                                        Search Location
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="City, state, or country…"
                                        {...register("searchPlace")}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            {/* Temperature Range */}
                            <Controller
                                control={control}
                                name="tempRange"
                                render={({ field: { value, onChange } }) => (
                                    <RangeSlider
                                        label="Temperature"
                                        value={value}
                                        onChange={onChange}
                                        min={-20}
                                        max={50}
                                        unit="°C"
                                        icon={Thermometer}
                                        step={1}
                                    />
                                )}
                            />

                            {/* Humidity Range */}
                            <Controller
                                control={control}
                                name="humidityRange"
                                render={({ field: { value, onChange } }) => (
                                    <RangeSlider
                                        label="Humidity"
                                        value={value}
                                        onChange={onChange}
                                        min={0}
                                        max={100}
                                        unit="%"
                                        icon={Droplets}
                                        step={1}
                                    />
                                )}
                            />

                            {/* WMO Code Select */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Cloud className="w-4 h-4 text-blue-600" />
                                    <label className="text-sm font-medium text-gray-700">
                                        Weather Condition
                                    </label>
                                </div>
                                <select
                                    {...register("wmoCode")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Conditions</option>
                                    {Object.entries(WMO_CODES).map(
                                        ([code, description]) => (
                                            <option key={code} value={code}>
                                                {description}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Sorting & Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-sm text-gray-600">
                                {loading ? (
                                    "Loading…"
                                ) : error ? (
                                    `Error: ${error}`
                                ) : (
                                    <>
                                        Showing{" "}
                                        <span className="font-medium text-gray-900">
                                            {filtered.length}
                                        </span>{" "}
                                        of {properties.length} properties
                                        <StatsInline list={filtered} />
                                    </>
                                )}
                            </span>

                            <div className="flex items-center gap-2 text-sm">
                                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                                <select
                                    {...register("sortKey")}
                                    className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    aria-label="Sort by"
                                >
                                    <option value="name">Name</option>
                                    <option value="city">Location</option>
                                    <option value="temperatureC">
                                        Temperature
                                    </option>
                                    <option value="humidityPct">
                                        Humidity
                                    </option>
                                </select>
                                <select
                                    {...register("sortDir")}
                                    className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    aria-label="Sort direction"
                                >
                                    <option value="asc">Asc</option>
                                    <option value="desc">Desc</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Grid (mobile/tablet) */}
                {filtered.length > 0 ? (
                    <>
                        <div
                            className={`${values.view === "grid" ? "grid" : "hidden"} grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:hidden`}
                        >
                            {filtered.map((p) => (
                                <PropertyCard key={p.id} p={p} />
                            ))}
                        </div>

                        {/* Table (desktop) */}
                        <div
                            className={`${values.view === "table" ? "" : "hidden"} bg-white rounded-xl shadow-sm overflow-hidden lg:block`}
                        >
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Home className="w-5 h-5" />
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
                                        {filtered.map((p) => {
                                            const ws = p.weatherSnapshot;
                                            const wmo = (ws?.wmoCode ??
                                                undefined) as
                                                | WmoCode
                                                | undefined;
                                            return (
                                                <tr
                                                    key={p.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <Home className="w-5 h-5 text-blue-600" />
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
                                                        {[
                                                            p.city,
                                                            p.state,
                                                            p.country,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(", ") || "—"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Thermometer className="w-4 h-4 text-red-400 mr-2" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {ws?.temperatureC ??
                                                                    "—"}
                                                                {ws?.temperatureC !=
                                                                null
                                                                    ? "°C"
                                                                    : ""}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Droplets className="w-4 h-4 text-blue-400 mr-2" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {ws?.humidityPct ??
                                                                    "—"}
                                                                {ws?.humidityPct !=
                                                                null
                                                                    ? "%"
                                                                    : ""}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <span
                                                                className="text-lg mr-2"
                                                                title={
                                                                    wmo !==
                                                                    undefined
                                                                        ? WMO_CODES[
                                                                              wmo
                                                                          ]
                                                                        : "N/A"
                                                                }
                                                            >
                                                                {wmo !==
                                                                undefined
                                                                    ? getWeatherIcon(
                                                                          wmo,
                                                                      )
                                                                    : "—"}
                                                            </span>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {wmo !==
                                                                    undefined
                                                                        ? WMO_CODES[
                                                                              wmo
                                                                          ]
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
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="text-center py-12">
                            <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {loading
                                    ? "Loading…"
                                    : error
                                      ? "Failed to load"
                                      : "No properties found"}
                            </h3>
                            <p className="text-gray-500">
                                {loading
                                    ? "Fetching latest data from the server."
                                    : error
                                      ? `Error: ${error}`
                                      : "Try adjusting your filter criteria to see more results."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    background: #3b82f6;
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                }
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    background: #3b82f6;
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                }
            `}</style>
        </div>
    );
}

/** Inline stats */
function StatsInline({ list }: { list: PropertyWithWeather[] }) {
    const temps = list
        .map((p) => p.weatherSnapshot?.temperatureC)
        .filter((v): v is number => v != null);
    const hums = list
        .map((p) => p.weatherSnapshot?.humidityPct)
        .filter((v): v is number => v != null);
    if (temps.length === 0 && hums.length === 0) return null;
    const avg = (arr: number[]) =>
        arr.length
            ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
            : 0;
    return (
        <span className="hidden sm:inline">
            {" "}
            • Avg: {avg(temps)}°C, {avg(hums)}%
        </span>
    );
}
