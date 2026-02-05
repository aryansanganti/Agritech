import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, ArrowLeft, CheckCircle, AlertTriangle, Scale, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { analyzeCropQuality } from '../services/geminiService';
import { getMarketPrice, STATES, getCommodities } from '../services/agmarknetService';
import { storeQualityGrading, gradeToScore } from '../services/qualityGradingService';
import { Language, CropAnalysisResult } from '../types';

interface Props {
    lang: Language;
    onBack: () => void;
    onNavigateToPricing?: () => void;
}

export const CropAnalysis: React.FC<Props> = ({ lang, onBack, onNavigateToPricing }) => {
    // Form State
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [market, setMarket] = useState('');
    const [commodity, setCommodity] = useState('');

    // Image State
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<CropAnalysisResult | null>(null);
    const [marketPrice, setMarketPrice] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Market Price when details change
    useEffect(() => {
        if (state && district && commodity) {
            const fetchPrice = async () => {
                const data = await getMarketPrice(state, district, commodity);
                setMarketPrice(data.modal_price);
            };
            fetchPrice();
        }
    }, [state, district, commodity]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image || !commodity) {
            alert("Please select a commodity and upload an image.");
            return;
        }

        setAnalyzing(true);
        try {
            const base64Data = image.split(',')[1];
            const context = {
                state, district, market, commodity, price: marketPrice || 0
            };

            const data = await analyzeCropQuality(base64Data, context, lang);
            setResult(data);

            // Store quality grading for use in Pricing Engine
            const qualityScore = gradeToScore(data.grading.overallGrade);
            storeQualityGrading({
                crop: commodity,
                state: state,
                district: district,
                qualityScore: qualityScore,
                overallGrade: data.grading.overallGrade,
                estimatedPrice: data.market.estimatedPrice,
                timestamp: new Date().toISOString(),
                image: image,  // Store the crop image for marketplace
                gradingDetails: {
                    colorChecking: data.grading.colorChecking,
                    sizeCheck: data.grading.sizeCheck,
                    textureCheck: data.grading.textureCheck,
                    shapeCheck: data.grading.shapeCheck,
                },
                healthStatus: {
                    lesions: data.health.lesions,
                    chlorosis: data.health.chlorosis,
                    pestDamage: data.health.pestDamage,
                    mechanicalDamage: data.health.mechanicalDamage,
                    diseaseName: data.health.diseaseName,
                },
            });
        } catch (error) {
            console.error(error);
            alert("Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    // Calculate Bounding Box Style
    const getBBoxStyle = (bbox: number[]) => {
        let [ymin, xmin, ymax, xmax] = bbox;
        // Auto-normalize if using 1000 scale
        if (ymin > 1 || xmin > 1 || ymax > 1 || xmax > 1) {
            ymin /= 1000; xmin /= 1000; ymax /= 1000; xmax /= 1000;
        }
        return {
            top: `${ymin * 100}%`,
            left: `${xmin * 100}%`,
            width: `${(xmax - xmin) * 100}%`,
            height: `${(ymax - ymin) * 100}%`,
        };
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-bhumi-mutedFg dark:text-bhumi-darkMutedFg hover:text-bhumi-fg dark:hover:text-bhumi-darkFg transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>
                <h2 className="text-2xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">AI Crop Quality Analysis</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input & Image */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Market Context Form */}
                    <div className="bg-bhumi-card dark:bg-bhumi-darkCard p-6 border-2 border-bhumi-border dark:border-bhumi-darkBorder">
                        <h3 className="text-lg font-heading font-bold mb-4 text-bhumi-fg dark:text-bhumi-darkFg">1. Market Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-1">State</label>
                                <select
                                    className="w-full bg-bhumi-muted dark:bg-bhumi-darkMuted border-2 border-bhumi-border dark:border-bhumi-darkBorder p-3 text-bhumi-fg dark:text-bhumi-darkFg focus:ring-2 focus:ring-bhumi-primary dark:focus:ring-bhumi-darkPrimary outline-none"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                >
                                    <option value="">Select State</option>
                                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-1">District</label>
                                    <input
                                        type="text"
                                        className="w-full bg-bhumi-muted dark:bg-bhumi-darkMuted border-2 border-bhumi-border dark:border-bhumi-darkBorder p-3 text-bhumi-fg dark:text-bhumi-darkFg focus:ring-2 focus:ring-bhumi-primary dark:focus:ring-bhumi-darkPrimary outline-none"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        placeholder="e.g. Khordha"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-1">Market</label>
                                    <select
                                        className="w-full bg-bhumi-muted dark:bg-bhumi-darkMuted border-2 border-bhumi-border dark:border-bhumi-darkBorder p-3 text-bhumi-fg dark:text-bhumi-darkFg"
                                        value={market}
                                        onChange={(e) => setMarket(e.target.value)}
                                    >
                                        <option value="Local">Local Mandi</option>
                                        <option value="Export">Export Hub</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-1">Commodity</label>
                                <select
                                    className="w-full bg-bhumi-muted dark:bg-bhumi-darkMuted border-2 border-bhumi-border dark:border-bhumi-darkBorder p-3 text-bhumi-fg dark:text-bhumi-darkFg"
                                    value={commodity}
                                    onChange={(e) => setCommodity(e.target.value)}
                                >
                                    <option value="">Select Crop</option>
                                    {getCommodities().map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {marketPrice && (
                                <div className="p-3 bg-bhumi-accent dark:bg-bhumi-darkAccent border-2 border-bhumi-border dark:border-bhumi-darkBorder flex justify-between items-center">
                                    <span className="text-sm text-bhumi-primary dark:text-bhumi-darkPrimary">Avg. Mandi Price</span>
                                    <span className="font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">₹{marketPrice}/q</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-bhumi-card dark:bg-bhumi-darkCard p-6 border-2 border-bhumi-border dark:border-bhumi-darkBorder">
                        <h3 className="text-lg font-heading font-bold mb-4 text-bhumi-fg dark:text-bhumi-darkFg">2. Upload Sample</h3>

                        <div className="relative min-h-[250px] bg-bhumi-muted dark:bg-bhumi-darkMuted overflow-hidden flex items-center justify-center border-dashed border-2 border-bhumi-border dark:border-bhumi-darkBorder">
                            {image ? (
                                <div className="relative w-full h-full">
                                    <img src={image} alt="Crop" className="w-full h-full object-contain" />
                                    {result?.detections && result.detections.length > 0 ? (
                                        result.detections.map((det, i) => (
                                            <div
                                                key={i}
                                                className="absolute border-2 border-bhumi-destructive shadow-[0_0_5px_rgba(201,123,123,0.5)] group hover:z-10"
                                                style={getBBoxStyle(det.bbox)}
                                            >
                                                <span className="absolute -top-6 left-0 bg-bhumi-destructive text-bhumi-destructiveFg text-[10px] font-bold px-1.5 py-0.5 shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {det.label} ({det.confidence}%)
                                                </span>
                                            </div>
                                        ))
                                    ) : result?.bbox ? (
                                        <div
                                            className="absolute border-4 border-bhumi-destructive shadow-[0_0_10px_rgba(201,123,123,0.5)] animate-pulse"
                                            style={getBBoxStyle(result.bbox)}
                                        >
                                            <span className="absolute -top-6 left-0 bg-bhumi-destructive text-bhumi-destructiveFg text-xs font-bold px-2 py-0.5">Detected</span>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="text-center p-6">
                                    <Upload size={40} className="mx-auto text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-2" />
                                    <p className="text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">Tap to upload photo</p>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 py-2.5 bg-bhumi-muted dark:bg-bhumi-darkMuted hover:bg-bhumi-accent dark:hover:bg-bhumi-darkAccent text-bhumi-fg dark:text-bhumi-darkFg font-medium transition-colors border-2 border-bhumi-border dark:border-bhumi-darkBorder"
                            >
                                {image ? 'Change Photo' : 'Select Photo'}
                            </button>
                            {image && (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    className="flex-1 py-2.5 bg-bhumi-primary dark:bg-bhumi-darkPrimary hover:bg-bhumi-primaryHover dark:hover:bg-bhumi-darkPrimaryHover text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 border-2 border-bhumi-primary dark:border-bhumi-darkPrimary"
                                >
                                    {analyzing ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent animate-spin"></div>
                                    ) : (
                                        <>
                                            <Scale size={18} /> Analyze
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Analysis Results */}
                <div className="lg:col-span-2">
                    {!result && !analyzing && (
                        <div className="h-full flex flex-col items-center justify-center text-bhumi-mutedFg dark:text-bhumi-darkMutedFg border-2 border-dashed border-bhumi-border dark:border-bhumi-darkBorder p-12">
                            <Activity size={64} className="mb-4 opacity-30" />
                            <p className="text-lg font-medium opacity-60">Upload an image and analyze to see Grading Report</p>
                        </div>
                    )}

                    {analyzing && (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-20 h-20 border-4 border-bhumi-primary dark:border-bhumi-darkPrimary border-t-transparent animate-spin"></div>
                            <p className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg font-accent italic">Scanning crop texture, color, and size...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 animate-slide-up">
                            {/* Top Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`bg-bhumi-card dark:bg-bhumi-darkCard p-6 border-2 border-bhumi-border dark:border-bhumi-darkBorder border-l-[6px] ${result.grading.overallGrade === 'A' ? 'border-l-bhumi-primary bg-bhumi-primary/5 dark:bg-bhumi-darkPrimary/10' :
                                    result.grading.overallGrade === 'B' ? 'border-l-bhumi-secondary bg-bhumi-secondary/10 dark:bg-bhumi-darkSecondary/10' :
                                        'border-l-bhumi-destructive bg-bhumi-destructive/10'
                                    }`}>
                                    <div className="text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-1 uppercase tracking-wide">Quality Grade</div>
                                    <div className="text-4xl font-heading font-black text-bhumi-fg dark:text-bhumi-darkFg flex items-center gap-2">
                                        {result.grading.overallGrade}
                                        <span className="text-base font-normal opacity-60 bg-bhumi-muted dark:bg-bhumi-darkMuted px-2 py-0.5">Grade</span>
                                    </div>
                                </div>

                                <div className="bg-bhumi-card dark:bg-bhumi-darkCard p-6 border-2 border-bhumi-primary/30 dark:border-bhumi-darkPrimary/30">
                                    <div className="text-sm text-bhumi-primary dark:text-bhumi-darkPrimary mb-1 uppercase tracking-wide flex items-center gap-1">
                                        <DollarSign size={14} /> Estimated Price
                                    </div>
                                    <div className="text-3xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg">
                                        ₹{result.market.estimatedPrice} <span className="text-lg text-bhumi-mutedFg dark:text-bhumi-darkMutedFg">/ q</span>
                                    </div>
                                    <div className="text-xs text-bhumi-primary dark:text-bhumi-darkPrimary mt-1">{result.market.priceDriver}</div>
                                </div>

                                <div className="bg-bhumi-card dark:bg-bhumi-darkCard p-6 border-2 border-bhumi-border dark:border-bhumi-darkBorder">
                                    <div className="text-sm text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mb-1 uppercase tracking-wide">Market Demand</div>
                                    <div className="text-xl font-heading font-bold text-bhumi-fg dark:text-bhumi-darkFg line-clamp-2">
                                        {result.market.demandFactor}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Visual Inspection */}
                                <div className="bg-bhumi-card dark:bg-bhumi-darkCard p-6 border-2 border-bhumi-border dark:border-bhumi-darkBorder">
                                    <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2 text-bhumi-fg dark:text-bhumi-darkFg">
                                        <CheckCircle className="text-bhumi-primary dark:text-bhumi-darkPrimary" size={20} />
                                        Visual Grading
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Color Uniformity', val: result.grading.colorChecking },
                                            { label: 'Size / Diameter', val: result.grading.sizeCheck },
                                            { label: 'Surface Texture', val: result.grading.textureCheck },
                                            { label: 'Shape', val: result.grading.shapeCheck }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-start border-b border-bhumi-border dark:border-bhumi-darkBorder pb-2 last:border-0 last:pb-0">
                                                <span className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg text-sm">{item.label}</span>
                                                <span className="text-bhumi-fg dark:text-bhumi-darkFg font-medium text-right max-w-[60%]">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Health & Defects */}
                                <div className="bg-bhumi-card dark:bg-bhumi-darkCard p-6 border-2 border-bhumi-border dark:border-bhumi-darkBorder">
                                    <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2 text-bhumi-fg dark:text-bhumi-darkFg">
                                        <AlertTriangle className="text-bhumi-secondary dark:text-bhumi-darkSecondary" size={20} />
                                        Health & Defects
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Disease / Lesions', val: result.health.lesions, good: result.health.lesions.toLowerCase().includes('none') },
                                            { label: 'Mechanical Damage', val: result.health.mechanicalDamage, good: result.health.mechanicalDamage.toLowerCase().includes('none') },
                                            { label: 'Pest Damage', val: result.health.pestDamage, good: result.health.pestDamage.toLowerCase().includes('none') },
                                            { label: 'Chlorosis', val: result.health.chlorosis, good: result.health.chlorosis.toLowerCase().includes('none') }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-start border-b border-bhumi-border dark:border-bhumi-darkBorder pb-2 last:border-0 last:pb-0">
                                                <span className="text-bhumi-mutedFg dark:text-bhumi-darkMutedFg text-sm">{item.label}</span>
                                                <span className={`font-medium text-right max-w-[60%] px-2 py-0.5 text-xs ${item.good ? 'bg-bhumi-primary/10 text-bhumi-primary dark:bg-bhumi-darkPrimary/20 dark:text-bhumi-darkPrimary' : 'bg-bhumi-destructive/10 text-bhumi-destructive'
                                                    }`}>
                                                    {item.val}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {result.health.diseaseName && (
                                        <div className="mt-4 p-3 bg-bhumi-destructive/10 text-sm text-bhumi-destructive border-2 border-bhumi-destructive/20">
                                            <strong>Detected Disease:</strong> {result.health.diseaseName} ({result.health.confidence}%)
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Navigate to Pricing Engine Button */}
                            {onNavigateToPricing && (
                                <div className="mt-6 p-6 glass-panel rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-500/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                                Quality Score: {gradeToScore(result.grading.overallGrade)}/10
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Your crop grading is saved. Get fair market price with blockchain verification.
                                            </p>
                                        </div>
                                        <button
                                            onClick={onNavigateToPricing}
                                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
                                        >
                                            Get Price <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};