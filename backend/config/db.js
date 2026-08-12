const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'apple',
  password: process.env.DB_PASSWORD || '123123123',
  database: process.env.DB_NAME || 'autoscrap',
});

async function initDb() {
  try {
    const client = await pool.connect();
    try {
      // 1. City Pricing Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS city_pricing (
          city VARCHAR(50) PRIMARY KEY,
          price_per_tonne INTEGER NOT NULL DEFAULT 235
        );
      `);

      const defaultRates = [
        ['Default', 235],
        ['Doncaster', 235],
        ['Leicester', 240],
        ['Peterborough', 230],
        ['London', 260],
        ['Cambridge', 245],
        ['Liverpool', 238],
        ['Manchester', 245],
      ];

      for (const [city, rate] of defaultRates) {
        await client.query(
          `INSERT INTO city_pricing (city, price_per_tonne) VALUES ($1, $2) ON CONFLICT (city) DO NOTHING`,
          [city, rate],
        );
      }

      // 2. Enquiries Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS enquiries (
          id SERIAL PRIMARY KEY,
          reference VARCHAR(50) UNIQUE NOT NULL,
          date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(30) DEFAULT 'Pending',
          postcode VARCHAR(20),
          city VARCHAR(50),
          vehicle JSONB,
          condition JSONB,
          customer JSONB,
          bank JSONB,
          quote JSONB
        );
      `);

      console.log('✅ PostgreSQL database tables initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

module.exports = {
  pool,
  initDb,
};
