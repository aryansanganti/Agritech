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
        <form onSubmit={handleSubmit} className="bg-bhumi-card dark:bg-bhumi-darkCard border-2 border-bhumi-border dark:border-bhumi-darkBorder p-6 space-y-6">
            <div className="flex items-center gap-2 text-bhumi-primary dark:text-bhumi-darkPrimary mb-2 font-heading font-bold uppercase text-xs tracking-widest">
                <Sparkles size={16} />
                Market Intelligence Input
            </div>

            <div className="space-y-4">
                {/* Crop Selection */}
                <div>
                    <label className="block text-sm font-medium text-bhumi-fg dark:text-bhumi-darkFg mb-2 flex items-center gap-2">
                        <Leaf size={16} className="text-bhumi-primary dark:text-bhumi-darkPrimary" />
                        Select Crop
                    </label>
                    <select
                        value={crop}
                        onChange={(e) => setCrop(e.target.value)}
                        className="w-full bg-bhumi-input dark:bg-bhumi-darkInput border-2 border-bhumi-border dark:border-bhumi-darkBorder px-4 py-3 focus:ring-2 focus:ring-bhumi-primary dark:focus:ring-bhumi-darkPrimary transition-all outline-none text-bhumi-fg dark:text-bhumi-darkFg"
                    >
                        {crops.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Location Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-bhumi-fg dark:text-bhumi-darkFg mb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-bhumi-primary dark:text-bhumi-darkPrimary" />
                            State
                        </label>
                        <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full bg-bhumi-input dark:bg-bhumi-darkInput border-2 border-bhumi-border dark:border-bhumi-darkBorder px-4 py-3 focus:ring-2 focus:ring-bhumi-primary dark:focus:ring-bhumi-darkPrimary transition-all outline-none text-bhumi-fg dark:text-bhumi-darkFg"
                        >
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-bhumi-fg dark:text-bhumi-darkFg mb-2">District</label>
                        <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full bg-bhumi-input dark:bg-bhumi-darkInput border-2 border-bhumi-border dark:border-bhumi-darkBorder px-4 py-3 focus:ring-2 focus:ring-bhumi-primary dark:focus:ring-bhumi-darkPrimary transition-all outline-none text-bhumi-fg dark:text-bhumi-darkFg"
                            placeholder="Enter district"
                        />
                    </div>
                </div>

                {/* Quality Score */}
                <div>
                    <label className="block text-sm font-medium text-bhumi-fg dark:text-bhumi-darkFg mb-2">
                        Crop Quality Score: <span className="text-bhumi-primary dark:text-bhumi-darkPrimary font-bold">{quality}/10</span>
                    </label>
                    <input
                        type="range"
                        min="1" max="10" step="1"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-2 bg-bhumi-muted dark:bg-bhumi-darkMuted appearance-none cursor-pointer accent-bhumi-primary dark:accent-bhumi-darkPrimary"
                    />
                    <div className="flex justify-between text-[10px] text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mt-1 uppercase font-bold">
                        <span>Low Quality</span>
                        <span>Premium (Grade A)</span>
                    </div>
                </div>

                {/* Quantity Input */}
                <div>
                    <label className="block text-sm font-medium text-bhumi-fg dark:text-bhumi-darkFg mb-2 flex items-center gap-2">
                        <Package size={16} className="text-bhumi-primary dark:text-bhumi-darkPrimary" />
                        Quantity (Quintals)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="1000"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-bhumi-input dark:bg-bhumi-darkInput border-2 border-bhumi-border dark:border-bhumi-darkBorder px-4 py-3 focus:ring-2 focus:ring-bhumi-primary dark:focus:ring-bhumi-darkPrimary transition-all outline-none text-bhumi-fg dark:text-bhumi-darkFg"
                        placeholder="Enter quantity in quintals"
                    />
                    <p className="text-[10px] text-bhumi-mutedFg dark:text-bhumi-darkMutedFg mt-1">
                        Enter the amount of crop to sell (1 Quintal = 100 kg)
                    </p>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-bhumi-primary dark:bg-bhumi-darkPrimary hover:opacity-90 text-bhumi-primaryFg dark:text-bhumi-darkPrimaryFg font-bold py-4 shadow-lg shadow-bhumi-primary/30 dark:shadow-bhumi-darkPrimary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border-2 border-bhumi-primary dark:border-bhumi-darkPrimary"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin"></div>
                ) : (
                    <Search size={20} />
                )}
                <span>Fetch AI Data & Predict</span>
            </button>
        </form>
    );
};
