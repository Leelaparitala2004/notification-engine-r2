const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/v2/health - Health check
router.get('/', async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoStatus,
      groq: process.env.GROQ_API_KEY ? 'configured' : 'not_configured'
    }
  });
});

module.exports = router;