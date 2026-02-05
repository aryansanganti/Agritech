import { GoogleGenAI, Type } from "@google/genai";
import { DiseaseResult, CropRec, YieldResult, AdvisoryResult, WeatherData, MandiPriceRecord, PricingPrediction } from "../types";

// ROBUST KEY RETRIEVAL:
// 1. Check process.env.API_KEY (Node/standard envs)
// 2. Check import.meta.env.VITE_API_KEY (Vite/Production builds)
// 3. Fallback to empty string (will cause error if used)
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

const MODEL_REASONING = 'gemini-3-pro-preview';
const MODEL_VISION = 'gemini-3-flash-preview'; 
const MODEL_FAST = 'gemini-3-flash-preview';

// Helper to check if key is present for UI indicators
export const isConfigured = () => !!apiKey && apiKey.length > 0;

const getLangName = (code: string) => {
    const map: Record<string, string> = {
        en: 'English', hi: 'Hindi', or: 'Odia', bn: 'Bengali',
        zh: 'Mandarin Chinese', es: 'Spanish', ru: 'Russian',
        ja: 'Japanese', pt: 'Portuguese'
    };
    return map[code] || 'English';
};

// Helper to validate key existence before calls
const checkApiKey = () => {
    if (!apiKey) {
        console.error("API Key is missing! Please set VITE_API_KEY or API_KEY in your environment variables.");
        throw new Error("API Key missing. Please configure VITE_API_KEY in your .env file or deployment settings.");
    }
};

export const analyzeCropDisease = async (base64Image: string, language: string): Promise<DiseaseResult> => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        const prompt = `Analyze this image of a crop. Identify if there is any disease. 
        If healthy, state it. If diseased, provide the name, confidence level (0-100), treatment, and preventative measures.
        Respond in language: ${langName}.`;

        const response = await ai.models.generateContent({
            model: MODEL_VISION,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        disease: { type: Type.STRING },
                        confidence: { type: Type.NUMBER },
                        treatment: { type: Type.STRING },
                        preventative: { type: Type.STRING }
                    },
                    required: ["disease", "confidence", "treatment", "preventative"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");
        return JSON.parse(text) as DiseaseResult;
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        throw error;
    }
};

export const getCropRecommendations = async (soil: string, season: string, location: string, language: string): Promise<CropRec[]> => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        const prompt = `Suggest 3 suitable crops for: Soil=${soil}, Season=${season}, Location=${location}. 
        Provide suitability percentage, reason, and duration. Language: ${langName}.`;

        const response = await ai.models.generateContent({
            model: MODEL_REASONING,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            suitability: { type: Type.NUMBER },
                            reason: { type: Type.STRING },
                            duration: { type: Type.STRING }
                        },
                        required: ["name", "suitability", "reason", "duration"]
                    }
                }
            }
        });

        const text = response.text;
        if (!text) return [];
        return JSON.parse(text) as CropRec[];
    } catch (error) {
        console.error("Gemini Recommendation Error:", error);
        return [];
    }
};

export const chatWithBhumi = async (history: { role: string, parts: { text: string }[] }[], message: string, language: string) => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        const chat = ai.chats.create({
            model: MODEL_REASONING,
            history: history,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: `You are Bhumi, a wise and friendly agricultural expert friend. 
                - Your Goal: Help farmers with practical, empathetic advice.
                - Personality: Warm, human-like, encouraging. Avoid being robotic. Speak like a knowledgeable neighbor.
                - Language Rule: You MUST strictly respond in ${langName} ONLY.
                - Capabilities: Use Google Search to provide REAL-TIME weather, prices, and news.
                - Formatting: Keep paragraphs short. Do NOT use Markdown.`
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw error;
    }
};

// Simplified Agent for Voice interaction (Faster Model)
export const voiceAgentChat = async (message: string) => {
    if (!apiKey) return "Please configure your API Key to chat with Bhumi.";
    try {
        const chat = ai.chats.create({
            model: MODEL_FAST,
            config: {
                systemInstruction: `You are Bhumi, a magical farm spirit voice. 
                 Keep answers VERY short (1-2 sentences), conversational, and helpful. 
                 You are talking to a farmer. Be instant and warm.`
            }
        });
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        return "I am having trouble hearing you clearly.";
    }
};

export const getYieldPrediction = async (data: any, language: string): Promise<YieldResult> => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        const prompt = `Act as an expert agronomist. Predict crop yield based on detailed inputs: 
        Crop: ${data.crop}, Area: ${data.area} acres, Soil: ${data.soil}, Season: ${data.season}, Previous Crop: ${data.previous}, Irrigation: ${data.irrigation}, Seed Variety: ${data.seed}.
        Language: ${langName}.
        Provide output in JSON format including yield range, unit, confidence, influencing factors, and agronomic suggestions.`;

        const response = await ai.models.generateContent({
            model: MODEL_REASONING,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        predicted_yield: { type: Type.STRING, description: "e.g. 2.5 - 3.0" },
                        unit: { type: Type.STRING, description: "e.g. Tonnes" },
                        confidence: { type: Type.NUMBER },
                        influencing_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestions: { type: Type.STRING }
                    },
                    required: ["predicted_yield", "unit", "confidence", "influencing_factors", "suggestions"]
                }
            }
        });
        const text = response.text;
        if (!text) throw new Error("No data");
        return JSON.parse(text) as YieldResult;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getSmartAdvisory = async (data: any, language: string): Promise<AdvisoryResult> => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        const prompt = `Provide specific agricultural advice for:
        Crop: ${data.crop}, Stage: ${data.stage}, Problem: ${data.problem || 'General Care'}.
        Language: ${langName}.
        Return JSON with specific fields for Irrigation, Fertilizer, and Pesticides.`;

        const response = await ai.models.generateContent({
            model: MODEL_REASONING,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        irrigation: { type: Type.STRING },
                        fertilizer: { type: Type.STRING },
                        pesticides: { type: Type.STRING }
                    },
                    required: ["irrigation", "fertilizer", "pesticides"]
                }
            }
        });
        return JSON.parse(response.text || '{}') as AdvisoryResult;
    } catch (e) {
        console.error(e);
        return { irrigation: "N/A", fertilizer: "N/A", pesticides: "N/A" };
    }
};

export const getWeatherForecast = async (location: string, language: string): Promise<WeatherData> => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        const prompt = `Get current weather and 5-day forecast for ${location}. 
        Provide a short farming advisory.
        Translate to ${langName}.
        Return JSON schema.`;

        const response = await ai.models.generateContent({
            model: MODEL_REASONING,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        temp: { type: Type.NUMBER },
                        humidity: { type: Type.NUMBER },
                        windSpeed: { type: Type.NUMBER },
                        condition: { type: Type.STRING },
                        location: { type: Type.STRING },
                        description: { type: Type.STRING },
                        forecast: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.STRING },
                                    temp: { type: Type.NUMBER },
                                    icon: { type: Type.STRING, enum: ['sunny', 'rain', 'cloudy', 'storm', 'partly-cloudy'] },
                                    condition: { type: Type.STRING }
                                }
                            }
                        },
                        advisory: { type: Type.STRING }
                    },
                    required: ["temp", "humidity", "windSpeed", "condition", "location", "description", "forecast", "advisory"]
                }
            }
        });

        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sourceUrls = grounding?.map((g: any) => g.web?.uri).filter((u: any) => u) || [];

        const data = JSON.parse(response.text || '{}') as WeatherData;
        data.sourceUrls = sourceUrls;
        return data;
    } catch (e) {
        console.error("Weather Error", e);
        throw e;
    }
};

export const getAnalyticsInsight = async (data: any, language: string): Promise<string> => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        const prompt = `Analyze this agricultural data and provide strategic insights in ${langName}.
        Data: ${JSON.stringify(data)}
        Use search to check market prices in India.
        Keep it concise.`;

        const response = await ai.models.generateContent({
            model: MODEL_REASONING,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        return response.text || "Analysis unavailable.";
    } catch (e) {
        return "Could not generate analysis.";
    }
};

export const getSeedScoutInsights = async (district: any, crop: string, language: string): Promise<string> => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        const prompt = `Act as a senior agricultural geneticist. Analyze this region for "SeedScout" - a project finding climate-resilient genes in tribal areas.
        
        Target Region: ${district.name}, ${district.state}
        Environmental Data:
        - Salinity: ${district.salinity} dS/m (High > 4)
        - Max Temp: ${district.maxTemp}°C (High > 40)
        - Rainfall: ${district.rainfall} mm
        - Tribal Population: ${district.tribalPercent}%
        
        Target Crop: ${crop}
        
        Task:
        1. Explain WHY this specific district is a "Genetic Goldmine" for ${crop}.
        2. Hypothesize what specific genes (e.g., "HKT1;5 gene for salinity") might have evolved here due to the environment.
        3. Provide a brief "Field Survey Strategy" for scientists visiting this tribal belt.
        
        Language: ${langName}.
        Format: Markdown. Keep it inspiring and scientific.`;

        const response = await ai.models.generateContent({
            model: MODEL_REASONING,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }] // Use Search to find real gene info if possible
            }
        });
        return response.text || "Insight generation failed.";
    } catch (e) {
        console.error("SeedScout Insight Error:", e);
        return "Unable to generate insights at this moment.";
    }
};

// NEW: Fetch real environmental data for a district using Gemini with Google Search
export interface DistrictEnvironmentalData {
    salinity: number;      // EC in dS/m
    maxTemp: number;       // Maximum temperature in °C
    rainfall: number;      // Annual rainfall in mm
    tribalPercent: number; // Tribal population percentage
    lat: number;
    lng: number;
    dataSource: 'gemini' | 'cached' | 'fallback';
    confidence: number;    // 0-100 confidence in data accuracy
}

export const getDistrictEnvironmentalData = async (
    districtName: string,
    state: string
): Promise<DistrictEnvironmentalData> => {
    checkApiKey();
    try {
        const prompt = `You are an agricultural data expert. Use Google Search to find REAL environmental data for ${districtName} district, ${state}, India.

        Find and return:
        1. Soil salinity (EC in dS/m) - Check Soil Health Card data, ICAR reports
        2. Maximum summer temperature (°C) - Check IMD historical data  
        3. Average annual rainfall (mm) - Check IMD or state agriculture department
        4. Tribal population percentage (%) - Check Census 2011 data
        5. District centroid coordinates (lat, lng)

        BE ACCURATE. Use real data from search results. If exact data unavailable, use best estimate based on nearby districts.
        
        Respond in JSON format with confidence level (0-100).`;

        const response = await ai.models.generateContent({
            model: MODEL_REASONING,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        salinity: { type: Type.NUMBER },
                        maxTemp: { type: Type.NUMBER },
                        rainfall: { type: Type.NUMBER },
                        tribalPercent: { type: Type.NUMBER },
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER },
                        confidence: { type: Type.NUMBER }
                    },
                    required: ["salinity", "maxTemp", "rainfall", "tribalPercent", "lat", "lng", "confidence"]
                }
            }
        });

        const data = JSON.parse(response.text || '{}');
        return {
            ...data,
            dataSource: 'gemini'
        } as DistrictEnvironmentalData;
    } catch (e) {
        console.error("District Data Fetch Error:", e);
        // Return fallback data
        return {
            salinity: 4.0,
            maxTemp: 40,
            rainfall: 800,
            tribalPercent: 15,
            lat: 20.5937,
            lng: 78.9629,
            dataSource: 'fallback',
            confidence: 20
        };
    }
};

export const getPriceArbitration = async (
    crop: string,
    location: string,
    sourceRecords: MandiPriceRecord[],
    language: string
): Promise<PricingPrediction> => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        const sourceDataStr = JSON.stringify(sourceRecords, null, 2);

        const prompt = `You are an expert agricultural economist and price arbitrator. 
        Analyze the following mandi price records for ${crop} in ${location}.
        
        Source Data:
        ${sourceDataStr}
        
        Tasks:
        1. Evaluate the reliability of each source.
        2. Identify the Minimum Guaranteed Price (MGP) to protect farmers from exploitation.
        3. Predict the Expected Market Price Band (Low-High) for the current week.
        4. Provide a confidence score (0-100) for your prediction.
        5. Explain your arbitration reasoning (e.g., why one source was weighted more).
        
        Respond in ${langName}. Use JSON format.`;

        const response = await ai.models.generateContent({
            model: MODEL_REASONING,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        crop: { type: Type.STRING },
                        location: { type: Type.STRING },
                        minGuaranteedPrice: { type: Type.NUMBER },
                        expectedPriceBand: {
                            type: Type.OBJECT,
                            properties: {
                                low: { type: Type.NUMBER },
                                high: { type: Type.NUMBER }
                            },
                            required: ["low", "high"]
                        },
                        confidenceScore: { type: Type.NUMBER },
                        arbitrationReasoning: { type: Type.STRING },
                        sourceAnalysis: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    reliability: { type: Type.NUMBER },
                                    contribution: { type: Type.STRING }
                                },
                                required: ["name", "reliability", "contribution"]
                            }
                        },
                        timestamp: { type: Type.STRING }
                    },
                    required: ["crop", "location", "minGuaranteedPrice", "expectedPriceBand", "confidenceScore", "arbitrationReasoning", "sourceAnalysis", "timestamp"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");
        return JSON.parse(text) as PricingPrediction;
    } catch (error) {
        console.error("Price Arbitration Error:", error);
        // Fallback prediction if AI fails
        return {
            crop,
            location,
            minGuaranteedPrice: 2000,
            expectedPriceBand: { low: 2200, high: 2800 },
            confidenceScore: 50,
            arbitrationReasoning: "Fallback estimation due to service interruption.",
            sourceAnalysis: sourceRecords.map(s => ({ name: s.source, reliability: 80, contribution: "Average weighting" })),
            timestamp: new Date().toISOString()
        };
    }
};

// Batch fetch for multiple districts (with caching)
const districtCache: Map<string, DistrictEnvironmentalData> = new Map();

export const getMultipleDistrictData = async (
    districts: Array<{ name: string; state: string }>
): Promise<Map<string, DistrictEnvironmentalData>> => {
    const results = new Map<string, DistrictEnvironmentalData>();

    for (const district of districts) {
        const key = `${district.name}-${district.state}`;

        // Check cache first
        if (districtCache.has(key)) {
            results.set(key, districtCache.get(key)!);
            continue;
        }

        // Fetch from Gemini
        try {
            const data = await getDistrictEnvironmentalData(district.name, district.state);
            districtCache.set(key, data);
            results.set(key, data);
        } catch (e) {
            console.error(`Failed to fetch data for ${key}`, e);
        }

        // Rate limiting - wait 500ms between calls
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
};