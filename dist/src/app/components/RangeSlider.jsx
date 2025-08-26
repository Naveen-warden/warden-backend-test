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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const RangeSlider = ({ label, value, onChange, min, max, unit, icon: Icon, step = 1, }) => {
    const [minVal, maxVal] = value;
    const setMinVal = (0, react_1.useCallback)((v) => onChange([Math.max(min, Math.min(v, maxVal)), maxVal]), [min, maxVal, onChange]);
    const setMaxVal = (0, react_1.useCallback)((v) => onChange([minVal, Math.min(max, Math.max(v, minVal))]), [minVal, max, onChange]);
    const onMinInput = (val) => {
        const v = val ? Number(val) : 0;
        setMinVal(v);
    };
    const onMaxInput = (val) => {
        const v = val ? Number(val) : 0;
        setMaxVal(v);
    };
    return (<div className="space-y-3">
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-blue-600"/>
                <span className="text-sm font-medium text-gray-700">
                    {label}
                </span>
            </div>

            <div className="space-y-2">
                <div className="relative h-6">
                    <input aria-label={`${label} min`} type="range" min={min} max={max} step={step} value={minVal} onChange={(e) => onMinInput(e.target.value)} className="absolute inset-0 h-2 w-full bg-gray-200 rounded-lg appearance-none cursor-pointer slider"/>
                </div>
                <div className="relative h-6 -mt-[1rem]">
                    <input aria-label={`${label} max`} type="range" min={min} max={max} step={step} value={maxVal} onChange={(e) => onMaxInput(e.target.value)} className="absolute inset-0 h-2 w-full bg-gray-200 rounded-lg appearance-none cursor-pointer slider"/>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 w-10">
                            Min
                        </label>
                        <input type="text" value={Number(minVal)} min={min} max={max} step={step} onChange={(e) => onMinInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        <span className="text-xs text-gray-500">{unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 w-10">
                            Max
                        </label>
                        <input type="text" value={Number(maxVal)} min={min} max={max} step={step} onChange={(e) => onMaxInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        <span className="text-xs text-gray-500">{unit}</span>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                    {Number(minVal)}
                    {unit} – {Number(maxVal)}
                    {unit}
                </div>
            </div>
        </div>);
};
exports.default = (0, react_1.memo)(RangeSlider);
