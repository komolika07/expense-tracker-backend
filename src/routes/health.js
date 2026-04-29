const express = require('express');
const router = express.Router();
const db = require('../models'); // adjust if your db connection file is elsewhere

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    db: 'unknown',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };

  try {
    await db.sequelize.authenticate(); // ping the database
    health.db = 'connected';
    res.status(200).json(health);
  } catch (err) {
    health.status = 'error';
    health.db = 'unreachable';
    res.status(503).json(health);
  }
});


module.exports = router;
