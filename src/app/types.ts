export type JsonValue =
    | string
    | number
    | boolean
    | null
    | { [key: string]: JsonValue }
    | JsonValue[];

export type PropertyWeatherSnapshot = {
    propertyId: number;
    temperatureC: number | null;
    humidityPct: number | null;
    wmoCode: number | null;
    updatedAt: string | Date;
};

export type PropertyWithWeather = {
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

export type WmoCode = 0 | 51 | 61 | 71 | 80;
export type SvgIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;
export type SortKey = "name" | "temperatureC" | "humidityPct" | "city";
export type SortDir = "asc" | "desc";
export type ViewMode = "grid" | "table";

export type FiltersForm = {
    searchPlace: string;
    tempRange: [number, number];
    humidityRange: [number, number];
    wmoCode: "" | `${WmoCode}`;
    sortKey: SortKey;
    sortDir: SortDir;
    view: ViewMode;
};
