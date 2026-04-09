const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /api/stats (Admin protected)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [[{ guidesCount }]] = await db.query('SELECT COUNT(*) AS guidesCount FROM game_guides WHERE deleted_at IS NULL');
    const [[{ topupsCount }]] = await db.query('SELECT COUNT(*) AS topupsCount FROM topups WHERE deleted_at IS NULL');
    
    res.json({
      guides: guidesCount,
      topups: topupsCount,
      visitors: 8534 // Dummy data based on the instruction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

module.exports = router;
