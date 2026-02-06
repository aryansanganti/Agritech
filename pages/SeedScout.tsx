import React, { useState, useMemo, useEffect } from 'react';
import { Language, SeedScoutQuery, HotspotResult, TopologyResult, SeedRecommendation } from '../types';
import { translations } from '../utils/translations';
import { indianDistricts, cropTypes, clusterLabels } from '../data/districtData';
import {
    searchHotspotsDynamic, searchHotspotsQuick, getClusterSummary, getDataRanges,
    identifyTopology, getTopoRecommendations, SearchProgressCallback
} from '../services/seedScoutService';
import { getCurrentWeather, WeatherData } from '../services/weatherService';
import { getSeedScoutInsights, getDistrictEnvironmentalData } from '../services/geminiService';
import { SatelliteMap } from '../components/SatelliteMap';
import { DNAScanner } from '../components/DNAScanner';
import {
    ArrowLeft, Search, MapPin, Thermometer, Droplets, Users, Layers,
    Target, Sparkles, TrendingUp, Filter, Eye, Map, Satellite,
    ChevronDown, ChevronUp, Leaf, FlaskConical, Compass, Loader2,
    Database, Cloud, AlertCircle, RefreshCw, Globe, Sprout
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SelectNative } from '../components/ui/Input';
import { PageHeader, Spinner } from '../components/ui/Shared';
import { cn } from '../lib/utils';

interface SeedScoutProps {
    lang: Language;
    onBack: () => void;
    onNavigateToReplication?: (crop: string, sourceLocation: string) => void;
}

export const SeedScout: React.FC<SeedScoutProps> = ({ lang, onBack, onNavigateToReplication }) => {
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

    // Topo-Seed Engine State
    const [userTopology, setUserTopology] = useState<TopologyResult | null>(null);
    const [topoSeeds, setTopoSeeds] = useState<SeedRecommendation[]>([]);
    const [isLocating, setIsLocating] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
    const [showWeatherDetails, setShowWeatherDetails] = useState(false);

    // AI Insight State
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(false);

    // Dynamic search state
    const [isSearching, setIsSearching] = useState(false);
    const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0, district: '' });
    const [dataSource, setDataSource] = useState<'gemini' | 'cached' | 'quick'>('quick');

    const clusterSummary = useMemo(() => getClusterSummary(), []);

    // Topology Coordinate Mapping (Approximate Centers)
    const topologyCoordinates: Record<string, { lat: number, lng: number }> = {
        "The Western Ghats": { lat: 14.0, lng: 74.5 },
        "The Eastern Ghats": { lat: 18.0, lng: 83.0 },
        "The North-Eastern Himalayas": { lat: 27.5, lng: 88.5 },
        "The Deccan Plateau": { lat: 17.0, lng: 77.0 },
        "The Coastal Plains": { lat: 10.0, lng: 76.5 },
        "The Desert Region": { lat: 27.0, lng: 71.0 },
        "The Gangetic Plains": { lat: 25.5, lng: 82.0 },
        "The Central Highlands": { lat: 23.5, lng: 78.5 },
        "The Islands": { lat: 11.5, lng: 92.5 }
    };

    // Eco-Locate Handler
    const handleLocate = () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude }); // Save user location

            try {
                // 1. Identify Topology
                const topology = await identifyTopology(latitude, longitude);
                setUserTopology(topology);

                // 2. Get Real-Time Weather
                const weather = await getCurrentWeather(latitude, longitude);
                setCurrentWeather(weather);

                // 3. Get Recommendations
                const response = await getTopoRecommendations(latitude, longitude, weather);
                setTopoSeeds(response.recommendations);
            } catch (error) {
                console.error("Topo-Seed Engine Failed:", error);
                alert("Could not identify your ecological address. Ensure backend is running.");
            } finally {
                setIsLocating(false);
            }
        }, (error) => {
            console.error("GPS Error:", error);
            setIsLocating(false);
            alert("Please enable location access to use Eco-Locate.");
        });
    };

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

    // Progressive filtering: Show only green, fallback to yellow, then gray
    const getFilteredResults = (searchResults: HotspotResult[]) => {
        if (!hasSearched || searchResults.length === 0) {
            return searchResults;
        }

        // Categorize results by score tier
        const greenHotspots = searchResults.filter(r => r.traitScore > 0.7);  // Excellent (Green)
        const yellowHotspots = searchResults.filter(r => r.traitScore > 0.4 && r.traitScore <= 0.7);  // Good (Yellow)
        const grayHotspots = searchResults.filter(r => r.traitScore <= 0.4);  // Moderate (Gray)

        // Progressive fallback: Green → Yellow → Gray
        if (greenHotspots.length > 0) {
            // console.log(`🟢 Showing ${greenHotspots.length} excellent hotspots`);
            return greenHotspots;
        } else if (yellowHotspots.length > 0) {
            // console.log(`🟡 No excellent hotspots found. Showing ${yellowHotspots.length} good hotspots`);
            return yellowHotspots;
        } else {
            // console.log(`⚫ No good hotspots found. Showing ${grayHotspots.length} moderate hotspots`);
            return grayHotspots;
        }
    };

    return (
        <div className="min-h-screen animate-fade-in pb-10">
            {/* Header */}
            <PageHeader
                title="SeedScout"
                onBack={onBack}
                icon={<Compass className="text-white" size={24} />}
                subtitle="Genetic Hotspot Locator"
            />

            {/* NEW: Topo-Seed Engine (Eco-Locate) Panel */}
            <Card className="mb-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Globe className="text-blue-500" size={24} />
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white">Eco-Locate: Find Your Topology Twin</h2>
                            <p className="text-xs text-gray-500">Discover seeds from regions perfectly matching your ecology.</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleLocate}
                        disabled={isLocating}
                        className="bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30"
                    >
                        {isLocating ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                        {isLocating ? 'Scanning Ecology...' : 'Find My Genetic Match'}
                    </Button>
                </div>

                {/* Topology Results */}
                {userTopology && (
                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800/50 animate-slide-up">
                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900">
                                <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Your Ecology</span>
                                <div className="font-bold text-lg text-gray-800 dark:text-white">{userTopology.topology}</div>
                            </div>
                            <div className="flex items-center text-gray-400"><ArrowLeft size={16} className="rotate-180" /></div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-100 dark:border-purple-800">
                                <span className="text-xs text-purple-500 font-bold uppercase tracking-wider">Topology Twin</span>
                                <div className="font-bold text-lg text-purple-700 dark:text-purple-300">{userTopology.twins[0]}</div>
                            </div>

                            {/* Weather Badge & Details */}
                            {currentWeather && (
                                <div className="w-full mt-2 animate-fade-in">
                                    <div
                                        onClick={() => setShowWeatherDetails(!showWeatherDetails)}
                                        className="bg-orange-50 dark:bg-orange-900/20 px-4 py-3 rounded-xl border border-orange-100 dark:border-orange-800 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                                                    <Cloud className="text-orange-500 dark:text-orange-300" size={24} />
                                                </div>
                                                <div>
                                                    <span className="text-xs text-orange-500 font-bold uppercase tracking-wider">Current Conditions</span>
                                                    <div className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-3">
                                                        <span>{currentWeather.temp}°C</span>
                                                        <span className="text-sm font-normal text-gray-400">|</span>
                                                        <span className="flex items-center gap-1 text-sm">
                                                            <Droplets size={14} /> {currentWeather.humidity}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {showWeatherDetails ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                        </div>

                                        {/* Expanded Weather Details */}
                                        {showWeatherDetails && (
                                            <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Air Temp (Min/Max)</p>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{currentWeather.tempMin}° / {currentWeather.tempMax}°</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Precipitation</p>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{currentWeather.precipitation} mm</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Wind</p>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{currentWeather.windSpeed} km/h</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Solar Radiation</p>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{currentWeather.radiation} W/m²</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Cloud Cover</p>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{currentWeather.cloudCover}%</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Pressure</p>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{currentWeather.pressure} hPa</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Show on Map Button */}
                            <button
                                onClick={() => {
                                    // Mapping logic for Twin visualization
                                    const twinLocations: Record<string, { lat: number, lng: number }> = {
                                        "The Western Ghats": { lat: 14.0, lng: 74.5 },
                                        "The Eastern Ghats": { lat: 18.0, lng: 83.0 },
                                        "The North-Eastern Himalayas": { lat: 27.5, lng: 88.5 },
                                        "The Deccan Plateau": { lat: 17.0, lng: 77.0 },
                                        "The Coastal Plains": { lat: 10.0, lng: 76.5 },
                                        "The Desert Region": { lat: 27.0, lng: 71.0 },
                                    };

                                    const twinName = userTopology.twins[0];
                                    const twinCoords = twinLocations[twinName];

                                    setSatelliteView(true);
                                    if (twinCoords) {
                                        // Update search results to show User + Twin
                                        // This relies on the map rendering logic using 'results' or a new 'markers' prop
                                        // For now, we simulate results to hijack the map view
                                        const mockResults = [
                                            {
                                                district: { name: "Your Location", lat: 20.0, lng: 78.0, id: "u1", state: "Current", salinity: 0, maxTemp: 0, rainfall: 0, tribalPercent: 0 }, // Placeholder coords, will update if we had user geo in state
                                                traitScore: 1, salinityScore: 0, heatScore: 0, droughtScore: 0, tribalScore: 0, recommendation: "You are here"
                                            },
                                            {
                                                district: { name: `Twin: ${twinName}`, lat: twinCoords.lat, lng: twinCoords.lng, id: "t1", state: "Topology Twin", salinity: 0, maxTemp: 0, rainfall: 0, tribalPercent: 0 },
                                                traitScore: 0.9, salinityScore: 0, heatScore: 0, droughtScore: 0, tribalScore: 0, recommendation: "Ecological Twin"
                                            }
                                        ];
                                        setResults(mockResults as any);
                                        setHasSearched(true);
                                    }
                                }}
                                className="w-full mt-2 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Map size={16} /> Show Locations on Map
                            </button>
                        </div>

                        {/* Seed Recommendations Card Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {topoSeeds.map((seed, idx) => (
                                <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-3 transition-hover hover:scale-[1.02] ${seed.matchType === 'Native'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
                                    }`}>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                                            <img src={seed.image_url} alt={seed.seed_name} className="w-full h-full object-cover"
                                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100?text=Seed'; }} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{seed.seed_name}</h4>
                                                <Badge variant={seed.matchType === 'Native' ? 'success' : 'purple'} className="text-[10px]">
                                                    {seed.matchType === 'Native' ? 'NATIVE' : 'TWIN'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{seed.cultural_note}</p>
                                        </div>
                                    </div>

                                    {/* View Origin Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click
                                            const nativeZone = seed.primary_topology[0]; // e.g., "The North-Eastern Himalayas"
                                            const nativeCoords = topologyCoordinates[nativeZone];

                                            // Typical Environmental Data for Topologies (Averages)
                                            const topologyTypicalData: Record<string, any> = {
                                                "The Western Ghats": { salinity: 0.5, maxTemp: 32, rainfall: 2500, tribalPercent: 40 },
                                                "The Eastern Ghats": { salinity: 1.2, maxTemp: 35, rainfall: 1200, tribalPercent: 55 },
                                                "The North-Eastern Himalayas": { salinity: 0.2, maxTemp: 25, rainfall: 3000, tribalPercent: 70 },
                                                "The Deccan Plateau": { salinity: 1.5, maxTemp: 38, rainfall: 700, tribalPercent: 15 },
                                                "The Coastal Plains": { salinity: 3.5, maxTemp: 34, rainfall: 1500, tribalPercent: 10 },
                                                "The Desert Region": { salinity: 4.0, maxTemp: 45, rainfall: 200, tribalPercent: 25 },
                                                "The Gangetic Plains": { salinity: 1.0, maxTemp: 40, rainfall: 1000, tribalPercent: 5 },
                                                "The Central Highlands": { salinity: 0.8, maxTemp: 36, rainfall: 900, tribalPercent: 45 },
                                                "The Islands": { salinity: 2.5, maxTemp: 30, rainfall: 2800, tribalPercent: 90 }
                                            };

                                            const typicalStats = topologyTypicalData[nativeZone] || { salinity: 1.0, maxTemp: 30, rainfall: 1000, tribalPercent: 20 };

                                            if (userLocation && nativeCoords) {
                                                setSatelliteView(true);

                                                // Create mock results with REAL data
                                                const sourceTargetResults = [
                                                    {
                                                        district: {
                                                            name: "Target: Your Farm",
                                                            lat: userLocation.lat,
                                                            lng: userLocation.lng,
                                                            id: "u1",
                                                            state: "Current Location",
                                                            salinity: 0.5, // Assumed low for user
                                                            maxTemp: currentWeather?.tempMax || 30,
                                                            rainfall: (currentWeather?.precipitation || 0) * 100 + 500, // Rough annual estimate based on current
                                                            tribalPercent: 0
                                                        },
                                                        traitScore: 0.95,
                                                        salinityScore: 0.2, heatScore: 0.5, droughtScore: 0.1, tribalScore: 0,
                                                        recommendation: "Ready for Cultivation"
                                                    },
                                                    {
                                                        district: {
                                                            name: `Source: ${nativeZone}`,
                                                            lat: nativeCoords.lat,
                                                            lng: nativeCoords.lng,
                                                            id: `s${idx}`,
                                                            state: "Native Origin",
                                                            salinity: typicalStats.salinity,
                                                            maxTemp: typicalStats.maxTemp,
                                                            rainfall: typicalStats.rainfall,
                                                            tribalPercent: typicalStats.tribalPercent
                                                        },
                                                        traitScore: 0.98,
                                                        salinityScore: typicalStats.salinity / 4,
                                                        heatScore: (typicalStats.maxTemp - 20) / 30,
                                                        droughtScore: 1 - (typicalStats.rainfall / 3000),
                                                        tribalScore: typicalStats.tribalPercent / 100,
                                                        recommendation: "Genetic Ancestry"
                                                    }
                                                ];

                                                setResults(sourceTargetResults as any);
                                                setHasSearched(true);

                                                // Auto-select the Source to show its details immediately
                                                setTimeout(() => handleSelectDistrict(sourceTargetResults[1] as any), 100);

                                                // Scroll to map
                                                window.scrollTo({ top: 450, behavior: 'smooth' });
                                            } else {
                                                alert("Could not map this seed's origin. Coordinates missing.");
                                            }
                                        }}
                                        className="mt-auto w-full py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Globe size={12} /> View Origin Map
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Crop Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Leaf size={18} className="text-emerald-500" />
                                Target Crop
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                        {/* ... Existing Search Panel ... */}
                        <SelectNative
                            value={query.cropType}
                            onChange={(e) => setQuery({ ...query, cropType: e.target.value })}
                        >
                            {cropTypes.map((crop) => (
                                <option key={crop.id} value={crop.id} className="bg-white dark:bg-gray-800">
                                    {crop.icon} {crop.name}
                                </option>
                            ))}
                        </SelectNative>
                        </CardContent>
                    </Card>

                    {/* Trait Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target size={18} className="text-orange-500" />
                                Desired Traits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handleSearch}
                        disabled={isSearching || (!query.salinityTolerance && !query.heatTolerance && !query.droughtTolerance)}
                        variant="success"
                        size="lg"
                        className="w-full shadow-lg shadow-emerald-500/30"
                    >
                        {isSearching ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Fetching {searchProgress.district}... ({searchProgress.current}/{searchProgress.total})</span>
                            </>
                        ) : (
                            <>
                                <Search size={20} />
                                <span className="text-left w-full pl-2">Find Hotspots</span>
                            </>
                        )}
                    </Button>

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
                                    {(hasSearched ? getFilteredResults(results) : indianDistricts.map(d => ({
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
                            <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
                                <CardContent className="p-5">
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
                                </CardContent>
                            </Card>

                            {/* AI Insight Panel */}
                            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent overflow-hidden">
                                <CardContent className="p-5">
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
                                </CardContent>
                            </Card>

                            {/* Replication Planner CTA */}
                            {onNavigateToReplication && (
                                <Card className="md:col-span-2 border-2 border-dashed border-bhoomi-green/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5 hover:border-bhoomi-green transition-all cursor-pointer group p-5"
                                    onClick={() => onNavigateToReplication(
                                        cropTypes.find(c => c.id === query.cropType)?.name || query.cropType,
                                        `${selectedDistrict.district.name}, ${selectedDistrict.district.state}`
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Compass size={28} className="text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Plan Crop Replication</h3>
                                                <p className="text-sm text-gray-500">
                                                    Get a complete cultivation blueprint to replicate {cropTypes.find(c => c.id === query.cropType)?.name || 'this crop'} from {selectedDistrict.district.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="hidden md:flex items-center gap-2 text-bhumi-green font-medium">
                                            <span>Create Plan</span>
                                            <ArrowLeft className="rotate-180" size={20} />
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>

                    )}

                    {/* Scanning Animation State */}
                    {isSearching && !hasSearched && (
                        <div className="h-64 glass-panel rounded-2xl p-4">
                            <DNAScanner />
                        </div>
                    )}

                    {/* Top Results List */}
                    {hasSearched && results.length > 0 && (() => {
                        const filteredResults = getFilteredResults(results);
                        return (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp size={18} className="text-emerald-500" />
                                        Top Genetic Hotspots {filteredResults.length < results.length && (
                                            <span className="text-xs font-normal text-gray-500">
                                                ({filteredResults.length} of {results.length} districts)
                                            </span>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {filteredResults.slice(0, 10).map((result, index) => (
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
                                </CardContent>
                            </Card>
                        )
                    })()}
                </div>
            </div >
        </div >
    );
};
