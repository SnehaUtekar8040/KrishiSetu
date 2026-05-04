const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const mandiRoutes = require('./routes/mandiRoutes');
const predictRoutes = require('./routes/predictRoutes');
const chatRoutes = require('./routes/chatRoutes');
const listingRoutes = require('./routes/listingRoutes');
const translationRoutes = require('./routes/translationRoutes');

// Import Models for Health Check
const Farmer = require('./models/Farmer');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/mandi-prices', mandiRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api', translationRoutes); // For /api/translate-batch

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const count = await Farmer.countDocuments();
    res.json({
      status: 'ok',
      service: 'KrishiSetu Backend (Modular)',
      farmersRegistered: count,
      database: 'MongoDB',
      uptime: Math.floor(process.uptime()) + 's',
    });
  } catch (err) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 KrishiSetu Backend running on http://localhost:${PORT}`);
});
