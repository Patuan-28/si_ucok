require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const guideRoutes = require('./routes/guides');
const topupRoutes = require('./routes/topups');
const statRoutes = require('./routes/stats');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/topups', topupRoutes);
app.use('/api/stats', statRoutes);

// Base route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Game Guides API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
