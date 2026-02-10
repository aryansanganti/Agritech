require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const { calculateHotspotScore } = require('./services/scoring');
const connectDB = require('./config/database');
const Search = require('./models/Search');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
let dbConnected = false;
connectDB().then((connection) => {
    dbConnected = !!connection;
    if (dbConnected) {
        console.log('📊 Database features enabled');
        // Register analytics routes AFTER DB connection
        const analyticsRouter = require('./routes/analytics');
        app.use('/api/analytics', analyticsRouter);
        console.log('📈 Analytics endpoints registered');

        // Register crop hotspots routes
        const cropHotspotsRouter = require('./routes/cropHotspots');
        app.use('/api/crop-hotspots', cropHotspotsRouter);
        console.log('🌾 Crop Hotspots endpoints registered');

        // Register topology engine routes
        const topologyRouter = require('./routes/topology');
        app.use('/api/topology', topologyRouter);
        console.log('🌍 Topo-Seed Engine endpoints registered');
    }
}).catch(err => {
    console.error('Database initialization failed:', err);
});

// Gemini Setup - Only initialize if API key exists
let ai = null;
if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    console.log('🤖 Gemini AI initialized');
} else {
    console.warn('⚠️ API_KEY not set - Gemini features will be disabled');
}

// API 1: Calculate Hotspots (Pure Data)
app.post('/api/seedscout/calculate', async (req, res) => {
    try {
        const { cropType, salinityTolerance, heatTolerance, droughtTolerance, sessionId } = req.body;
        console.log(`Calculating hotspots for ${cropType}...`, { salinityTolerance, heatTolerance, droughtTolerance });

        const results = calculateHotspotScore(cropType, {
            salinityTolerance, heatTolerance, droughtTolerance
        });

        // Save search history to MongoDB (if connected)
        if (dbConnected) {
            try {
                const topResults = results.slice(0, 10).map(r => ({
                    districtName: r.district.name,
                    state: r.district.state,
                    score: r.traitScore,
                    salinity: r.district.salinity,
                    maxTemp: r.district.maxTemp,
                    rainfall: r.district.rainfall,
                    tribalPercent: r.district.tribalPercent
                }));

                await Search.create({
                    cropType,
                    traits: { salinityTolerance, heatTolerance, droughtTolerance },
                    topResults,
                    sessionId: sessionId || 'anonymous'
                });
                console.log('✅ Search history saved to MongoDB');
            } catch (dbError) {
                console.error('⚠️ Failed to save to database:', dbError.message);
                // Don't fail the request if DB save fails
            }
        }

        res.json(results);
    } catch (e) {
        console.error("Calculation Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// API 2: Explain Result (Gemini)
app.post('/api/seedscout/explain', async (req, res) => {
    try {
        if (!ai) {
            return res.status(503).json({ error: 'AI service not available - API_KEY not configured' });
        }

        const { district, crop, score, logic } = req.body;

        const prompt = `Act as an expert agricultural geneticist.
        Context: The district ${district.name} in ${district.state} has been identified as a Genetic Hotspot for ${crop} with a score of ${(score * 100).toFixed(0)}%.
        
        Data:
        - Salinity (EC): ${district.salinity} dS/m
        - Max Temp: ${district.maxTemp}°C
        - Tribal Population: ${district.tribalPercent}%
        - Rainfall: ${district.rainfall} mm
        - Computed Reason: ${logic}

        Task:
        Explain WHY this specific combination of environmental stress and tribal history makes it a "Genetic Goldmine" for finding resilient genes.
        Hypothesize specific gene traits (e.g. osmotic adjustment, heat shock proteins) that might have evolved here.
        Keep it inspiring, scientific, yet readable for a researcher.
        Format: HTML (use <b> for emphasis, <br> for breaks).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001', // Correct stable model
            contents: { role: 'user', parts: [{ text: prompt }] }
        });

        res.json({ explanation: response.text });
    } catch (e) {
        console.error("Explanation Error:", e);
        res.status(500).json({ error: "Could not generate explanation." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 SeedScout Backend running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${dbConnected ? 'Connected' : 'Connecting...'}`);
});
