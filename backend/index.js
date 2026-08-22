require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const vrmRoutes = require('./routes/vrmRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const addressRoutes = require('./routes/addressRoutes');
const cityRoutes = require('./routes/cityRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const { autoResolveExpiredBids } = require('./services/biddingAutoResolver');

// Initialize Database Tables & Accounts
initDb().then(() => {
  autoResolveExpiredBids();
  // Periodically check and auto-resolve expired 48h biddings every 60 seconds
  setInterval(autoResolveExpiredBids, 60 * 1000);
});

// Mount Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/vrm-lookup', vrmRoutes);
app.use('/api/address-lookup', addressRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/cities', cityRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Express Backend server running on http://localhost:${PORT}`);
});