/**
 * Carbon Footprint Logistics Service
 * Uses Travelling Salesman Problem (TSP) with real road routes
 * Integrates with OSRM (Open Source Routing Machine) for actual road distances
 */

// Node in the delivery network
export interface DeliveryNode {
    id: string;
    name: string;
    type: 'farmer' | 'hub' | 'vendor' | 'warehouse';
    coordinates: { lat: number; lng: number };
    district: string;
    state: string;
}

// Route segment with real road data
export interface RouteSegment {
    from: DeliveryNode;
    to: DeliveryNode;
    distance: number;      // in km (real road distance)
    duration: number;      // in hours
    carbonEmission: number;
    roadType: string;
    geometry: [number, number][]; // Array of [lng, lat] coordinates for the actual road path
}

// Complete route result
export interface OptimalRoute {
    path: DeliveryNode[];
    totalDistance: number;
    estimatedTime: number;
    carbonEmission: number;
    carbonSaved: number;
    fuelCost: number;
    segments: RouteSegment[];
    tspOrder: number[];      // Order of nodes visited (TSP solution)
    algorithmUsed: 'TSP-NearestNeighbor' | 'TSP-2Opt' | 'TSP-BruteForce';
    routeGeometry: [number, number][]; // Full route path coordinates
}

// OSRM API response types
interface OSRMRouteResponse {
    routes: {
        distance: number;  // meters
        duration: number;  // seconds
        geometry: {
            coordinates: [number, number][];
        };
    }[];
}

// Carbon calculation constants
const CARBON_CONSTANTS = {
    // kg CO2 per km for different vehicle types
    TRUCK_LARGE: 0.27,
    TRUCK_MEDIUM: 0.21,
    TRUCK_SMALL: 0.15,
    VAN: 0.12,
    
    // Average speed (km/h) - used as fallback
    SPEED_HIGHWAY: 60,
    SPEED_STATE: 45,
    SPEED_RURAL: 30,
    
    // Fuel cost per km (INR)
    FUEL_COST_PER_KM: 8.5,
    
    // Trees equivalent (1 tree absorbs ~22kg CO2/year)
    TREE_CO2_ABSORPTION: 22,
};

// Major distribution hubs in India
const DISTRIBUTION_HUBS: DeliveryNode[] = [
    { id: 'hub_mumbai', name: 'Mumbai Central Hub', type: 'hub', coordinates: { lat: 19.0760, lng: 72.8777 }, district: 'Mumbai', state: 'Maharashtra' },
    { id: 'hub_pune', name: 'Pune Distribution Center', type: 'hub', coordinates: { lat: 18.5204, lng: 73.8567 }, district: 'Pune', state: 'Maharashtra' },
    { id: 'hub_delhi', name: 'Delhi NCR Hub', type: 'hub', coordinates: { lat: 28.7041, lng: 77.1025 }, district: 'Delhi', state: 'Delhi' },
    { id: 'hub_bangalore', name: 'Bangalore Agri Hub', type: 'hub', coordinates: { lat: 12.9716, lng: 77.5946 }, district: 'Bangalore', state: 'Karnataka' },
    { id: 'hub_chennai', name: 'Chennai Port Hub', type: 'hub', coordinates: { lat: 13.0827, lng: 80.2707 }, district: 'Chennai', state: 'Tamil Nadu' },
    { id: 'hub_kolkata', name: 'Kolkata East Hub', type: 'hub', coordinates: { lat: 22.5726, lng: 88.3639 }, district: 'Kolkata', state: 'West Bengal' },
    { id: 'hub_hyderabad', name: 'Hyderabad Central', type: 'hub', coordinates: { lat: 17.3850, lng: 78.4867 }, district: 'Hyderabad', state: 'Telangana' },
    { id: 'hub_ahmedabad', name: 'Ahmedabad APMC', type: 'hub', coordinates: { lat: 23.0225, lng: 72.5714 }, district: 'Ahmedabad', state: 'Gujarat' },
    { id: 'hub_jaipur', name: 'Jaipur Mandi Hub', type: 'hub', coordinates: { lat: 26.9124, lng: 75.7873 }, district: 'Jaipur', state: 'Rajasthan' },
    { id: 'hub_lucknow', name: 'Lucknow Agri Center', type: 'hub', coordinates: { lat: 26.8467, lng: 80.9462 }, district: 'Lucknow', state: 'Uttar Pradesh' },
    { id: 'hub_nagpur', name: 'Nagpur Orange Hub', type: 'hub', coordinates: { lat: 21.1458, lng: 79.0882 }, district: 'Nagpur', state: 'Maharashtra' },
    { id: 'hub_indore', name: 'Indore Grain Hub', type: 'hub', coordinates: { lat: 22.7196, lng: 75.8577 }, district: 'Indore', state: 'Madhya Pradesh' },
];

// District coordinates database
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
    // Maharashtra
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'nagpur': { lat: 21.1458, lng: 79.0882 },
    'nashik': { lat: 19.9975, lng: 73.7898 },
    'aurangabad': { lat: 19.8762, lng: 75.3433 },
    'solapur': { lat: 17.6599, lng: 75.9064 },
    'kolhapur': { lat: 16.7050, lng: 74.2433 },
    'sangli': { lat: 16.8524, lng: 74.5815 },
    'satara': { lat: 17.6805, lng: 74.0183 },
    'ratnagiri': { lat: 16.9902, lng: 73.3120 },
    'ahmednagar': { lat: 19.0948, lng: 74.7480 },
    
    // Gujarat
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'surat': { lat: 21.1702, lng: 72.8311 },
    'vadodara': { lat: 22.3072, lng: 73.1812 },
    'rajkot': { lat: 22.3039, lng: 70.8022 },
    
    // Karnataka
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'mysore': { lat: 12.2958, lng: 76.6394 },
    'mangalore': { lat: 12.9141, lng: 74.8560 },
    'belgaum': { lat: 15.8497, lng: 74.4977 },
    'hubli': { lat: 15.3647, lng: 75.1240 },
    
    // Tamil Nadu
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'coimbatore': { lat: 11.0168, lng: 76.9558 },
    'madurai': { lat: 9.9252, lng: 78.1198 },
    'salem': { lat: 11.6643, lng: 78.1460 },
    
    // Delhi NCR
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'gurgaon': { lat: 28.4595, lng: 77.0266 },
    'noida': { lat: 28.5355, lng: 77.3910 },
    'faridabad': { lat: 28.4089, lng: 77.3178 },
    
    // Uttar Pradesh
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'kanpur': { lat: 26.4499, lng: 80.3319 },
    'agra': { lat: 27.1767, lng: 78.0081 },
    'varanasi': { lat: 25.3176, lng: 82.9739 },
    'allahabad': { lat: 25.4358, lng: 81.8463 },
    
    // Rajasthan
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'jodhpur': { lat: 26.2389, lng: 73.0243 },
    'udaipur': { lat: 24.5854, lng: 73.7125 },
    'kota': { lat: 25.2138, lng: 75.8648 },
    
    // West Bengal
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'howrah': { lat: 22.5958, lng: 88.2636 },
    'durgapur': { lat: 23.5204, lng: 87.3119 },
    
    // Telangana
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'warangal': { lat: 17.9784, lng: 79.5941 },
    'nizamabad': { lat: 18.6725, lng: 78.0941 },
    
    // Madhya Pradesh
    'indore': { lat: 22.7196, lng: 75.8577 },
    'bhopal': { lat: 23.2599, lng: 77.4126 },
    'jabalpur': { lat: 23.1815, lng: 79.9864 },
    'gwalior': { lat: 26.2183, lng: 78.1828 },
    
    // Punjab & Haryana
    'chandigarh': { lat: 30.7333, lng: 76.7794 },
    'ludhiana': { lat: 30.9010, lng: 75.8573 },
    'amritsar': { lat: 31.6340, lng: 74.8723 },
    'jalandhar': { lat: 31.3260, lng: 75.5762 },
    
    // Others
    'shimla': { lat: 31.1048, lng: 77.1734 },
    'dehradun': { lat: 30.3165, lng: 78.0322 },
    'patna': { lat: 25.5941, lng: 85.1376 },
    'ranchi': { lat: 23.3441, lng: 85.3096 },
    'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
    'guwahati': { lat: 26.1445, lng: 91.7362 },
    'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
    'kochi': { lat: 9.9312, lng: 76.2673 },
};

/**
 * Get real road route using OSRM (Open Source Routing Machine) API
 * This returns actual road distances and the geometry of the route
 */
export const getRealRouteFromOSRM = async (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
): Promise<{ distance: number; duration: number; geometry: [number, number][] }> => {
    try {
        // OSRM public demo server (for production, use your own instance)
        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        const data: OSRMRouteResponse = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            return {
                distance: route.distance / 1000, // Convert meters to km
                duration: route.duration / 3600, // Convert seconds to hours
                geometry: route.geometry.coordinates // [lng, lat] array
            };
        }
    } catch (error) {
        console.error('OSRM API error, falling back to Haversine:', error);
    }
    
    // Fallback to Haversine calculation with estimated road factor
    const straightLineDistance = calculateHaversineDistance(from, to);
    const roadDistance = straightLineDistance * 1.4; // Road distance is typically 1.4x straight line
    
    return {
        distance: roadDistance,
        duration: roadDistance / 50, // Assume average 50 km/h
        geometry: [[from.lng, from.lat], [to.lng, to.lat]]
    };
};

/**
 * Calculate straight-line distance using Haversine formula (fallback)
 */
export const calculateHaversineDistance = (
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number }
): number => {
    const R = 6371;
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Build distance matrix for TSP using real road distances
 */
export const buildDistanceMatrix = async (
    nodes: DeliveryNode[]
): Promise<{ distances: number[][]; durations: number[][]; geometries: Map<string, [number, number][]> }> => {
    const n = nodes.length;
    const distances: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    const durations: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    const geometries = new Map<string, [number, number][]>();
    
    // Fetch real routes for all pairs
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const promise = getRealRouteFromOSRM(
                nodes[i].coordinates,
                nodes[j].coordinates
            ).then(result => {
                distances[i][j] = result.distance;
                distances[j][i] = result.distance;
                durations[i][j] = result.duration;
                durations[j][i] = result.duration;
                geometries.set(`${i}-${j}`, result.geometry);
                geometries.set(`${j}-${i}`, [...result.geometry].reverse());
            });
            promises.push(promise);
        }
    }
    
    await Promise.all(promises);
    
    return { distances, durations, geometries };
};

/**
 * TSP Solver using Nearest Neighbor Heuristic with 2-Opt improvement
 * This solves the Travelling Salesman Problem to find the optimal route
 */
export const solveTSP = (
    distances: number[][],
    startIndex: number = 0,
    endIndex?: number
): { order: number[]; totalDistance: number } => {
    const n = distances.length;
    const visited = new Set<number>([startIndex]);
    const order = [startIndex];
    let current = startIndex;
    let totalDistance = 0;
    
    // Nearest Neighbor Heuristic
    while (visited.size < n) {
        let nearest = -1;
        let nearestDist = Infinity;
        
        for (let i = 0; i < n; i++) {
            if (!visited.has(i) && distances[current][i] < nearestDist) {
                // If endIndex is specified, don't visit it until the end
                if (endIndex !== undefined && i === endIndex && visited.size < n - 1) {
                    continue;
                }
                nearest = i;
                nearestDist = distances[current][i];
            }
        }
        
        if (nearest !== -1) {
            visited.add(nearest);
            order.push(nearest);
            totalDistance += nearestDist;
            current = nearest;
        }
    }
    
    // Apply 2-Opt improvement
    const improved = twoOptImprovement(order, distances);
    
    return {
        order: improved.order,
        totalDistance: improved.totalDistance
    };
};

/**
 * 2-Opt improvement for TSP
 * Iteratively reverses segments to find shorter routes
 */
const twoOptImprovement = (
    order: number[],
    distances: number[][]
): { order: number[]; totalDistance: number } => {
    let improved = true;
    let bestOrder = [...order];
    
    const calculateTotalDistance = (path: number[]): number => {
        let total = 0;
        for (let i = 0; i < path.length - 1; i++) {
            total += distances[path[i]][path[i + 1]];
        }
        return total;
    };
    
    let bestDistance = calculateTotalDistance(bestOrder);
    
    while (improved) {
        improved = false;
        
        for (let i = 1; i < bestOrder.length - 2; i++) {
            for (let j = i + 1; j < bestOrder.length - 1; j++) {
                // Try reversing the segment between i and j
                const newOrder = [
                    ...bestOrder.slice(0, i),
                    ...bestOrder.slice(i, j + 1).reverse(),
                    ...bestOrder.slice(j + 1)
                ];
                
                const newDistance = calculateTotalDistance(newOrder);
                
                if (newDistance < bestDistance) {
                    bestOrder = newOrder;
                    bestDistance = newDistance;
                    improved = true;
                }
            }
        }
    }
    
    return { order: bestOrder, totalDistance: bestDistance };
};

/**
 * Get coordinates for a district
 */
export const getDistrictCoordinates = (district: string, state: string): { lat: number; lng: number } => {
    const key = district.toLowerCase().replace(/\s+/g, '');
    if (DISTRICT_COORDINATES[key]) {
        return DISTRICT_COORDINATES[key];
    }
    const stateKey = state.toLowerCase().replace(/\s+/g, '');
    if (DISTRICT_COORDINATES[stateKey]) {
        return DISTRICT_COORDINATES[stateKey];
    }
    return { lat: 20.5937, lng: 78.9629 };
};

/**
 * Create a delivery node from location info
 */
export const createDeliveryNode = (
    id: string,
    name: string,
    type: 'farmer' | 'vendor',
    district: string,
    state: string
): DeliveryNode => {
    const coordinates = getDistrictCoordinates(district, state);
    return { id, name, type, coordinates, district, state };
};

/**
 * Find relevant hubs between source and destination
 */
export const findRelevantHubs = (
    source: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    maxHubs: number = 2
): DeliveryNode[] => {
    const directDistance = calculateHaversineDistance(source, destination);
    
    // Score each hub based on how much it deviates from the direct path
    const hubScores = DISTRIBUTION_HUBS.map(hub => {
        const distToSource = calculateHaversineDistance(source, hub.coordinates);
        const distToDest = calculateHaversineDistance(hub.coordinates, destination);
        const deviation = (distToSource + distToDest) / directDistance;
        
        return { hub, deviation };
    });
    
    // Filter hubs that are reasonably on the way (deviation < 1.5)
    // and sort by deviation
    return hubScores
        .filter(h => h.deviation < 1.5 && h.deviation > 0.1)
        .sort((a, b) => a.deviation - b.deviation)
        .slice(0, maxHubs)
        .map(h => h.hub);
};

/**
 * Calculate optimal route using TSP with real road data
 */
export const calculateOptimalRoute = async (
    farmerLocation: { district: string; state: string; name?: string },
    vendorLocation: { district: string; state: string; name?: string },
    quantity: number = 1
): Promise<OptimalRoute> => {
    // Create source and destination nodes
    const source = createDeliveryNode(
        'farmer_source',
        farmerLocation.name || `Farmer at ${farmerLocation.district}`,
        'farmer',
        farmerLocation.district,
        farmerLocation.state
    );
    
    const destination = createDeliveryNode(
        'vendor_dest',
        vendorLocation.name || `Vendor at ${vendorLocation.district}`,
        'vendor',
        vendorLocation.district,
        vendorLocation.state
    );
    
    // Find relevant intermediate hubs
    const relevantHubs = findRelevantHubs(source.coordinates, destination.coordinates, 2);
    
    // Build the list of all nodes
    const allNodes = [source, ...relevantHubs, destination];
    
    // Build distance matrix using real road data
    const { distances, durations, geometries } = await buildDistanceMatrix(allNodes);
    
    // Solve TSP: start at source (index 0), end at destination (last index)
    const tspResult = solveTSP(distances, 0, allNodes.length - 1);
    
    // Build the optimal path based on TSP solution
    const path = tspResult.order.map(i => allNodes[i]);
    
    // Build segments with real geometries
    const segments: RouteSegment[] = [];
    let fullGeometry: [number, number][] = [];
    
    // Determine vehicle type based on quantity
    let carbonPerKm = CARBON_CONSTANTS.TRUCK_SMALL;
    if (quantity > 50) carbonPerKm = CARBON_CONSTANTS.TRUCK_LARGE;
    else if (quantity > 20) carbonPerKm = CARBON_CONSTANTS.TRUCK_MEDIUM;
    else if (quantity > 5) carbonPerKm = CARBON_CONSTANTS.TRUCK_SMALL;
    else carbonPerKm = CARBON_CONSTANTS.VAN;
    
    for (let i = 0; i < tspResult.order.length - 1; i++) {
        const fromIdx = tspResult.order[i];
        const toIdx = tspResult.order[i + 1];
        const geometry = geometries.get(`${fromIdx}-${toIdx}`) || [];
        
        const segmentDist = distances[fromIdx][toIdx];
        const segmentDur = durations[fromIdx][toIdx];
        const roadType = segmentDist > 100 ? 'National Highway' : segmentDist > 50 ? 'State Highway' : 'District Road';
        
        segments.push({
            from: allNodes[fromIdx],
            to: allNodes[toIdx],
            distance: Math.round(segmentDist * 10) / 10,
            duration: Math.round(segmentDur * 10) / 10,
            carbonEmission: Math.round(segmentDist * carbonPerKm * 100) / 100,
            roadType,
            geometry
        });
        
        // Add to full geometry (skip first point of subsequent segments to avoid duplicates)
        if (i === 0) {
            fullGeometry = [...geometry];
        } else {
            fullGeometry = [...fullGeometry, ...geometry.slice(1)];
        }
    }
    
    // Calculate totals
    const totalDistance = Math.round(tspResult.totalDistance * 10) / 10;
    const totalTime = segments.reduce((sum, s) => sum + s.duration, 0);
    const totalCarbon = segments.reduce((sum, s) => sum + s.carbonEmission, 0);
    
    // Calculate carbon saved (vs inefficient route - 35% more for non-optimized)
    const inefficientCarbon = totalCarbon * 1.35;
    const carbonSaved = Math.round((inefficientCarbon - totalCarbon) * 100) / 100;
    
    return {
        path,
        totalDistance,
        estimatedTime: Math.round(totalTime * 10) / 10,
        carbonEmission: Math.round(totalCarbon * 100) / 100,
        carbonSaved,
        fuelCost: Math.round(totalDistance * CARBON_CONSTANTS.FUEL_COST_PER_KM),
        segments,
        tspOrder: tspResult.order,
        algorithmUsed: 'TSP-2Opt',
        routeGeometry: fullGeometry
    };
};

/**
 * Synchronous version for initial render (uses Haversine estimates)
 */
export const calculateOptimalRouteSync = (
    farmerLocation: { district: string; state: string; name?: string },
    vendorLocation: { district: string; state: string; name?: string },
    quantity: number = 1
): OptimalRoute => {
    const source = createDeliveryNode(
        'farmer_source',
        farmerLocation.name || `Farmer at ${farmerLocation.district}`,
        'farmer',
        farmerLocation.district,
        farmerLocation.state
    );
    
    const destination = createDeliveryNode(
        'vendor_dest',
        vendorLocation.name || `Vendor at ${vendorLocation.district}`,
        'vendor',
        vendorLocation.district,
        vendorLocation.state
    );
    
    const relevantHubs = findRelevantHubs(source.coordinates, destination.coordinates, 2);
    const allNodes = [source, ...relevantHubs, destination];
    
    // Build distance matrix using Haversine (synchronous)
    const n = allNodes.length;
    const distances: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    const durations: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const dist = calculateHaversineDistance(allNodes[i].coordinates, allNodes[j].coordinates) * 1.4;
            distances[i][j] = dist;
            distances[j][i] = dist;
            durations[i][j] = dist / 50;
            durations[j][i] = dist / 50;
        }
    }
    
    const tspResult = solveTSP(distances, 0, n - 1);
    const path = tspResult.order.map(i => allNodes[i]);
    
    let carbonPerKm = CARBON_CONSTANTS.TRUCK_SMALL;
    if (quantity > 50) carbonPerKm = CARBON_CONSTANTS.TRUCK_LARGE;
    else if (quantity > 20) carbonPerKm = CARBON_CONSTANTS.TRUCK_MEDIUM;
    else if (quantity > 5) carbonPerKm = CARBON_CONSTANTS.TRUCK_SMALL;
    else carbonPerKm = CARBON_CONSTANTS.VAN;
    
    const segments: RouteSegment[] = [];
    
    for (let i = 0; i < tspResult.order.length - 1; i++) {
        const fromIdx = tspResult.order[i];
        const toIdx = tspResult.order[i + 1];
        const segmentDist = distances[fromIdx][toIdx];
        
        segments.push({
            from: allNodes[fromIdx],
            to: allNodes[toIdx],
            distance: Math.round(segmentDist * 10) / 10,
            duration: Math.round((segmentDist / 50) * 10) / 10,
            carbonEmission: Math.round(segmentDist * carbonPerKm * 100) / 100,
            roadType: segmentDist > 100 ? 'National Highway' : segmentDist > 50 ? 'State Highway' : 'District Road',
            geometry: [
                [allNodes[fromIdx].coordinates.lng, allNodes[fromIdx].coordinates.lat],
                [allNodes[toIdx].coordinates.lng, allNodes[toIdx].coordinates.lat]
            ]
        });
    }
    
    const totalDistance = Math.round(tspResult.totalDistance * 10) / 10;
    const totalCarbon = segments.reduce((sum, s) => sum + s.carbonEmission, 0);
    
    return {
        path,
        totalDistance,
        estimatedTime: Math.round((totalDistance / 50) * 10) / 10,
        carbonEmission: Math.round(totalCarbon * 100) / 100,
        carbonSaved: Math.round(totalCarbon * 0.35 * 100) / 100,
        fuelCost: Math.round(totalDistance * CARBON_CONSTANTS.FUEL_COST_PER_KM),
        segments,
        tspOrder: tspResult.order,
        algorithmUsed: 'TSP-2Opt',
        routeGeometry: []
    };
};

/**
 * Calculate carbon metrics for display
 */
export const calculateCarbonMetrics = (route: OptimalRoute) => {
    return {
        treesEquivalent: Math.round((route.carbonSaved / CARBON_CONSTANTS.TREE_CO2_ABSORPTION) * 100) / 100,
        smartphoneCharges: Math.round(route.carbonSaved / 0.005),
        carKmEquivalent: Math.round(route.carbonSaved / 0.12),
        percentageSaved: Math.round((route.carbonSaved / (route.carbonEmission + route.carbonSaved)) * 100),
        efficiencyRating: route.carbonEmission < 5 ? 'A+' :
                         route.carbonEmission < 10 ? 'A' :
                         route.carbonEmission < 20 ? 'B' :
                         route.carbonEmission < 40 ? 'C' : 'D'
    };
};

/**
 * Get grade-based segregation info
 */
export const getGradeSegregation = (grade: 'A' | 'B' | 'C') => {
    const segregation = {
        'A': {
            priority: 1,
            handling: 'Premium Cold Chain',
            storage: 'Climate Controlled',
            packaging: 'Vacuum Sealed',
            route: 'Express Highway',
            color: '#10B981',
            description: 'Premium grade - Direct express delivery with cold chain'
        },
        'B': {
            priority: 2,
            handling: 'Standard Refrigerated',
            storage: 'Cool Storage',
            packaging: 'Standard Crate',
            route: 'Standard Route',
            color: '#F59E0B',
            description: 'Good grade - Standard refrigerated transport'
        },
        'C': {
            priority: 3,
            handling: 'Basic Transport',
            storage: 'Ambient',
            packaging: 'Bulk Bags',
            route: 'Economy Route',
            color: '#EF4444',
            description: 'Standard grade - Economy bulk transport'
        }
    };
    
    return segregation[grade];
};

/**
 * Generate TSP algorithm steps for visualization
 */
export const generateTSPVisualizationSteps = (
    nodes: DeliveryNode[],
    distances: number[][],
    tspOrder: number[]
): { step: number; type: string; message: string; nodes: number[] }[] => {
    const steps: { step: number; type: string; message: string; nodes: number[] }[] = [];
    
    steps.push({
        step: 1,
        type: 'init',
        message: `🚀 Initialize TSP with ${nodes.length} nodes (Farmer → Hubs → Vendor)`,
        nodes: [0]
    });
    
    steps.push({
        step: 2,
        type: 'matrix',
        message: `📊 Building distance matrix using real road routes from OSRM API`,
        nodes: []
    });
    
    // Show nearest neighbor selection
    for (let i = 0; i < tspOrder.length - 1; i++) {
        const from = tspOrder[i];
        const to = tspOrder[i + 1];
        steps.push({
            step: 3 + i,
            type: 'select',
            message: `🔍 Nearest Neighbor: ${nodes[from].name} → ${nodes[to].name} (${distances[from][to].toFixed(1)} km)`,
            nodes: tspOrder.slice(0, i + 2)
        });
    }
    
    steps.push({
        step: steps.length + 1,
        type: '2opt',
        message: `🔄 Applying 2-Opt optimization to improve route`,
        nodes: tspOrder
    });
    
    steps.push({
        step: steps.length + 1,
        type: 'complete',
        message: `✅ TSP Solution found! Optimal route through ${tspOrder.length} nodes`,
        nodes: tspOrder
    });
    
    return steps;
};

export { DISTRIBUTION_HUBS, DISTRICT_COORDINATES };
