/**
 * Climate Data Service
 * Fetches real climate data from Open-Meteo API (free, no API key required)
 * Provides historical averages and forecasts for crop replication planning
 */

export interface ClimateData {
    location: string;
    coordinates: { lat: number; lng: number };
    temperature: {
        avgMin: number;
        avgMax: number;
        mean: number;
        monthlyAvg: number[];
    };
    humidity: {
        avg: number;
        monthlyAvg: number[];
    };
    rainfall: {
        annual: number;
        monthlyAvg: number[];
    };
    sunlight: {
        avgHours: number;
        monthlyAvg: number[];
    };
    frost: {
        firstFrostMonth: number | null;
        lastFrostMonth: number | null;
        frostFreeDays: number;
    };
    growingSeasonLength: number;
    climate_zone: string;
}

export interface ClimateComparison {
    source: ClimateData;
    target: ClimateData;
    similarity: number; // 0-100%
    gaps: ClimateGap[];
    adjustments: ClimateAdjustment[];
}

export interface ClimateGap {
    parameter: string;
    sourceValue: number;
    targetValue: number;
    difference: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
}

export interface ClimateAdjustment {
    parameter: string;
    recommendation: string;
    priority: 'essential' | 'recommended' | 'optional';
    cost: 'low' | 'medium' | 'high';
}

// Known locations with coordinates (expandable)
const LOCATION_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
    // India - Famous agricultural regions
    'mahabaleshwar': { lat: 17.9307, lng: 73.6477, country: 'India' },
    'ooty': { lat: 11.4102, lng: 76.6950, country: 'India' },
    'shimla': { lat: 31.1048, lng: 77.1734, country: 'India' },
    'munnar': { lat: 10.0889, lng: 77.0595, country: 'India' },
    'kodaikanal': { lat: 10.2381, lng: 77.4892, country: 'India' },
    'darjeeling': { lat: 27.0360, lng: 88.2627, country: 'India' },
    'kashmir': { lat: 34.0837, lng: 74.7973, country: 'India' },
    'patiala': { lat: 30.3398, lng: 76.3869, country: 'India' },
    'nashik': { lat: 19.9975, lng: 73.7898, country: 'India' },
    'sangli': { lat: 16.8524, lng: 74.5815, country: 'India' },
    'pune': { lat: 18.5204, lng: 73.8567, country: 'India' },
    'nagpur': { lat: 21.1458, lng: 79.0882, country: 'India' },
    'indore': { lat: 22.7196, lng: 75.8577, country: 'India' },
    'ludhiana': { lat: 30.9010, lng: 75.8573, country: 'India' },
    'jaipur': { lat: 26.9124, lng: 75.7873, country: 'India' },
    'coimbatore': { lat: 11.0168, lng: 76.9558, country: 'India' },
    'ratnagiri': { lat: 16.9902, lng: 73.3120, country: 'India' },
    'alphonso mango belt': { lat: 17.0000, lng: 73.3000, country: 'India' },
    'basmati belt': { lat: 29.9457, lng: 76.8180, country: 'India' },
    'coffee belt karnataka': { lat: 13.2000, lng: 75.7000, country: 'India' },
    
    // International famous agricultural regions
    'california central valley': { lat: 36.7783, lng: -119.4179, country: 'USA' },
    'napa valley': { lat: 38.5025, lng: -122.2654, country: 'USA' },
    'huelva spain': { lat: 37.2614, lng: -6.9447, country: 'Spain' },
    'champagne france': { lat: 49.0400, lng: 4.0300, country: 'France' },
    'bordeaux': { lat: 44.8378, lng: -0.5792, country: 'France' },
    'tuscany': { lat: 43.7711, lng: 11.2486, country: 'Italy' },
    'hokkaido': { lat: 43.0642, lng: 141.3469, country: 'Japan' },
    'valencia': { lat: 39.4699, lng: -0.3763, country: 'Spain' },
    'queensland': { lat: -27.4698, lng: 153.0251, country: 'Australia' },
    'mendoza': { lat: -32.8895, lng: -68.8458, country: 'Argentina' },
    'cape town': { lat: -33.9249, lng: 18.4241, country: 'South Africa' },
};

/**
 * Get coordinates for a location (with geocoding fallback)
 */
export async function getLocationCoordinates(location: string): Promise<{ lat: number; lng: number; name: string }> {
    const normalized = location.toLowerCase().trim();
    
    // Check known locations first
    if (LOCATION_COORDINATES[normalized]) {
        return { 
            ...LOCATION_COORDINATES[normalized], 
            name: location 
        };
    }
    
    // Try Open-Meteo Geocoding API (free)
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            return {
                lat: result.latitude,
                lng: result.longitude,
                name: `${result.name}, ${result.admin1 || ''} ${result.country || ''}`
            };
        }
    } catch (e) {
        console.error('Geocoding failed:', e);
    }
    
    throw new Error(`Could not find coordinates for location: ${location}`);
}

/**
 * Fetch real climate data from Open-Meteo API
 */
export async function fetchClimateData(lat: number, lng: number, locationName: string): Promise<ClimateData> {
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear - 1}-01-01`;
    const endDate = `${currentYear - 1}-12-31`;
    
    try {
        // Fetch historical data (past year)
        const historicalUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean,sunshine_duration&timezone=auto`;
        
        const response = await fetch(historicalUrl);
        const data = await response.json();
        
        if (!data.daily) {
            throw new Error('No climate data available');
        }
        
        // Process daily data into monthly averages
        const monthlyTemp: number[][] = Array.from({ length: 12 }, () => []);
        const monthlyTempMin: number[][] = Array.from({ length: 12 }, () => []);
        const monthlyTempMax: number[][] = Array.from({ length: 12 }, () => []);
        const monthlyHumidity: number[][] = Array.from({ length: 12 }, () => []);
        const monthlyRainfall: number[][] = Array.from({ length: 12 }, () => []);
        const monthlySunshine: number[][] = Array.from({ length: 12 }, () => []);
        
        data.daily.time.forEach((date: string, i: number) => {
            const month = new Date(date).getMonth();
            if (data.daily.temperature_2m_mean[i] !== null) monthlyTemp[month].push(data.daily.temperature_2m_mean[i]);
            if (data.daily.temperature_2m_min[i] !== null) monthlyTempMin[month].push(data.daily.temperature_2m_min[i]);
            if (data.daily.temperature_2m_max[i] !== null) monthlyTempMax[month].push(data.daily.temperature_2m_max[i]);
            if (data.daily.relative_humidity_2m_mean[i] !== null) monthlyHumidity[month].push(data.daily.relative_humidity_2m_mean[i]);
            if (data.daily.precipitation_sum[i] !== null) monthlyRainfall[month].push(data.daily.precipitation_sum[i]);
            if (data.daily.sunshine_duration[i] !== null) monthlySunshine[month].push(data.daily.sunshine_duration[i] / 3600); // Convert seconds to hours
        });
        
        const avgArray = (arr: number[][]) => arr.map(m => m.length ? m.reduce((a, b) => a + b, 0) / m.length : 0);
        const sumArray = (arr: number[][]) => arr.map(m => m.reduce((a, b) => a + b, 0));
        
        const monthlyTempAvg = avgArray(monthlyTemp);
        const monthlyTempMinAvg = avgArray(monthlyTempMin);
        const monthlyTempMaxAvg = avgArray(monthlyTempMax);
        const monthlyHumidityAvg = avgArray(monthlyHumidity);
        const monthlyRainfallSum = sumArray(monthlyRainfall);
        const monthlySunshineAvg = avgArray(monthlySunshine);
        
        // Calculate frost info
        const frostMonths = monthlyTempMinAvg.map((t, i) => ({ month: i, temp: t })).filter(m => m.temp < 2);
        const firstFrost = frostMonths.length > 0 ? frostMonths[frostMonths.length - 1].month : null;
        const lastFrost = frostMonths.length > 0 ? frostMonths[0].month : null;
        
        // Calculate growing season (months with avg temp > 10°C)
        const growingMonths = monthlyTempAvg.filter(t => t > 10).length;
        
        // Determine climate zone based on temp and rainfall
        const avgTemp = monthlyTempAvg.reduce((a, b) => a + b, 0) / 12;
        const totalRainfall = monthlyRainfallSum.reduce((a, b) => a + b, 0);
        const climate_zone = classifyClimateZone(avgTemp, totalRainfall, lat);
        
        return {
            location: locationName,
            coordinates: { lat, lng },
            temperature: {
                avgMin: Math.min(...monthlyTempMinAvg),
                avgMax: Math.max(...monthlyTempMaxAvg),
                mean: avgTemp,
                monthlyAvg: monthlyTempAvg.map(t => Math.round(t * 10) / 10)
            },
            humidity: {
                avg: monthlyHumidityAvg.reduce((a, b) => a + b, 0) / 12,
                monthlyAvg: monthlyHumidityAvg.map(h => Math.round(h))
            },
            rainfall: {
                annual: Math.round(totalRainfall),
                monthlyAvg: monthlyRainfallSum.map(r => Math.round(r))
            },
            sunlight: {
                avgHours: monthlySunshineAvg.reduce((a, b) => a + b, 0) / 12,
                monthlyAvg: monthlySunshineAvg.map(s => Math.round(s * 10) / 10)
            },
            frost: {
                firstFrostMonth: firstFrost,
                lastFrostMonth: lastFrost,
                frostFreeDays: (12 - frostMonths.length) * 30
            },
            growingSeasonLength: growingMonths,
            climate_zone
        };
    } catch (error) {
        console.error('Failed to fetch climate data:', error);
        throw error;
    }
}

function classifyClimateZone(avgTemp: number, rainfall: number, lat: number): string {
    const absLat = Math.abs(lat);
    
    if (absLat > 60) return 'Polar/Subarctic';
    if (absLat > 45) {
        if (rainfall > 1000) return 'Temperate Oceanic';
        return 'Continental';
    }
    if (absLat > 23.5) {
        if (rainfall > 1500) return 'Humid Subtropical';
        if (rainfall < 500) return 'Semi-Arid';
        return 'Mediterranean';
    }
    // Tropics
    if (rainfall > 2000) return 'Tropical Rainforest';
    if (rainfall > 1000) return 'Tropical Monsoon';
    if (rainfall < 500) return 'Tropical Dry';
    return 'Tropical Savanna';
}

/**
 * Compare climate between two locations
 */
export function compareClimates(source: ClimateData, target: ClimateData): ClimateComparison {
    const gaps: ClimateGap[] = [];
    const adjustments: ClimateAdjustment[] = [];
    
    // Temperature comparison
    const tempDiff = Math.abs(source.temperature.mean - target.temperature.mean);
    if (tempDiff > 2) {
        gaps.push({
            parameter: 'Temperature',
            sourceValue: source.temperature.mean,
            targetValue: target.temperature.mean,
            difference: tempDiff,
            severity: tempDiff > 8 ? 'critical' : tempDiff > 5 ? 'high' : tempDiff > 3 ? 'medium' : 'low',
            impact: tempDiff > 5 
                ? 'Major temperature difference will significantly affect crop growth, flowering, and yield'
                : 'Temperature difference may affect growth rate and harvest timing'
        });
        
        if (target.temperature.mean < source.temperature.mean) {
            adjustments.push({
                parameter: 'Temperature (Too Cold)',
                recommendation: `Use polytunnels/greenhouses to raise temperature by ${Math.ceil(tempDiff)}°C. Consider mulching and row covers for heat retention.`,
                priority: tempDiff > 5 ? 'essential' : 'recommended',
                cost: tempDiff > 8 ? 'high' : 'medium'
            });
        } else {
            adjustments.push({
                parameter: 'Temperature (Too Hot)',
                recommendation: `Use shade nets (30-50% shade), increase irrigation frequency, and apply mulch to reduce soil temperature.`,
                priority: tempDiff > 5 ? 'essential' : 'recommended',
                cost: 'medium'
            });
        }
    }
    
    // Humidity comparison
    const humidityDiff = Math.abs(source.humidity.avg - target.humidity.avg);
    if (humidityDiff > 10) {
        gaps.push({
            parameter: 'Humidity',
            sourceValue: source.humidity.avg,
            targetValue: target.humidity.avg,
            difference: humidityDiff,
            severity: humidityDiff > 25 ? 'high' : humidityDiff > 15 ? 'medium' : 'low',
            impact: 'Humidity affects disease pressure, transpiration rates, and fruit quality'
        });
        
        if (target.humidity.avg < source.humidity.avg) {
            adjustments.push({
                parameter: 'Humidity (Too Low)',
                recommendation: 'Install misting systems, use windbreaks, and maintain dense ground cover. Drip irrigation helps maintain soil moisture.',
                priority: humidityDiff > 20 ? 'essential' : 'recommended',
                cost: 'medium'
            });
        } else {
            adjustments.push({
                parameter: 'Humidity (Too High)',
                recommendation: 'Improve air circulation, wider plant spacing, prune for airflow. Use fungicides preventively.',
                priority: humidityDiff > 20 ? 'essential' : 'recommended',
                cost: 'low'
            });
        }
    }
    
    // Rainfall comparison
    const rainfallDiff = Math.abs(source.rainfall.annual - target.rainfall.annual);
    const rainfallRatio = target.rainfall.annual / (source.rainfall.annual || 1);
    
    if (rainfallRatio < 0.7 || rainfallRatio > 1.5) {
        gaps.push({
            parameter: 'Rainfall',
            sourceValue: source.rainfall.annual,
            targetValue: target.rainfall.annual,
            difference: rainfallDiff,
            severity: rainfallRatio < 0.5 || rainfallRatio > 2 ? 'critical' : 'high',
            impact: 'Water availability is critical for crop survival and yield'
        });
        
        if (rainfallRatio < 0.7) {
            adjustments.push({
                parameter: 'Rainfall (Deficit)',
                recommendation: `Target location receives ${Math.round((1 - rainfallRatio) * 100)}% less rainfall. Install drip irrigation system. Water requirement: approx ${Math.round((source.rainfall.annual - target.rainfall.annual) / 12)} mm/month supplemental.`,
                priority: 'essential',
                cost: 'high'
            });
        } else {
            adjustments.push({
                parameter: 'Rainfall (Excess)',
                recommendation: 'Install raised beds for drainage, use rain shelters during flowering, select disease-resistant varieties.',
                priority: 'essential',
                cost: 'medium'
            });
        }
    }
    
    // Sunlight comparison
    const sunlightDiff = Math.abs(source.sunlight.avgHours - target.sunlight.avgHours);
    if (sunlightDiff > 2) {
        gaps.push({
            parameter: 'Sunlight Hours',
            sourceValue: source.sunlight.avgHours,
            targetValue: target.sunlight.avgHours,
            difference: sunlightDiff,
            severity: sunlightDiff > 4 ? 'high' : 'medium',
            impact: 'Sunlight affects photosynthesis, flowering triggers, and sugar content in fruits'
        });
        
        adjustments.push({
            parameter: 'Sunlight',
            recommendation: target.sunlight.avgHours < source.sunlight.avgHours 
                ? 'Use reflective mulch to maximize light. Avoid planting near tall structures. Consider supplemental grow lights for high-value crops.'
                : 'Use 30% shade cloth during peak summer. Plant companion crops for natural shading.',
            priority: sunlightDiff > 3 ? 'recommended' : 'optional',
            cost: 'low'
        });
    }
    
    // Calculate overall similarity score
    const weights = { temp: 0.35, humidity: 0.2, rainfall: 0.3, sunlight: 0.15 };
    const tempScore = Math.max(0, 100 - tempDiff * 8);
    const humidityScore = Math.max(0, 100 - humidityDiff * 2);
    const rainfallScore = Math.max(0, 100 - Math.abs(1 - rainfallRatio) * 100);
    const sunlightScore = Math.max(0, 100 - sunlightDiff * 10);
    
    const similarity = Math.round(
        tempScore * weights.temp +
        humidityScore * weights.humidity +
        rainfallScore * weights.rainfall +
        sunlightScore * weights.sunlight
    );
    
    return {
        source,
        target,
        similarity: Math.min(100, Math.max(0, similarity)),
        gaps,
        adjustments
    };
}

/**
 * Get climate data for a location by name
 */
export async function getClimateForLocation(location: string): Promise<ClimateData> {
    const coords = await getLocationCoordinates(location);
    return fetchClimateData(coords.lat, coords.lng, coords.name);
}
