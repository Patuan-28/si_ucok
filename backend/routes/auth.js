const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND deleted_at IS NULL', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid username or password' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ id: user.id, username: user.username }, 'A_VERY_SECRET_KEY', { expiresIn: '8h' });
    res.json({ token, message: 'Welcome back' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
