const { prisma } = require('../config/db');
const { getCityNameFromOutwardCode } = require('../utils/postcodeHelper');

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

        const numericRate = Number(rate);
        if (isNaN(numericRate) || numericRate < 0) {
          continue;
        }

        // Find or dynamically create the City record so pricing is properly persisted
        let city = await prisma.city.findFirst({
          where: {
            name: {
              equals: cityName.trim(),
              mode: 'insensitive',
            },
          },
        });

        if (!city) {
          const rawSlug = cityName
            .trim()
            .toLowerCase()
            .replace(/[\s\W-]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'city';
          const existingSlug = await prisma.city.findUnique({ where: { slug: rawSlug } });
          const finalSlug = existingSlug ? `${rawSlug}-${Math.floor(Math.random() * 10000)}` : rawSlug;

          city = await prisma.city.create({
            data: {
              name: cityName.trim(),
              slug: finalSlug,
              isActive: true,
            },
          });
        } else if (!city.isActive) {
          city = await prisma.city.update({
            where: { id: city.id },
            data: { isActive: true },
          });
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
    const user = req.user;
    const isDealer = user && user.role === 'City Dealer';
    const dealerCovered = isDealer
      ? (user.coveredPostcodes || []).map((p) => String(p).trim().toUpperCase()).filter(Boolean)
      : null;

    // 1. Determine all active outward districts across all active City Dealers
    const activeDealers = await prisma.user.findMany({
      where: { role: 'City Dealer', isActive: true },
      select: { coveredPostcodes: true },
    });

    const activeSet = new Set();
    for (const d of activeDealers) {
      for (const p of (d.coveredPostcodes || [])) {
        if (p && p.trim()) activeSet.add(p.trim().toUpperCase());
      }
    }
    const allActiveDistricts = Array.from(activeSet).sort();

    // 2. Automatically delete/cleanup orphaned district_pricing rows for districts that are no longer active
    if (allActiveDistricts.length > 0) {
      await prisma.districtPricing.deleteMany({
        where: {
          district: { notIn: allActiveDistricts },
        },
      });
    } else {
      await prisma.districtPricing.deleteMany({});
    }

    // 3. Query district pricing rows strictly for active districts
    let allowedDistricts = allActiveDistricts;
    if (isDealer) {
      allowedDistricts = (dealerCovered || []).filter((d) => activeSet.has(d));
    }

    const rows = allowedDistricts.length > 0
      ? await prisma.districtPricing.findMany({
          where: { district: { in: allowedDistricts } },
          orderBy: { district: 'asc' },
        })
      : [];

    let activeDistricts = [];
    if (isDealer) {
      activeDistricts = (dealerCovered || []).filter((d) => activeSet.has(d)).sort();
    } else {
      activeDistricts = allActiveDistricts;
    }

    // Also fetch active city pricings to supply default rates from parent cities
    const activeCities = await prisma.city.findMany({
      where: { isActive: true },
      include: { pricing: true },
    });
    const cityRateMap = new Map();
    for (const c of activeCities) {
      if (c.pricing?.pricePerTonne) {
        cityRateMap.set(c.name.trim().toLowerCase(), Number(c.pricing.pricePerTonne));
      }
    }

    const customRowMap = new Map();
    for (const row of rows) {
      customRowMap.set(row.district, Number(row.pricePerTonne));
    }

    const districtRates = {};
    const districtOrigins = {}; // 'custom' | 'city' | 'default'
    const districtParentCities = {};

    for (const dist of activeDistricts) {
      const parentCity = getCityNameFromOutwardCode(dist);
      if (parentCity) {
        districtParentCities[dist] = parentCity;
      }

      if (customRowMap.has(dist)) {
        districtRates[dist] = customRowMap.get(dist);
        districtOrigins[dist] = 'custom';
      } else {
        const cityRate = parentCity ? cityRateMap.get(parentCity.toLowerCase()) : null;
        if (cityRate !== undefined && cityRate !== null) {
          districtRates[dist] = cityRate;
          districtOrigins[dist] = 'city';
        } else {
          districtRates[dist] = 235;
          districtOrigins[dist] = 'default';
        }
      }
    }

    res.json({
      defaultPricePerTonne: 235,
      districtRates,
      districtOrigins,
      districtParentCities,
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
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to update scrap pricing.' });
    }

    const isSuperAdmin = user.role === 'Super Admin';
    const isDealer = user.role === 'City Dealer';

    if (!isSuperAdmin && !isDealer) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to update scrap pricing.' });
    }

    // Determine currently active districts across all active dealers
    const activeDealers = await prisma.user.findMany({
      where: { role: 'City Dealer', isActive: true },
      select: { coveredPostcodes: true },
    });

    const activeSet = new Set();
    for (const d of activeDealers) {
      for (const p of (d.coveredPostcodes || [])) {
        if (p && p.trim()) activeSet.add(p.trim().toUpperCase());
      }
    }

    const dealerCovered = isDealer
      ? (user.coveredPostcodes || []).map((p) => String(p).trim().toUpperCase()).filter(Boolean)
      : null;

    const { districtRates, district, pricePerTonne } = req.body;

    if (district && pricePerTonne !== undefined) {
      const cleanDistrict = String(district).trim().toUpperCase();
      const numRate = Number(pricePerTonne);

      if (!activeSet.has(cleanDistrict)) {
        return res.status(400).json({
          error: `District ${cleanDistrict} is not currently active. An active dealer must cover this district before scrap rates can be configured.`,
        });
      }

      if (isDealer && (!dealerCovered || !dealerCovered.includes(cleanDistrict))) {
        return res.status(403).json({
          error: `Forbidden: You are only authorized to set scrap rates for your own assigned postcode districts (${(dealerCovered || []).join(', ')}).`,
        });
      }

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

        if (!activeSet.has(cleanDist)) {
          continue; // Ignore inactive districts
        }

        if (isDealer && (!dealerCovered || !dealerCovered.includes(cleanDist))) {
          return res.status(403).json({
            error: `Forbidden: You are only authorized to set scrap rates for your own assigned postcode districts (${(dealerCovered || []).join(', ')}).`,
          });
        }

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
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to delete district pricing.' });
    }

    const isSuperAdmin = user.role === 'Super Admin';
    const isDealer = user.role === 'City Dealer';

    if (!isSuperAdmin && !isDealer) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to delete district pricing.' });
    }

    const { district } = req.params;
    if (!district) {
      return res.status(400).json({ error: 'District parameter is required.' });
    }

    const cleanDistrict = String(district).trim().toUpperCase();

    if (isDealer) {
      const dealerCovered = (user.coveredPostcodes || []).map((p) => String(p).trim().toUpperCase()).filter(Boolean);
      if (!dealerCovered.includes(cleanDistrict)) {
        return res.status(403).json({
          error: 'Forbidden: You cannot delete pricing for a district you do not cover.',
        });
      }
    }

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
