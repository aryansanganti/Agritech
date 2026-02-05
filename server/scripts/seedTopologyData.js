require('dotenv').config();
const Seed = require('../models/Seed');
const connectDB = require('../config/database');

const seeds = [
    {
        seed_name: "Black Pepper (Panniyur-1)",
        primary_topology: ["The Western Ghats", "North-East Hills"],
        secondary_topology: ["Coastal Plains"],
        requirements: {
            min_humidity: 70,
            soil_type: "Laterite",
            altitude_min: 500,
            min_temp: 10,
            max_temp: 40
        },
        cultural_note: "Native to Kerala, but grows well in Assam (Topology Twin).",
        crop_type: "Spice",
        image_url: "https://example.com/black_pepper.jpg"
    },
    {
        seed_name: "Lakadong Turmeric",
        primary_topology: ["North-East Hills"],
        secondary_topology: ["The Western Ghats"],
        requirements: {
            min_humidity: 60,
            soil_type: "Loamy",
            altitude_min: 800,
            min_temp: 15,
            max_temp: 35
        },
        cultural_note: "World's finest turmeric from Meghalaya. Perfect for Western Ghats farmers seeking high-value crops.",
        crop_type: "Spice",
        image_url: "https://example.com/turmeric.jpg"
    },
    {
        seed_name: "Khapli Wheat (Emmer)",
        primary_topology: ["The Deccan Plateau", "Central Highlands"],
        secondary_topology: [],
        requirements: {
            min_humidity: 30,
            soil_type: "Black Cotton",
            altitude_min: 300,
            min_temp: 12,
            max_temp: 32
        },
        cultural_note: "Ancient grain resilient to drought. Ideally suited for the Deccan semi-arid conditions.",
        crop_type: "Cereal",
        image_url: "https://example.com/khapli.jpg"
    },
    {
        seed_name: "Kesar Mango",
        primary_topology: ["Kutch", "The Thar Desert"],
        secondary_topology: ["The Deccan Plateau"],
        requirements: {
            min_humidity: 40,
            soil_type: "Rocky/Sandy",
            altitude_min: 0,
            min_temp: 20,
            max_temp: 45
        },
        cultural_note: "Thrives in dry, hot climates. The 'Queen of Mangoes' from Gujarat.",
        crop_type: "Fruit",
        image_url: "https://example.com/kesar.jpg"
    },
    {
        seed_name: "Saffron (Kesar)",
        primary_topology: ["The Himalayas"],
        secondary_topology: ["Nilgiris"],
        requirements: {
            min_humidity: 40,
            soil_type: "Karewa (Clay-Loam)",
            altitude_min: 1500,
            min_temp: -10,
            max_temp: 25
        },
        cultural_note: "Kashmiri Gold. Can be experimentally grown in high-altitude Nilgiris.",
        crop_type: "Spice",
        image_url: "https://example.com/saffron.jpg"
    }
];

const seedData = async () => {
    try {
        console.log('🌱 Connecting to DB to seed topology data...');
        const connection = await connectDB();

        if (!connection) {
            throw new Error("DB Connection failed");
        }

        await new Promise(r => setTimeout(r, 1000));

        console.log('🗑️  Clearing old seeds...');
        await Seed.deleteMany({});

        console.log('✨ Inserting Topo-Seeds...');
        await Seed.insertMany(seeds);

        console.log('✅ Seeds planted successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    seedData();
}

module.exports = seedData;
