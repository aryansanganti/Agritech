import React, { useState, useEffect } from 'react';
import { Search, MapPin, Leaf, Sparkles, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { getQualityGrading, clearQualityGrading, QualityGradingData } from '../services/qualityGradingService';

interface PricingFormProps {
    onSearch: (crop: string, district: string, state: string, quality: number, quantity: number) => void;
    isLoading: boolean;
}

export const PricingForm: React.FC<PricingFormProps> = ({ onSearch, isLoading }) => {
    const [crop, setCrop] = useState('Soybean');
    const [state, setState] = useState('Maharashtra');
    const [district, setDistrict] = useState('Nagpur');
    const [quality, setQuality] = useState(8);
    const [quantity, setQuantity] = useState(1);
    const [qualityGrading, setQualityGrading] = useState<QualityGradingData | null>(null);

    useEffect(() => {
        const storedGrading = getQualityGrading();
        if (storedGrading) {
            setQualityGrading(storedGrading);
            setCrop(storedGrading.crop);
            setState(storedGrading.state);
            setDistrict(storedGrading.district);
            setQuality(storedGrading.qualityScore);
        }

        const handleUpdate = (event: CustomEvent<QualityGradingData>) => {
            setQualityGrading(event.detail);
            setCrop(event.detail.crop);
            setState(event.detail.state);
            setDistrict(event.detail.district);
            setQuality(event.detail.qualityScore);
        };

        const handleClear = () => {
            setQualityGrading(null);
        };

        window.addEventListener('qualityGradingUpdated', handleUpdate as EventListener);
        window.addEventListener('qualityGradingCleared', handleClear);

        return () => {
            window.removeEventListener('qualityGradingUpdated', handleUpdate as EventListener);
            window.removeEventListener('qualityGradingCleared', handleClear);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(crop, district, state, quality, quantity);
    };

    const handleClearGrading = () => {
        clearQualityGrading();
        setQualityGrading(null);
    };

    const crops = [
        'Soybean', 'Pearl Millet (Bajra)', 'Rice (Paddy)', 'Wheat', 'Cotton', 'Maize', 'Gram', 'Tur (Arhar)',
        'Tomato', 'Potato', 'Onion', 'Apple', 'Mango', 'Banana', 'Orange', 'Grapes'
    ];

    const states = [
        'Maharashtra', 'Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Odisha', 'Jharkhand', 'Uttar Pradesh', 'Punjab', 'Haryana'
    ];

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-2 text-green-500 mb-2 font-bold uppercase text-xs tracking-widest">
                <Sparkles size={16} />
                Market Intelligence Input
            </div>

            {qualityGrading && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="bg-green-500/20 p-2 rounded-lg">
                                <CheckCircle2 size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-bold text-green-700 dark:text-green-400 text-sm">
                                    AI Quality Grading Applied
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Grade <span className="font-bold">{qualityGrading.overallGrade}</span> • 
                                    Score <span className="font-bold">{qualityGrading.qualityScore}/10</span> •
                                    {' '}{qualityGrading.crop}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClearGrading}
                            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {!qualityGrading && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                                No Quality Grading Found
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Upload a crop image in Crop Analysis to get AI-powered quality score
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Leaf size={16} className="text-green-500" />
                        Select Crop
                    </label>
                    <select
                        value={crop}
                        onChange={(e) => setCrop(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 transition-all outline-none"
                        disabled={!!qualityGrading}
                    >
                        {crops.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {qualityGrading && (
                        <p className="text-xs text-green-600 mt-1">Auto-filled from quality grading</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-green-500" />
                            State
                        </label>
                        <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 transition-all outline-none"
                            disabled={!!qualityGrading}
                        >
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">District</label>
                        <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 transition-all outline-none"
                            placeholder="Enter district"
                            disabled={!!qualityGrading}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Crop Quality Score: <span className="text-green-500 font-bold">{quality}/10</span>
                        {qualityGrading && (
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                AI Graded
                            </span>
                        )}
                    </label>
                    <input
                        type="range"
                        min="1" max="10" step="1"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                        disabled={!!qualityGrading}
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 uppercase font-bold">
                        <span>Low Quality</span>
                        <span>Premium (Grade A)</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Package size={16} className="text-green-500" />
                        Quantity (Quintals)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="1000"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 transition-all outline-none"
                        placeholder="Enter quantity in quintals"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                        Enter the amount of crop to sell (1 Quintal = 100 kg)
                    </p>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-bhoomi-primary hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <Search size={20} />
                )}
                <span>Fetch AI Data & Predict</span>
            </button>
        </form>
    );
};
