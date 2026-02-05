const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    cropType: {
        type: String,
        required: true
    },
    traits: {
        salinityTolerance: Boolean,
        heatTolerance: Boolean,
        droughtTolerance: Boolean
    },
    topResults: [{
        districtName: String,
        state: String,
        score: Number,
        salinity: Number,
        maxTemp: Number,
        rainfall: Number,
        tribalPercent: Number
    }],
    timestamp: {
        type: Date,
        default: Date.now
    },
    userLocation: String,
    sessionId: String
}, {
    timestamps: true
});

// Index for faster queries
searchSchema.index({ cropType: 1, timestamp: -1 });
searchSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Search', searchSchema);
