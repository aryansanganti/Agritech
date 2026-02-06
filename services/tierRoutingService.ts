// 3-Tier Routing Protocol Service
// Universal logic that classifies harvest into Retail/Market/Industrial destinations

import { getCropConfig, needsUrgentRouting, getTransportMethod } from './cropRoutingConfigService';

export type TierLevel = 'tier1' | 'tier2' | 'tier3';
export type Grade = 'A' | 'B' | 'C' | 'D';

export interface TierClassification {
    tier: TierLevel;
    tierName: string;
    destination: string;
    percentage: number;
    quantity: number; // in quintals
    grade: Grade;
    description: string;
}

export interface TierRoutingResult {
    crop: string;
    totalQuantity: number;
    tiers: TierClassification[];
    transportMethod: string;
    urgentRouting: boolean;
    rescueRadarEligible: boolean;
    hoursSinceHarvest: number;
    recommendations: string[];
}

export interface QualityDistribution {
    gradeA: number;  // percentage 0-100
    gradeB: number;  // percentage 0-100
    gradeC: number;  // percentage 0-100
    gradeD: number;  // percentage 0-100
}

// Core Logic: Map Quality Grade to Universal Tier
export const mapGradeToTier = (grade: Grade): TierLevel => {
    switch (grade) {
        case 'A': return 'tier1'; // Retail Grade
        case 'B': return 'tier2'; // Market Grade
        case 'C':
        case 'D':
            return 'tier3'; // Industrial Grade
        default: return 'tier2';
    }
};

// Get Tier Name (Universal across all crops)
export const getTierName = (tier: TierLevel): string => {
    switch (tier) {
        case 'tier1': return 'Retail Grade';
        case 'tier2': return 'Market Grade';
        case 'tier3': return 'Industrial Grade';
        default: return 'Unknown';
    }
};

// Get Tier Description
export const getTierDescription = (tier: TierLevel): string => {
    switch (tier) {
        case 'tier1':
            return 'Perfect shape, color, size. Zero defects. Premium quality.';
        case 'tier2':
            return 'Good taste, but visual defects (odd shape, spots).';
        case 'tier3':
            return 'Bruised, over-ripe, too small, or broken. Processing grade.';
        default:
            return '';
    }
};

// Main Classification Function: Analyze a harvest and split into 3 tiers
export const classifyHarvestIntoTiers = (
    crop: string,
    totalQuantity: number,
    distribution: QualityDistribution,
    hoursSinceHarvest: number = 0
): TierRoutingResult => {
    const config = getCropConfig(crop);
    
    if (!config) {
        throw new Error(`Crop "${crop}" not supported in routing config`);
    }

    const tiers: TierClassification[] = [];

    // Tier 1: Grade A (Retail)
    if (distribution.gradeA > 0) {
        tiers.push({
            tier: 'tier1',
            tierName: 'Retail Grade',
            destination: config.tier1_destination,
            percentage: distribution.gradeA,
            quantity: (totalQuantity * distribution.gradeA) / 100,
            grade: 'A',
            description: getTierDescription('tier1')
        });
    }

    // Tier 2: Grade B (Market)
    if (distribution.gradeB > 0) {
        tiers.push({
            tier: 'tier2',
            tierName: 'Market Grade',
            destination: config.tier2_destination,
            percentage: distribution.gradeB,
            quantity: (totalQuantity * distribution.gradeB) / 100,
            grade: 'B',
            description: getTierDescription('tier2')
        });
    }

    // Tier 3: Grade C + D (Industrial)
    const tier3Percentage = distribution.gradeC + distribution.gradeD;
    if (tier3Percentage > 0) {
        tiers.push({
            tier: 'tier3',
            tierName: 'Industrial Grade',
            destination: config.tier3_industry,
            percentage: tier3Percentage,
            quantity: (totalQuantity * tier3Percentage) / 100,
            grade: 'C',
            description: `${getTierDescription('tier3')} → ${config.tier3_products.join(', ')}`
        });
    }

    const urgentRouting = needsUrgentRouting(crop, hoursSinceHarvest);
    const transportMethod = getTransportMethod(crop);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (config.local_factory_priority && tier3Percentage > 0) {
        recommendations.push('🏭 Prioritize local factories within 50km for Tier 3 to reduce carbon footprint');
    }
    
    if (transportMethod === 'cold_chain') {
        recommendations.push('❄️ Cold chain logistics required for this crop');
    }
    
    if (urgentRouting) {
        recommendations.push('⚡ URGENT: Approaching shelf life limit - activate Flash Sale pricing');
    }
    
    if (tier3Percentage > 30) {
        recommendations.push(`💡 ${tier3Percentage.toFixed(0)}% is Industrial Grade - aggregate with nearby farmers for bulk factory sale`);
    }

    if (config.carbon_risk === 'high_methane' && tier3Percentage > 0) {
        recommendations.push('🌱 High methane risk if unsold - consider composting or animal feed partnerships');
    }

    return {
        crop,
        totalQuantity,
        tiers,
        transportMethod,
        urgentRouting,
        rescueRadarEligible: urgentRouting || tier3Percentage > 50,
        hoursSinceHarvest,
        recommendations
    };
};

// Create separate marketplace listings from one classification (The Magic)
export interface SplitStreamListing {
    tier: TierLevel;
    tierName: string;
    crop: string;
    quantity: number;
    grade: Grade;
    destination: string;
    targetBuyer: string;
    suggestedPrice: number; // Will be calculated by pricing engine
    transportMethod: string;
}

export const createSplitStreamListings = (
    routingResult: TierRoutingResult,
    basePrice: number // Base mandi price
): SplitStreamListing[] => {
    return routingResult.tiers.map(tier => {
        let targetBuyer = '';
        let priceMultiplier = 1.0;

        switch (tier.tier) {
            case 'tier1':
                targetBuyer = 'BigBasket, Zepto, Blinkit, Export Agents';
                priceMultiplier = 1.3; // 30% premium
                break;
            case 'tier2':
                targetBuyer = 'Local Mandi Agents, Restaurants, Hotels';
                priceMultiplier = 1.0; // Market rate
                break;
            case 'tier3':
                targetBuyer = 'Processing Factories (FMCG Companies)';
                priceMultiplier = 0.4; // 40% of market price (but better than throwing away!)
                break;
        }

        return {
            tier: tier.tier,
            tierName: tier.tierName,
            crop: routingResult.crop,
            quantity: tier.quantity,
            grade: tier.grade,
            destination: tier.destination,
            targetBuyer,
            suggestedPrice: Math.round(basePrice * priceMultiplier),
            transportMethod: routingResult.transportMethod
        };
    });
};

// Universal Pricing Formula
export const calculateUniversalPrice = (
    baseMarketPrice: number,
    tier: TierLevel,
    urgentSale: boolean = false
): number => {
    let price = baseMarketPrice;

    // Apply tier multiplier
    switch (tier) {
        case 'tier1':
            price = baseMarketPrice * 1.3; // Retail premium
            break;
        case 'tier2':
            price = baseMarketPrice * 1.0; // Market rate
            break;
        case 'tier3':
            price = baseMarketPrice * 0.4; // Factory rate
            break;
    }

    // Flash sale discount for urgent routing (Rescue Radar)
    if (urgentSale && tier === 'tier3') {
        price = price * 0.3; // 70% off for urgent sales
    }

    return Math.round(price);
};

// Calculate total value across all tiers (The Universal Pricing Algorithm)
export const calculateTotalValue = (
    quantities: { tier1: number; tier2: number; tier3: number },
    prices: { retail: number; mandi: number; factory: number }
): number => {
    return (
        quantities.tier1 * prices.retail +
        quantities.tier2 * prices.mandi +
        quantities.tier3 * prices.factory
    );
};

// Aggregate Tier 3 from multiple farmers (for factory bulk orders)
export interface FarmerTier3Batch {
    farmerId: string;
    farmerName: string;
    crop: string;
    quantity: number;
    location: { district: string; state: string };
    distance: number; // km from factory
}

export const aggregateTier3Batches = (
    batches: FarmerTier3Batch[],
    minBulkQuantity: number = 500 // quintals
): { canAggregate: boolean; totalQuantity: number; farmers: string[] } => {
    const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    const farmers = batches.map(b => b.farmerName);

    return {
        canAggregate: totalQuantity >= minBulkQuantity,
        totalQuantity,
        farmers
    };
};
