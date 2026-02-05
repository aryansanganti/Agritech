import { useState, useEffect, useCallback } from 'react';
import { getDistrictEnvironmentalData, DistrictEnvironmentalData } from '../services/geminiService';
import { indianDistricts } from '../data/districtData';
import { DistrictData } from '../types';

// Cache for AI-fetched data persisted in localStorage
const CACHE_KEY = 'seedscout_district_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
    data: DistrictEnvironmentalData;
    timestamp: number;
}

const getFromCache = (key: string): DistrictEnvironmentalData | null => {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        const entry = cache[key] as CacheEntry | undefined;
        if (entry && Date.now() - entry.timestamp < CACHE_EXPIRY) {
            return { ...entry.data, dataSource: 'cached' };
        }
    } catch (e) {
        console.error('Cache read error', e);
    }
    return null;
};

const setToCache = (key: string, data: DistrictEnvironmentalData) => {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        cache[key] = { data, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.error('Cache write error', e);
    }
};

export interface EnhancedDistrictData extends DistrictData {
    dataSource: 'gemini' | 'cached' | 'fallback';
    confidence: number;
}

export const useDistrictData = () => {
    const [districts, setDistricts] = useState<EnhancedDistrictData[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingDistrict, setFetchingDistrict] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize with fallback data on mount
    useEffect(() => {
        const initialData: EnhancedDistrictData[] = indianDistricts.map(d => ({
            ...d,
            dataSource: 'fallback' as const,
            confidence: 30 // Default confidence for mock data
        }));
        setDistricts(initialData);
        setLoading(false);
    }, []);

    // Function to fetch AI-updated data for a specific district
    const fetchDistrictData = useCallback(async (districtId: string): Promise<EnhancedDistrictData | null> => {
        const district = indianDistricts.find(d => d.id === districtId);
        if (!district) return null;

        const cacheKey = `${district.name}-${district.state}`;

        // Check cache first
        const cached = getFromCache(cacheKey);
        if (cached) {
            const enhanced: EnhancedDistrictData = {
                ...district,
                salinity: cached.salinity,
                maxTemp: cached.maxTemp,
                rainfall: cached.rainfall,
                tribalPercent: cached.tribalPercent,
                lat: cached.lat || district.lat,
                lng: cached.lng || district.lng,
                dataSource: 'cached',
                confidence: cached.confidence
            };

            // Update state
            setDistricts(prev => prev.map(d => d.id === districtId ? enhanced : d));
            return enhanced;
        }

        // Fetch from Gemini
        setFetchingDistrict(district.name);
        try {
            const aiData = await getDistrictEnvironmentalData(district.name, district.state);

            const enhanced: EnhancedDistrictData = {
                ...district,
                salinity: aiData.salinity,
                maxTemp: aiData.maxTemp,
                rainfall: aiData.rainfall,
                tribalPercent: aiData.tribalPercent,
                lat: aiData.lat || district.lat,
                lng: aiData.lng || district.lng,
                dataSource: aiData.dataSource,
                confidence: aiData.confidence
            };

            // Cache and update state
            setToCache(cacheKey, aiData);
            setDistricts(prev => prev.map(d => d.id === districtId ? enhanced : d));

            return enhanced;
        } catch (e) {
            console.error('Failed to fetch district data:', e);
            setError(`Failed to fetch data for ${district.name}`);
            return null;
        } finally {
            setFetchingDistrict(null);
        }
    }, []);

    // Batch fetch for top N districts (for initial load optimization)
    const fetchTopDistricts = useCallback(async (districtIds: string[]) => {
        for (const id of districtIds.slice(0, 5)) { // Limit to 5 to avoid rate limits
            await fetchDistrictData(id);
        }
    }, [fetchDistrictData]);

    return {
        districts,
        loading,
        fetchingDistrict,
        error,
        fetchDistrictData,
        fetchTopDistricts
    };
};
