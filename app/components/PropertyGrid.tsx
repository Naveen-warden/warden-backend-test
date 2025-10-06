"use client";
import React from "react";
import type { PropertyWithWeather } from "../types";
import PropertyCard from "./propertyCard";

const PropertiesGrid: React.FC<{ items: PropertyWithWeather[] }> = ({
    items,
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:hidden">
            {items.map((p) => (
                <PropertyCard key={p.id} p={p} />
            ))}
        </div>
    );
};

export default PropertiesGrid;
