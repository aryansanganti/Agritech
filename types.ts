
export type Language = 'en' | 'hi' | 'or' | 'bn' | 'te' | 'zh' | 'es' | 'ru' | 'ja' | 'pt';

export interface User {
    email: string;
    name: string;
    location?: string;
    phone?: string;
    farmSize?: string;
    memberSince?: string;
    soilType?: string;
    mainCrop?: string;
    irrigationSource?: string;
    role?: 'farmer' | 'vendor'; // Added for Marketplace
    [key: string]: any; // Allow extensibility for API
}

export interface Listing {
    id: string;
    farmerName: string;
    crop: string;
    variety: string;
    grade: 'A' | 'B' | 'C' | 'D';
    price: number; // Farmer's price in ₹/q
    marketPrice: number; // Avg Mandi Price in ₹/q
    quantity: number; // in Quintals
    location: string | { district: string; state: string };
    image: string; // Base64 or URL
    analysisId?: string; // Link to crop analysis
    blockchainHash?: string; // Fake hash for verification
    harvestDate: string;
    // 3-Tier Routing Protocol (New fields - optional for backward compatibility)
    tierRouting?: {
        tier: 'tier1' | 'tier2' | 'tier3';
        tierName: string;
        destination: string;
        targetBuyer?: string;
        transportMethod?: string;
    };
    rescueRadar?: boolean; // Flash sale eligible
    hoursSinceHarvest?: number;
}

export type PageView =
    | 'landing'
    | 'language'
    | 'auth'
    | 'dashboard'
    | 'marketplace'
    | 'disease-detection'
    | 'yield-prediction'
    | 'smart-advisory'
    | 'chatbot'
    | 'crop-recommendation'
    | 'weather'
    | 'analytics'
    | 'profile'
    | 'soil-analysis'
    | 'seedscout'
    | 'crop-analysis'
    | 'pricing-engine'
    | 'replication-planner';

export interface Detection {
    label: string;
    bbox: number[]; // [ymin, xmin, ymax, xmax]
    confidence: number;
}

export interface CropAnalysisResult {
    detectedCrop: string;
    isMatch: boolean;
    grading: {
        overallGrade: 'A' | 'B' | 'C';
        colorChecking: string;
        sizeCheck: string;
        textureCheck: string;
        shapeCheck: string;
    };
    bbox?: number[]; // Legacy support
    detections?: Detection[]; // New multi-object support
    health: {
        lesions: string;
        chlorosis: string;
        pestDamage: string;
        mechanicalDamage: string;
        diseaseName?: string;
        confidence?: number;
    };
    market: {
        estimatedPrice: number;
        priceDriver: string;
        demandFactor: string;
    };
} // end CropAnalysisResult

// SeedScout Types
export interface DistrictData {
    id: string;
    name: string;
    state: string;
    lat: number;
    lng: number;
    salinity: number;        // EC value in dS/m (0-16)
    maxTemp: number;         // Average max temp in °C
    rainfall: number;        // Annual rainfall in mm
    tribalPercent: number;   // Tribal population percentage
    cluster?: number;        // K-Means cluster assignment
}

export interface SeedScoutQuery {
    cropType: string;
    salinityTolerance: boolean;
    heatTolerance: boolean;
    droughtTolerance: boolean;
    salinityWeight: number;
    heatWeight: number;
    droughtWeight: number;
}

export interface HotspotResult {
    district: DistrictData;
    traitScore: number;
    salinityScore: number;
    heatScore: number;
    droughtScore: number;
    tribalScore: number;
    recommendation: string;
}

export interface WeatherData {
    temp: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    location: string;
    description: string;
    forecast: Array<{ day: string; temp: number; icon: 'sunny' | 'rain' | 'cloudy' | 'storm' | 'partly-cloudy'; condition: string }>;
    advisory: string;
    sourceUrls?: string[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

// Pricing Engine Types
export interface MandiPriceRecord {
    state: string;
    district: string;
    market: string;
    commodity: string;
    variety: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    date: string;
    source: string;
}

export interface PricingPrediction {
    crop: string;
    location: string;
    minGuaranteedPrice: number;
    expectedPriceBand: {
        low: number;
        high: number;
    };
    confidenceScore: number;
    arbitrationReasoning: string;
    sourceAnalysis: Array<{
        name: string;
        reliability: number;
        contribution: string;
    }>;
    timestamp: string;
}

export interface DiseaseResult {
    disease: string;
    confidence: number;
    treatment: string;
    preventative: string;
}

export interface CropRec {
    name: string;
    suitability: number;
    reason: string;
    duration: string;
}

export interface YieldResult {
    predicted_yield: string;
    unit: string;
    confidence: number;
    influencing_factors: string[];
    suggestions: string;
}

export interface AdvisoryResult {
    irrigation: string;
    fertilizer: string;
    pesticides: string;
}

export interface AnalyticsData {
    yieldHistory: Array<{ year: string; yield: number }>;
    marketPrices: Array<{ month: string; price: number }>;
    expenses: Array<{ category: string; amount: number }>;
}

// Blockchain Types
export interface BlockchainTransaction {
    transactionHash: string;
    blockNumber: number;
    timestamp: string;
    data: {
        crop: string;
        location: string;
        qualityScore: number;
        amount: number;
        pricePerQuintal: {
            min: number;
            max: number;
            guaranteed: number;
        };
        farmerUpiId?: string;
        confidenceScore: number;
    };
    verified: boolean;
}

export interface MarketplaceListing extends Listing {
    farmerId?: string; // Optional because service uses farmerAddress
    farmerAddress?: string;
    verificationStatus: 'verified' | 'pending' | 'unverified';

    // Additional fields from service
    qualityScore: number;
    minPrice: number;
    maxPrice: number;
    guaranteedPrice: number;
    transactionHash: string;
    etherscanUrl: string;
    contractAddress: string;
    recordId: number;
    gradingDetails?: {
        colorChecking: string;
        sizeCheck: string;
        textureCheck: string;
        shapeCheck: string;
    };
    listedDate: string;
    timestamp: number;
    description?: string;
}

export interface QRCodeData {
    type: 'quality' | 'payment';
    transactionHash: string;
    data: {
        crop?: string;
        qualityScore?: number;
        amount?: number;
        verificationUrl?: string;
        upiId?: string;
        payeeName?: string;
        transactionNote?: string;
    };
}

export interface SoilMetrics {
    soc: number;         // 0-100 (Derived from Value)
    moisture: number;    // 0-100 (Derived from Value/Darkness)
    salinity: number;    // 0-100 (White pixel density)
    texture: number;     // 0-100 (Variance/Roughness)
    cracks: boolean;     // True/False (Edge density)
    description: string; // Summary of spectral analysis
}

export interface SoilAnalysisResult {
    metrics: SoilMetrics;
    aiAdvice: string;
    soilType: string;
    recommendedCrops: string[];
}

export interface Translations {
    welcome: string;
    subtitle: string;
    loginTitle: string;
    signupTitle: string;
    name: string;
    email: string;
    password: string;
    location: string;
    dashboard: string;
    disease: string;
    yield: string;
    advisory: string;
    recommend: string;
    weather: string;
    analytics: string;
    profile: string;
    status: string;
    optimal: string;
    quickActions: string;
    farmConditions: string;
    logout: string;
    greeting: string;
    humidity: string;
    wind: string;
    rain: string;
    irrigation: string;
    fertilizer: string;
    pesticides: string;
    lightMode: string;
    darkMode: string;
    activeAlerts: string;
    soilAnalysis: string;
    cropAnalysis: string;
    nutrientMirror: string;
    thirstTracker: string;
    rootComfort: string;
    salinityAlarm: string;
    analyzeSoil: string;
    analyzing: string;
}

// Topo-Seed Engine Types
export interface TopologyResult {
    topology: string;
    twins: string[];
    message: string;
}

export interface SeedRecommendation {
    seed_name: string;
    primary_topology: string[];
    secondary_topology: string[];
    requirements: {
        min_humidity: number;
        soil_type: string;
        altitude_min: number;
        min_temp: number;
        max_temp: number;
    };
    cultural_note: string;
    crop_type: string;
    image_url: string;
    matchType: 'Native' | 'Twin-Adaptation';
    matchReason: string;
}

export interface RecommendationResponse {
    user_location: {
        topology: string;
        twins: string[];
    };
    weather_snapshot: {
        humidity: number;
        temp: number;
    };
    recommendations: SeedRecommendation[];
}
