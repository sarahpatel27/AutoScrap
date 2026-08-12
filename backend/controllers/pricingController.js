const { pool } = require('../config/db');

async function getPricing(req, res) {
  try {
    const result = await pool.query('SELECT city, price_per_tonne FROM city_pricing');
    const cityRates = {};
    let defaultRate = 235;

    for (const row of result.rows) {
      if (row.city === 'Default') {
        defaultRate = row.price_per_tonne;
      } else {
        cityRates[row.city] = row.price_per_tonne;
      }
    }

    res.json({
      defaultPricePerTonne: defaultRate,
      cityRates,
    });
  } catch (err) {
    console.error('Get Pricing Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function updatePricing(req, res) {
  try {
    const { cityRates, defaultPricePerTonne } = req.body;

    if (cityRates && typeof cityRates === 'object') {
      for (const [city, rate] of Object.entries(cityRates)) {
        await pool.query(
          `INSERT INTO city_pricing (city, price_per_tonne) VALUES ($1, $2)
           ON CONFLICT (city) DO UPDATE SET price_per_tonne = EXCLUDED.price_per_tonne`,
          [city, Number(rate) || 235],
        );
      }
    }

    if (defaultPricePerTonne) {
      await pool.query(
        `INSERT INTO city_pricing (city, price_per_tonne) VALUES ('Default', $1)
         ON CONFLICT (city) DO UPDATE SET price_per_tonne = EXCLUDED.price_per_tonne`,
        [Number(defaultPricePerTonne) || 235],
      );
    }

    const result = await pool.query('SELECT city, price_per_tonne FROM city_pricing');
    const updatedRates = {};
    let defRate = 235;

    for (const row of result.rows) {
      if (row.city === 'Default') defRate = row.price_per_tonne;
      else updatedRates[row.city] = row.price_per_tonne;
    }

    res.json({
      defaultPricePerTonne: defRate,
      cityRates: updatedRates,
    });
  } catch (err) {
    console.error('Update Pricing Error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getPricing,
  updatePricing,
};
