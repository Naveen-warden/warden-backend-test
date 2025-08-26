"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherIcon = exports.WMO_CODES = void 0;
exports.WMO_CODES = {
    0: "Clear sky",
    51: "Light drizzle",
    61: "Slight rain",
    71: "Slight snow",
    80: "Slight rain showers",
};
const getWeatherIcon = (code) => {
    if (code === 0)
        return "☀️"; // Clear
    if (code != null && code >= 1 && code <= 3)
        return "⛅"; // Cloudy
    if (code != null && code >= 51 && code <= 57)
        return "🌫️"; // Drizzle
    if (code != null &&
        ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)))
        return "🌧️"; // Rainy
    if (code != null &&
        ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)))
        return "❄️"; // Snow
    return "🌤️"; // Default
};
exports.getWeatherIcon = getWeatherIcon;
