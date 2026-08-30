const { prisma } = require('../config/db');

async function getPricing(req, res) {
  try {
    const rows = await prisma.cityPricing.findMany({
      where: {
        city: {
          isActive: true,
        },
      },
      include: { city: true },
    });

    const cityRates = {};
    const defaultRate = 235;

    for (const row of rows) {
      if (row.city?.name && row.city.isActive) {
        cityRates[row.city.name] = Number(row.pricePerTonne);
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
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const { cityRates, defaultPricePerTonne } = req.body;

    if (cityRates && typeof cityRates === 'object') {
      for (const [cityName, rate] of Object.entries(cityRates)) {
        if (cityName === 'Default') continue;

        // If City Dealer, verify they are only editing their own assigned city
        if (user.role === 'City Dealer') {
          if (!user.assignedCity || user.assignedCity.trim().toLowerCase() !== cityName.trim().toLowerCase()) {
            return res.status(403).json({
              error: `Forbidden: City Dealers can only update scrap rates for their assigned city (${user.assignedCity}).`,
            });
          }
        } else if (user.role !== 'Super Admin') {
          return res.status(403).json({ error: 'Forbidden: Insufficient permissions to modify scrap rates.' });
        }

        // Verify city is an existing supported city
        const city = await prisma.city.findFirst({
          where: {
            name: {
              equals: cityName.trim(),
              mode: 'insensitive',
            },
          },
        });

        if (!city) {
          // Do not allow pricing for unsupported cities
          continue;
        }

        const numericRate = Number(rate);
        if (isNaN(numericRate) || numericRate < 0) {
          continue;
        }

        await prisma.cityPricing.upsert({
          where: { cityId: city.id },
          update: { pricePerTonne: numericRate },
          create: {
            cityId: city.id,
            pricePerTonne: numericRate,
          },
        });
      }
    }

    const rows = await prisma.cityPricing.findMany({
      include: { city: true },
    });

    const updatedRates = {};
    const defRate = Number(defaultPricePerTonne) || 235;

    for (const row of rows) {
      if (row.city?.name) {
        updatedRates[row.city.name] = Number(row.pricePerTonne);
      }
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
