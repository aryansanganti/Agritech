import React, { useState, useMemo, useEffect } from 'react';
import { Language, SeedScoutQuery, HotspotResult } from '../types';
import { translations } from '../utils/translations';
import { indianDistricts, cropTypes, clusterLabels } from '../data/districtData';
import { searchHotspots, getClusterSummary, getDataRanges } from '../services/seedScoutService';
import { searchHotspotsDynamic, searchHotspotsQuick, baseDistricts, SearchProgressCallback } from '../services/dynamicSeedScoutService';
import { getSeedScoutInsights, getDistrictEnvironmentalData } from '../services/geminiService';
import { SatelliteMap } from '../components/SatelliteMap';
import {
    ArrowLeft, Search, MapPin, Thermometer, Droplets, Users, Layers,
    Target, Sparkles, TrendingUp, Filter, Eye, Map, Satellite,
    ChevronDown, ChevronUp, Leaf, FlaskConical, Compass, Loader2,
    Database, Cloud, AlertCircle, RefreshCw
} from 'lucide-react';

interface SeedScoutProps {
    lang: Language;
    onBack: () => void;
}

export const SeedScout: React.FC<SeedScoutProps> = ({ lang, onBack }) => {
    const t = translations[lang];

    // Query state
    const [query, setQuery] = useState<SeedScoutQuery>({
        cropType: 'pearl-millet',
        salinityTolerance: true,
        heatTolerance: true,
        droughtTolerance: false,
        salinityWeight: 0.4,
        heatWeight: 0.4,
        droughtWeight: 0.2,
    });

    const [hasSearched, setHasSearched] = useState(false);
    const [results, setResults] = useState<HotspotResult[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<HotspotResult | null>(null);
    const [activeLayer, setActiveLayer] = useState<'salinity' | 'heat' | 'tribal' | 'cluster' | 'score'>('score');
    const [satelliteView, setSatelliteView] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // AI Insight State
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(false);

    // Dynamic search state
    const [isSearching, setIsSearching] = useState(false);
    const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0, district: '' });
    const [dataSource, setDataSource] = useState<'gemini' | 'cached' | 'quick'>('quick');

    const clusterSummary = useMemo(() => getClusterSummary(), []);

    const handleSearch = async () => {
        setIsSearching(true);
        setHasSearched(true);
        setDataSource('gemini');

        try {
            // Use dynamic search that fetches real data from Gemini
            const searchResults = await searchHotspotsDynamic(
                query,
                (current, total, districtName) => {
                    setSearchProgress({ current, total, district: districtName });
                }
            );

            setResults(searchResults);
            if (searchResults.length > 0) {
                handleSelectDistrict(searchResults[0]);
            }
        } catch (e) {
            console.error('Dynamic search failed, using quick search', e);
            const quickResults = searchHotspotsQuick(query);
            setResults(quickResults);
            setDataSource('quick');
            if (quickResults.length > 0) {
                handleSelectDistrict(quickResults[0]);
            }
        } finally {
            setIsSearching(false);
            setSearchProgress({ current: 0, total: 0, district: '' });
        }
    };

    const handleSelectDistrict = async (result: HotspotResult) => {
        setSelectedDistrict(result);
        setAiInsight(null); // Reset previous insight

        // Auto-fetch AI insight for high-scoring districts
        setLoadingInsight(true);
        try {
            const cropName = cropTypes.find(c => c.id === query.cropType)?.name || query.cropType;
            const insight = await getSeedScoutInsights(result.district, cropName, lang);
            setAiInsight(insight);
        } catch (e) {
            console.error("Failed to fetch insight", e);
        } finally {
            setLoadingInsight(false);
        }
    };

    // Color scale functions (kept same as before)
    const getColorForValue = (value: number, type: 'salinity' | 'heat' | 'tribal' | 'score') => {
        const intensity = Math.min(1, Math.max(0, value));
        switch (type) {
            case 'salinity': return `rgba(239, 68, 68, ${0.2 + intensity * 0.7})`;
            case 'heat': return `rgba(249, 115, 22, ${0.2 + intensity * 0.7})`;
            case 'tribal': return `rgba(139, 92, 246, ${0.2 + intensity * 0.7})`;
            case 'score':
                return intensity > 0.7 ? `rgba(34, 197, 94, ${0.3 + intensity * 0.6})`
                    : intensity > 0.4 ? `rgba(234, 179, 8, ${0.3 + intensity * 0.5})`
                        : `rgba(156, 163, 175, ${0.2 + intensity * 0.3})`;
            default: return 'rgba(156, 163, 175, 0.3)';
        }
    };

    const getDistrictColor = (result: HotspotResult) => {
        if (activeLayer === 'cluster') {
            const cluster = result.district.cluster ?? 0;
            return clusterLabels[cluster].color + '99';
        }
        switch (activeLayer) {
            case 'salinity': return getColorForValue(result.salinityScore, 'salinity');
            case 'heat': return getColorForValue(result.heatScore, 'heat');
            case 'tribal': return getColorForValue(result.tribalScore, 'tribal');
            case 'score': return getColorForValue(result.traitScore, 'score');
            default: return 'rgba(156, 163, 175, 0.3)';
        }
    };

    return (
        <div className="min-h-screen animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-bhumi-green dark:hover:text-bhumi-gold transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <Compass className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">SeedScout</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Genetic Hotspot Locator</p>
                    </div>
                </div>
                <div className="w-16"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Crop Selection */}
                    <div className="glass-panel rounded-2xl p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Leaf size={18} className="text-emerald-500" />
                            Target Crop
                        </h3>
                        <select
                            value={query.cropType}
                            onChange={(e) => setQuery({ ...query, cropType: e.target.value })}
                            className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 
                       text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        >
                            {cropTypes.map((crop) => (
                                <option key={crop.id} value={crop.id} className="bg-white dark:bg-gray-800">
                                    {crop.icon} {crop.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Trait Selection */}
                    <div className="glass-panel rounded-2xl p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Target size={18} className="text-orange-500" />
                            Desired Traits
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors group">
                                <input
                                    type="checkbox"
                                    checked={query.salinityTolerance}
                                    onChange={(e) => setQuery({ ...query, salinityTolerance: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                                />
                                <Droplets size={18} className="text-red-500" />
                                <div className="flex-1">
                                    <span className="font-medium text-gray-900 dark:text-white">Salinity Tolerance</span>
                                    <p className="text-xs text-gray-500">High soil EC environments</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors group">
                                <input
                                    type="checkbox"
                                    checked={query.heatTolerance}
                                    onChange={(e) => setQuery({ ...query, heatTolerance: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                                />
                                <Thermometer size={18} className="text-orange-500" />
                                <div className="flex-1">
                                    <span className="font-medium text-gray-900 dark:text-white">Heat Resistance</span>
                                    <p className="text-xs text-gray-500">Survives 40°C+ temperatures</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors group">
                                <input
                                    type="checkbox"
                                    checked={query.droughtTolerance}
                                    onChange={(e) => setQuery({ ...query, droughtTolerance: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                                />
                                <TrendingUp size={18} className="text-yellow-500" />
                                <div className="flex-1">
                                    <span className="font-medium text-gray-900 dark:text-white">Drought Hardiness</span>
                                    <p className="text-xs text-gray-500">Low rainfall adaptation</p>
                                </div>
                            </label>
                        </div>

                        {/* Advanced Weights Button */}
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 mt-4 text-sm text-gray-500 hover:text-emerald-500 transition-colors"
                        >
                            <Filter size={14} />
                            <span>Advanced Weights</span>
                            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                <div>
                                    <label className="text-xs text-gray-500">Salinity Weight: {query.salinityWeight.toFixed(1)}</label>
                                    <input
                                        type="range" min="0" max="1" step="0.1" value={query.salinityWeight}
                                        onChange={(e) => setQuery({ ...query, salinityWeight: parseFloat(e.target.value) })}
                                        className="w-full accent-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Heat Weight: {query.heatWeight.toFixed(1)}</label>
                                    <input
                                        type="range" min="0" max="1" step="0.1" value={query.heatWeight}
                                        onChange={(e) => setQuery({ ...query, heatWeight: parseFloat(e.target.value) })}
                                        className="w-full accent-orange-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={isSearching || (!query.salinityTolerance && !query.heatTolerance && !query.droughtTolerance)}
                        className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold 
                     flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-700 
                     transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSearching ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Fetching {searchProgress.district}... ({searchProgress.current}/{searchProgress.total})</span>
                            </>
                        ) : (
                            <>
                                <Search size={20} />
                                <span>Find Genetic Hotspots (AI Data)</span>
                            </>
                        )}
                    </button>

                    {/* Data Source Indicator */}
                    {hasSearched && !isSearching && (
                        <div className={`flex items-center gap-2 p-2 rounded-lg text-xs mt-2 ${dataSource === 'gemini' ? 'bg-emerald-500/10 text-emerald-600' :
                            dataSource === 'cached' ? 'bg-blue-500/10 text-blue-600' :
                                'bg-gray-500/10 text-gray-600'
                            }`}>
                            {dataSource === 'gemini' && <Cloud size={14} />}
                            {dataSource === 'cached' && <Database size={14} />}
                            {dataSource === 'quick' && <AlertCircle size={14} />}
                            <span>
                                {dataSource === 'gemini' ? 'Data from Gemini AI with Google Search' :
                                    dataSource === 'cached' ? 'Using cached data' :
                                        'Using fallback data (API may have issues)'}
                            </span>
                            {dataSource !== 'gemini' && (
                                <button onClick={handleSearch} className="ml-auto text-emerald-500 hover:underline flex items-center gap-1">
                                    <RefreshCw size={12} /> Retry with AI
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Map & Results Panel */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Map Controls */}
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                        <div className="flex gap-2 flex-wrap">
                            {(['score', 'salinity', 'heat', 'tribal', 'cluster'] as const).map((layer) => (
                                <button
                                    key={layer}
                                    onClick={() => { setActiveLayer(layer); setSatelliteView(false); }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!satelliteView && activeLayer === layer
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                                        }`}
                                >
                                    {layer === 'score' ? '🎯 Hotspot Score' :
                                        layer === 'salinity' ? '🧂 Salinity' :
                                            layer === 'heat' ? '🌡️ Heat' :
                                                layer === 'tribal' ? '👥 Tribal %' : '🗺️ Clusters'}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setSatelliteView(!satelliteView)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${satelliteView
                                ? 'bg-gray-800 text-white ring-2 ring-emerald-500'
                                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                                }`}
                        >
                            {satelliteView ? <Satellite size={16} /> : <Map size={16} />}
                            {satelliteView ? 'Satellite View' : 'Map View'}
                        </button>
                    </div>

                    {/* Interactive Map */}
                    <div
                        className={`glass-panel rounded-2xl p-4 relative overflow-hidden transition-all h-[520px] ${satelliteView ? 'bg-gray-900 border-0 p-0' : ''
                            }`}
                    >
                        {satelliteView ? (
                            // Leaflet Satellite View with ESRI World Imagery (Free, no API key needed)
                            <SatelliteMap
                                center={selectedDistrict
                                    ? { lat: selectedDistrict.district.lat, lng: selectedDistrict.district.lng }
                                    : { lat: 20.5937, lng: 78.9629 }}
                                zoom={selectedDistrict ? 9 : 5}
                                markers={hasSearched ? results.map(r => ({
                                    lat: r.district.lat,
                                    lng: r.district.lng,
                                    title: `${r.district.name}: ${(r.traitScore * 100).toFixed(0)}% Score`,
                                    score: r.traitScore
                                })) : []}
                                onMarkerClick={(marker) => {
                                    const found = results.find(r =>
                                        r.district.lat === marker.lat && r.district.lng === marker.lng
                                    );
                                    if (found) handleSelectDistrict(found);
                                }}
                            />
                        ) : (
                            // SVG Data View (Data Heatmap)
                            <div className="relative w-full h-full">
                                <svg viewBox="0 0 500 520" className="w-full h-full">
                                    <rect x="0" y="0" width="500" height="520" fill="rgba(243, 244, 246, 0.5)" className="dark:fill-white/5" />

                                    {/* Simplistic India Outline */}
                                    <path
                                        d="M160,50 L200,30 L280,35 L350,60 L380,100 L400,140 L420,200 L440,280 L430,350 L400,400 L350,450 L280,480 L200,490 L150,460 L100,400 L80,340 L60,280 L70,200 L90,140 L120,90 Z"
                                        fill="rgba(200,220,200,0.3)" stroke="rgba(45,80,22,0.3)" strokeWidth="2"
                                    />

                                    {/* District Points */}
                                    {(hasSearched ? results : indianDistricts.map(d => ({
                                        district: d, traitScore: 0.3, salinityScore: d.salinity / 10,
                                        heatScore: (d.maxTemp - 30) / 20, droughtScore: 1 - d.rainfall / 2000,
                                        tribalScore: d.tribalPercent / 100, recommendation: ''
                                    }))).map((result) => {
                                        const d = result.district;
                                        const x = ((d.lng - 68) / 30) * 400 + 50;
                                        const y = ((37 - d.lat) / 30) * 450 + 30;
                                        const isSelected = selectedDistrict?.district.id === d.id;
                                        const color = getDistrictColor(result);
                                        const size = hasSearched ? 8 + result.traitScore * 12 : 6;

                                        return (
                                            <g key={d.id} className="cursor-pointer group" onClick={() => handleSelectDistrict(result)}>
                                                <circle cx={x} cy={y} r={size + 4} fill={color} opacity={isSelected ? 0.4 : 0} />
                                                <circle cx={x} cy={y} r={size} fill={color} stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.2)'} strokeWidth={isSelected ? 3 : 1} />
                                                <text x={x} y={y - size - 6} textAnchor="middle" className="text-[8px] fill-gray-700 dark:fill-white opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontWeight: 600 }}>
                                                    {d.name}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>

                                {/* Legend */}
                                <div className="absolute bottom-2 left-2 glass-panel rounded-lg p-2 text-xs backdrop-blur-md">
                                    <div className="font-semibold text-gray-700 dark:text-white mb-1">
                                        {activeLayer === 'score' ? 'Hotspot Score' :
                                            activeLayer === 'salinity' ? 'Salinity (dS/m)' :
                                                activeLayer === 'heat' ? 'Max Temperature' :
                                                    activeLayer === 'tribal' ? 'Tribal Population' : 'Agro-Clusters'}
                                    </div>
                                    {activeLayer !== 'cluster' ? (
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500">Low</span>
                                            <div className="w-16 h-2 rounded" style={{
                                                background: activeLayer === 'score' ? 'linear-gradient(to right, #9ca3af, #eab308, #22c55e)' :
                                                    activeLayer === 'salinity' ? 'linear-gradient(to right, rgba(239,68,68,0.2), rgba(239,68,68,1))' : 'linear-gradient(to right, gray, darkgray)'
                                            }}></div>
                                            <span className="text-gray-500">High</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <span className="text-gray-500">4 Climate Zones</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Selected District Detail & AI Insight */}
                    {selectedDistrict && hasSearched && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Metrics Panel */}
                            <div className="glass-panel rounded-2xl p-5 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <MapPin className="text-emerald-500" size={20} />
                                            {selectedDistrict.district.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{selectedDistrict.district.state}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-emerald-500">
                                            {(selectedDistrict.traitScore * 100).toFixed(0)}%
                                        </div>
                                        <p className="text-xs text-gray-500">Match Score</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="p-2 rounded-xl bg-red-500/10 text-center">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedDistrict.district.salinity}</div>
                                        <p className="text-xs text-gray-500">EC (dS/m)</p>
                                    </div>
                                    <div className="p-2 rounded-xl bg-orange-500/10 text-center">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedDistrict.district.maxTemp}°C</div>
                                        <p className="text-xs text-gray-500">Max Temp</p>
                                    </div>
                                    <div className="p-2 rounded-xl bg-purple-500/10 text-center">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedDistrict.district.tribalPercent}%</div>
                                        <p className="text-xs text-gray-500">Tribal</p>
                                    </div>
                                    <div className="p-2 rounded-xl bg-blue-500/10 text-center">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedDistrict.district.rainfall}</div>
                                        <p className="text-xs text-gray-500">Rain (mm)</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Insight Panel */}
                            <div className="glass-panel rounded-2xl p-5 border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent relative overflow-hidden">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Sparkles size={18} className="text-purple-500" />
                                    AI Genetic Analysis
                                </h3>

                                {loadingInsight ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-purple-500">
                                        <Loader2 size={32} className="animate-spin mb-2" />
                                        <span className="text-sm animate-pulse">Analyzing gene evolution...</span>
                                    </div>
                                ) : aiInsight ? (
                                    <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-h-60 overflow-y-auto custom-scrollbar">
                                        <div dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                        <p>Select a hotspot to generate insights</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Top Results List */}
                    {hasSearched && results.length > 0 && (
                        <div className="glass-panel rounded-2xl p-5">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500" />
                                Top Genetic Hotspots
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {results.slice(0, 10).map((result, index) => (
                                    <button
                                        key={result.district.id}
                                        onClick={() => handleSelectDistrict(result)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedDistrict?.district.id === result.district.id
                                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                                            : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-medium text-sm text-gray-900 dark:text-white">{result.district.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">{result.district.state}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm font-bold ${result.traitScore >= 0.7 ? 'text-emerald-500' : 'text-gray-400'
                                                }`}>{(result.traitScore * 100).toFixed(0)}%</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
