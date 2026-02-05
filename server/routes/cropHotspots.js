const express = require('express');
const router = express.Router();
const CropHotspot = require('../models/CropHotspot');

// Get all hotspots for a specific crop
router.get('/crop/:cropName', async (req, res) => {
    try {
        const { cropName } = req.params;
        const hotspots = await CropHotspot.find({
            crop: new RegExp(cropName, 'i')
        }).sort({ geneticHotspotScore: -1 });

        res.json({
            crop: cropName,
            count: hotspots.length,
            hotspots
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get top hotspots across all crops
router.get('/top/:limit', async (req, res) => {
    try {
        const limit = parseInt(req.params.limit) || 10;
        const topHotspots = await CropHotspot.find()
            .sort({ geneticHotspotScore: -1 })
            .limit(limit);

        res.json(topHotspots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/top', async (req, res) => {
    try {
        const limit = 10;
        const topHotspots = await CropHotspot.find()
            .sort({ geneticHotspotScore: -1 })
            .limit(limit);

        res.json(topHotspots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get hotspots by topology zone
router.get('/zone/:zoneName', async (req, res) => {
    try {
        const { zoneName } = req.params;
        const hotspots = await CropHotspot.find({
            topologyZone: new RegExp(zoneName, 'i')
        }).sort({ geneticHotspotScore: -1 });

        res.json({
            zone: zoneName,
            count: hotspots.length,
            hotspots
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search hotspots by trait relevance
router.post('/search', async (req, res) => {
    try {
        const {
            crop,
            minSalinity,
            minHeat,
            minDrought,
            minScore
        } = req.body;

        const query = {};

        if (crop) {
            query.crop = new RegExp(crop, 'i');
        }
        if (minSalinity) {
            query.salinityRelevance = { $gte: parseFloat(minSalinity) };
        }
        if (minHeat) {
            query.heatRelevance = { $gte: parseFloat(minHeat) };
        }
        if (minDrought) {
            query.droughtRelevance = { $gte: parseFloat(minDrought) };
        }
        if (minScore) {
            query.geneticHotspotScore = { $gte: parseFloat(minScore) };
        }

        const results = await CropHotspot.find(query)
            .sort({ geneticHotspotScore: -1 })
            .limit(50);

        res.json({
            query,
            count: results.length,
            results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all available crops
router.get('/crops/list', async (req, res) => {
    try {
        const crops = await CropHotspot.distinct('crop');
        res.json(crops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all topology zones
router.get('/zones/list', async (req, res) => {
    try {
        const zones = await CropHotspot.distinct('topologyZone');
        res.json(zones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get statistics
router.get('/stats', async (req, res) => {
    try {
        const totalHotspots = await CropHotspot.countDocuments();
        const cropStats = await CropHotspot.aggregate([
            {
                $group: {
                    _id: '$crop',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$geneticHotspotScore' },
                    maxScore: { $max: '$geneticHotspotScore' },
                    avgSalinity: { $avg: '$salinityRelevance' },
                    avgHeat: { $avg: '$heatRelevance' },
                    avgDrought: { $avg: '$droughtRelevance' }
                }
            },
            { $sort: { avgScore: -1 } }
        ]);

        res.json({
            totalHotspots,
            uniqueCrops: cropStats.length,
            cropStats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
