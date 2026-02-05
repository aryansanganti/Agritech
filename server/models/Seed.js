const mongoose = require('mongoose');

const seedSchema = new mongoose.Schema({
    seed_name: {
        type: String,
        required: true,
        index: true
    },
    primary_topology: [{
        type: String,
        required: true
    }],
    secondary_topology: [{
        type: String
    }],
    requirements: {
        min_humidity: Number,
        soil_type: String,
        altitude_min: Number,
        min_temp: Number,
        max_temp: Number
    },
    cultural_note: {
        type: String
    },
    crop_type: String, // e.g., 'Spice', 'Cereal'
    image_url: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Seed', seedSchema);
