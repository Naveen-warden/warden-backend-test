"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PropertyWeatherUI;
const react_1 = __importDefault(require("react"));
const dynamic_1 = __importDefault(require("next/dynamic"));
const lucide_react_1 = require("lucide-react");
const react_hook_form_1 = require("react-hook-form");
const axios_1 = __importDefault(require("axios"));
const Wmo_1 = require("./components/Wmo");
const react_query_1 = require("@tanstack/react-query");
// Code-split heavy views + slider
const PropertiesGrid = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require("./components/PropertyGrid"))), {
    loading: () => <div className="text-sm text-gray-500">Loading grid…</div>,
});
const PropertiesTable = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require("./components/PropetiesTable"))), {
    loading: () => <div className="text-sm text-gray-500">Loading table…</div>,
});
const RangeSlider = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require("./components/RangeSlider"))), {
    ssr: false,
    loading: () => <div className="text-sm text-gray-500">Loading slider…</div>,
});
function PropertyWeatherUI() {
    const { control, register, handleSubmit, reset } = (0, react_hook_form_1.useForm)({
        defaultValues: {
            searchPlace: "",
            tempRange: [0, 40],
            humidityRange: [0, 100],
            wmoCode: "",
            sortKey: "name",
            sortDir: "asc",
            view: "table",
        },
        mode: "onChange",
    });
    const values = (0, react_hook_form_1.useWatch)({ control });
    const params = {
        searchText: values.searchPlace || undefined,
        tempMin: values.tempRange[0] || 0,
        tempMax: values.tempRange[1] || 40,
        humidityMin: values.humidityRange[0],
        humidityMax: values.humidityRange[1],
        wmoCode: values.wmoCode || undefined,
    };
    const fetchProperties = async () => {
        const controller = new AbortController();
        const { data } = await axios_1.default.get("http://localhost:5000/get-properties", {
            params,
            signal: controller.signal,
        });
        return data;
    };
    const { data: properties = [], isLoading: loading, isError: error, } = (0, react_query_1.useQuery)({
        queryKey: ["properties", params],
        queryFn: fetchProperties,
        enabled: !!values.tempRange &&
            !!values.humidityRange &&
            values.tempRange.length === 2 &&
            values.humidityRange.length === 2,
        staleTime: 0,
    });
    /** Sort client-side (server already filtered) */
    // const filtered = useMemo(() => {
    //     const { sortKey, sortDir } = values;
    //     const sorted = [...properties].sort((a, b) => {
    //         let cmp = 0;
    //         switch (sortKey) {
    //             case "name":
    //                 cmp = a.name.localeCompare(b.name);
    //                 break;
    //             case "city":
    //                 cmp = (a.city ?? "").localeCompare(b.city ?? "");
    //                 break;
    //             case "temperatureC":
    //                 cmp =
    //                     (a.weatherSnapshot?.temperatureC ?? -Infinity) -
    //                     (b.weatherSnapshot?.temperatureC ?? -Infinity);
    //                 break;
    //             case "humidityPct":
    //                 cmp =
    //                     (a.weatherSnapshot?.humidityPct ?? -Infinity) -
    //                     (b.weatherSnapshot?.humidityPct ?? -Infinity);
    //                 break;
    //         }
    //         return sortDir === "asc" ? cmp : -cmp;
    //     });
    //     return sorted;
    // }, [values.sortKey, values.sortDir, properties]);
    const onReset = () => reset();
    const onSubmit = () => { };
    return (<div className="min-h-screen bg-gray-50 p-4 md:p-6">
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
                                <lucide_react_1.Search className="w-5 h-5"/>
                                Filters
                            </h2>

                            <div className="flex items-center gap-2">
                                {/* View toggle */}
                                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                                    <label className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${values.view === "grid" ? "bg-gray-50" : ""}`}>
                                        <input {...register("view")} type="radio" value="grid" className="hidden"/>
                                        <lucide_react_1.LayoutGrid className="w-4 h-4"/> Grid
                                    </label>
                                    <label className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 border-l border-gray-200 ${values.view === "table" ? "bg-gray-50" : ""}`}>
                                        <input {...register("view")} type="radio" value="table" className="hidden"/>
                                        <lucide_react_1.List className="w-4 h-4"/> Table
                                    </label>
                                </div>

                                <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                                    <lucide_react_1.RotateCcw className="w-4 h-4"/>
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Search across city/state/country */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <lucide_react_1.MapPin className="w-4 h-4 text-blue-600"/>
                                    <label className="text-sm font-medium text-gray-700">
                                        Search Location
                                    </label>
                                </div>
                                <div className="relative">
                                    <input type="text" placeholder="City, state, or country…" {...register("searchPlace")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                                    <lucide_react_1.Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400"/>
                                </div>
                            </div>

                            {/* Temperature Range */}
                            <react_hook_form_1.Controller control={control} name="tempRange" render={({ field: { value, onChange } }) => (<RangeSlider label="Temperature" value={value} onChange={onChange} min={-20} max={50} unit="°C" icon={lucide_react_1.Thermometer} step={1}/>)}/>

                            {/* Humidity Range */}
                            <react_hook_form_1.Controller control={control} name="humidityRange" render={({ field: { value, onChange } }) => (<RangeSlider label="Humidity" value={value} onChange={onChange} min={0} max={100} unit="%" icon={lucide_react_1.Droplets} step={1}/>)}/>

                            {/* WMO Code Select */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <lucide_react_1.Cloud className="w-4 h-4 text-blue-600"/>
                                    <label className="text-sm font-medium text-gray-700">
                                        Weather Condition
                                    </label>
                                </div>
                                <select {...register("wmoCode")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">All Conditions</option>
                                    {Object.entries(Wmo_1.WMO_CODES).map(([code, description]) => (<option key={code} value={code}>
                                                {description}
                                            </option>))}
                                </select>
                            </div>
                        </div>

                        {/* Sorting & Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-sm text-gray-600">
                                {loading ? ("Loading…") : error ? (`Error: ${error}`) : (<>
                                        Showing{" "}
                                        <span className="font-medium text-gray-900">
                                            {properties.length}
                                        </span>{" "}
                                        of {properties.length} properties
                                        <StatsInline list={properties}/>
                                    </>)}
                            </span>

                            <div className="flex items-center gap-2 text-sm">
                                <lucide_react_1.ArrowUpDown className="w-4 h-4 text-gray-500"/>
                                <select {...register("sortKey")} className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Sort by">
                                    <option value="name">Name</option>
                                    <option value="city">Location</option>
                                    <option value="temperatureC">
                                        Temperature
                                    </option>
                                    <option value="humidityPct">
                                        Humidity
                                    </option>
                                </select>
                                <select {...register("sortDir")} className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Sort direction">
                                    <option value="asc">Asc</option>
                                    <option value="desc">Desc</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>

                {properties.length > 0 ? (<>
                        <PropertiesGrid items={properties}/>

                        <PropertiesTable items={properties}/>
                    </>) : (<div className="bg-white rounded-xl shadow-sm">
                        <div className="text-center py-12">
                            <lucide_react_1.Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
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
                    </div>)}
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
        </div>);
}
/** Inline stats */
function StatsInline({ list }) {
    const temps = list
        .map((p) => p.weatherSnapshot?.temperatureC)
        .filter((v) => v != null);
    const hums = list
        .map((p) => p.weatherSnapshot?.humidityPct)
        .filter((v) => v != null);
    if (temps.length === 0 && hums.length === 0)
        return null;
    const avg = (arr) => arr.length
        ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
        : 0;
    return (<span className="hidden sm:inline">
            {" "}
            • Avg: {avg(temps)}°C, {avg(hums)}%
        </span>);
}
