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

async function getDistrictPricing(req, res) {
  try {
    const rows = await prisma.districtPricing.findMany({
      orderBy: { district: 'asc' },
    });

    const districtRates = {};
    for (const row of rows) {
      districtRates[row.district] = Number(row.pricePerTonne);
    }

    // Also get all distinct districts covered by active dealers
    const activeDealers = await prisma.user.findMany({
      where: { role: 'City Dealer', isActive: true },
      select: { coveredPostcodes: true },
    });

    const coveredSet = new Set();
    for (const d of activeDealers) {
      for (const p of (d.coveredPostcodes || [])) {
        if (p && p.trim()) coveredSet.add(p.trim().toUpperCase());
      }
    }

    const activeDistricts = Array.from(coveredSet).sort();

    res.json({
      defaultPricePerTonne: 235,
      districtRates,
      activeDistricts,
      districts: rows.map((r) => ({
        id: r.id,
        district: r.district,
        pricePerTonne: Number(r.pricePerTonne),
        updatedAt: r.updatedAt,
      })),
    });
  } catch (err) {
    console.error('Get District Pricing Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function updateDistrictPricing(req, res) {
  try {
    const user = req.user;
    if (!user || user.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Forbidden: Only Super Administrators can update district scrap pricing.' });
    }

    const { districtRates, district, pricePerTonne } = req.body;

    if (district && pricePerTonne !== undefined) {
      const cleanDistrict = String(district).trim().toUpperCase();
      const numRate = Number(pricePerTonne);
      if (cleanDistrict && !isNaN(numRate) && numRate > 0) {
        await prisma.districtPricing.upsert({
          where: { district: cleanDistrict },
          update: { pricePerTonne: numRate },
          create: { district: cleanDistrict, pricePerTonne: numRate },
        });
      }
    }

    if (districtRates && typeof districtRates === 'object') {
      for (const [dist, rate] of Object.entries(districtRates)) {
        const cleanDist = String(dist).trim().toUpperCase();
        const numRate = Number(rate);
        if (cleanDist && !isNaN(numRate) && numRate > 0) {
          await prisma.districtPricing.upsert({
            where: { district: cleanDist },
            update: { pricePerTonne: numRate },
            create: { district: cleanDist, pricePerTonne: numRate },
          });
        }
      }
    }

    return getDistrictPricing(req, res);
  } catch (err) {
    console.error('Update District Pricing Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteDistrictPricing(req, res) {
  try {
    const user = req.user;
    if (!user || user.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Forbidden: Only Super Administrators can delete district pricing.' });
    }

    const { district } = req.params;
    if (!district) {
      return res.status(400).json({ error: 'District parameter is required.' });
    }

    const cleanDistrict = String(district).trim().toUpperCase();
    await prisma.districtPricing.deleteMany({
      where: { district: cleanDistrict },
    });

    return getDistrictPricing(req, res);
  } catch (err) {
    console.error('Delete District Pricing Error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getPricing,
  updatePricing,
  getDistrictPricing,
  updateDistrictPricing,
  deleteDistrictPricing,
};
