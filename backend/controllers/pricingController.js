const { prisma } = require('../config/db');

async function getPricing(req, res) {
  try {
    const rows = await prisma.cityPricing.findMany();
    const cityRates = {};
    let defaultRate = 235;

    for (const row of rows) {
      if (row.city === 'Default') {
        defaultRate = row.pricePerTonne;
      } else {
        cityRates[row.city] = row.pricePerTonne;
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
        await prisma.cityPricing.upsert({
          where: { city },
          update: { pricePerTonne: Number(rate) || 235 },
          create: { city, pricePerTonne: Number(rate) || 235 },
        });
      }
    }

    if (defaultPricePerTonne) {
      await prisma.cityPricing.upsert({
        where: { city: 'Default' },
        update: { pricePerTonne: Number(defaultPricePerTonne) || 235 },
        create: { city: 'Default', pricePerTonne: Number(defaultPricePerTonne) || 235 },
      });
    }

    const rows = await prisma.cityPricing.findMany();
    const updatedRates = {};
    let defRate = 235;

    for (const row of rows) {
      if (row.city === 'Default') defRate = row.pricePerTonne;
      else updatedRates[row.city] = row.pricePerTonne;
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
