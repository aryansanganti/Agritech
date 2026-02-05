import React, { useState, useRef } from 'react';
import { PageView, Language, SoilMetrics, SoilAnalysisResult } from '../types';
import { translations } from '../utils/translations';
import { analyzeSoilHealth } from '../services/geminiService';
import { Camera, Upload, RefreshCw, BarChart2, AlertCircle, CheckCircle, Droplets, Sun, Layers, Thermometer, XCircle } from 'lucide-react';

interface SoilAnalysisProps {
    lang: Language;
    onBack: () => void;
}

export const SoilAnalysis: React.FC<SoilAnalysisProps> = ({ lang, onBack }) => {
    const t = translations[lang];
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [metrics, setMetrics] = useState<SoilMetrics | null>(null);
    const [result, setResult] = useState<SoilAnalysisResult | null>(null);
    
    // NEW: State for handling errors (like uploading a selfie)
    const [error, setError] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setMetrics(null);
                setResult(null);
                setError(null); // Clear previous errors
            };
            reader.readAsDataURL(file);
        }
    };

    const runComputerVision = async () => {
        if (!image || !canvasRef.current) return;
        setAnalyzing(true);
        setError(null);

        const img = new Image();
        img.src = image;
        img.onload = async () => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Resize for processing speed
            const width = 300;
            const height = (img.height / img.width) * width;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            let totalV = 0;
            let totalSat = 0;
            let whitePixelCount = 0;
            let edgePixels = 0;
            let intensities = [];

            // NEW: Counters for Validation
            let earthTonePixels = 0;
            let skinTonePixels = 0;
            let greenFoliagePixels = 0;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // RGB to HSV Conversion
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const v = max / 255;
                const d = max - min;
                const s = max === 0 ? 0 : d / max;

                // Calculate Hue (0-1) for color detection
                let h = 0;
                if (d !== 0) {
                    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
                    else if (max === g) h = (b - r) / d + 2;
                    else h = (r - g) / d + 4;
                    h /= 6;
                }

                totalV += v;
                totalSat += s;

                // Intensity for texture
                const intensity = (r + g + b) / 3;
                intensities.push(intensity);

                if (r > 190 && g > 190 && b > 190 && s < 0.30) {
                    whitePixelCount++;
                }

                // --- VALIDATION LOGIC START ---
                
                // 1. Detect Skin (Simple heuristic)
                // Skin is usually Red > Green > Blue, with specific brightness
                if (r > 95 && g > 40 && b > 20 && 
                    (max - min) > 15 && 
                    r > g && r > b && 
                    v > 0.2 && v < 0.9) {
                    skinTonePixels++;
                }

                // 2. Detect Foliage (Green)
                if (g > r && g > b && g > 50 && s > 0.1) {
                    greenFoliagePixels++;
                }

                // 3. Detect Earth/Soil
                // Soil ranges from Red/Brown (Hue 0-0.15) to Yellow/Sand (Hue 0.1-0.2)
                // It also has some saturation but isn't neon.
                if ((h >= 0 && h <= 0.22) && s > 0.05 && v < 0.9) {
                    earthTonePixels++;
                }
                
                // --- VALIDATION LOGIC END ---
            }

            const pixelCount = data.length / 4;

            // --- PERFORM VALIDATION CHECKS ---
            
            // Check 1: Is it too much foliage?
            if (greenFoliagePixels / pixelCount > 0.4) {
                setError("This image appears to be mostly leaves/plants. Please take a photo of the soil ground.");
                setAnalyzing(false);
                return;
            }

            // Check 2: Is it a person/selfie?
            // If more than 15% of pixels look like skin, reject.
            if (skinTonePixels / pixelCount > 0.15) {
                setError("This looks like a photo of a person. Please upload a photo of soil.");
                setAnalyzing(false);
                return;
            }

            // Check 3: Is there enough soil?
            // If less than 40% of the image is "Earth Tone", reject.
            if (earthTonePixels / pixelCount < 0.40) {
                setError("We couldn't detect enough soil in this image. Please take a closer photo of the ground.");
                setAnalyzing(false);
                return;
            }

            // --- PROCEED WITH NORMAL ANALYSIS ---

            const avgV = totalV / pixelCount;
            const avgSat = totalSat / pixelCount;
            const salinityScore = (whitePixelCount / pixelCount) * 100;

            // Texture (Standard Deviation of Intensity)
            const meanIntensity = intensities.reduce((a, b) => a + b, 0) / pixelCount;
            const variance = intensities.reduce((a, b) => a + Math.pow(b - meanIntensity, 2), 0) / pixelCount;
            const stdDev = Math.sqrt(variance);
            const textureScore = Math.min(100, (stdDev / 128) * 100);

            // Edge Detection (Simplified for Cracks)
            const grayscale = new Uint8ClampedArray(width * height);
            for (let i = 0; i < data.length; i += 4) {
                grayscale[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
            }

            let highGradients = 0;
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const i = y * width + x;
                    const gx = grayscale[i + 1] - grayscale[i - 1];
                    const gy = grayscale[i + width] - grayscale[i - width];
                    const mag = Math.sqrt(gx * gx + gy * gy);
                    if (mag > 50) highGradients++;
                }
            }
            const crackScore = (highGradients / pixelCount) * 100;

            // Derived Metrics
            const socScore = Math.round((1 - avgV) * 100);
            const moistureScore = Math.round((1 - avgV) * 80 + avgSat * 20);

            const calculatedMetrics: SoilMetrics = {
                soc: socScore,
                moisture: moistureScore,
                salinity: Math.round(salinityScore * 5),
                texture: Math.round(textureScore),
                cracks: crackScore > 5,
                description: `Avg Brightness: ${(avgV * 100).toFixed(0)}%, Salinity Index: ${(salinityScore * 100).toFixed(2)}`
            };

            setMetrics(calculatedMetrics);

            try {
                const aiResult = await analyzeSoilHealth(calculatedMetrics, lang);
                setResult({
                    metrics: calculatedMetrics,
                    ...aiResult
                });
            } catch (err) {
                console.error(err);
                setResult({
                    metrics: calculatedMetrics,
                    aiAdvice: "Could not connect to AI advisor. Please check your connection. Based on metrics, please check the dashboard below.",
                    soilType: "Unknown",
                    recommendedCrops: ["Rice", "Wheat", "Corn"]
                });
            } finally {
                setAnalyzing(false);
            }
        };
    };

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                    <RefreshCw className="w-6 h-6 rotate-90" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.soilAnalysis}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Hybrid AI: Vision + GenAI</p>
                </div>
            </div>

            {/* Input Section */}
            {!image ? (
                <div className="glass-panel p-10 rounded-3xl border-2 border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center gap-6 hover:border-bhumi-green transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-full">
                        <Camera size={48} className="text-bhumi-green" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Take a Photo of Soil</h3>
                        <p className="text-gray-500 dark:text-gray-400">or upload from gallery</p>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Image View */}
                    <div className="space-y-4">
                        <div className="relative rounded-3xl overflow-hidden glass-panel shadow-lg aspect-[4/3]">
                            <img src={image} alt="Soil Analysis" className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {/* ERROR MESSAGE UI */}
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-xl flex items-start gap-3 animate-fade-in">
                                <XCircle className="mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <strong className="block font-bold mb-1">Invalid Image</strong>
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {!result && !analyzing && (
                            <button
                                onClick={runComputerVision}
                                className="w-full py-4 bg-bhumi-green text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw />
                                {t.analyzeSoil}
                            </button>
                        )}

                        {analyzing && (
                            <div className="w-full py-4 bg-gray-100 dark:bg-white/10 text-gray-500 rounded-xl font-bold flex items-center justify-center gap-3 animate-pulse">
                                <RefreshCw className="animate-spin" />
                                {t.analyzing}
                            </div>
                        )}
                        
                        {/* Reset Button Logic: Show if Error exists OR Result exists */}
                        {(result || error) && (
                            <button
                                onClick={() => { 
                                    setImage(null); 
                                    setResult(null); 
                                    setError(null);
                                }}
                                className="w-full py-3 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                                Try Another Image
                            </button>
                        )}
                    </div>

                    {/* Results View */}
                    <div className="space-y-6">
                        {result && (
                            <div className="animate-slide-up space-y-6">
                                {/* AI Insight Card */}
                                <div className="glass-panel p-6 rounded-3xl border-l-4 border-bhumi-gold bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-900/20">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
                                            <Sun className="text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Agronomist Insight</h3>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {result.aiAdvice}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <MetricCard
                                        icon={Layers}
                                        label={t.nutrientMirror}
                                        value={`${result.metrics.soc}%`}
                                        sub="Organic Carbon"
                                        color="text-emerald-500"
                                        score={result.metrics.soc}
                                    />
                                    <MetricCard
                                        icon={Droplets}
                                        label={t.thirstTracker}
                                        value={`${result.metrics.moisture}%`}
                                        sub="Moisture Index"
                                        color="text-blue-500"
                                        score={result.metrics.moisture}
                                    />
                                    <MetricCard
                                        icon={AlertCircle}
                                        label={t.salinityAlarm}
                                        value={result.metrics.salinity > 10 ? 'High' : 'Normal'}
                                        sub={`Index: ${result.metrics.salinity}`}
                                        color={result.metrics.salinity > 10 ? "text-red-500" : "text-green-500"}
                                        score={100 - result.metrics.salinity}
                                    />
                                    <MetricCard
                                        icon={BarChart2}
                                        label={t.rootComfort}
                                        value={result.metrics.texture > 20 ? 'Cloddy' : 'Fine'}
                                        sub="Texture"
                                        color="text-amber-600"
                                        score={100 - result.metrics.texture}
                                    />
                                </div>

                                {/* Recommendations */}
                                <div className="glass-panel p-6 rounded-3xl">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recommended Crops</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.recommendedCrops.map((crop, i) => (
                                            <span key={i} className="px-4 py-2 bg-bhumi-green/10 text-bhumi-green dark:text-green-400 rounded-full font-medium border border-bhumi-green/20">
                                                {crop}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Component for Metrics
const MetricCard = ({ icon: Icon, label, value, sub, color, score }: any) => (
    <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex justify-between items-start">
            <div className={`p-2 rounded-xl bg-gray-50 dark:bg-white/5 ${color}`}>
                <Icon size={20} />
            </div>
            <span className="text-xs font-mono text-gray-400">{sub}</span>
        </div>
        <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        </div>
        {/* Mini Bar */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div
                className={`h-full ${color.replace('text-', 'bg-')}`}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
        </div>
    </div>
);