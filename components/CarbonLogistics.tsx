/**
 * Carbon Footprint Logistics Component
 * Visualizes delivery routes with TSP (Travelling Salesman Problem) algorithm
 * Shows real road routes on an interactive map with animation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Leaf, Truck, MapPin, Route, Zap, TreePine, Clock, Fuel,
    ArrowRight, Play, Pause, RotateCcw, CheckCircle2, Package,
    Sparkles, TrendingDown, Navigation, X, Map
} from 'lucide-react';
import { MarketplaceListing } from '../types';
import {
    calculateOptimalRoute,
    calculateOptimalRouteSync,
    calculateCarbonMetrics,
    getGradeSegregation,
    OptimalRoute,
    DeliveryNode,
} from '../services/carbonLogisticsService';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color: string, emoji: string) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 18px;">${emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

const farmerIcon = createIcon('#10B981', '🌾');
const hubIcon = createIcon('#F59E0B', '📦');
const vendorIcon = createIcon('#8B5CF6', '🏪');
const truckIcon = createIcon('#EF4444', '🚛');

interface Props {
    listing: MarketplaceListing;
    vendorLocation: { district: string; state: string };
    onClose: () => void;
}

// Animation states
type SimulationState = 'idle' | 'fetching' | 'calculating' | 'running' | 'paused' | 'completed';

// Map bounds fitter component
const FitBounds: React.FC<{ route: OptimalRoute }> = ({ route }) => {
    const map = useMap();

    useEffect(() => {
        if (route.path.length > 0) {
            const bounds = L.latLngBounds(
                route.path.map(node => [node.coordinates.lat, node.coordinates.lng])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [route, map]);

    return null;
};

// Animated truck marker component
const AnimatedTruck: React.FC<{
    route: OptimalRoute;
    progress: number;
    isRunning: boolean;
}> = ({ route, progress, isRunning }) => {
    const [position, setPosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (!route.routeGeometry || route.routeGeometry.length === 0) {
            // Fallback to node positions
            const totalNodes = route.path.length;
            const progressPerNode = 1 / (totalNodes - 1);
            const nodeIndex = Math.min(Math.floor(progress / progressPerNode), totalNodes - 2);
            const nodeProgress = (progress - nodeIndex * progressPerNode) / progressPerNode;

            const from = route.path[nodeIndex];
            const to = route.path[nodeIndex + 1];

            const lat = from.coordinates.lat + (to.coordinates.lat - from.coordinates.lat) * nodeProgress;
            const lng = from.coordinates.lng + (to.coordinates.lng - from.coordinates.lng) * nodeProgress;

            setPosition([lat, lng]);
        } else {
            // Use real route geometry
            const totalPoints = route.routeGeometry.length;
            const pointIndex = Math.min(Math.floor(progress * (totalPoints - 1)), totalPoints - 2);
            const pointProgress = (progress * (totalPoints - 1)) - pointIndex;

            const from = route.routeGeometry[pointIndex];
            const to = route.routeGeometry[pointIndex + 1];

            // Geometry is [lng, lat], we need [lat, lng] for Leaflet
            const lat = from[1] + (to[1] - from[1]) * pointProgress;
            const lng = from[0] + (to[0] - from[0]) * pointProgress;

            setPosition([lat, lng]);
        }
    }, [route, progress]);

    if (!position || progress === 0) return null;

    return (
        <Marker position={position} icon={truckIcon}>
            <Popup>
                <div className="text-center">
                    <strong>🚛 Delivery Truck</strong>
                    <br />
                    Progress: {Math.round(progress * 100)}%
                </div>
            </Popup>
        </Marker>
    );
};

export const CarbonLogistics: React.FC<Props> = ({ listing, vendorLocation, onClose }) => {
    // State
    const [route, setRoute] = useState<OptimalRoute | null>(null);
    const [isLoadingRealRoute, setIsLoadingRealRoute] = useState(false);
    const [simulationState, setSimulationState] = useState<SimulationState>('idle');
    const [progress, setProgress] = useState(0);
    const [currentSegment, setCurrentSegment] = useState(0);
    const [tspSteps, setTspSteps] = useState<string[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showAlgorithm, setShowAlgorithm] = useState(true);
    const animationRef = useRef<NodeJS.Timeout | null>(null);

    // Grade segregation info
    const gradeInfo = getGradeSegregation(listing.grade as 'A' | 'B' | 'C');

    // Helper to safely get location string
    const getLocationString = (loc: string | { district: string; state: string }): { district: string; state: string; name: string } => {
        if (typeof loc === 'string') {
            return { district: loc, state: '', name: loc };
        }
        return { district: loc.district, state: loc.state, name: `${loc.district}, ${loc.state}` };
    };

    // Calculate initial route (sync) on mount
    useEffect(() => {
        const loc = getLocationString(listing.location);
        const farmerLocation = {
            district: loc.district,
            state: loc.state,
            name: `Farmer (${listing.crop})`
        };

        const vendor = {
            district: vendorLocation.district,
            state: vendorLocation.state,
            name: 'Vendor Warehouse'
        };

        // Use sync version for initial render
        const initialRoute = calculateOptimalRouteSync(farmerLocation, vendor, listing.quantity);
        setRoute(initialRoute);

        // Generate TSP algorithm steps
        generateTSPSteps(initialRoute);
    }, [listing, vendorLocation]);

    // Fetch real road routes when starting simulation
    const fetchRealRoutes = async () => {
        setIsLoadingRealRoute(true);
        setSimulationState('fetching');

        try {
            const loc = getLocationString(listing.location);
            const farmerLocation = {
                district: loc.district,
                state: loc.state,
                name: `Farmer (${listing.crop})`
            };

            const vendor = {
                district: vendorLocation.district,
                state: vendorLocation.state,
                name: 'Vendor Warehouse'
            };

            // Fetch real routes from OSRM
            const realRoute = await calculateOptimalRoute(farmerLocation, vendor, listing.quantity);
            setRoute(realRoute);
            generateTSPSteps(realRoute);

        } catch (error) {
            console.error('Error fetching real routes:', error);
        } finally {
            setIsLoadingRealRoute(false);
        }
    };

    // Generate TSP algorithm steps for visualization
    const generateTSPSteps = (route: OptimalRoute) => {
        const steps: string[] = [];

        steps.push(`🚀 TRAVELLING SALESMAN PROBLEM (TSP) SOLVER`);
        steps.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        steps.push(`📍 Source: ${route.path[0]?.name || 'Farmer'}`);
        steps.push(`🏪 Destination: ${route.path[route.path.length - 1]?.name || 'Vendor'}`);
        steps.push(`📦 Intermediate hubs: ${route.path.length - 2}`);
        steps.push(``);
        steps.push(`📊 Step 1: Building distance matrix using OSRM API`);
        steps.push(`   → Fetching real road distances between all nodes`);
        steps.push(`   → Matrix size: ${route.path.length} × ${route.path.length}`);
        steps.push(``);
        steps.push(`🔍 Step 2: Applying Nearest Neighbor Heuristic`);

        // Show the path being built
        route.path.forEach((node, idx) => {
            if (idx === 0) {
                steps.push(`   [0] Start at: ${node.name}`);
            } else {
                const dist = route.segments[idx - 1]?.distance || 0;
                steps.push(`   [${idx}] → ${node.name} (${dist.toFixed(1)} km road distance)`);
            }
        });

        steps.push(``);
        steps.push(`🔄 Step 3: Applying 2-Opt Optimization`);
        steps.push(`   → Checking all possible segment reversals`);
        steps.push(`   → Looking for shorter total distance`);
        steps.push(``);
        steps.push(`✅ TSP SOLUTION FOUND!`);
        steps.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        steps.push(`📏 Total Road Distance: ${route.totalDistance} km`);
        steps.push(`⏱️ Estimated Time: ${route.estimatedTime.toFixed(1)} hours`);
        steps.push(`🌱 CO₂ Emission: ${route.carbonEmission} kg`);
        steps.push(`💚 CO₂ Saved: ${route.carbonSaved} kg (vs non-optimized)`);

        setTspSteps(steps);
    };

    // Animation effect
    useEffect(() => {
        if (simulationState !== 'running' || !route) return;

        animationRef.current = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 0.015; // ~3.3 seconds for full animation

                if (newProgress >= 1) {
                    setSimulationState('completed');
                    setCurrentStepIndex(tspSteps.length - 1);
                    return 1;
                }

                // Update current segment
                const totalDist = route.totalDistance;
                let accumulated = 0;
                for (let i = 0; i < route.segments.length; i++) {
                    accumulated += route.segments[i].distance;
                    if (accumulated / totalDist >= newProgress) {
                        setCurrentSegment(i);
                        break;
                    }
                }

                // Update algorithm step
                const stepIndex = Math.floor(newProgress * tspSteps.length);
                setCurrentStepIndex(Math.min(stepIndex, tspSteps.length - 1));

                return newProgress;
            });
        }, 50);

        return () => {
            if (animationRef.current) {
                clearInterval(animationRef.current);
            }
        };
    }, [simulationState, route, tspSteps.length]);

    // Controls
    const startSimulation = async () => {
        setSimulationState('calculating');

        // First fetch real routes
        await fetchRealRoutes();

        // Then start animation
        setTimeout(() => {
            setSimulationState('running');
        }, 500);
    };

    const pauseSimulation = () => {
        setSimulationState('paused');
        if (animationRef.current) {
            clearInterval(animationRef.current);
        }
    };

    const resumeSimulation = () => setSimulationState('running');

    const resetSimulation = () => {
        setSimulationState('idle');
        setProgress(0);
        setCurrentSegment(0);
        setCurrentStepIndex(0);
        if (animationRef.current) {
            clearInterval(animationRef.current);
        }
    };

    // Carbon metrics
    const metrics = route ? calculateCarbonMetrics(route) : null;

    // Get route polyline for map
    const getRoutePolyline = useCallback((): [number, number][] => {
        if (!route) return [];

        if (route.routeGeometry && route.routeGeometry.length > 0) {
            // Convert [lng, lat] to [lat, lng] for Leaflet
            return route.routeGeometry.map(coord => [coord[1], coord[0]] as [number, number]);
        }

        // Fallback to straight lines between nodes
        return route.path.map(node => [node.coordinates.lat, node.coordinates.lng] as [number, number]);
    }, [route]);

    // Get progress polyline (completed portion)
    const getProgressPolyline = useCallback((): [number, number][] => {
        const fullRoute = getRoutePolyline();
        if (fullRoute.length === 0) return [];

        const endIndex = Math.floor(progress * (fullRoute.length - 1));
        return fullRoute.slice(0, endIndex + 1);
    }, [getRoutePolyline, progress]);

    if (!route) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#1A202C] rounded-2xl p-8 max-w-lg w-full text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-bhumi-green border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Calculating optimal route...</p>
                </div>
            </div>
        );
    }

    // Calculate map center
    const mapCenter: [number, number] = [
        (route.path[0].coordinates.lat + route.path[route.path.length - 1].coordinates.lat) / 2,
        (route.path[0].coordinates.lng + route.path[route.path.length - 1].coordinates.lng) / 2
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#1A202C] rounded-2xl w-full max-w-6xl max-h-[98vh] overflow-y-auto shadow-2xl border border-green-500/30"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 md:p-6 rounded-t-2xl z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Leaf className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold">Carbon Footprint Optimizer</h2>
                                <p className="text-green-100 text-sm">Travelling Salesman Problem (TSP) with Real Routes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <div className="text-2xl font-bold text-green-200">-{metrics?.percentageSaved}%</div>
                                <div className="text-xs text-green-100">CO₂ Reduction</div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Grade Segregation Banner */}
                    <div
                        className="p-4 rounded-xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        style={{
                            backgroundColor: `${gradeInfo.color}15`,
                            borderColor: `${gradeInfo.color}50`
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg"
                                style={{ backgroundColor: gradeInfo.color }}
                            >
                                {listing.grade}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                    {gradeInfo.description}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {gradeInfo.handling} • {gradeInfo.storage} • {gradeInfo.packaging}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Route Priority</div>
                            <div className="font-bold" style={{ color: gradeInfo.color }}>{gradeInfo.route}</div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Real Map */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Map size={18} className="text-bhumi-green" />
                                Real Route Map (OpenStreetMap + OSRM)
                            </h3>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: '350px' }}>
                                <MapContainer
                                    center={mapCenter}
                                    zoom={6}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <FitBounds route={route} />

                                    {/* Full route (gray background) */}
                                    <Polyline
                                        positions={getRoutePolyline()}
                                        color="#9CA3AF"
                                        weight={4}
                                        opacity={0.5}
                                        dashArray="10, 10"
                                    />

                                    {/* Progress route (green) */}
                                    {progress > 0 && (
                                        <Polyline
                                            positions={getProgressPolyline()}
                                            color="#10B981"
                                            weight={5}
                                            opacity={1}
                                        />
                                    )}

                                    {/* Node markers */}
                                    {route.path.map((node, idx) => (
                                        <Marker
                                            key={node.id}
                                            position={[node.coordinates.lat, node.coordinates.lng]}
                                            icon={
                                                idx === 0 ? farmerIcon :
                                                    idx === route.path.length - 1 ? vendorIcon :
                                                        hubIcon
                                            }
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <strong>{node.name}</strong>
                                                    <br />
                                                    <span className="text-gray-500">{node.district}, {node.state}</span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {/* Animated truck */}
                                    <AnimatedTruck
                                        route={route}
                                        progress={progress}
                                        isRunning={simulationState === 'running'}
                                    />
                                </MapContainer>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                {simulationState === 'idle' && (
                                    <button
                                        onClick={startSimulation}
                                        className="flex items-center gap-2 px-6 py-3 bg-bhumi-green hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                                    >
                                        <Play size={18} />
                                        Start TSP Simulation
                                    </button>
                                )}
                                {(simulationState === 'fetching' || simulationState === 'calculating') && (
                                    <div className="flex items-center gap-3 px-6 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl">
                                        <div className="animate-spin w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full" />
                                        <span className="font-medium">
                                            {simulationState === 'fetching' ? 'Fetching real road routes from OSRM...' : 'Solving TSP...'}
                                        </span>
                                    </div>
                                )}
                                {simulationState === 'running' && (
                                    <button
                                        onClick={pauseSimulation}
                                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
                                    >
                                        <Pause size={18} />
                                        Pause
                                    </button>
                                )}
                                {simulationState === 'paused' && (
                                    <button
                                        onClick={resumeSimulation}
                                        className="flex items-center gap-2 px-6 py-3 bg-bhumi-green hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                                    >
                                        <Play size={18} />
                                        Resume
                                    </button>
                                )}
                                {(simulationState === 'paused' || simulationState === 'completed') && (
                                    <button
                                        onClick={resetSimulation}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors"
                                    >
                                        <RotateCcw size={18} />
                                        Reset
                                    </button>
                                )}
                                {simulationState === 'completed' && (
                                    <div className="flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl">
                                        <CheckCircle2 size={18} />
                                        <span className="font-medium">Delivery Complete!</span>
                                    </div>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Delivery Progress</span>
                                    <span>{Math.round(progress * 100)}%</span>
                                </div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100 rounded-full"
                                        style={{ width: `${progress * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Algorithm Visualization */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Sparkles size={18} className="text-purple-500" />
                                    TSP Algorithm Console
                                </h3>
                                <button
                                    onClick={() => setShowAlgorithm(!showAlgorithm)}
                                    className="text-sm text-bhumi-green hover:underline"
                                >
                                    {showAlgorithm ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            {showAlgorithm && (
                                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs md:text-sm h-64 md:h-80 overflow-y-auto">
                                    <div className="text-green-400 mb-3">// Travelling Salesman Problem Solver</div>
                                    <div className="text-gray-400 mb-3 text-xs">
                                        <div>Algorithm: Nearest Neighbor + 2-Opt Optimization</div>
                                        <div>Data Source: OSRM (Open Source Routing Machine)</div>
                                    </div>

                                    <div className="border-t border-gray-700 pt-3 space-y-1">
                                        {tspSteps.slice(0, currentStepIndex + 1).map((step, idx) => (
                                            <div
                                                key={idx}
                                                className={`${step.includes('✅') ? 'text-green-400' :
                                                    step.includes('🔄') ? 'text-yellow-400' :
                                                        step.includes('🔍') ? 'text-blue-400' :
                                                            step.includes('📊') ? 'text-cyan-400' :
                                                                step.includes('→') ? 'text-purple-400' :
                                                                    step.includes('━') ? 'text-gray-600' :
                                                                        'text-gray-300'
                                                    } ${idx === currentStepIndex && simulationState === 'running' ? 'animate-pulse' : ''}`}
                                            >
                                                {step}
                                            </div>
                                        ))}
                                        {simulationState === 'running' && (
                                            <div className="text-green-400 animate-pulse">▋</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Route Details */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300">Optimal Route (TSP Solution)</h4>
                                <div className="flex flex-wrap items-center gap-2">
                                    {route.path.map((node, idx) => (
                                        <React.Fragment key={node.id}>
                                            <div
                                                className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 ${idx === 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                                    idx === route.path.length - 1 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                    }`}
                                            >
                                                {idx === 0 ? '🌾' : idx === route.path.length - 1 ? '🏪' : '📦'}
                                                <span className="hidden md:inline">{node.name}</span>
                                                <span className="md:hidden">{node.district}</span>
                                            </div>
                                            {idx < route.path.length - 1 && (
                                                <ArrowRight size={16} className="text-gray-400" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                            <Route className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <div className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-300">
                                {route.totalDistance} km
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">Road Distance</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <div className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {route.estimatedTime.toFixed(1)}h
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">Estimated Time</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
                            <Fuel className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                            <div className="text-xl md:text-2xl font-bold text-amber-700 dark:text-amber-300">
                                ₹{route.fuelCost}
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400">Fuel Cost</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
                            <TrendingDown className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                            <div className="text-xl md:text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                {route.carbonEmission} kg
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400">CO₂ Emission</div>
                        </div>
                    </div>

                    {/* Carbon Impact */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 md:p-6 border border-green-200 dark:border-green-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Leaf className="text-green-600" />
                            Carbon Impact Summary
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-green-600">{route.carbonSaved}</div>
                                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">kg CO₂ Saved</div>
                            </div>
                            <div className="text-center">
                                <TreePine className="w-6 h-6 md:w-8 md:h-8 text-green-600 mx-auto mb-1" />
                                <div className="text-xl md:text-2xl font-bold text-green-600">{metrics?.treesEquivalent}</div>
                                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Trees Equivalent</div>
                            </div>
                            <div className="text-center">
                                <Zap className="w-6 h-6 md:w-8 md:h-8 text-amber-500 mx-auto mb-1" />
                                <div className="text-xl md:text-2xl font-bold text-amber-600">{metrics?.smartphoneCharges}</div>
                                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Phone Charges</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-3xl md:text-4xl font-black ${metrics?.efficiencyRating === 'A+' ? 'text-green-500' :
                                    metrics?.efficiencyRating === 'A' ? 'text-green-600' :
                                        metrics?.efficiencyRating === 'B' ? 'text-yellow-500' :
                                            'text-red-500'
                                    }`}>
                                    {metrics?.efficiencyRating}
                                </div>
                                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Efficiency</div>
                            </div>
                        </div>
                    </div>

                    {/* Segments Table */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-900 dark:text-white">Route Segments (Real Road Data)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs md:text-sm">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-800">
                                        <th className="px-2 md:px-4 py-2 text-left">From</th>
                                        <th className="px-2 md:px-4 py-2 text-left">To</th>
                                        <th className="px-2 md:px-4 py-2 text-right">Distance</th>
                                        <th className="px-2 md:px-4 py-2 text-right hidden md:table-cell">Duration</th>
                                        <th className="px-2 md:px-4 py-2 text-right">CO₂</th>
                                        <th className="px-2 md:px-4 py-2 text-center hidden md:table-cell">Road</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {route.segments.map((segment, idx) => (
                                        <tr
                                            key={idx}
                                            className={`border-b border-gray-100 dark:border-gray-700 ${currentSegment === idx && simulationState === 'running' ? 'bg-green-50 dark:bg-green-900/20' : ''
                                                }`}
                                        >
                                            <td className="px-2 md:px-4 py-2 md:py-3">
                                                <div className="flex items-center gap-1 md:gap-2">
                                                    {currentSegment === idx && simulationState === 'running' && (
                                                        <Truck size={14} className="text-green-600 animate-bounce" />
                                                    )}
                                                    <span className="truncate max-w-[80px] md:max-w-none">{segment.from.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-2 md:px-4 py-2 md:py-3">
                                                <span className="truncate max-w-[80px] md:max-w-none">{segment.to.name}</span>
                                            </td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 text-right font-medium">{segment.distance} km</td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 text-right hidden md:table-cell">{segment.duration}h</td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 text-right text-green-600">{segment.carbonEmission} kg</td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 text-center hidden md:table-cell">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${segment.roadType.includes('National') ? 'bg-blue-100 text-blue-700' :
                                                    segment.roadType.includes('State') ? 'bg-amber-100 text-amber-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {segment.roadType}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarbonLogistics;
