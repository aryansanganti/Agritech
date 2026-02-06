import React, { useState } from 'react';
import { SeedScoutQuery } from '../../types';
import { cropTypes } from '../../data/districtData';
import { SelectNative } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    Leaf, Target, Droplets, Thermometer, TrendingUp, Filter,
    ChevronDown, ChevronUp, Search, Loader2, RefreshCw, Cloud, Database, AlertCircle
} from 'lucide-react';

interface SeedScoutFiltersProps {
    query: SeedScoutQuery;
    setQuery: (query: SeedScoutQuery) => void;
    onSearch: () => void;
    isSearching: boolean;
    hasSearched: boolean;
    dataSource: 'gemini' | 'cached' | 'quick';
    searchProgress: { current: number, total: number, district: string };
}

export const SeedScoutFilters: React.FC<SeedScoutFiltersProps> = ({
    query, setQuery, onSearch, isSearching, hasSearched, dataSource, searchProgress
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Crop Selection */}
            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Leaf size={120} className="text-emerald-500 transform rotate-12 translate-x-10 -translate-y-10" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 relative z-10">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <Leaf size={20} />
                    </div>
                    Target Crop
                </h3>

                <SelectNative
                    value={query.cropType}
                    onChange={(e) => setQuery({ ...query, cropType: e.target.value })}
                    className="relative z-10 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500"
                >
                    {cropTypes.map((crop) => (
                        <option key={crop.id} value={crop.id} className="bg-white dark:bg-gray-800">
                            {crop.name}
                        </option>
                    ))}
                </SelectNative>
            </div>

            {/* Trait Selection */}
            <div className="glass-panel p-5 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                        <Target size={20} />
                    </div>
                    Desired Traits
                </h3>

                <div className="space-y-3">
                    <TraitCheckbox
                        label="Salinity Tolerance"
                        sub="High soil EC"
                        icon={<Droplets size={18} className="text-blue-500" />}
                        checked={query.salinityTolerance}
                        onChange={(c) => setQuery({ ...query, salinityTolerance: c })}
                        colorClass="peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20"
                    />

                    <TraitCheckbox
                        label="Heat Resistance"
                        sub="40°C+ survival"
                        icon={<Thermometer size={18} className="text-orange-500" />}
                        checked={query.heatTolerance}
                        onChange={(c) => setQuery({ ...query, heatTolerance: c })}
                        colorClass="peer-checked:border-orange-500 peer-checked:bg-orange-50 dark:peer-checked:bg-orange-900/20"
                    />

                    <TraitCheckbox
                        label="Drought Hardiness"
                        sub="Low rainfall"
                        icon={<TrendingUp size={18} className="text-yellow-500" />}
                        checked={query.droughtTolerance}
                        onChange={(c) => setQuery({ ...query, droughtTolerance: c })}
                        colorClass="peer-checked:border-yellow-500 peer-checked:bg-yellow-50 dark:peer-checked:bg-yellow-900/20"
                    />
                </div>

                {/* Advanced Weights Button */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 mt-4 text-xs font-semibold text-gray-500 hover:text-emerald-500 transition-colors uppercase tracking-wide"
                >
                    <Filter size={12} />
                    <span>Advanced Tuning</span>
                    {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {showAdvanced && (
                    <div className="mt-4 space-y-4 p-4 rounded-xl bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 animate-slide-up">
                        <RangeSlider label="Salinity Weight" value={query.salinityWeight} onChange={(v) => setQuery({ ...query, salinityWeight: v })} color="accent-blue-500" />
                        <RangeSlider label="Heat Weight" value={query.heatWeight} onChange={(v) => setQuery({ ...query, heatWeight: v })} color="accent-orange-500" />
                    </div>
                )}

                <div className="mt-6">
                    <Button
                        onClick={onSearch}
                        disabled={isSearching || (!query.salinityTolerance && !query.heatTolerance && !query.droughtTolerance)}
                        className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] ${isSearching ? 'bg-gray-100 text-gray-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/40'
                            }`}
                    >
                        {isSearching ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 size={20} className="animate-spin" />
                                <span className="text-sm">Scanning {searchProgress.district}... ({searchProgress.current}/{searchProgress.total})</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Search size={20} />
                                <span>Find Hotspots</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Data Source Indicator */}
            {hasSearched && !isSearching && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium border animate-fade-in ${dataSource === 'gemini' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' :
                    dataSource === 'cached' ? 'bg-blue-50/50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' :
                        'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                    }`}>
                    {dataSource === 'gemini' && <Cloud size={14} />}
                    {dataSource === 'cached' && <Database size={14} />}
                    {dataSource === 'quick' && <AlertCircle size={14} />}
                    <span>
                        {dataSource === 'gemini' ? 'Live Gemini AI Analysis' :
                            dataSource === 'cached' ? 'Cached Results' :
                                'Offline Mode'}
                    </span>
                    {dataSource !== 'gemini' && (
                        <button onClick={onSearch} className="ml-auto text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                            <RefreshCw size={12} /> Retry
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper Components
const TraitCheckbox = ({ label, sub, icon, checked, onChange, colorClass }: any) => (
    <label className={`relative flex items-center gap-4 p-3 rounded-xl border border-transparent cursor-pointer transition-all hover:bg-white/50 dark:hover:bg-white/5 ${checked ? 'bg-white shadow-sm border-gray-100 dark:bg-white/5 dark:border-white/10' : 'opacity-80 hover:opacity-100'}`}>
        <div className={`absolute inset-0 rounded-xl border-2 border-transparent transition-all pointer-events-none ${colorClass}`}></div>
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
        />
        <div className={`w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center transition-colors relative z-10 ${checked ? 'bg-emerald-500 border-emerald-500' : ''}`}>
            {checked && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
        </div>
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg relative z-10">
            {icon}
        </div>
        <div className="flex-1 relative z-10">
            <span className={`block text-sm font-semibold text-gray-900 dark:text-white transition-colors ${checked ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>{label}</span>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{sub}</p>
        </div>
    </label>
);

const RangeSlider = ({ label, value, onChange, color }: any) => (
    <div>
        <div className="flex justify-between mb-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
            <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">{value.toFixed(1)}</span>
        </div>
        <input
            type="range" min="0" max="1" step="0.1" value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${color}`}
        />
    </div>
);
