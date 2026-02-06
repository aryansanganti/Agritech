import React from 'react';
import { HotspotResult } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { MapPin, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

interface SeedScoutResultsProps {
    selectedDistrict: HotspotResult | null;
    aiInsight: string | null;
    loadingInsight: boolean;
}

export const SeedScoutResults: React.FC<SeedScoutResultsProps> = ({ selectedDistrict, aiInsight, loadingInsight }) => {
    if (!selectedDistrict) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 glass-panel rounded-3xl border-dashed border-2 border-gray-200 dark:border-gray-700 opacity-60">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <MapPin size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-500">No District Selected</h3>
                <p className="text-sm text-gray-400 max-w-xs">Select a hotspot on the map to view detailed analytics and AI insights.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Main Score Card */}
            <div className="glass-panel rounded-3xl p-6 bg-gradient-to-br from-white/80 to-emerald-50/50 dark:from-white/5 dark:to-emerald-900/10 border-emerald-100 dark:border-emerald-500/20 relative overflow-hidden group">
                {/* Decorative background glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                            <MapPin size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">{selectedDistrict.district.state}</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            {selectedDistrict.district.name}
                        </h2>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black text-emerald-500 tracking-tighter shadow-emerald-500/20 drop-shadow-sm">
                            {(selectedDistrict.traitScore * 100).toFixed(0)}<span className="text-lg align-top">%</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Match Score</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <MetricBox label="Soil Salinity" value={`${selectedDistrict.district.salinity} dS/m`} className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400" />
                    <MetricBox label="Max Temp" value={`${selectedDistrict.district.maxTemp}°C`} className="bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400" />
                    <MetricBox label="Rainfall" value={`${selectedDistrict.district.rainfall} mm`} className="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400" />
                    <MetricBox label="Tribal Pop" value={`${selectedDistrict.district.tribalPercent}%`} className="bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400" />
                </div>
            </div>

            {/* AI Insight Panel */}
            <div className={`glass-panel rounded-3xl p-5 border-l-4 border-l-purple-500 transition-all ${loadingInsight ? 'opacity-80' : 'opacity-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-white shadow-lg shadow-purple-500/20">
                        {loadingInsight ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Gemini 3 Pro Analysis</h3>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                    {loadingInsight ? (
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {aiInsight || "No specific insights available for this region yet. Try selecting a different crop or adjusting tolerance filters."}
                        </p>
                    )}
                </div>

                {!loadingInsight && aiInsight && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                        <button className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 group">
                            Full Report <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricBox = ({ label, value, className }: any) => (
    <div className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center ${className}`}>
        <span className="text-lg font-bold">{value}</span>
        <span className="text-[10px] opacity-70 uppercase tracking-wider font-semibold">{label}</span>
    </div>
);
