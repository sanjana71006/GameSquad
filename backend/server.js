require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect("mongodb+srv://Gamer234:gamer1234@cluster0.i2xqnz6.mongodb.net/puzzleDB?retryWrites=true&w=majority")
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log("MongoDB connection error details:", err));

// Route Middleware
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
