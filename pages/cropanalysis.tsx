import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, ArrowLeft, CheckCircle, AlertTriangle, Scale, DollarSign, Activity } from 'lucide-react';
import { analyzeCropQuality } from '../services/geminiService';
import { getMarketPrice, STATES, getCommodities } from '../services/agmarknetService';
import { Language, CropAnalysisResult } from '../types';

interface Props {
    lang: Language;
    onBack: () => void;
}

export const CropAnalysis: React.FC<Props> = ({ lang, onBack }) => {
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
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Crop Quality Analysis</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input & Image */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Market Context Form */}
                    <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">1. Market Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">State</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                >
                                    <option value="">Select State</option>
                                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">District</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        placeholder="e.g. Khordha"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Market</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white"
                                        value={market}
                                        onChange={(e) => setMarket(e.target.value)}
                                    >
                                        <option value="Local">Local Mandi</option>
                                        <option value="Export">Export Hub</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Commodity</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-gray-900 dark:text-white"
                                    value={commodity}
                                    onChange={(e) => setCommodity(e.target.value)}
                                >
                                    <option value="">Select Crop</option>
                                    {getCommodities().map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {marketPrice && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                                    <span className="text-sm text-blue-700 dark:text-blue-300">Avg. Mandi Price</span>
                                    <span className="font-bold text-blue-800 dark:text-blue-200">₹{marketPrice}/q</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">2. Upload Sample</h3>

                        <div className="relative min-h-[250px] bg-gray-100 dark:bg-black/40 rounded-xl overflow-hidden flex items-center justify-center border-dashed border-2 border-gray-300 dark:border-gray-700">
                            {image ? (
                                <div className="relative w-full h-full">
                                    <img src={image} alt="Crop" className="w-full h-full object-contain" />
                                    {result?.detections && result.detections.length > 0 ? (
                                        result.detections.map((det, i) => (
                                            <div
                                                key={i}
                                                className="absolute border-2 border-red-500 shadow-[0_0_5px_rgba(255,0,0,0.5)] group hover:z-10"
                                                style={getBBoxStyle(det.bbox)}
                                            >
                                                <span className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {det.label} ({det.confidence}%)
                                                </span>
                                            </div>
                                        ))
                                    ) : result?.bbox ? (
                                        <div
                                            className="absolute border-4 border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)] animate-pulse"
                                            style={getBBoxStyle(result.bbox)}
                                        >
                                            <span className="absolute -top-6 left-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">Detected</span>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="text-center p-6">
                                    <Upload size={40} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Tap to upload photo</p>
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
                                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                {image ? 'Change Photo' : 'Select Photo'}
                            </button>
                            {image && (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    className="flex-1 py-2 bg-bhumi-green hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {analyzing ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-12">
                            <Activity size={64} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium opacity-50">Upload an image and analyze to see Grading Report</p>
                        </div>
                    )}

                    {analyzing && (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-20 h-20 border-4 border-bhumi-green border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500">Scanning crop texture, color, and size...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6 animate-slide-up">
                            {/* Top Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`glass-panel p-6 rounded-2xl border-l-[6px] ${result.grading.overallGrade === 'A' ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' :
                                    result.grading.overallGrade === 'B' ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' :
                                        'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                                    }`}>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Quality Grade</div>
                                    <div className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        {result.grading.overallGrade}
                                        <span className="text-base font-normal opacity-60 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-md">Grade</span>
                                    </div>
                                </div>

                                <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-white/5 border border-indigo-200 dark:border-indigo-500/30">
                                    <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                                        <DollarSign size={14} /> Estimated Price
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                        ₹{result.market.estimatedPrice} <span className="text-lg text-gray-500">/ q</span>
                                    </div>
                                    <div className="text-xs text-green-600 mt-1">{result.market.priceDriver}</div>
                                </div>

                                <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Market Demand</div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                                        {result.market.demandFactor}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Visual Inspection */}
                                <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                        <CheckCircle className="text-bhumi-green" size={20} />
                                        Visual Grading
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Color Uniformity', val: result.grading.colorChecking },
                                            { label: 'Size / Diameter', val: result.grading.sizeCheck },
                                            { label: 'Surface Texture', val: result.grading.textureCheck },
                                            { label: 'Shape', val: result.grading.shapeCheck }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-start border-b border-gray-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">{item.label}</span>
                                                <span className="text-gray-900 dark:text-white font-medium text-right max-w-[60%]">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Health & Defects */}
                                <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                        <AlertTriangle className="text-orange-500" size={20} />
                                        Health & Defects
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Disease / Lesions', val: result.health.lesions, good: result.health.lesions.toLowerCase().includes('none') },
                                            { label: 'Mechanical Damage', val: result.health.mechanicalDamage, good: result.health.mechanicalDamage.toLowerCase().includes('none') },
                                            { label: 'Pest Damage', val: result.health.pestDamage, good: result.health.pestDamage.toLowerCase().includes('none') },
                                            { label: 'Chlorosis', val: result.health.chlorosis, good: result.health.chlorosis.toLowerCase().includes('none') }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-start border-b border-gray-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">{item.label}</span>
                                                <span className={`font-medium text-right max-w-[60%] px-2 py-0.5 rounded text-xs ${item.good ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                    {item.val}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {result.health.diseaseName && (
                                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-300">
                                            <strong>Detected Disease:</strong> {result.health.diseaseName} ({result.health.confidence}%)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};