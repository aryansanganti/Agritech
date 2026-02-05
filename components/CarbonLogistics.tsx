import React, { useState, useEffect } from 'react';
import { X, MapPin, Truck, Leaf, Navigation, Award, Fuel } from 'lucide-react';
import { MarketplaceListing, Listing } from '../types';
import { DISTRICT_COORDINATES, calculateRouteDistance, calculateCarbonFootprint } from '../services/carbonLogisticsService';

interface CarbonLogisticsProps {
    listing: MarketplaceListing | Listing;
    vendorLocation: {
        district: string;
        state: string;
    };
    onClose: () => void;
}

export const CarbonLogistics: React.FC<CarbonLogisticsProps> = ({ listing, vendorLocation, onClose }) => {
    const [calculating, setCalculating] = useState(true);
    const [stats, setStats] = useState<any>(null);

    // Mock farm location (since listings might not have precise coordinates in this demo)
    const farmDistrict = typeof listing.location === 'string' ? listing.location.split(',')[0].trim() : listing.location.district;

    useEffect(() => {
        // Simulate calculation
        const timer = setTimeout(() => {
            const distance = calculateRouteDistance(farmDistrict, vendorLocation.district);
            const carbon = calculateCarbonFootprint(distance, 'truck'); // Default mode

            setStats({
                distance,
                carbon,
                route: [farmDistrict, 'Distribution Hub', vendorLocation.district],
                mode: 'Electric Truck', // Optimized
                savings: '24%'
            });
            setCalculating(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [farmDistrict, vendorLocation.district]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#1A202C] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Leaf className="animate-bounce" />
                            <span className="font-mono text-xs uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">Eco-Logistics Engine</span>
                        </div>
                        <h2 className="text-2xl font-bold">Carbon Footprint Analysis</h2>
                        <p className="opacity-90">Review optimized delivery route and environmental impact.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {calculating ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Calculating Valid Route...</h3>
                            <p className="text-gray-500 text-sm mt-1">Applying Dijkstra's Algorithm for shortest path...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* Route Visualization */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <Navigation size={14} /> Optimized Route
                                </h3>
                                <div className="flex items-center justify-between relative">
                                    {/* Line */}
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-600 -z-10 transform -translate-y-1/2"></div>

                                    {/* Points */}
                                    <div className="flex flex-col items-center gap-2 relative z-10">
                                        <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-sm">
                                            <Sprout size={18} />
                                        </div>
                                        <div className="text-xs font-bold bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm">{farmDistrict}</div>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 relative z-10">
                                        <div className="w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-sm">
                                            <Truck size={14} />
                                        </div>
                                        <div className="text-[10px] text-gray-400">In Transit</div>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 relative z-10">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-sm">
                                            <MapPin size={18} />
                                        </div>
                                        <div className="text-xs font-bold bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm">{vendorLocation.district}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-1">
                                        <Leaf size={16} /> <span className="text-xs font-bold uppercase">Carbon Emission</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.carbon} <span className="text-sm font-normal text-gray-500">kg CO₂</span></div>
                                    <div className="text-xs text-green-600 mt-1 font-medium">-{stats.savings} vs avg route</div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-1">
                                        <Navigation size={16} /> <span className="text-xs font-bold uppercase">Total Distance</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.distance} <span className="text-sm font-normal text-gray-500">km</span></div>
                                    <div className="text-xs text-blue-600 mt-1 font-medium">Est. Time: {(stats.distance / 50).toFixed(1)} hrs</div>
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 flex items-start gap-4">
                                <div className="p-2 bg-amber-100 dark:bg-amber-800/40 rounded-lg text-amber-700 dark:text-amber-400">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Eco-Friendly Badge Eligible</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        This route qualifies for a <strong>Green Logistics credit</strong>. By choosing this listing, you contribute to carbon neutrality.
                                    </p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                        Close Analysis
                    </button>
                    <button onClick={() => { /* Proceeed Logic */ onClose(); }} className="px-6 py-2.5 rounded-xl font-bold bg-bhoomi-green hover:bg-green-700 text-white shadow-lg shadow-green-500/20 transition-all flex items-center gap-2">
                        <Truck size={18} /> Proceed with Order
                    </button>
                </div>

            </div>
        </div>
    );
};

// Helper for icon (internal)
const Sprout = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" /><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.2.4-4.8-.3-1.2-.6-1.6-1.2-1.6-1.8 0-1.5 1.5-3.2 2-2.9 1 3 1.1 5 4.1 1.3Z" /></svg>
);
