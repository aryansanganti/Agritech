// Dynamic SeedScout Service - Fetches real data from Gemini AI
import { DistrictData, SeedScoutQuery, HotspotResult } from '../types';
import { getDistrictEnvironmentalData, DistrictEnvironmentalData } from './geminiService';

// Base district list (names and coordinates only - environmental data fetched from Gemini)
const baseDistricts: Array<{ id: string; name: string; state: string; lat: number; lng: number }> = [
    // Maharashtra
    { id: 'mh-nan', name: 'Nandurbar', state: 'Maharashtra', lat: 21.37, lng: 74.24 },
    { id: 'mh-dhu', name: 'Dhule', state: 'Maharashtra', lat: 20.90, lng: 74.78 },
    { id: 'mh-ahm', name: 'Ahmednagar', state: 'Maharashtra', lat: 19.08, lng: 74.73 },
    { id: 'mh-sol', name: 'Solapur', state: 'Maharashtra', lat: 17.66, lng: 75.91 },
    // Rajasthan
    { id: 'rj-jai', name: 'Jaisalmer', state: 'Rajasthan', lat: 26.92, lng: 70.90 },
    { id: 'rj-bar', name: 'Barmer', state: 'Rajasthan', lat: 25.75, lng: 71.42 },
    { id: 'rj-bik', name: 'Bikaner', state: 'Rajasthan', lat: 28.02, lng: 73.31 },
    { id: 'rj-jod', name: 'Jodhpur', state: 'Rajasthan', lat: 26.29, lng: 73.02 },
    { id: 'rj-ban', name: 'Banswara', state: 'Rajasthan', lat: 23.55, lng: 74.44 },
    // Gujarat
    { id: 'gj-kut', name: 'Kutch', state: 'Gujarat', lat: 23.73, lng: 69.86 },
    { id: 'gj-dan', name: 'Dang', state: 'Gujarat', lat: 20.75, lng: 73.68 },
    // Madhya Pradesh
    { id: 'mp-jha', name: 'Jhabua', state: 'Madhya Pradesh', lat: 22.77, lng: 74.59 },
    { id: 'mp-bar', name: 'Barwani', state: 'Madhya Pradesh', lat: 22.04, lng: 74.90 },
    // Odisha
    { id: 'od-may', name: 'Mayurbhanj', state: 'Odisha', lat: 21.93, lng: 86.73 },
    { id: 'od-sun', name: 'Sundargarh', state: 'Odisha', lat: 22.12, lng: 84.03 },
    // Jharkhand  
    { id: 'jh-gum', name: 'Gumla', state: 'Jharkhand', lat: 23.04, lng: 84.54 },
    // Chhattisgarh
    { id: 'cg-bas', name: 'Bastar', state: 'Chhattisgarh', lat: 19.10, lng: 82.04 },
    { id: 'cg-dan', name: 'Dantewada', state: 'Chhattisgarh', lat: 18.90, lng: 81.35 },
    // Telangana
    { id: 'tg-adi', name: 'Adilabad', state: 'Telangana', lat: 19.67, lng: 78.53 },
    // Tamil Nadu
    { id: 'tn-ram', name: 'Ramanathapuram', state: 'Tamil Nadu', lat: 9.37, lng: 78.83 },
];

// Cache for Gemini-fetched data
const dataCache: Map<string, { data: DistrictEnvironmentalData; timestamp: number }> = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Normalize a value to 0-1 range
function normalize(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// Calculate scores
function calculateSalinityScore(salinity: number): number {
    return normalize(salinity, 0, 10);
}

function calculateHeatScore(maxTemp: number): number {
    return normalize(maxTemp, 30, 50);
}

function calculateDroughtScore(rainfall: number): number {
    return 1 - normalize(rainfall, 200, 2000);
}

function calculateTribalScore(tribalPercent: number): number {
    return normalize(tribalPercent, 0, 100);
}

// Fetch dynamic environmental data for a district
async function fetchDistrictData(name: string, state: string): Promise<DistrictEnvironmentalData> {
    const cacheKey = `${name}-${state}`;
    const cached = dataCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return { ...cached.data, dataSource: 'cached' };
    }

    try {
        const data = await getDistrictEnvironmentalData(name, state);
        dataCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    } catch (e) {
        console.error(`Failed to fetch data for ${name}`, e);
        throw e;
    }
}

// Calculate hotspot score with dynamic data
function calculateHotspotScore(
    district: DistrictData,
    query: SeedScoutQuery
): HotspotResult {
    const salinityScore = query.salinityTolerance ? calculateSalinityScore(district.salinity) : 0;
    const heatScore = query.heatTolerance ? calculateHeatScore(district.maxTemp) : 0;
    const droughtScore = query.droughtTolerance ? calculateDroughtScore(district.rainfall) : 0;
    const tribalScore = calculateTribalScore(district.tribalPercent);

    const weights = {
        salinity: query.salinityTolerance ? query.salinityWeight : 0,
        heat: query.heatTolerance ? query.heatWeight : 0,
        drought: query.droughtTolerance ? query.droughtWeight : 0,
    };

    const totalWeight = weights.salinity + weights.heat + weights.drought;
    const normalizedWeights = totalWeight > 0 ? {
        salinity: weights.salinity / totalWeight * 0.8,
        heat: weights.heat / totalWeight * 0.8,
        drought: weights.drought / totalWeight * 0.8,
    } : { salinity: 0, heat: 0, drought: 0 };

    const traitScore =
        (salinityScore * normalizedWeights.salinity) +
        (heatScore * normalizedWeights.heat) +
        (droughtScore * normalizedWeights.drought) +
        (tribalScore * 0.2);

    let recommendation = '';
    if (traitScore >= 0.7) {
        recommendation = `HIGH PRIORITY: Exceptional genetic potential.`;
    } else if (traitScore >= 0.5) {
        recommendation = `RECOMMENDED: Promising location for research.`;
    } else {
        recommendation = `MODERATE: Consider as secondary location.`;
    }

    return {
        district,
        traitScore,
        salinityScore,
        heatScore,
        droughtScore,
        tribalScore,
        recommendation,
    };
}

// Progress callback type
export type SearchProgressCallback = (current: number, total: number, districtName: string) => void;

// Main dynamic search function - fetches REAL data from Gemini
export async function searchHotspotsDynamic(
    query: SeedScoutQuery,
    onProgress?: SearchProgressCallback
): Promise<HotspotResult[]> {
    const results: HotspotResult[] = [];
    const total = baseDistricts.length;

    for (let i = 0; i < baseDistricts.length; i++) {
        const base = baseDistricts[i];
        onProgress?.(i + 1, total, base.name);

        try {
            // Fetch real environmental data from Gemini
            const envData = await fetchDistrictData(base.name, base.state);

            // Create full district data
            const district: DistrictData = {
                id: base.id,
                name: base.name,
                state: base.state,
                lat: envData.lat || base.lat,
                lng: envData.lng || base.lng,
                salinity: envData.salinity,
                maxTemp: envData.maxTemp,
                rainfall: envData.rainfall,
                tribalPercent: envData.tribalPercent,
                cluster: 0, // Could be computed dynamically
            };

            // Calculate score
            const result = calculateHotspotScore(district, query);
            results.push(result);

            // Rate limiting - small delay between API calls
            if (i < baseDistricts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (e) {
            console.error(`Skipping ${base.name} due to error`, e);
        }
    }

    // Sort by score
    results.sort((a, b) => b.traitScore - a.traitScore);

    return results;
}

// Quick search using cached data (for immediate results)
export function searchHotspotsQuick(query: SeedScoutQuery): HotspotResult[] {
    const results: HotspotResult[] = [];

    for (const base of baseDistricts) {
        const cacheKey = `${base.name}-${base.state}`;
        const cached = dataCache.get(cacheKey);

        // Use cached data if available, otherwise use placeholder
        const envData: DistrictEnvironmentalData = cached?.data || {
            salinity: 5,
            maxTemp: 42,
            rainfall: 600,
            tribalPercent: 20,
            lat: base.lat,
            lng: base.lng,
            dataSource: 'fallback',
            confidence: 10
        };

        const district: DistrictData = {
            id: base.id,
            name: base.name,
            state: base.state,
            lat: base.lat,
            lng: base.lng,
            salinity: envData.salinity,
            maxTemp: envData.maxTemp,
            rainfall: envData.rainfall,
            tribalPercent: envData.tribalPercent,
            cluster: 0,
        };

        results.push(calculateHotspotScore(district, query));
    }

    results.sort((a, b) => b.traitScore - a.traitScore);
    return results;
}

// Export base districts for map display
export { baseDistricts };
