const UK_CITIES = require('../constants/ukCities');
const { prisma } = require('../config/db');
const { normalizeLocationString } = require('../utils/postcodeHelper');

/**
 * Helper to generate URL safe slug from city name.
 */
function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * GET /api/cities/options
 * Returns searchable options from the master 76-city reference list.
 */
async function getCityOptions(req, res) {
  try {
    const { search = '', limit = 20, excludeAdded = 'true' } = req.query;
    const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
    const shouldExclude = excludeAdded !== 'false';

    // 1. Fetch currently supported cities from database
    const supportedCities = await prisma.city.findMany({
      select: { name: true, isActive: true },
    });
    const supportedCityNames = new Set(
      supportedCities.map((c) => c.name.trim().toLowerCase()),
    );

    // 2. Filter 76-city master list
    const searchTerm = String(search).trim().toLowerCase();

    const matched = UK_CITIES.filter((cityName) => {
      const lower = cityName.toLowerCase();
      const matchesSearch = !searchTerm || lower.includes(searchTerm);
      if (!matchesSearch) return false;

      if (shouldExclude && supportedCityNames.has(lower)) {
        return false;
      }

      return true;
    });

    // 3. Apply limit
    const results = matched.slice(0, parsedLimit).map((cityName) => ({
      name: cityName,
      isAdded: supportedCityNames.has(cityName.toLowerCase()),
    }));

    res.json(results);
  } catch (err) {
    console.error('Get City Options Error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/cities
 * Returns configured supported cities in AutoScrap.
 * Supports query param: ?active=true
 */
async function getCities(req, res) {
  try {
    const { active } = req.query;
    const where = {};
    if (active === 'true') {
      where.isActive = true;
    } else if (active === 'false') {
      where.isActive = false;
    }

    const [cities, users] = await Promise.all([
      prisma.city.findMany({
        where,
        include: {
          pricing: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.user.findMany({
        where: {
          role: 'City Dealer',
          assignedCity: { not: null },
        },
        select: { assignedCity: true },
      }),
    ]);

    // Count dealers per city
    const dealerCounts = {};
    for (const u of users) {
      if (u.assignedCity) {
        const key = u.assignedCity.trim().toLowerCase();
        dealerCounts[key] = (dealerCounts[key] || 0) + 1;
      }
    }

    const result = cities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      isActive: c.isActive,
      ratePerTon: c.pricing ? Number(c.pricing.pricePerTonne) : 235,
      dealerCount: dealerCounts[c.name.trim().toLowerCase()] || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    res.json(result);
  } catch (err) {
    console.error('Get Cities Error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/cities
 * Creates a newly supported City and its initial CityPricing record atomically.
 */
async function createCity(req, res) {
  try {
    // Only Super Admin can perform this action
    if (req.user?.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Unauthorized: Only Super Administrators can add supported cities.' });
    }

    const { name, ratePerTon } = req.body;

    // 1. Validation: Trim, lowercase and normalize input name
    const cleanInputName = normalizeLocationString(name);
    if (!cleanInputName) {
      return res.status(400).json({ error: 'City name is required.' });
    }

    // Match against official UK cities and counties master list
    const masterCity = UK_CITIES.find(
      (c) => normalizeLocationString(c) === cleanInputName,
    );
    if (!masterCity) {
      return res.status(400).json({
        error: `"${name}" is not a recognized UK city or county in the official master list.`,
      });
    }

    // 2. Validation: Scrap rate is required and must be greater than zero
    const numericRate = Number(ratePerTon);
    if (isNaN(numericRate) || numericRate <= 0) {
      return res.status(400).json({
        error: 'Scrap rate per tonne is required and must be a valid number greater than zero.',
      });
    }

    // 3. Duplicate check using normalized name / slug
    const existing = await prisma.city.findFirst({
      where: {
        OR: [
          { name: { equals: masterCity, mode: 'insensitive' } },
          { slug: slugify(masterCity) },
        ],
      },
      include: { pricing: true },
    });

    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          error: `"${existing.name}" is already configured as an active supported city in AutoScrap.`,
        });
      }

      // If existing but inactive, reactivate city and update rate atomically.
      // NOTE: Old dealer accounts remain deactivated until explicitly enabled or re-created by Super Admin.
      const reactivated = await prisma.$transaction(async (tx) => {
        const updatedCity = await tx.city.update({
          where: { id: existing.id },
          data: { isActive: true },
        });

        const pricing = await tx.cityPricing.upsert({
          where: { cityId: existing.id },
          update: { pricePerTonne: numericRate },
          create: { cityId: existing.id, pricePerTonne: numericRate },
        });

        return { ...updatedCity, pricing };
      });

      return res.status(200).json({
        success: true,
        reactivated: true,
        message: `Re-activated "${reactivated.name}" with rate £${numericRate}/t. (Dealer accounts remain deactivated until explicitly reactivated by Super Admin).`,
        city: {
          id: reactivated.id,
          name: reactivated.name,
          slug: reactivated.slug,
          isActive: reactivated.isActive,
          ratePerTon: Number(reactivated.pricing.pricePerTonne),
          createdAt: reactivated.createdAt,
          updatedAt: reactivated.updatedAt,
        },
      });
    }

    // 4. Create new City and CityPricing in a transaction
    const slug = slugify(masterCity);
    const newRecord = await prisma.$transaction(async (tx) => {
      const city = await tx.city.create({
        data: {
          name: masterCity,
          slug,
          isActive: true,
        },
      });

      const pricing = await tx.cityPricing.create({
        data: {
          cityId: city.id,
          pricePerTonne: numericRate,
        },
      });

      return { ...city, pricing };
    });

    res.status(201).json({
      success: true,
      message: `Successfully added ${newRecord.name} with rate £${numericRate}/t.`,
      city: {
        id: newRecord.id,
        name: newRecord.name,
        slug: newRecord.slug,
        isActive: newRecord.isActive,
        ratePerTon: Number(newRecord.pricing.pricePerTonne),
        createdAt: newRecord.createdAt,
        updatedAt: newRecord.updatedAt,
      },
    });
  } catch (err) {
    console.error('Create City Error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * PUT /api/cities/:id
 * Updates city rate and/or active status.
 */
async function updateCity(req, res) {
  try {
    if (req.user?.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Unauthorized: Only Super Administrators can modify city settings.' });
    }

    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Invalid city ID.' });
    }

    const existing = await prisma.city.findUnique({
      where: { id: numericId },
      include: { pricing: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Supported city not found.' });
    }

    const { name, ratePerTon, isActive } = req.body;

    // Disallow arbitrary unsupported city names if name is being changed
    let validName = existing.name;
    let validSlug = existing.slug;
    if (name && typeof name === 'string' && name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const masterCity = UK_CITIES.find(
        (c) => c.toLowerCase() === name.trim().toLowerCase(),
      );
      if (!masterCity) {
        return res.status(400).json({
          error: `"${name}" is not a recognized UK city or county in the official master list.`,
        });
      }
      validName = masterCity;
      validSlug = slugify(masterCity);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cityData = {
        name: validName,
        slug: validSlug,
      };

      if (typeof isActive === 'boolean') {
        cityData.isActive = isActive;
      }

      const city = await tx.city.update({
        where: { id: numericId },
        data: cityData,
      });

      // If city isActive state changed, synchronize dealer active status atomically
      if (typeof isActive === 'boolean') {
        await tx.user.updateMany({
          where: {
            OR: [
              { cityId: numericId },
              { assignedCity: { equals: existing.name, mode: 'insensitive' } },
            ],
          },
          data: { isActive },
        });
      }

      let pricing = existing.pricing;
      if (ratePerTon !== undefined) {
        const numericRate = Number(ratePerTon);
        if (isNaN(numericRate) || numericRate <= 0) {
          throw new Error('Rate per tonne must be greater than zero.');
        }

        pricing = await tx.cityPricing.upsert({
          where: { cityId: numericId },
          update: { pricePerTonne: numericRate },
          create: { cityId: numericId, pricePerTonne: numericRate },
        });
      }

      return { ...city, pricing };
    });

    res.json({
      success: true,
      message: `City ${updated.name} updated successfully.`,
      city: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        isActive: updated.isActive,
        ratePerTon: updated.pricing ? Number(updated.pricing.pricePerTonne) : 235,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error('Update City Error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * DELETE /api/cities/:id
 * Soft deletes / deactivates supported city without destroying historical data.
 */
async function deleteCity(req, res) {
  try {
    if (req.user?.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Unauthorized: Only Super Administrators can deactivate cities.' });
    }

    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Invalid city ID.' });
    }

    const existing = await prisma.city.findUnique({
      where: { id: numericId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Supported city not found.' });
    }

    // Soft deletion: Deactivate city and related dealer accounts in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const deactivatedCity = await tx.city.update({
        where: { id: numericId },
        data: { isActive: false },
      });

      // Soft deactivate associated dealers
      await tx.user.updateMany({
        where: {
          OR: [
            { cityId: numericId },
            { assignedCity: { equals: existing.name, mode: 'insensitive' } },
          ],
        },
        data: { isActive: false },
      });

      return deactivatedCity;
    });

    res.json({
      success: true,
      message: `City "${result.name}" and associated dealer accounts have been deactivated successfully.`,
      city: {
        id: result.id,
        name: result.name,
        isActive: false,
      },
    });
  } catch (err) {
    console.error('Delete City Error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCityOptions,
  getCities,
  createCity,
  updateCity,
  deleteCity,
};
