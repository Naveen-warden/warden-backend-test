"use client";
import React, { memo, useCallback } from "react";
import type { SvgIcon } from "../types";

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

    const setMinVal = useCallback(
        (v: number) => onChange([Math.max(min, Math.min(v, maxVal)), maxVal]),
        [min, maxVal, onChange],
    );
    const setMaxVal = useCallback(
        (v: number) => onChange([minVal, Math.min(max, Math.max(v, minVal))]),
        [minVal, max, onChange],
    );

    const onMinInput = (val: string) => {
        const v = val ? Number(val) : 0;
        setMinVal(v);
    };

    const onMaxInput = (val: string) => {
        const v = val ? Number(val) : 0;
        setMaxVal(v);
    };
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
                        onChange={(e) => onMinInput(e.target.value)}
                        className="absolute inset-0 h-2 w-full bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                </div>
                <div className="relative h-6 -mt-[1rem]">
                    <input
                        aria-label={`${label} max`}
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={maxVal}
                        onChange={(e) => onMaxInput(e.target.value)}
                        className="absolute inset-0 h-2 w-full bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 w-10">
                            Min
                        </label>
                        <input
                            type="text"
                            value={Number(minVal)}
                            min={min}
                            max={max}
                            step={step}
                            onChange={(e) => onMinInput(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">{unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 w-10">
                            Max
                        </label>
                        <input
                            type="text"
                            value={Number(maxVal)}
                            min={min}
                            max={max}
                            step={step}
                            onChange={(e) => onMaxInput(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">{unit}</span>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                    {Number(minVal)}
                    {unit} – {Number(maxVal)}
                    {unit}
                </div>
            </div>
        </div>
    );
};

export default memo(RangeSlider);
