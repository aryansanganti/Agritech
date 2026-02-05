// Service to fetch real-time weather data
// Uses Open-Meteo API (Free, No Key Required)

export interface WeatherData {
    temp: number;
    humidity: number;
    windSpeed: number;     // km/h
    windDirection: number; // degrees
    precipitation: number; // mm
    pressure: number;      // hPa
    cloudCover: number;    // %
    radiation: number;     // W/m² (GHI)
    tempMin: number;       // °C (Daily Min)
    tempMax: number;       // °C (Daily Max)
}

export const getCurrentWeather = async (lat: number, lng: number): Promise<WeatherData> => {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,shortwave_radiation&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
        );

        if (!response.ok) {
            throw new Error(`Weather API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const current = data.current;
        const daily = data.daily;

        return {
            temp: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            windSpeed: current.wind_speed_10m,
            windDirection: current.wind_direction_10m,
            precipitation: current.precipitation,
            pressure: current.surface_pressure,
            cloudCover: current.cloud_cover,
            radiation: current.shortwave_radiation,
            tempMin: daily.temperature_2m_min[0],
            tempMax: daily.temperature_2m_max[0]
        };

    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        // Fallback to safe defaults if API fails
        return {
            temp: 25,
            humidity: 60,
            windSpeed: 10,
            windDirection: 0,
            precipitation: 0,
            pressure: 1013,
            cloudCover: 20,
            radiation: 500,
            tempMin: 20,
            tempMax: 30
        };
    }
};
