require('dotenv').config();

const path = require('path');
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
const promotionRoutes = require('./routes/promotionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors(
    corsOrigins.length
      ? { origin: corsOrigins, credentials: true }
      : undefined
  )
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { autoResolveExpiredBids, processMidwayBiddingNotifications } = require('./services/biddingAutoResolver');

// Initialize Database Tables & Accounts
initDb().then(() => {
  autoResolveExpiredBids();
  processMidwayBiddingNotifications();
  // Periodically check expired biddings & 24h midway notifications every 60 seconds
  setInterval(() => {
    autoResolveExpiredBids();
    processMidwayBiddingNotifications();
  }, 60 * 1000);
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
app.use('/api/promotions', promotionRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express Backend server running on 0.0.0.0:${PORT}`);
});