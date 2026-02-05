import React, { useState } from 'react';
import { Search, MapPin, Leaf, Sparkles, Package } from 'lucide-react';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(crop, district, state, quality, quantity);
    };

    const crops = [
        'Soybean', 'Pearl Millet (Bajra)', 'Rice (Paddy)', 'Wheat', 'Cotton', 'Maize', 'Gram', 'Tur (Arhar)'
    ];

    const states = [
        'Maharashtra', 'Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Odisha', 'Jharkhand'
    ];

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-2 text-emerald-500 mb-2 font-bold uppercase text-xs tracking-widest">
                <Sparkles size={16} />
                Market Intelligence Input
            </div>

            <div className="space-y-4">
                {/* Crop Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Leaf size={16} className="text-emerald-500" />
                        Select Crop
                    </label>
                    <select
                        value={crop}
                        onChange={(e) => setCrop(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    >
                        {crops.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Location Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-emerald-500" />
                            State
                        </label>
                        <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
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
                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                            placeholder="Enter district"
                        />
                    </div>
                </div>

                {/* Quality Score */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Crop Quality Score: <span className="text-emerald-500 font-bold">{quality}/10</span>
                    </label>
                    <input
                        type="range"
                        min="1" max="10" step="1"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 uppercase font-bold">
                        <span>Low Quality</span>
                        <span>Premium (Grade A)</span>
                    </div>
                </div>

                {/* Quantity Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Package size={16} className="text-emerald-500" />
                        Quantity (Quintals)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="1000"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
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
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
