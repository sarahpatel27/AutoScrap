require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const vrmRoutes = require('./routes/vrmRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Tables & Accounts
initDb();

// Mount Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/vrm-lookup', vrmRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Express Backend server running on http://localhost:${PORT}`);
});