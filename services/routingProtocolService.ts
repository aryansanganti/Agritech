/**
 * 3-Tier Routing Protocol Service
 *
 * Core Logic:
 *   Tier 1 (Retail Grade)    → Supermarkets / Export / Quick Commerce
 *   Tier 2 (Market Grade)    → Local Mandis / Restaurants / Canteens
 *   Tier 3 (Industrial Grade)→ Processing Factories (FMCG)
 *
 * Features:
 *   A. Crop Configuration Engine (see data/cropConfig.ts)
 *   B. Vision Scan → Digital Assay → Split-Stream Listings
 *   C. Universal Pricing Algorithm
 *   D. Rescue Radar (flash-sale perishable Tier-3 produce)
 *   E. Route-Matching Logistics (Cold Chain vs Standard Truck vs Local Loop)
 *   F. Carbon Footprint (Fill-Rate + Distance Penalty)
 */

import { CropConfig, getCropConfig, CROP_CONFIG } from '../data/cropConfig';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TierLevel = 1 | 2 | 3;

export interface TierBreakdown {
  tier: TierLevel;
  label: string;
  percentage: number;     // 0-100
  quantityKg: number;
  destination: string;
  pricePerQtl: number;
  totalValue: number;
}

export interface DigitalAssay {
  cropKey: string;
  cropName: string;
  totalQuantityKg: number;
  scanTimestamp: string;
  tiers: TierBreakdown[];
  totalValue: number;
  transportType: string;
  carbonRisk: string;
  shelfLifeHours: number;
  isPerishable: boolean;   // shelfLifeHours < 48
  rescueEligible: boolean; // Tier-3 exists and perishable
}

export interface SplitListing {
  id: string;
  tier: TierLevel;
  tierLabel: string;
  cropName: string;
  quantityKg: number;
  destination: string;
  buyerLabel: string;
  pricePerQtl: number;
  totalValue: number;
  urgency: 'normal' | 'high' | 'flash-sale';
  transport: string;
  carbonRisk: string;
}

export interface RescueItem {
  id: string;
  cropName: string;
  quantityKg: number;
  hoursSinceHarvest: number;
  shelfLifeHours: number;
  percentLifeUsed: number;
  originalPricePerQtl: number;
  flashPricePerQtl: number;
  rescueChannels: string[];
  status: 'active' | 'claimed' | 'expired';
}

export interface MilkRunStop {
  farmerId: string;
  farmerName: string;
  quantityKg: number;
  cropName: string;
  location: string;
}

export interface MilkRunRoute {
  id: string;
  factoryName: string;
  factoryLocation: string;
  stops: MilkRunStop[];
  totalQuantityKg: number;
  truckFillPercent: number;
  estimatedDistanceKm: number;
  carbonSavedKg: number;
  transport: string;
}

// ─── Core: Classify into 3 Tiers ───────────────────────────────────────────

/**
 * Simulated AI Vision Scan.
 * In production, this would call a computer-vision model.
 * For the hackathon demo, we generate realistic random splits.
 */
export function runVisionScan(
  cropKey: string,
  totalQuantityKg: number,
  /** Optional overrides for demo (percentages must add to 100) */
  overrides?: { tier1Pct?: number; tier2Pct?: number; tier3Pct?: number }
): DigitalAssay | null {
  const config = getCropConfig(cropKey);
  if (!config) return null;

  // Generate tier splits
  let t1 = overrides?.tier1Pct ?? randomBetween(45, 70);
  let t2 = overrides?.tier2Pct ?? randomBetween(15, 35);
  let t3 = overrides?.tier3Pct ?? (100 - t1 - t2);
  // Clamp
  if (t3 < 0) { t2 = 100 - t1; t3 = 0; }

  const retailPrice = config.retailPricePerQtl;
  const mandiPrice = Math.round(retailPrice * 0.7);
  const factoryPrice = Math.round(retailPrice * 0.3);

  const makeTier = (tier: TierLevel, pct: number, dest: string, price: number): TierBreakdown => {
    const qtyKg = Math.round(totalQuantityKg * pct / 100);
    return {
      tier,
      label: tier === 1 ? 'Retail Grade' : tier === 2 ? 'Market Grade' : 'Industrial Grade',
      percentage: pct,
      quantityKg: qtyKg,
      destination: dest,
      pricePerQtl: price,
      totalValue: Math.round(qtyKg / 100 * price), // qtl = 100kg
    };
  };

  const tiers: TierBreakdown[] = [
    makeTier(1, t1, config.tier1_destination, retailPrice),
    makeTier(2, t2, config.tier2_destination, mandiPrice),
    makeTier(3, t3, config.tier3_industry, factoryPrice),
  ];

  const totalValue = tiers.reduce((s, t) => s + t.totalValue, 0);
  const isPerishable = config.shelfLifeHours < 48;

  return {
    cropKey,
    cropName: config.name,
    totalQuantityKg: totalQuantityKg,
    scanTimestamp: new Date().toISOString(),
    tiers,
    totalValue,
    transportType: config.transport,
    carbonRisk: config.carbonRisk,
    shelfLifeHours: config.shelfLifeHours,
    isPerishable,
    rescueEligible: isPerishable && t3 > 0,
  };
}

// ─── Split-Stream Marketplace ───────────────────────────────────────────────

/** Creates three separate listings from one scan */
export function createSplitListings(assay: DigitalAssay): SplitListing[] {
  const config = getCropConfig(assay.cropKey);
  if (!config) return [];

  return assay.tiers
    .filter((t) => t.quantityKg > 0)
    .map((t, i) => {
      const urgency: SplitListing['urgency'] =
        t.tier === 3 && assay.isPerishable ? 'flash-sale' :
        t.tier === 3 ? 'high' : 'normal';

      const buyerLabel =
        t.tier === 1 ? 'BigBasket / Zepto / Export' :
        t.tier === 2 ? 'Mandi Agents / Hotels' :
        config.factoryBuyerLabel;

      return {
        id: `SL-${assay.cropKey}-T${t.tier}-${Date.now()}-${i}`,
        tier: t.tier,
        tierLabel: t.label,
        cropName: assay.cropName,
        quantityKg: t.quantityKg,
        destination: t.destination,
        buyerLabel,
        pricePerQtl: t.pricePerQtl,
        totalValue: t.totalValue,
        urgency,
        transport: config.transport,
        carbonRisk: config.carbonRisk,
      };
    });
}

// ─── Universal Pricing Algorithm ────────────────────────────────────────────

/**
 * Total Value = (Q1 × P_Retail) + (Q2 × P_Mandi) + (Q3 × P_Factory)
 * P_Mandi  = 70% of P_Retail
 * P_Factory = 30% of P_Retail
 *
 * Returns per-tier and aggregated value.
 */
export interface UniversalPriceResult {
  cropName: string;
  retailPricePerQtl: number;
  mandiPricePerQtl: number;
  factoryPricePerQtl: number;
  tiers: { tier: TierLevel; qtyKg: number; pricePerQtl: number; value: number }[];
  totalValue: number;
  comparedToAllRetail: number; // % of what farmer would get if ALL were Grade-A
  valueSaved: number;          // ₹ rescued from waste
}

export function calculateUniversalPrice(assay: DigitalAssay): UniversalPriceResult {
  const config = getCropConfig(assay.cropKey);
  if (!config) throw new Error(`Unknown crop: ${assay.cropKey}`);

  const retailP = config.retailPricePerQtl;
  const mandiP = Math.round(retailP * 0.7);
  const factoryP = Math.round(retailP * 0.3);

  const tiers = assay.tiers.map((t) => ({
    tier: t.tier,
    qtyKg: t.quantityKg,
    pricePerQtl: t.pricePerQtl,
    value: t.totalValue,
  }));

  const totalValue = tiers.reduce((s, t) => s + t.value, 0);
  const allRetailValue = Math.round(assay.totalQuantityKg / 100 * retailP);
  const comparedToAllRetail = allRetailValue > 0 ? Math.round(totalValue / allRetailValue * 100) : 0;

  // Value "rescued" = what Tier 3 earned instead of ₹0 (farmer would have thrown it away)
  const tier3Value = tiers.find((t) => t.tier === 3)?.value ?? 0;

  return {
    cropName: assay.cropName,
    retailPricePerQtl: retailP,
    mandiPricePerQtl: mandiP,
    factoryPricePerQtl: factoryP,
    tiers,
    totalValue,
    comparedToAllRetail,
    valueSaved: tier3Value,
  };
}

// ─── Rescue Radar ───────────────────────────────────────────────────────────

/**
 * If Time_Since_Harvest > 80% of Shelf_Life →
 *   Flash Sale: price drops 70%, notify hyper-local NGOs / Pig Farms / Composting
 */
export function generateRescueItems(
  cropKey: string,
  tier3QuantityKg: number,
  hoursSinceHarvest: number,
): RescueItem | null {
  const config = getCropConfig(cropKey);
  if (!config || tier3QuantityKg <= 0) return null;

  const percentLifeUsed = Math.round(hoursSinceHarvest / config.shelfLifeHours * 100);
  const originalPrice = Math.round(config.retailPricePerQtl * 0.3); // factory price
  const isFlashSale = percentLifeUsed >= 80;

  return {
    id: `RESCUE-${cropKey}-${Date.now()}`,
    cropName: config.name,
    quantityKg: tier3QuantityKg,
    hoursSinceHarvest,
    shelfLifeHours: config.shelfLifeHours,
    percentLifeUsed,
    originalPricePerQtl: originalPrice,
    flashPricePerQtl: isFlashSale ? Math.round(originalPrice * 0.3) : originalPrice,
    rescueChannels: config.rescueChannels,
    status: 'active',
  };
}

/** Build mock rescue radar items from multiple crops */
export function getMockRescueRadar(): RescueItem[] {
  const items: RescueItem[] = [];
  // Simulated nearby farmers with excess Tier-3 produce
  const mocks: { crop: string; qty: number; hours: number }[] = [
    { crop: 'tomato', qty: 150, hours: 100 },
    { crop: 'spinach', qty: 80, hours: 30 },
    { crop: 'banana', qty: 200, hours: 85 },
    { crop: 'strawberry', qty: 40, hours: 42 },
    { crop: 'mango', qty: 120, hours: 150 },
  ];
  mocks.forEach((m) => {
    const item = generateRescueItems(m.crop, m.qty, m.hours);
    if (item) items.push(item);
  });
  return items;
}

// ─── Route-Matching / Milk-Run Logistics ────────────────────────────────────

/**
 * Aggregates Tier-3 produce from multiple farmers → single truck to factory.
 * "Driver, pick up 100kg bad onions from Farmer A, 200kg from Farmer B,
 *  and drop all 300kg at the Powder Factory."
 */
export function buildMilkRunRoutes(): MilkRunRoute[] {
  const routes: MilkRunRoute[] = [
    {
      id: 'MR-001',
      factoryName: 'Hindustan Unilever — Kissan Ketchup',
      factoryLocation: 'Nashik, Maharashtra',
      stops: [
        { farmerId: 'F1', farmerName: 'Ramesh Kumar', quantityKg: 100, cropName: 'Tomato', location: 'Nashik' },
        { farmerId: 'F2', farmerName: 'Priya Devi', quantityKg: 200, cropName: 'Tomato', location: 'Pune' },
        { farmerId: 'F3', farmerName: 'Suresh Patil', quantityKg: 150, cropName: 'Tomato', location: 'Satara' },
      ],
      totalQuantityKg: 450,
      truckFillPercent: 90,
      estimatedDistanceKm: 180,
      carbonSavedKg: 12.4,
      transport: 'Crate_Stackable',
    },
    {
      id: 'MR-002',
      factoryName: 'PepsiCo — Lays Chips',
      factoryLocation: 'Kolkata, West Bengal',
      stops: [
        { farmerId: 'F4', farmerName: 'Rajesh Gupta', quantityKg: 300, cropName: 'Potato', location: 'Hooghly' },
        { farmerId: 'F5', farmerName: 'Anjali Das', quantityKg: 250, cropName: 'Potato', location: 'Bardhaman' },
      ],
      totalQuantityKg: 550,
      truckFillPercent: 92,
      estimatedDistanceKm: 95,
      carbonSavedKg: 8.1,
      transport: 'Jute_Sack',
    },
    {
      id: 'MR-003',
      factoryName: 'Jain Irrigation — Onion Dehydration',
      factoryLocation: 'Jalgaon, Maharashtra',
      stops: [
        { farmerId: 'F6', farmerName: 'Sunita Patil', quantityKg: 120, cropName: 'Onion', location: 'Ahmednagar' },
        { farmerId: 'F7', farmerName: 'Manoj Jadhav', quantityKg: 180, cropName: 'Onion', location: 'Nashik' },
        { farmerId: 'F8', farmerName: 'Kavita Deshmukh', quantityKg: 200, cropName: 'Onion', location: 'Aurangabad' },
      ],
      totalQuantityKg: 500,
      truckFillPercent: 95,
      estimatedDistanceKm: 210,
      carbonSavedKg: 15.2,
      transport: 'Jute_Sack',
    },
    {
      id: 'MR-004',
      factoryName: 'McCain — Frozen Spinach',
      factoryLocation: 'Mehsana, Gujarat',
      stops: [
        { farmerId: 'F9', farmerName: 'Bhavna Patel', quantityKg: 80, cropName: 'Spinach', location: 'Ahmedabad' },
        { farmerId: 'F10', farmerName: 'Dinesh Shah', quantityKg: 60, cropName: 'Spinach', location: 'Gandhinagar' },
      ],
      totalQuantityKg: 140,
      truckFillPercent: 70,
      estimatedDistanceKm: 45,
      carbonSavedKg: 3.8,
      transport: 'Cold_Chain',
    },
  ];
  return routes;
}

// ─── Carbon Footprint helpers ───────────────────────────────────────────────

export interface CarbonSummary {
  transportMethod: string;
  isLocalLoop: boolean;         // factory within 50km?
  distancePenalty: number;      // extra ₹ if Tier-3 goes >50km
  truckFillPercent: number;
  co2PerKg: number;             // kg CO₂ per kg of produce
  greenCertification: boolean;  // truck >90% full
}

export function getCarbonSummary(
  config: CropConfig,
  distanceKm: number,
  truckFillPercent: number,
): CarbonSummary {
  const isLocalLoop = distanceKm <= 50;
  const baseCo2 = config.transport === 'Cold_Chain' ? 0.035 : 0.022; // kg CO₂ per kg per km simplified
  const fillFactor = truckFillPercent > 0 ? 100 / truckFillPercent : 2;
  const co2PerKg = parseFloat((baseCo2 * distanceKm / 100 * fillFactor).toFixed(4));

  return {
    transportMethod: config.transport,
    isLocalLoop,
    distancePenalty: isLocalLoop ? 0 : Math.round(distanceKm * 0.5), // ₹0.5/km extra
    truckFillPercent,
    co2PerKg,
    greenCertification: truckFillPercent >= 90,
  };
}

// ─── Utility ────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
