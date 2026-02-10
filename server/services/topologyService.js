// Lazy-load turf to avoid ESM/CommonJS conflicts
let turf = null;
let ZONES = null;

const loadTurf = async () => {
    if (!turf) {
        turf = await import('@turf/turf');

        // Initialize ZONES after turf is loaded
        ZONES = {
            "The Western Ghats": turf.polygon([[
                [72.5, 21.0], [73.5, 19.0], [74.5, 15.0], [76.5, 11.0], [77.5, 8.5],
                [78.5, 8.5], [77.0, 11.5], [75.5, 15.5], [74.5, 19.5], [73.5, 21.5], [72.5, 21.0]
            ]]),
            "The Thar Desert": turf.polygon([[
                [69.0, 24.5], [73.0, 24.5], [76.0, 28.0], [76.0, 30.0],
                [74.0, 30.0], [70.0, 28.0], [69.0, 24.5]
            ]]),
            "The Deccan Plateau": turf.polygon([[
                [73.5, 20.0], [79.0, 20.0], [82.0, 17.0], [79.0, 12.0],
                [76.0, 12.0], [74.0, 16.0], [73.5, 20.0]
            ]]),
            "The Gangetic Plains": turf.polygon([[
                [77.0, 30.0], [80.0, 27.0], [88.0, 26.0], [89.0, 22.0],
                [85.0, 24.0], [78.0, 28.0], [77.0, 30.0]
            ]]),
            "Coastal Plains": turf.polygon([[
                [80.0, 16.0], [85.0, 20.0], [87.0, 22.0], [85.0, 15.0],
                [80.0, 10.0], [78.0, 8.0], [75.0, 9.0], [80.0, 16.0]
            ]]),
        };
    }
    return turf;
};

// 1. TOPOLOGY TWIN MAPPING
const TOPOLOGY_TWINS = {
    "The Western Ghats": ["North-East Hills"],
    "North-East Hills": ["The Western Ghats"],

    "The Deccan Plateau": ["Central Highlands"],
    "Central Highlands": ["The Deccan Plateau"],

    "Coastal Plains": ["Islands"],
    "Islands": ["Coastal Plains"],

    "The Gangetic Plains": ["Punjab-Haryana Plains"],
    "Punjab-Haryana Plains": ["The Gangetic Plains"],

    "The Thar Desert": ["Kutch"],
    "Kutch": ["The Thar Desert"],

    "The Himalayas": ["Nilgiris"],
    "Nilgiris": ["The Himalayas"],

    "The Aravalli Range": ["Chotanagpur Plateau"],
    "Chotanagpur Plateau": ["The Aravalli Range"]
};

/**
 * Step 1: The "Geo-Fencer"
 * Determines topology based on latitude and longitude
 */
const identifyTopology = async (lat, lng) => {
    const turfLib = await loadTurf();
    const userPoint = turfLib.point([lng, lat]); // turf uses [lng, lat]

    // Check strict polygon matches
    for (const [zoneName, polygon] of Object.entries(ZONES)) {
        if (turfLib.booleanPointInPolygon(userPoint, polygon)) {
            return zoneName;
        }
    }

    // FALLBACK LOGIC if point is outside simplified polygons
    // (In production, use complete coverage polygons)
    if (lat > 28 && lng < 77) return "Punjab-Haryana Plains";
    if (lat > 28 && lng >= 77) return "The Himalayas";
    if (lat < 22 && lat > 15 && lng > 80) return "Eastern Ghats & Hills";
    if (lng > 88 && lat > 22) return "North-East Hills";

    return "The Deccan Plateau"; // Default fallback for central India
};

/**
 * Get "Topology Twins" for a given zone
 */
const getTopologyTwins = (zoneName) => {
    return TOPOLOGY_TWINS[zoneName] || [];
};

module.exports = {
    identifyTopology,
    getTopologyTwins
};
