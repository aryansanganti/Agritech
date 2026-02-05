import { GoogleGenAI, Type } from "@google/genai";
import { 
    DiseaseResult, 
    CropRec, 
    YieldResult, 
    AdvisoryResult, 
    WeatherData, 
    CropAnalysisResult, // From Block 1
    MandiPriceRecord,   // From Block 2
    PricingPrediction   // From Block 2
} from "../types";

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

// ==========================================
// VISION & QUALITY ANALYSIS
// ==========================================

export const analyzeCropQuality = async (base64Image: string, context: any, language: string, mimeType: string = 'image/jpeg'): Promise<CropAnalysisResult> => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        const prompt = `Act as an expert Plant Pathologist. Analyze this crop image.
        Constraint: JSON Output ONLY. No Markdown. No Explanations strings inside JSON values.
        Context: Commodity=${context.commodity}, Location=${context.district}, ${context.state}. Price=₹${context.price}/q.

        Task 1: Disease Detection (Universal)
        1. Identify the crop (Verify it matches: ${context.commodity} if provided).
        2. Identify ALL visible diseases, pests, or physical defects.
        3. Draw a bounding box [ymin, xmin, ymax, xmax] around EACH affected area.
           IMPORTANT: Return coordinates normalized to 0-1 range (e.g., 0.5, not 500).
        4. Use standard specific disease names (e.g. "Rice Blast", "Wheat Rust").
        5. If healthy, label as "Healthy".

        Task 2: Quality & Market Analysis
        - Grade the overall quality (A/B/C) based on visual appearance.
        - Estimate fair market price.
        - Assess physical health indicators.

        Return JSON matching this structure:
        {
          "detections": [{ "label": "Specific Disease/Defect Name", "bbox": [ymin, xmin, ymax, xmax], "confidence": 0-100 }],
          "grading": { "overallGrade": "A"|"B"|"C", "colorChecking": "", "sizeCheck": "", "textureCheck": "", "shapeCheck": "" },
          "health": { "lesions": "None"|"Minor"|"Severe", "chlorosis": "...", "pestDamage": "...", "mechanicalDamage": "...", "diseaseName": "Short Label Only (Max 3 words)", "confidence": 0 },
          "market": { "estimatedPrice": 0, "priceDriver": "Reason", "demandFactor": "High/Mod/Low" }
        }
        Respond in language: ${langName}`;

        const response = await ai.models.generateContent({
            model: MODEL_VISION,
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Image } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        detections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    bbox: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                                    confidence: { type: Type.NUMBER }
                                },
                                required: ["label", "bbox", "confidence"]
                            }
                        },
                        grading: {
                            type: Type.OBJECT,
                            properties: {
                                overallGrade: { type: Type.STRING, enum: ["A", "B", "C"] },
                                colorChecking: { type: Type.STRING },
                                sizeCheck: { type: Type.STRING },
                                textureCheck: { type: Type.STRING },
                                shapeCheck: { type: Type.STRING }
                            },
                            required: ["overallGrade", "colorChecking", "sizeCheck", "textureCheck", "shapeCheck"]
                        },
                        health: {
                            type: Type.OBJECT,
                            properties: {
                                lesions: { type: Type.STRING },
                                chlorosis: { type: Type.STRING },
                                pestDamage: { type: Type.STRING },
                                mechanicalDamage: { type: Type.STRING },
                                diseaseName: { type: Type.STRING },
                                confidence: { type: Type.NUMBER }
                            },
                            required: ["lesions", "chlorosis", "pestDamage", "mechanicalDamage"]
                        },
                        market: {
                            type: Type.OBJECT,
                            properties: {
                                estimatedPrice: { type: Type.NUMBER },
                                priceDriver: { type: Type.STRING },
                                demandFactor: { type: Type.STRING }
                            },
                            required: ["estimatedPrice", "priceDriver", "demandFactor"]
                        }
                    },
                    required: ["detections", "grading", "health", "market"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");
        return JSON.parse(text) as CropAnalysisResult;
    } catch (error) {
        console.error("Gemini Crop Analysis Error:", error);
        throw error;
    }
};

export const analyzeCropDisease = async (base64Image: string, language: string, mimeType: string = 'image/jpeg'): Promise<DiseaseResult> => {
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
                    { inlineData: { mimeType: mimeType, data: base64Image } },
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

// ==========================================
// ADVISORY & CHAT
// ==========================================

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

// ==========================================
// YIELD, WEATHER & GENERAL ANALYTICS
// ==========================================

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

// ==========================================
// SOIL & GENETICS
// ==========================================

export const analyzeSoilHealth = async (metrics: any, language: string): Promise<any> => {
    checkApiKey();
    try {
        const langName = getLangName(language);
        // Hybrid Prompt: We provide the "Hard Metrics" from CV, GenAI gives the "Soft Advice".
        const prompt = `Act as an expert Agronomist. I have analyzed a soil sample using Computer Vision and extracted these metrics:
        - Organic Carbon Proxy (Darkness/Value): ${metrics.soc}% (Higher is better)
        - Moisture Index: ${metrics.moisture}%
        - Salinity Probability (White Crust): ${metrics.salinity}%
        - Texture/Clod Index: ${metrics.texture} (0=Fine, 100=Very Rough)
        - Surface Cracks Detected: ${metrics.cracks}

        Based ONLY on these metrics, provide a detailed analysis in ${langName} JSON format:
        1. "aiAdvice": A conversational summary paragraph explaining what these numbers mean for the farmer. Be specific (e.g., "Your soil is quite pale, indicating low organic carbon.").
        2. "soilType": Best guess of soil type (Clay, Loamy, Sandy, Silt) based on the texture/moisture profile.
        3. "recommendedCrops": Array of 3 suitable crops.

        JSON Schema: { aiAdvice: string, soilType: string, recommendedCrops: string[] }
        `;

        const response = await ai.models.generateContent({
            model: MODEL_REASONING,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        aiAdvice: { type: Type.STRING },
                        soilType: { type: Type.STRING },
                        recommendedCrops: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["aiAdvice", "soilType", "recommendedCrops"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Soil Analysis Error:", error);
        throw error;
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

// ==========================================
// DISTRICT DATA
// ==========================================

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

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");
        const data = JSON.parse(text);
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

// ==========================================
// PRICE & MARKET ARBITRATION
// ==========================================

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