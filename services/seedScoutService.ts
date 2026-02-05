// SeedScout Service - Scoring Algorithm and ML-inspired Clustering
import { DistrictData, SeedScoutQuery, HotspotResult } from '../types';
import { indianDistricts, clusterLabels } from '../data/districtData';

// Normalize a value to 0-1 range
function normalize(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// Calculate individual trait scores
export function calculateSalinityScore(salinity: number): number {
    // Higher salinity = higher score for salt-tolerant crops
    return normalize(salinity, 0, 10);
}

export function calculateHeatScore(maxTemp: number): number {
    // Higher temperature = higher score for heat-tolerant crops
    return normalize(maxTemp, 30, 50);
}

export function calculateDroughtScore(rainfall: number): number {
    // LOWER rainfall = HIGHER drought score (inverse)
    return 1 - normalize(rainfall, 200, 2000);
}

export function calculateTribalScore(tribalPercent: number): number {
    // Higher tribal population = more likely to have traditional landraces
    return normalize(tribalPercent, 0, 100);
}

// Main scoring function
export function calculateHotspotScore(
    district: DistrictData,
    query: SeedScoutQuery
): HotspotResult {
    const salinityScore = query.salinityTolerance ? calculateSalinityScore(district.salinity) : 0;
    const heatScore = query.heatTolerance ? calculateHeatScore(district.maxTemp) : 0;
    const droughtScore = query.droughtTolerance ? calculateDroughtScore(district.rainfall) : 0;
    const tribalScore = calculateTribalScore(district.tribalPercent);

    // Weighted combination
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

    // Generate recommendation based on scores
    const recommendation = generateRecommendation(district, query, traitScore);

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

function generateRecommendation(
    district: DistrictData,
    query: SeedScoutQuery,
    score: number
): string {
    const traits: string[] = [];
    if (query.salinityTolerance && district.salinity > 4) {
        traits.push(`salt-tolerant (EC: ${district.salinity.toFixed(1)} dS/m)`);
    }
    if (query.heatTolerance && district.maxTemp > 40) {
        traits.push(`heat-resistant (Max: ${district.maxTemp}°C)`);
    }
    if (query.droughtTolerance && district.rainfall < 800) {
        traits.push(`drought-hardy (Rainfall: ${district.rainfall}mm)`);
    }

    if (score >= 0.7) {
        return `HIGH PRIORITY: ${district.name} district shows exceptional potential. The tribal communities here (${district.tribalPercent.toFixed(1)}% population) have cultivated ${query.cropType || 'traditional crops'} under extreme conditions for generations. Expected traits: ${traits.join(', ')}.`;
    } else if (score >= 0.5) {
        return `RECOMMENDED: ${district.name} is a promising location for finding ${traits.join(' and ')} varieties. Contact local agricultural extension officers or tribal cooperatives for access.`;
    } else {
        return `MODERATE: ${district.name} may contain relevant landraces. Consider as secondary research location.`;
    }
}

// Search function - returns ranked districts
export function searchHotspots(query: SeedScoutQuery): HotspotResult[] {
    const results = indianDistricts.map(district =>
        calculateHotspotScore(district, query)
    );

    // Sort by trait score (descending)
    results.sort((a, b) => b.traitScore - a.traitScore);

    return results;
}

// Get districts by cluster
export function getDistrictsByCluster(clusterId: number): DistrictData[] {
    return indianDistricts.filter(d => d.cluster === clusterId);
}

// Get all clusters with counts
export function getClusterSummary() {
    const summary = Object.entries(clusterLabels).map(([id, info]) => ({
        id: parseInt(id),
        ...info,
        count: indianDistricts.filter(d => d.cluster === parseInt(id)).length,
    }));
    return summary;
}

// Get statistics for map legends
export function getDataRanges() {
    return {
        salinity: {
            min: Math.min(...indianDistricts.map(d => d.salinity)),
            max: Math.max(...indianDistricts.map(d => d.salinity)),
        },
        temperature: {
            min: Math.min(...indianDistricts.map(d => d.maxTemp)),
            max: Math.max(...indianDistricts.map(d => d.maxTemp)),
        },
        rainfall: {
            min: Math.min(...indianDistricts.map(d => d.rainfall)),
            max: Math.max(...indianDistricts.map(d => d.rainfall)),
        },
        tribal: {
            min: Math.min(...indianDistricts.map(d => d.tribalPercent)),
            max: Math.max(...indianDistricts.map(d => d.tribalPercent)),
        },
    };
}
