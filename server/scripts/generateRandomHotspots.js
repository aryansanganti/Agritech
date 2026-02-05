require('dotenv').config();
const CropHotspot = require('../models/CropHotspot');
const connectDB = require('../config/database');

// Expanded crop varieties with characteristics
const CROP_VARIETIES = [
    { name: 'Basmati Rice', type: 'cereal', salinityBase: 0.2, heatBase: 0.5, droughtBase: 0.4 },
    { name: 'Durum Wheat', type: 'cereal', salinityBase: 0.45, heatBase: 0.6, droughtBase: 0.65 },
    { name: 'Kabuli Chickpea', type: 'pulse', salinityBase: 0.35, heatBase: 0.55, droughtBase: 0.7 },
    { name: 'Pigeon Pea (Tur)', type: 'pulse', salinityBase: 0.3, heatBase: 0.65, droughtBase: 0.75 },
    { name: 'Hybrid Cotton BT', type: 'cash', salinityBase: 0.55, heatBase: 0.5, droughtBase: 0.6 },
    { name: 'Sugarcane CO 86032', type: 'cash', salinityBase: 0.25, heatBase: 0.45, droughtBase: 0.35 },
    { name: 'Red Amaranth', type: 'vegetable', salinityBase: 0.6, heatBase: 0.7, droughtBase: 0.5 },
    { name: 'Foxtail Millet', type: 'millet', salinityBase: 0.5, heatBase: 0.65, droughtBase: 0.8 },
    { name: 'Black Gram (Urad)', type: 'pulse', salinityBase: 0.4, heatBase: 0.55, droughtBase: 0.6 },
    { name: 'Sunflower Hybrid', type: 'oilseed', salinityBase: 0.45, heatBase: 0.7, droughtBase: 0.7 },
    { name: 'Green Gram (Moong)', type: 'pulse', salinityBase: 0.35, heatBase: 0.6, droughtBase: 0.65 },
    { name: 'Castor Bean', type: 'oilseed', salinityBase: 0.65, heatBase: 0.75, droughtBase: 0.85 },
    { name: 'Onion Nasik Red', type: 'vegetable', salinityBase: 0.3, heatBase: 0.5, droughtBase: 0.45 },
    { name: 'Sweet Sorghum', type: 'cereal', salinityBase: 0.55, heatBase: 0.7, droughtBase: 0.8 },
    { name: 'Safflower', type: 'oilseed', salinityBase: 0.5, heatBase: 0.65, droughtBase: 0.75 }
];

// Diverse topology zones with environmental characteristics
const TOPOLOGY_ZONES = [
    {
        name: 'Western Ghats Rainforest',
        desc: 'High rainfall, acidic soils, steep slopes, biodiversity hotspot',
        salinityMod: -0.2, heatMod: -0.1, droughtMod: -0.3
    },
    {
        name: 'Thar Desert Fringe',
        desc: 'Extreme aridity, sandy soils, temperature fluctuations, wind erosion',
        salinityMod: 0.3, heatMod: 0.4, droughtMod: 0.5
    },
    {
        name: 'Brahmaputra Flood Plains',
        desc: 'Seasonal flooding, alluvial deposits, high water table, silt accumulation',
        salinityMod: -0.15, heatMod: 0.1, droughtMod: -0.2
    },
    {
        name: 'Malwa Plateau',
        desc: 'Black cotton soil, moderate rainfall, undulating terrain, river valleys',
        salinityMod: 0.1, heatMod: 0.2, droughtMod: 0.15
    },
    {
        name: 'Chhota Nagpur Plateau',
        desc: 'Tribal farming, forest patches, laterite soils, mineral-rich rocks',
        salinityMod: 0.05, heatMod: 0.15, droughtMod: 0.2
    },
    {
        name: 'Konkan Coastal Belt',
        desc: 'Lateritic soils, monsoon dominance, coconut groves, humid climate',
        salinityMod: 0.25, heatMod: 0.1, droughtMod: -0.15
    },
    {
        name: 'Bundelkhand Ravines',
        desc: 'Degraded lands, gully erosion, water scarcity, resilient landraces',
        salinityMod: 0.2, heatMod: 0.3, droughtMod: 0.4
    },
    {
        name: 'Kerala Backwaters',
        desc: 'Waterlogged paddy fields, high organic matter, saline intrusion risk',
        salinityMod: 0.35, heatMod: 0.05, droughtMod: -0.25
    },
    {
        name: 'Kutch Salt Marshes',
        desc: 'Extreme salinity, arid conditions, halophytic vegetation, tidal influence',
        salinityMod: 0.5, heatMod: 0.35, droughtMod: 0.45
    },
    {
        name: 'Nilgiri Hills',
        desc: 'Cool climate, tea estates, shola forests, high elevation, mist belt',
        salinityMod: -0.1, heatMod: -0.3, droughtMod: 0.1
    },
    {
        name: 'Vidarbha Cotton Belt',
        desc: 'Dryland farming, erratic rainfall, farmer suicides legacy, BT cotton dominance',
        salinityMod: 0.15, heatMod: 0.25, droughtMod: 0.35
    },
    {
        name: 'Sundarbans Delta',
        desc: 'Mangrove ecosystem, tidal influence, brackish water, cyclone-prone',
        salinityMod: 0.45, heatMod: 0.2, droughtMod: -0.1
    }
];

// Generate random value with variance
const randomVariance = (base, variance = 0.2) => {
    const min = Math.max(0, base - variance);
    const max = Math.min(1, base + variance);
    return min + Math.random() * (max - min);
};

// Calculate genetic hotspot score with complexity
const calculateGeneticScore = (salinity, heat, drought, cropType, zoneComplexity) => {
    // Base score from environmental stress (higher stress = more genetic diversity potential)
    const stressScore = (salinity * 0.35 + heat * 0.35 + drought * 0.3);

    // Zone complexity bonus (some zones naturally have more genetic diversity)
    const zoneFactor = zoneComplexity;

    // Crop type factor (millets and pulses often have more landraces)
    const cropFactor = {
        'millet': 1.15,
        'pulse': 1.1,
        'cereal': 1.0,
        'oilseed': 0.95,
        'vegetable': 0.9,
        'cash': 0.85
    }[cropType] || 1.0;

    // Add some randomness for realism
    const randomFactor = 0.9 + Math.random() * 0.2;

    const rawScore = stressScore * zoneFactor * cropFactor * randomFactor;

    // Normalize to 0-1 range but keep variation
    return Math.min(0.98, Math.max(0.25, rawScore));
};

// Generate realistic reason
const generateReason = (crop, zone, score) => {
    const reasons = [
        `Indigenous ${crop} landraces in ${zone} show ${score > 0.7 ? 'exceptional' : 'moderate'} genetic adaptation`,
        `Traditional ${crop} cultivars evolved under ${zone} stress conditions over centuries`,
        `${zone} harbors ancient ${crop} germplasm with ${score > 0.75 ? 'high' : 'valuable'} genetic diversity`,
        `Local ${crop} varieties from ${zone} demonstrate unique stress-tolerance mechanisms`,
        `Farmer-selected ${crop} strains in ${zone} exhibit distinct genetic signatures`,
        `Wild relatives of ${crop} persist in ${zone} with valuable allelic variation`,
        `${zone} represents a ${score > 0.8 ? 'critical' : 'important'} conservation priority for ${crop} genetic resources`,
        `Traditional knowledge systems in ${zone} have preserved diverse ${crop} genotypes`,
        `${crop} biodiversity in ${zone} shows adaptation to ${score > 0.7 ? 'extreme' : 'challenging'} environmental gradients`
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
};

async function generateRandomData(count = 50) {
    try {
        console.log('🔗 Connecting to MongoDB...');
        const connection = await connectDB();

        if (!connection) {
            throw new Error('Failed to connect to MongoDB');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ MongoDB connection ready');

        console.log(`🎲 Generating ${count} random crop hotspot entries...`);

        const newEntries = [];
        const usedCombinations = new Set();

        for (let i = 0; i < count; i++) {
            // Pick random crop and zone
            const crop = CROP_VARIETIES[Math.floor(Math.random() * CROP_VARIETIES.length)];
            const zone = TOPOLOGY_ZONES[Math.floor(Math.random() * TOPOLOGY_ZONES.length)];

            // Create unique key to avoid duplicates
            const key = `${crop.name}-${zone.name}`;
            if (usedCombinations.has(key)) {
                i--; // Retry this iteration
                continue;
            }
            usedCombinations.add(key);

            // Calculate stress relevance scores with zone modifiers
            const salinityRelevance = Math.min(0.99, Math.max(0.1,
                randomVariance(crop.salinityBase, 0.15) + zone.salinityMod + (Math.random() * 0.1 - 0.05)
            ));

            const heatRelevance = Math.min(0.99, Math.max(0.1,
                randomVariance(crop.heatBase, 0.15) + zone.heatMod + (Math.random() * 0.1 - 0.05)
            ));

            const droughtRelevance = Math.min(0.99, Math.max(0.1,
                randomVariance(crop.droughtBase, 0.15) + zone.droughtMod + (Math.random() * 0.1 - 0.05)
            ));

            // Zone complexity based on description length and diversity indicators
            const zoneComplexity = 0.8 + Math.random() * 0.4;

            // Calculate genetic hotspot score
            const geneticScore = calculateGeneticScore(
                salinityRelevance,
                heatRelevance,
                droughtRelevance,
                crop.type,
                zoneComplexity
            );

            newEntries.push({
                crop: crop.name,
                topologyZone: zone.name,
                topologyDescription: zone.desc,
                salinityRelevance: parseFloat(salinityRelevance.toFixed(2)),
                heatRelevance: parseFloat(heatRelevance.toFixed(2)),
                droughtRelevance: parseFloat(droughtRelevance.toFixed(2)),
                geneticHotspotScore: parseFloat(geneticScore.toFixed(2)),
                reason: generateReason(crop.name, zone.name, geneticScore)
            });
        }

        // Insert into database
        const result = await CropHotspot.insertMany(newEntries);
        console.log(`✅ Successfully inserted ${result.length} random entries!`);

        // Show statistics
        console.log('\n📊 Sample of generated data:');
        const samples = newEntries.slice(0, 5);
        samples.forEach(s => {
            console.log(`   ${s.crop} in ${s.topologyZone}`);
            console.log(`   → Sal: ${s.salinityRelevance}, Heat: ${s.heatRelevance}, Drought: ${s.droughtRelevance}, Score: ${s.geneticHotspotScore}`);
        });

        // Show distribution
        const totalCount = await CropHotspot.countDocuments();
        const scoreDistribution = await CropHotspot.aggregate([
            {
                $bucket: {
                    groupBy: '$geneticHotspotScore',
                    boundaries: [0, 0.4, 0.6, 0.75, 0.9, 1.0],
                    default: 'other',
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        console.log('\n📈 Score Distribution:');
        scoreDistribution.forEach(bucket => {
            console.log(`   ${bucket._id}-range: ${bucket.count} entries`);
        });

        console.log(`\n🎯 Total records in database: ${totalCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Generation failed:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    const count = parseInt(process.argv[2]) || 50;
    generateRandomData(count);
}

module.exports = generateRandomData;
