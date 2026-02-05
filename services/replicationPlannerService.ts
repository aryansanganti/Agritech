/**
 * Replication Planner Service
 * Generates comprehensive cultivation plans for replicating crops from source to target locations
 * Uses Gemini AI with Google Search for accurate, up-to-date agricultural data
 */

import { GoogleGenAI, Type } from "@google/genai";
import { ClimateData, ClimateComparison, getClimateForLocation, compareClimates } from './climateDataService';

// API Key retrieval
const getApiKey = () => {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_API_KEY;
    }
    return process.env.API_KEY || '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });
const MODEL = 'gemini-2.5-flash-preview-05-20';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface CropProfile {
    name: string;
    scientificName: string;
    variety: string;
    sourceRegion: string;
    famousFor: string;
    idealConditions: {
        temperature: { min: number; max: number; optimal: number };
        humidity: { min: number; max: number };
        rainfall: { annual: number; critical_periods: string[] };
        soil: { type: string; pH: { min: number; max: number }; drainage: string };
        sunlight: { hours: number; type: string };
        altitude: { min: number; max: number };
    };
    growingCycle: {
        totalDays: number;
        stages: GrowthStage[];
    };
    specialRequirements: string[];
}

export interface GrowthStage {
    name: string;
    durationDays: number;
    description: string;
    criticalFactors: string[];
}

export interface FertilizerSchedule {
    week: number;
    stage: string;
    fertilizer: string;
    npkRatio: string;
    applicationRate: string;
    applicationMethod: string;
    frequency: string;
    notes: string;
}

export interface IrrigationSchedule {
    week: number;
    stage: string;
    waterRequirement: string;
    frequency: string;
    method: string;
    timing: string;
    notes: string;
}

export interface PestDiseaseManagement {
    name: string;
    type: 'pest' | 'disease' | 'deficiency';
    riskPeriod: string;
    symptoms: string[];
    preventiveMeasures: string[];
    treatment: string;
    organicAlternative: string;
}

export interface WeeklyActivity {
    week: number;
    stage: string;
    activities: string[];
    fertilizer: FertilizerSchedule | null;
    irrigation: IrrigationSchedule;
    pestWatch: string[];
    weatherAlert: string;
    tips: string[];
}

export interface SoilPreparation {
    amendments: SoilAmendment[];
    bedPreparation: string;
    mulching: string;
    drainage: string;
    prePlantingSteps: string[];
}

export interface SoilAmendment {
    material: string;
    quantity: string;
    purpose: string;
    applicationTiming: string;
}

export interface ReplicationPlan {
    id: string;
    createdAt: string;
    crop: CropProfile;
    sourceLocation: string;
    targetLocation: string;
    climateComparison: ClimateComparison;
    feasibilityScore: number;
    feasibilityNotes: string;
    plantingWindow: {
        optimal: { start: string; end: string };
        acceptable: { start: string; end: string };
        avoid: string[];
    };
    soilPreparation: SoilPreparation;
    weeklySchedule: WeeklyActivity[];
    fertilizerCalendar: FertilizerSchedule[];
    irrigationPlan: IrrigationSchedule[];
    pestDiseaseCalendar: PestDiseaseManagement[];
    harvestGuidelines: {
        indicators: string[];
        timing: string;
        technique: string;
        postHarvest: string[];
    };
    costEstimate: {
        setup: number;
        monthly: number;
        perAcre: number;
        breakdown: { item: string; cost: number }[];
    };
    expectedYield: {
        quantity: string;
        quality: string;
        timeToFirstHarvest: string;
    };
    riskFactors: { risk: string; mitigation: string; likelihood: 'low' | 'medium' | 'high' }[];
    successTips: string[];
    localResources: string[];
}

// ==========================================
// CROP KNOWLEDGE BASE (Expandable)
// ==========================================

const CROP_PROFILES: Record<string, Partial<CropProfile>> = {
    'strawberry': {
        scientificName: 'Fragaria × ananassa',
        famousFor: 'Sweet, aromatic berries',
        idealConditions: {
            temperature: { min: 10, max: 26, optimal: 18 },
            humidity: { min: 60, max: 80 },
            rainfall: { annual: 800, critical_periods: ['flowering', 'fruiting'] },
            soil: { type: 'Sandy loam', pH: { min: 5.5, max: 6.8 }, drainage: 'Excellent' },
            sunlight: { hours: 8, type: 'Full sun to partial shade' },
            altitude: { min: 800, max: 2000 }
        },
        specialRequirements: ['Chilling hours (200-400)', 'Well-drained raised beds', 'Drip irrigation']
    },
    'mango': {
        scientificName: 'Mangifera indica',
        famousFor: 'King of fruits, aromatic flesh',
        idealConditions: {
            temperature: { min: 24, max: 30, optimal: 27 },
            humidity: { min: 50, max: 80 },
            rainfall: { annual: 1000, critical_periods: ['flowering needs dry spell'] },
            soil: { type: 'Deep alluvial', pH: { min: 5.5, max: 7.5 }, drainage: 'Good' },
            sunlight: { hours: 8, type: 'Full sun' },
            altitude: { min: 0, max: 600 }
        },
        specialRequirements: ['3-4 months dry period for flowering', 'Protection from frost', 'Wind breaks']
    },
    'coffee': {
        scientificName: 'Coffea arabica',
        famousFor: 'Aromatic beans, rich flavor',
        idealConditions: {
            temperature: { min: 15, max: 24, optimal: 20 },
            humidity: { min: 70, max: 85 },
            rainfall: { annual: 1500, critical_periods: ['even distribution'] },
            soil: { type: 'Volcanic, well-drained', pH: { min: 6.0, max: 6.5 }, drainage: 'Excellent' },
            sunlight: { hours: 4, type: 'Filtered/shade' },
            altitude: { min: 900, max: 1800 }
        },
        specialRequirements: ['Shade trees', 'No frost', 'High altitude for quality']
    },
    'grape': {
        scientificName: 'Vitis vinifera',
        famousFor: 'Wine and table grapes',
        idealConditions: {
            temperature: { min: 15, max: 35, optimal: 25 },
            humidity: { min: 40, max: 70 },
            rainfall: { annual: 600, critical_periods: ['dry during ripening'] },
            soil: { type: 'Well-drained, gravelly', pH: { min: 5.5, max: 7.0 }, drainage: 'Excellent' },
            sunlight: { hours: 7, type: 'Full sun' },
            altitude: { min: 0, max: 800 }
        },
        specialRequirements: ['Trellis system', 'Winter dormancy', 'Pruning expertise']
    },
    'apple': {
        scientificName: 'Malus domestica',
        famousFor: 'Crisp texture, versatile fruit',
        idealConditions: {
            temperature: { min: 4, max: 24, optimal: 18 },
            humidity: { min: 50, max: 75 },
            rainfall: { annual: 1000, critical_periods: ['steady throughout'] },
            soil: { type: 'Deep loamy', pH: { min: 6.0, max: 7.0 }, drainage: 'Good' },
            sunlight: { hours: 8, type: 'Full sun' },
            altitude: { min: 1500, max: 2700 }
        },
        specialRequirements: ['1000+ chilling hours', 'Cross-pollination', 'Cold winters']
    },
    'saffron': {
        scientificName: 'Crocus sativus',
        famousFor: 'World\'s most expensive spice',
        idealConditions: {
            temperature: { min: -10, max: 35, optimal: 20 },
            humidity: { min: 40, max: 60 },
            rainfall: { annual: 400, critical_periods: ['dry during dormancy'] },
            soil: { type: 'Sandy loam, calcareous', pH: { min: 6.0, max: 8.0 }, drainage: 'Excellent' },
            sunlight: { hours: 8, type: 'Full sun' },
            altitude: { min: 1500, max: 2500 }
        },
        specialRequirements: ['Cold winters for dormancy', 'Summer drought', 'Hand harvesting']
    },
    'tea': {
        scientificName: 'Camellia sinensis',
        famousFor: 'Aromatic beverage leaves',
        idealConditions: {
            temperature: { min: 13, max: 30, optimal: 22 },
            humidity: { min: 70, max: 90 },
            rainfall: { annual: 2000, critical_periods: ['well-distributed'] },
            soil: { type: 'Acidic, deep, well-drained', pH: { min: 4.5, max: 5.5 }, drainage: 'Good' },
            sunlight: { hours: 5, type: 'Partial shade' },
            altitude: { min: 600, max: 2000 }
        },
        specialRequirements: ['Acidic soil essential', 'Regular plucking', 'Shade trees']
    },
    'cardamom': {
        scientificName: 'Elettaria cardamomum',
        famousFor: 'Queen of spices',
        idealConditions: {
            temperature: { min: 10, max: 35, optimal: 22 },
            humidity: { min: 75, max: 95 },
            rainfall: { annual: 2500, critical_periods: ['monsoon critical'] },
            soil: { type: 'Forest loam, rich humus', pH: { min: 5.0, max: 6.5 }, drainage: 'Good' },
            sunlight: { hours: 4, type: 'Shade (50-60%)' },
            altitude: { min: 600, max: 1500 }
        },
        specialRequirements: ['Shade essential', 'High humidity', 'Forest-like environment']
    },
    'wheat': {
        scientificName: 'Triticum aestivum',
        famousFor: 'Staple grain crop',
        idealConditions: {
            temperature: { min: 10, max: 25, optimal: 18 },
            humidity: { min: 50, max: 70 },
            rainfall: { annual: 500, critical_periods: ['tillering', 'grain filling'] },
            soil: { type: 'Loamy, clay loam', pH: { min: 6.0, max: 7.5 }, drainage: 'Moderate' },
            sunlight: { hours: 8, type: 'Full sun' },
            altitude: { min: 0, max: 3000 }
        },
        specialRequirements: ['Cool growing season', 'Adequate moisture at planting', 'Dry harvest']
    },
    'rice': {
        scientificName: 'Oryza sativa',
        famousFor: 'Global staple food',
        idealConditions: {
            temperature: { min: 20, max: 35, optimal: 28 },
            humidity: { min: 70, max: 90 },
            rainfall: { annual: 1500, critical_periods: ['transplanting', 'flowering'] },
            soil: { type: 'Clay, clay loam', pH: { min: 5.5, max: 6.5 }, drainage: 'Poor (paddy)' },
            sunlight: { hours: 6, type: 'Full sun' },
            altitude: { min: 0, max: 2000 }
        },
        specialRequirements: ['Standing water', 'Puddled soil', 'Warm temperatures']
    }
};

// ==========================================
// MAIN FUNCTIONS
// ==========================================

/**
 * Generate a comprehensive crop replication plan using AI
 */
export async function generateReplicationPlan(
    cropName: string,
    sourceLocation: string,
    targetLocation: string,
    language: string = 'en',
    onProgress?: (stage: string, percent: number) => void
): Promise<ReplicationPlan> {
    const checkApiKey = () => {
        if (!apiKey) throw new Error("API Key missing. Please configure VITE_API_KEY.");
    };
    checkApiKey();

    try {
        // Stage 1: Fetch climate data
        onProgress?.('Fetching climate data...', 10);
        
        const [sourceClimate, targetClimate] = await Promise.all([
            getClimateForLocation(sourceLocation),
            getClimateForLocation(targetLocation)
        ]);
        
        onProgress?.('Comparing climates...', 25);
        const climateComparison = compareClimates(sourceClimate, targetClimate);
        
        // Stage 2: Get crop profile from AI
        onProgress?.('Researching crop requirements...', 40);
        const cropProfile = await fetchCropProfile(cropName, sourceLocation, language);
        
        // Stage 3: Generate cultivation plan
        onProgress?.('Generating cultivation schedule...', 60);
        const cultivationPlan = await generateCultivationSchedule(
            cropProfile, 
            sourceClimate, 
            targetClimate, 
            climateComparison,
            language
        );
        
        // Stage 4: Generate pest & disease calendar
        onProgress?.('Analyzing pest & disease risks...', 75);
        const pestCalendar = await generatePestDiseaseCalendar(cropName, targetLocation, language);
        
        // Stage 5: Calculate feasibility and finalize
        onProgress?.('Calculating feasibility...', 90);
        const feasibility = calculateFeasibility(climateComparison, cropProfile);
        
        onProgress?.('Finalizing plan...', 100);
        
        const plan: ReplicationPlan = {
            id: `plan_${Date.now()}`,
            createdAt: new Date().toISOString(),
            crop: cropProfile,
            sourceLocation,
            targetLocation,
            climateComparison,
            feasibilityScore: feasibility.score,
            feasibilityNotes: feasibility.notes,
            plantingWindow: cultivationPlan.plantingWindow || {
                optimal: { start: 'October 15', end: 'November 15' },
                acceptable: { start: 'September 15', end: 'December 15' },
                avoid: ['Peak summer', 'Heavy monsoon']
            },
            soilPreparation: cultivationPlan.soilPreparation || {
                amendments: [],
                bedPreparation: 'Prepare raised beds',
                mulching: 'Organic mulch recommended',
                drainage: 'Good drainage required',
                prePlantingSteps: ['Soil test', 'pH adjustment']
            },
            weeklySchedule: cultivationPlan.weeklySchedule || [],
            fertilizerCalendar: cultivationPlan.fertilizerCalendar || [],
            irrigationPlan: cultivationPlan.irrigationPlan || [],
            pestDiseaseCalendar: pestCalendar,
            harvestGuidelines: cultivationPlan.harvestGuidelines || {
                indicators: ['Maturity signs'],
                timing: 'Early morning',
                technique: 'Hand harvesting',
                postHarvest: ['Grade', 'Pack', 'Store cool']
            },
            costEstimate: cultivationPlan.costEstimate || {
                setup: 100000,
                monthly: 10000,
                perAcre: 150000,
                breakdown: []
            },
            expectedYield: cultivationPlan.expectedYield || {
                quantity: 'Varies by management',
                quality: 'Grade A possible',
                timeToFirstHarvest: `${cropProfile.growingCycle.totalDays} days`
            },
            riskFactors: cultivationPlan.riskFactors || [],
            successTips: cultivationPlan.successTips || [],
            localResources: await getLocalResources(targetLocation, cropName)
        };
        
        return plan;
    } catch (error) {
        console.error('Failed to generate replication plan:', error);
        throw error;
    }
}

/**
 * Fetch detailed crop profile using Gemini with Google Search
 */
async function fetchCropProfile(cropName: string, sourceLocation: string, language: string): Promise<CropProfile> {
    const baseProfile = CROP_PROFILES[cropName.toLowerCase()] || {};
    
    const prompt = `You are an expert agronomist. Research and provide comprehensive cultivation data for growing ${cropName} as cultivated in ${sourceLocation}.

Use your knowledge and search capabilities to find accurate, current agricultural data.

Provide the following in JSON format:
{
    "name": "Common crop name",
    "scientificName": "Latin name",
    "variety": "Best variety from ${sourceLocation}",
    "sourceRegion": "${sourceLocation}",
    "famousFor": "What makes this region's crop special",
    "idealConditions": {
        "temperature": { "min": number, "max": number, "optimal": number },
        "humidity": { "min": percent, "max": percent },
        "rainfall": { "annual": mm, "critical_periods": ["period1", "period2"] },
        "soil": { "type": "soil type", "pH": { "min": number, "max": number }, "drainage": "type" },
        "sunlight": { "hours": number, "type": "description" },
        "altitude": { "min": meters, "max": meters }
    },
    "growingCycle": {
        "totalDays": number,
        "stages": [
            { "name": "Stage name", "durationDays": number, "description": "details", "criticalFactors": ["factor1"] }
        ]
    },
    "specialRequirements": ["requirement1", "requirement2"]
}

Be specific with numbers based on real agricultural data for ${sourceLocation}.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        const aiProfile = JSON.parse(text);
        return { ...baseProfile, ...aiProfile } as CropProfile;
    } catch (e) {
        console.error('Failed to fetch crop profile:', e);
        // Return base profile if AI fails
        return {
            name: cropName,
            scientificName: baseProfile.scientificName || 'Unknown',
            variety: `${sourceLocation} variety`,
            sourceRegion: sourceLocation,
            famousFor: baseProfile.famousFor || `Premium ${cropName} cultivation`,
            idealConditions: baseProfile.idealConditions || {
                temperature: { min: 15, max: 30, optimal: 22 },
                humidity: { min: 50, max: 80 },
                rainfall: { annual: 1000, critical_periods: ['growing season'] },
                soil: { type: 'Loamy', pH: { min: 6.0, max: 7.0 }, drainage: 'Good' },
                sunlight: { hours: 6, type: 'Full sun' },
                altitude: { min: 0, max: 1500 }
            },
            growingCycle: {
                totalDays: 120,
                stages: [
                    { name: 'Germination', durationDays: 14, description: 'Seed germination', criticalFactors: ['moisture', 'temperature'] },
                    { name: 'Vegetative', durationDays: 45, description: 'Leaf and stem growth', criticalFactors: ['nitrogen', 'water'] },
                    { name: 'Flowering', durationDays: 21, description: 'Flower development', criticalFactors: ['phosphorus', 'temperature'] },
                    { name: 'Fruiting', durationDays: 40, description: 'Fruit development', criticalFactors: ['potassium', 'sunlight'] }
                ]
            },
            specialRequirements: baseProfile.specialRequirements || []
        };
    }
}

/**
 * Generate week-by-week cultivation schedule
 */
async function generateCultivationSchedule(
    crop: CropProfile,
    sourceClimate: ClimateData,
    targetClimate: ClimateData,
    comparison: ClimateComparison,
    language: string
): Promise<Partial<ReplicationPlan>> {
    
    const prompt = `You are an expert agricultural consultant. Create a detailed week-by-week cultivation plan for growing ${crop.name} (${crop.variety}) at a new location.

SOURCE REGION: ${crop.sourceRegion}
- Temperature: ${sourceClimate.temperature.mean}°C avg
- Rainfall: ${sourceClimate.rainfall.annual}mm/year
- Humidity: ${sourceClimate.humidity.avg}%

TARGET REGION CLIMATE:
- Temperature: ${targetClimate.temperature.mean}°C avg (${comparison.gaps.find(g => g.parameter === 'Temperature')?.difference || 0}°C difference)
- Rainfall: ${targetClimate.rainfall.annual}mm/year
- Humidity: ${targetClimate.humidity.avg}%
- Climate Zone: ${targetClimate.climate_zone}

CLIMATE GAPS TO ADDRESS:
${comparison.gaps.map(g => `- ${g.parameter}: ${g.severity} severity - ${g.impact}`).join('\n')}

CROP GROWING CYCLE: ${crop.growingCycle.totalDays} days total
${crop.growingCycle.stages.map(s => `- ${s.name}: ${s.durationDays} days`).join('\n')}

Create a comprehensive JSON response with:
1. Optimal planting window for target location
2. Soil preparation requirements with specific amendments
3. Week-by-week schedule for entire growing cycle
4. Fertilizer calendar with exact NPK ratios and rates
5. Irrigation plan adjusted for target climate
6. Harvest guidelines
7. Cost estimates (in INR)
8. Expected yield
9. Risk factors and mitigation
10. Success tips specific to this replication

JSON Structure:
{
    "plantingWindow": {
        "optimal": { "start": "Month Day", "end": "Month Day" },
        "acceptable": { "start": "Month Day", "end": "Month Day" },
        "avoid": ["reason1", "reason2"]
    },
    "soilPreparation": {
        "amendments": [{ "material": "name", "quantity": "kg/acre", "purpose": "why", "applicationTiming": "when" }],
        "bedPreparation": "detailed instructions",
        "mulching": "type and method",
        "drainage": "requirements",
        "prePlantingSteps": ["step1", "step2"]
    },
    "weeklySchedule": [
        {
            "week": 1,
            "stage": "stage name",
            "activities": ["activity1", "activity2"],
            "fertilizer": { "fertilizer": "name", "npkRatio": "N:P:K", "applicationRate": "amount", "applicationMethod": "how", "frequency": "how often", "notes": "tips" } or null,
            "irrigation": { "waterRequirement": "liters/day", "frequency": "how often", "method": "drip/flood/etc", "timing": "best time", "notes": "tips" },
            "pestWatch": ["pest1", "disease1"],
            "weatherAlert": "what to watch for",
            "tips": ["tip1", "tip2"]
        }
    ],
    "fertilizerCalendar": [{ "week": 1, "stage": "name", "fertilizer": "name", "npkRatio": "ratio", "applicationRate": "rate", "applicationMethod": "method", "frequency": "freq", "notes": "notes" }],
    "irrigationPlan": [{ "week": 1, "stage": "name", "waterRequirement": "amount", "frequency": "freq", "method": "method", "timing": "time", "notes": "notes" }],
    "harvestGuidelines": {
        "indicators": ["indicator1", "indicator2"],
        "timing": "best time to harvest",
        "technique": "how to harvest",
        "postHarvest": ["step1", "step2"]
    },
    "costEstimate": {
        "setup": number_in_INR,
        "monthly": number_in_INR,
        "perAcre": number_in_INR,
        "breakdown": [{ "item": "name", "cost": number }]
    },
    "expectedYield": {
        "quantity": "amount per acre",
        "quality": "expected quality grade",
        "timeToFirstHarvest": "days/months"
    },
    "riskFactors": [{ "risk": "description", "mitigation": "how to prevent", "likelihood": "low|medium|high" }],
    "successTips": ["tip1", "tip2", "tip3"]
}

Provide realistic, actionable data based on agricultural best practices.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) throw new Error("No cultivation schedule generated");
        
        return JSON.parse(text);
    } catch (e) {
        console.error('Failed to generate cultivation schedule:', e);
        // Return a basic template
        return generateFallbackSchedule(crop, targetClimate);
    }
}

/**
 * Generate pest and disease management calendar
 */
async function generatePestDiseaseCalendar(
    cropName: string,
    targetLocation: string,
    language: string
): Promise<PestDiseaseManagement[]> {
    
    const prompt = `List the major pests, diseases, and nutrient deficiencies that affect ${cropName} cultivation, especially relevant to the ${targetLocation} region.

For each, provide:
{
    "name": "Pest/Disease name",
    "type": "pest" | "disease" | "deficiency",
    "riskPeriod": "When most likely to occur",
    "symptoms": ["symptom1", "symptom2"],
    "preventiveMeasures": ["measure1", "measure2"],
    "treatment": "Chemical/conventional treatment",
    "organicAlternative": "Organic treatment option"
}

Return as JSON array of at least 8 common issues.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) throw new Error("No pest calendar generated");
        
        return JSON.parse(text);
    } catch (e) {
        console.error('Failed to generate pest calendar:', e);
        return [
            {
                name: 'Aphids',
                type: 'pest',
                riskPeriod: 'Spring and early summer',
                symptoms: ['Curled leaves', 'Sticky honeydew', 'Stunted growth'],
                preventiveMeasures: ['Regular inspection', 'Companion planting with marigolds', 'Maintain plant health'],
                treatment: 'Imidacloprid spray',
                organicAlternative: 'Neem oil spray or soap solution'
            },
            {
                name: 'Fungal root rot',
                type: 'disease',
                riskPeriod: 'Rainy season, waterlogged conditions',
                symptoms: ['Wilting', 'Yellow leaves', 'Brown roots'],
                preventiveMeasures: ['Good drainage', 'Avoid overwatering', 'Raised beds'],
                treatment: 'Fungicide drench (Metalaxyl)',
                organicAlternative: 'Trichoderma viride application'
            }
        ];
    }
}

/**
 * Get local resources and suppliers for target location
 */
async function getLocalResources(targetLocation: string, cropName: string): Promise<string[]> {
    try {
        const prompt = `List helpful local resources for someone starting ${cropName} cultivation in ${targetLocation}:
        - Agricultural extension offices
        - Seed/plant suppliers
        - Farmer producer organizations
        - Government schemes
        - Training programs
        
        Return as JSON array of strings with specific names/contacts where possible.`;

        const response = await ai.models.generateContent({
            model: MODEL,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (text) {
            return JSON.parse(text);
        }
    } catch (e) {
        console.error('Failed to fetch local resources:', e);
    }
    
    return [
        `Contact local Krishi Vigyan Kendra (KVK) for training`,
        `Register with local Agricultural Produce Market Committee (APMC)`,
        `Check state agriculture department for subsidies`,
        `Join local farmer producer organization (FPO)`
    ];
}

/**
 * Calculate feasibility score based on climate comparison
 */
function calculateFeasibility(comparison: ClimateComparison, crop: CropProfile): { score: number; notes: string } {
    let score = comparison.similarity;
    const notes: string[] = [];
    
    // Adjust based on critical gaps
    const criticalGaps = comparison.gaps.filter(g => g.severity === 'critical');
    const highGaps = comparison.gaps.filter(g => g.severity === 'high');
    
    if (criticalGaps.length > 0) {
        score -= criticalGaps.length * 15;
        notes.push(`Critical gaps in: ${criticalGaps.map(g => g.parameter).join(', ')}`);
    }
    
    if (highGaps.length > 0) {
        score -= highGaps.length * 8;
        notes.push(`High adjustments needed for: ${highGaps.map(g => g.parameter).join(', ')}`);
    }
    
    // Check special requirements
    if (crop.specialRequirements && crop.specialRequirements.length > 0) {
        notes.push(`Special requirements: ${crop.specialRequirements.slice(0, 2).join(', ')}`);
    }
    
    score = Math.max(0, Math.min(100, score));
    
    let assessment = '';
    if (score >= 80) assessment = 'Excellent feasibility. Minor adjustments needed.';
    else if (score >= 60) assessment = 'Good feasibility with proper infrastructure investment.';
    else if (score >= 40) assessment = 'Moderate feasibility. Significant modifications required.';
    else assessment = 'Challenging. Consider alternative crops or intensive controlled environment.';
    
    notes.unshift(assessment);
    
    return { score: Math.round(score), notes: notes.join(' ') };
}

/**
 * Fallback schedule generator when AI fails
 */
function generateFallbackSchedule(crop: CropProfile, targetClimate: ClimateData): Partial<ReplicationPlan> {
    const totalWeeks = Math.ceil(crop.growingCycle.totalDays / 7);
    const weeklySchedule: WeeklyActivity[] = [];
    
    let currentWeek = 1;
    for (const stage of crop.growingCycle.stages) {
        const stageWeeks = Math.ceil(stage.durationDays / 7);
        for (let w = 0; w < stageWeeks; w++) {
            weeklySchedule.push({
                week: currentWeek++,
                stage: stage.name,
                activities: [stage.description],
                fertilizer: null,
                irrigation: {
                    week: currentWeek - 1,
                    stage: stage.name,
                    waterRequirement: '20-30 liters/plant/week',
                    frequency: 'Every 2-3 days',
                    method: 'Drip irrigation recommended',
                    timing: 'Early morning',
                    notes: 'Adjust based on rainfall'
                },
                pestWatch: ['Monitor regularly'],
                weatherAlert: 'Watch for extreme temperatures',
                tips: stage.criticalFactors
            });
        }
    }
    
    return {
        plantingWindow: {
            optimal: { start: 'October 15', end: 'November 15' },
            acceptable: { start: 'September 15', end: 'December 15' },
            avoid: ['Peak summer months', 'Heavy monsoon period']
        },
        soilPreparation: {
            amendments: [
                { material: 'Well-rotted compost', quantity: '10 tons/acre', purpose: 'Improve organic matter', applicationTiming: '2 weeks before planting' },
                { material: 'Neem cake', quantity: '200 kg/acre', purpose: 'Pest prevention + nitrogen', applicationTiming: 'At planting' }
            ],
            bedPreparation: 'Prepare raised beds 15-20cm high, 1m wide',
            mulching: 'Apply 4-inch layer of straw or plastic mulch',
            drainage: 'Ensure proper slope for water drainage',
            prePlantingSteps: ['Soil testing', 'pH adjustment if needed', 'Install irrigation system']
        },
        weeklySchedule,
        fertilizerCalendar: [],
        irrigationPlan: [],
        harvestGuidelines: {
            indicators: ['Fruit color change', 'Fruit firmness', 'Taste test'],
            timing: 'Early morning harvest',
            technique: 'Hand picking with care',
            postHarvest: ['Grade by size', 'Pack in ventilated containers', 'Store at cool temperature']
        },
        costEstimate: {
            setup: 150000,
            monthly: 15000,
            perAcre: 200000,
            breakdown: [
                { item: 'Plants/Seeds', cost: 30000 },
                { item: 'Irrigation setup', cost: 40000 },
                { item: 'Fertilizers & amendments', cost: 25000 },
                { item: 'Labor', cost: 50000 },
                { item: 'Miscellaneous', cost: 55000 }
            ]
        },
        expectedYield: {
            quantity: 'Varies by crop',
            quality: 'Grade A with proper care',
            timeToFirstHarvest: `${crop.growingCycle.totalDays} days`
        },
        riskFactors: [
            { risk: 'Climate mismatch', mitigation: 'Use climate control structures', likelihood: 'medium' },
            { risk: 'Pest outbreak', mitigation: 'Regular monitoring and IPM', likelihood: 'medium' },
            { risk: 'Water shortage', mitigation: 'Rainwater harvesting + drip irrigation', likelihood: 'low' }
        ],
        successTips: [
            'Start small, learn, then scale up',
            'Connect with successful farmers in the source region',
            'Document everything for continuous improvement',
            'Join farmer groups for knowledge sharing'
        ]
    };
}

/**
 * Quick feasibility check without full plan generation
 */
export async function quickFeasibilityCheck(
    cropName: string,
    sourceLocation: string,
    targetLocation: string
): Promise<{ score: number; summary: string; canReplicate: boolean }> {
    try {
        const [sourceClimate, targetClimate] = await Promise.all([
            getClimateForLocation(sourceLocation),
            getClimateForLocation(targetLocation)
        ]);
        
        const comparison = compareClimates(sourceClimate, targetClimate);
        const baseProfile = CROP_PROFILES[cropName.toLowerCase()];
        
        let score = comparison.similarity;
        
        // Adjust for known crop requirements
        if (baseProfile?.idealConditions) {
            const tempDiff = Math.abs(targetClimate.temperature.mean - baseProfile.idealConditions.temperature.optimal);
            if (tempDiff > 10) score -= 20;
            else if (tempDiff > 5) score -= 10;
        }
        
        score = Math.max(0, Math.min(100, score));
        
        return {
            score: Math.round(score),
            summary: score >= 70 
                ? `Good potential for ${cropName} replication with ${comparison.adjustments.length} adjustments needed`
                : score >= 40
                ? `${cropName} cultivation possible with significant infrastructure investment`
                : `${cropName} replication will be challenging. Consider controlled environment or alternative crops.`,
            canReplicate: score >= 40
        };
    } catch (e) {
        console.error('Quick feasibility check failed:', e);
        return {
            score: 50,
            summary: 'Unable to complete full analysis. Manual assessment recommended.',
            canReplicate: true
        };
    }
}
