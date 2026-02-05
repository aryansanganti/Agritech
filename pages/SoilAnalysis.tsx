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
                    className="p-2 hover:bg-bhumi-muted dark:hover:bg-bhumi-darkMuted transition-colors border-2 border-transparent hover:border-bhumi-border dark:hover:border-bhumi-darkBorder"
                >
                    <RefreshCw className="w-6 h-6 rotate-90 text-bhumi-mutedFg dark:text-bhumi-darkMutedFg" />
                </button>
                <div>
                    <h1 className="text-2xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">{t.soilAnalysis}</h1>
                    <p className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-accent italic">Hybrid AI: Vision + GenAI</p>
                </div>
            </div>

            {/* Input Section */}
            {!image ? (
                <div className="bg-bhumi-card dark:bg-bhumi-darkCard p-12 border-2 border-dashed border-bhumi-border dark:border-bhumi-darkBorder flex flex-col items-center justify-center gap-6 hover:border-bhumi-primary dark:hover:border-bhumi-darkPrimary transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <div className="p-6 bg-bhumi-accent dark:bg-bhumi-darkAccent border-2 border-bhumi-border dark:border-bhumi-darkBorder group-hover:scale-105 transition-transform">
                        <Camera size={48} className="text-bhumi-primary dark:text-bhumi-darkPrimary" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg mb-2">Take a Photo of Soil</h3>
                        <p className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-accent italic">or upload from gallery</p>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Image View */}
                    <div className="space-y-4">
                        <div className="relative overflow-hidden bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder shadow-md aspect-[4/3]">
                            <img src={image} alt="Soil Analysis" className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                            {/* Overlay Indicators could go here */}
                        </div>

                        {!result && !analyzing && (
                            <button
                                onClick={runComputerVision}
                                className="w-full py-4 bg-bhumi-primary dark:bg-bhumi-darkPrimary text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg font-bold text-lg shadow-md hover:bg-bhumi-primaryHover dark:hover:bg-bhumi-darkPrimaryHover transition-all flex items-center justify-center gap-2 border-2 border-bhumi-primary dark:border-bhumi-darkPrimary"
                            >
                                <RefreshCw />
                                {t.analyzeSoil}
                            </button>
                        )}

                        {analyzing && (
                            <div className="w-full py-4 bg-bhumi-muted dark:bg-bhumi-darkMuted text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-bold flex items-center justify-center gap-3 animate-pulse border-2 border-bhumi-border dark:border-bhumi-darkBorder">
                                <RefreshCw className="animate-spin" />
                                {t.analyzing}
                            </div>
                        )}
                        {result && (
                            <button
                                onClick={() => { setImage(null); setResult(null); }}
                                className="w-full py-3 border-2 border-bhumi-border dark:border-bhumi-darkBorder text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-medium hover:bg-bhumi-muted dark:hover:bg-bhumi-darkMuted transition-colors"
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
                                <div className="bg-bhumi-card dark:bg-bhumi-darkCard p-6 border-2 border-bhumi-border dark:border-bhumi-darkBorder border-l-4 border-l-bhumi-secondary dark:border-l-bhumi-darkSecondary">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-bhumi-secondary/20 dark:bg-bhumi-darkSecondary/30">
                                            <Sun className="text-bhumi-secondaryFg dark:text-bhumi-darkSecondary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg mb-2">Agronomist Insight</h3>
                                            <p className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg leading-relaxed">
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

                                {/* Recommended Crops */}
                                <div className="bg-bhumi-card dark:bg-bhumi-darkCard p-6 border-2 border-bhumi-border dark:border-bhumi-darkBorder">
                                    <h3 className="font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg mb-4">Recommended Crops</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.recommendedCrops.map((crop, i) => (
                                            <span key={i} className="px-4 py-2 bg-bhumi-primary/10 dark:bg-bhumi-darkPrimary/20 text-bhumi-primary dark:text-bhumi-darkPrimary font-medium border-2 border-bhumi-primary/20 dark:border-bhumi-darkPrimary/30">
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
    <div className="bg-bhumi-card dark:bg-bhumi-darkCard p-4 border-2 border-bhumi-border dark:border-bhumi-darkBorder flex flex-col gap-3">
        <div className="flex justify-between items-start">
            <div className={`p-2 bg-bhumi-muted dark:bg-bhumi-darkMuted ${color}`}>
                <Icon size={20} />
            </div>
            <span className="text-xs font-mono text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">{sub}</span>
        </div>
        <div>
            <div className="text-xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">{value}</div>
            <div className="text-xs text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">{label}</div>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-bhumi-muted dark:bg-bhumi-darkMuted overflow-hidden">
            <div
                className={`h-full ${color.replace('text-', 'bg-')}`}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
        </div>
    </div>
);
