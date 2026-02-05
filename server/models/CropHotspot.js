const mongoose = require('mongoose');

const cropHotspotSchema = new mongoose.Schema({
    crop: {
        type: String,
        required: true,
        index: true
    },
    topologyZone: {
        type: String,
        required: true
    },
    topologyDescription: {
        type: String,
        required: true
    },
    salinityRelevance: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    heatRelevance: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    droughtRelevance: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    geneticHotspotScore: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    reason: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
cropHotspotSchema.index({ crop: 1, topologyZone: 1 }, { unique: true });
cropHotspotSchema.index({ geneticHotspotScore: -1 });

module.exports = mongoose.model('CropHotspot', cropHotspotSchema);
