import React, { useState, useRef, useEffect } from 'react';
import { PageView, Language, SoilMetrics, SoilAnalysisResult } from '../types';
import { translations } from '../utils/translations';
import { analyzeSoilHealth } from '../services/geminiService';
import { Camera, Upload, RefreshCw, BarChart2, AlertCircle, CheckCircle, Droplets, Sun, Layers, Thermometer } from 'lucide-react';

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
            };
            reader.readAsDataURL(file);
        }
    };

    const runComputerVision = async () => {
        if (!image || !canvasRef.current) return;
        setAnalyzing(true);

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

            // Texture Analysis vars
            let intensities = [];

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

                totalV += v;
                totalSat += s;

                // Intensity for texture
                const intensity = (r + g + b) / 3;
                intensities.push(intensity);

                // Salinity Detection: High Brightness + Low Saturation
                // White is high RGB, low Saturation
                // Relaxed thresholds for better real-world detection
                if (r > 190 && g > 190 && b > 190 && s < 0.30) {
                    whitePixelCount++;
                }
            }

            const pixelCount = data.length / 4;
            const avgV = totalV / pixelCount;
            const avgSat = totalSat / pixelCount;
            const salinityScore = (whitePixelCount / pixelCount) * 100;

            // Texture (Standard Deviation of Intensity)
            const meanIntensity = intensities.reduce((a, b) => a + b, 0) / pixelCount;
            const variance = intensities.reduce((a, b) => a + Math.pow(b - meanIntensity, 2), 0) / pixelCount;
            const stdDev = Math.sqrt(variance);
            const textureScore = Math.min(100, (stdDev / 128) * 100); // Normalize roughly

            // Edge Detection (Simplified for Cracks)
            // Sobel-like check on grayscale buffer
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
            // SOC Proxy: Darker soil (Lower V) = Higher SOC. 
            // Invert V: 1 - 0.8 (light) = 0.2 (Low SOC). 1 - 0.2 (dark) = 0.8 (High SOC).
            const socScore = Math.round((1 - avgV) * 100);

            // Moisture: Also correlates with darkness, but we can combine with saturation for "wet look"
            // Wet soil is darker (Low V) and often more saturated colors in some contexts, but mostly just darker.
            // Let's use a weighted combo.
            const moistureScore = Math.round((1 - avgV) * 80 + avgSat * 20);

            const calculatedMetrics: SoilMetrics = {
                soc: socScore,
                moisture: moistureScore,
                salinity: Math.round(salinityScore * 5), // Amplify for visibility
                texture: Math.round(textureScore),
                cracks: crackScore > 5, // Threshold
                description: `Avg Brightness: ${(avgV * 100).toFixed(0)}%, Salinity Index: ${(salinityScore * 100).toFixed(2)}`
            };

            setMetrics(calculatedMetrics);

            // 2. Call GenAI with these metrics
            try {
                const aiResult = await analyzeSoilHealth(calculatedMetrics, lang);
                setResult({
                    metrics: calculatedMetrics,
                    ...aiResult
                });
            } catch (err) {
                console.error(err);
                // Fallback result if API fails
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
                            {/* Overlay Indicators could go here */}
                        </div>

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
                        {result && (
                            <button
                                onClick={() => { setImage(null); setResult(null); }}
                                className="w-full py-3 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                                Analyze Another Sample
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
                                        score={100 - result.metrics.salinity} // Invert for "Goodness"
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
