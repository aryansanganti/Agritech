require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const CropHotspot = require('../models/CropHotspot');
const connectDB = require('../config/database');

async function importCropHotspots() {
    try {
        // Connect to MongoDB and wait
        console.log('🔗 Connecting to MongoDB...');
        const connection = await connectDB();

        if (!connection) {
            throw new Error('Failed to connect to MongoDB');
        }

        // Wait a bit for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ MongoDB connection ready');

        // Read CSV file
        const csvPath = path.join(__dirname, '../data/crop_topology_genetic_hotspots.csv');
        const fileContent = fs.readFileSync(csvPath, 'utf-8');

        // Parse CSV
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            cast: true // Auto-convert numbers
        });

        console.log(`📄 Found ${records.length} records in CSV`);

        // Clear existing data
        await CropHotspot.deleteMany({});
        console.log('🗑️  Cleared existing hotspot data');

        // Transform and insert data
        const hotspots = records.map(record => ({
            crop: record.crop,
            topologyZone: record.topology_zone,
            topologyDescription: record.topology_description,
            salinityRelevance: parseFloat(record.salinity_relevance),
            heatRelevance: parseFloat(record.heat_relevance),
            droughtRelevance: parseFloat(record.drought_relevance),
            geneticHotspotScore: parseFloat(record.genetic_hotspot_score),
            reason: record.reason
        }));

        const result = await CropHotspot.insertMany(hotspots);
        console.log(`✅ Successfully imported ${result.length} crop hotspots!`);

        // Show sample data
        console.log('\n📊 Sample imported records:');
        const samples = await CropHotspot.find().limit(3);
        samples.forEach(s => {
            console.log(`   ${s.crop} in ${s.topologyZone}: Score ${s.geneticHotspotScore}`);
        });

        // Show statistics
        const stats = await CropHotspot.aggregate([
            {
                $group: {
                    _id: '$crop',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$geneticHotspotScore' },
                    maxScore: { $max: '$geneticHotspotScore' }
                }
            },
            { $sort: { avgScore: -1 } }
        ]);

        console.log('\n📈 Statistics by crop:');
        stats.forEach(s => {
            console.log(`   ${s._id}: ${s.count} zones, Avg Score: ${s.avgScore.toFixed(2)}, Max: ${s.maxScore.toFixed(2)}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    importCropHotspots();
}

module.exports = importCropHotspots;
