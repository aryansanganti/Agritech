/**
 * BHUMI Voice Server
 * Main Express server for handling Twilio voice calls
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const voiceRouter = require('./routes/voice');
const { getAllActiveCalls } = require('./services/conversationState');
const { logCall, logError } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'BHUMI Voice Server',
    timestamp: new Date().toISOString(),
    activeCalls: getAllActiveCalls().length
  });
});

// Voice webhook routes
app.use('/voice', voiceRouter);

// Admin endpoint to view active calls (for monitoring)
app.get('/admin/active-calls', (req, res) => {
  try {
    const activeCalls = getAllActiveCalls();
    res.json({
      success: true,
      count: activeCalls.length,
      calls: activeCalls
    });
  } catch (error) {
    logError(null, 'Error fetching active calls', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active calls'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'BHUMI Voice Assistant',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      voice: '/voice',
      admin: '/admin/active-calls'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logError(req.body?.CallSid || null, 'Server error', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BHUMI Voice Server running on port ${PORT}`);
  console.log(`📞 Voice webhook: http://localhost:${PORT}/voice`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Active calls monitor: http://localhost:${PORT}/admin/active-calls`);
  
  // Log environment check
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠️  Warning: Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
