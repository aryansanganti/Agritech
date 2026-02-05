import { SeedScoutQuery, HotspotResult } from '../types';

const API_URL = 'http://localhost:3000/api/seedscout';

// Call the backend to get calculated hotspots
export const searchHotspotsDynamic = async (
    query: SeedScoutQuery,
    onProgress?: (current: number, total: number, district: string) => void
): Promise<HotspotResult[]> => {
    try {
        if (onProgress) onProgress(1, 100, "Sending criteria to SeedScout Engine...");

        const response = await fetch(`${API_URL}/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        });

        if (!response.ok) throw new Error("Backend calculation failed");

        const results = await response.json();

        if (onProgress) onProgress(100, 100, "Processing complete.");
        return results;
    } catch (e) {
        console.error("Backend Error:", e);
        // Fallback to empty or throw
        return [];
    }
};

// Legacy shim to keep Types happy if other files import these
export const searchHotspots = (query: SeedScoutQuery): HotspotResult[] => {
    console.warn("Using legacy synchronous search - this should be migrated to searchHotspotsDynamic");
    return [];
};

export const searchHotspotsQuick = searchHotspots;

export const baseDistricts = []; // No longer needed on client

export type SearchProgressCallback = (current: number, total: number, district: string) => void;

export const getClusterSummary = () => ({
    totalDistricts: 640,
    highPotential: 150,
    clusters: {}
});

export const getDataRanges = () => ({
    salinity: { min: 0, max: 4 },
    temp: { min: 20, max: 50 },
    rainfall: { min: 0, max: 3000 }
});
