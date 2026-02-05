const express = require('express');
const router = express.Router();
const { identifyTopology, getTopologyTwins } = require('../services/topologyService');
const Seed = require('../models/Seed');

// 1. GEO-FENCER ENDPOINT
// Returns the user's ecological zone based on GPS
router.post('/identify', (req, res) => {
    try {
        const { lat, lng } = req.body;
        if (!lat || !lng) {
            return res.status(400).json({ error: "Latitude and Longitude required" });
        }

        const topology = identifyTopology(parseFloat(lat), parseFloat(lng));
        const twins = getTopologyTwins(topology);

        res.json({
            topology,
            twins,
            message: `You are in ${topology}. Similar ecology found in: ${twins.join(', ')}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. TOPO-SEED RECOMMENDATION ENGINE
// Implements the "Strategy 4" logic: Topology Match + Weather Bridge + Twin Match
router.post('/recommend', async (req, res) => {
    try {
        const { lat, lng, weather } = req.body;

        // 1. Identify Topology (Geo-Fencer)
        const userTopology = identifyTopology(parseFloat(lat), parseFloat(lng));
        const twinTopologies = getTopologyTwins(userTopology);

        // 2. Weather Bridge (Use provided weather or default)
        // If frontend doesn't send weather, we assume "safe" weather for demo
        const currentHumidity = weather?.humidity || 70;
        const currentTemp = weather?.temp || 25;

        // 3. Database Query
        const allSeeds = await Seed.find({});

        const recommendations = allSeeds.map(seed => {
            // A. Topology Match
            const isHomeMatch = seed.primary_topology.includes(userTopology);

            // B. Twin Match (The "Explore" Feature)
            // Checks if seed belongs to a Twin region
            const isTwinMatch = seed.primary_topology.some(t => twinTopologies.includes(t));

            // C. Weather Safe (Real-time check)
            const isWeatherSafe = (
                currentHumidity >= (seed.requirements.min_humidity || 0) &&
                currentTemp >= (seed.requirements.min_temp || 0) &&
                currentTemp <= (seed.requirements.max_temp || 100)
            );

            // Logic: Must be (Home OR Twin) AND WeatherSafe
            if ((isHomeMatch || isTwinMatch) && isWeatherSafe) {
                return {
                    ...seed.toObject(),
                    matchType: isHomeMatch ? 'Native' : 'Twin-Adaptation', // Tag results
                    matchReason: isHomeMatch
                        ? `Perfect match for ${userTopology}`
                        : `Originally from ${seed.primary_topology[0]}, but fits ${userTopology} (${twinTopologies[0]} Twin)`
                };
            }
            return null;
        }).filter(Boolean);

        res.json({
            user_location: {
                topology: userTopology,
                twins: twinTopologies
            },
            weather_snapshot: {
                humidity: currentHumidity,
                temp: currentTemp
            },
            recommendations
        });

    } catch (error) {
        console.error("Topo recommendation error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
