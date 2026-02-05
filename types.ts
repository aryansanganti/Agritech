
export type Language = 'en' | 'hi' | 'or' | 'bn' | 'zh' | 'es' | 'ru' | 'ja' | 'pt';

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
    [key: string]: any; // Allow extensibility for API
}

export type PageView =
    | 'language'
    | 'auth'
    | 'dashboard'
    | 'disease-detection'
    | 'yield-prediction'
    | 'smart-advisory'
    | 'chatbot'
    | 'crop-recommendation'
    | 'weather'
    | 'analytics'
    | 'profile'
    | 'soil-analysis';
    | 'seedscout';

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
    nutrientMirror: string;
    thirstTracker: string;
    rootComfort: string;
    salinityAlarm: string;
    analyzeSoil: string;
    analyzing: string;
}
