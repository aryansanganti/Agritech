const express = require('express');
const router = express.Router();
const Search = require('../models/Search');

// Get popular crops searched
router.get('/popular-crops', async (req, res) => {
    try {
        const popularCrops = await Search.aggregate([
            {
                $group: {
                    _id: '$cropType',
                    count: { $sum: 1 },
                    avgTopScore: { $avg: { $arrayElemAt: ['$topResults.score', 0] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json(popularCrops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get popular districts (most frequently appearing in top results)
router.get('/popular-districts', async (req, res) => {
    try {
        const searches = await Search.find({}).select('topResults');
        const districtCounts = {};

        searches.forEach(search => {
            search.topResults.forEach(result => {
                const key = `${result.districtName}, ${result.state}`;
                districtCounts[key] = (districtCounts[key] || 0) + 1;
            });
        });

        const sorted = Object.entries(districtCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([district, count]) => ({ district, count }));

        res.json(sorted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recent searches
router.get('/recent-searches', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const recentSearches = await Search.find({})
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('cropType traits timestamp topResults');

        res.json(recentSearches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get search statistics
router.get('/stats', async (req, res) => {
    try {
        const totalSearches = await Search.countDocuments();
        const uniqueCrops = await Search.distinct('cropType');
        const last24Hours = await Search.countDocuments({
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        res.json({
            totalSearches,
            uniqueCrops: uniqueCrops.length,
            searchesLast24h: last24Hours,
            avgSearchesPerDay: totalSearches // You can calculate this more accurately
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
