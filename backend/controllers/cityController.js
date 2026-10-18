const UK_CITIES = require('../constants/ukCities');
const { prisma } = require('../config/db');
const { normalizeLocationString, extractOutwardCode, getCityNameFromOutwardCode } = require('../utils/postcodeHelper');
const { renderCityNotFoundHtml } = require('../utils/cityTemplateRenderer');

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
 * Shared computation helper that resolves active cities dynamically
 * based on active dealers, covered postcodes, assigned cities, and district pricing.
 * Reused identically by getCities and validateCitySlug.
 */
async function computeActiveCitiesData() {
  const [districtPricings, dbCities, activeDealers] = await Promise.all([
    prisma.districtPricing.findMany(),
    prisma.city.findMany({
      include: { pricing: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: {
        role: 'City Dealer',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        coveredPostcodes: true,
        assignedCity: true,
      },
    }),
  ]);

  const districtPricingMap = new Map();
  for (const dp of districtPricings) {
    if (dp.district && dp.pricePerTonne) {
      districtPricingMap.set(dp.district.trim().toUpperCase(), Number(dp.pricePerTonne));
    }
  }

  const dbCityMap = new Map();
  for (const c of dbCities) {
    dbCityMap.set(c.name.trim().toLowerCase(), c);
  }

  // Map to aggregate active cities based on active dealer coverage
  const activeCityGroups = new Map();
  function getActiveGroup(name) {
    const key = name.trim().toLowerCase();
    if (!activeCityGroups.has(key)) {
      activeCityGroups.set(key, {
        name: name.trim(),
        slug: slugify(name),
        postcodes: new Set(),
        dealers: new Set(),
        customRates: [],
      });
    }
    return activeCityGroups.get(key);
  }

  for (const dealer of activeDealers) {
    const pcs = (dealer.coveredPostcodes || [])
      .map((p) => extractOutwardCode(p).toUpperCase())
      .filter(Boolean);

    if (pcs.length > 0) {
      for (const pc of pcs) {
        const cityName = getCityNameFromOutwardCode(pc) || (dealer.assignedCity ? dealer.assignedCity.trim() : pc);
        const group = getActiveGroup(cityName);
        group.postcodes.add(pc);
        group.dealers.add(dealer.id);
        if (districtPricingMap.has(pc)) {
          group.customRates.push(districtPricingMap.get(pc));
        }
      }
    } else if (dealer.assignedCity) {
      const cityName = dealer.assignedCity.trim();
      const group = getActiveGroup(cityName);
      group.dealers.add(dealer.id);
    }
  }

  // Format active cities
  const activeResults = Array.from(activeCityGroups.values()).map((group) => {
    const postcodesArray = Array.from(group.postcodes).sort();
    const dbCity = dbCityMap.get(group.name.trim().toLowerCase());
    const ratePerTon = group.customRates.length > 0
      ? Math.max(...group.customRates)
      : (dbCity?.pricing?.pricePerTonne ? Number(dbCity.pricing.pricePerTonne) : 235);
    const postcodesText = postcodesArray.join(', ');
    const code = postcodesArray.length > 0 ? postcodesArray.slice(0, 3).join(', ') : group.name.slice(0, 3).toUpperCase();

    return {
      id: dbCity?.id || group.slug,
      name: group.name,
      city: group.name,
      slug: dbCity?.slug || group.slug,
      isActive: true,
      postcodes: postcodesArray,
      code,
      areas: postcodesArray.length > 0 ? postcodesArray : [`${group.name} Central`, 'Local Districts'],
      ratePerTon,
      dealerCount: group.dealers.size,
      description: postcodesArray.length > 0
        ? `Fast and free scrap car collection across ${group.name} covering ${postcodesText} and surrounding districts.`
        : `Scrap car collection available across ${group.name} and surrounding areas.`,
      createdAt: dbCity?.createdAt || new Date(),
      updatedAt: dbCity?.updatedAt || new Date(),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return {
    districtPricingMap,
    dbCities,
    activeDealers,
    activeCityGroups,
    activeResults,
  };
}

// 10-second microcache with in-flight promise deduplication to prevent DB spikes during heavy bot crawling
let cachedActiveComputation = null;
let cacheExpiry = 0;
let inFlightComputation = null;

function clearActiveCitiesCache() {
  cachedActiveComputation = null;
  cacheExpiry = 0;
}

async function getCachedActiveCitiesData() {
  const now = Date.now();
  if (cachedActiveComputation && now < cacheExpiry) {
    return cachedActiveComputation;
  }

  if (inFlightComputation) {
    return inFlightComputation;
  }

  inFlightComputation = (async () => {
    try {
      const data = await computeActiveCitiesData();
      cachedActiveComputation = data;
      cacheExpiry = Date.now() + 10000; // 10-second TTL
      return data;
    } finally {
      inFlightComputation = null;
    }
  })();

  return inFlightComputation;
}

/**
 * GET /api/cities/validate-slug?slug=:slug
 * Internal validation endpoint called by Caddy forward_auth.
 *
 * Status codes:
 * 200: City is currently active and supported.
 * 404: City is not active / unapproved (returns X-Robots-Tag: noindex, nofollow and branded 404 HTML).
 * 503: Database error or empty database anomaly (prevents valid cities from false 404s).
 */
async function validateCitySlug(req, res) {
  try {
    const rawSlug = req.query.slug;
    if (!rawSlug || typeof rawSlug !== 'string') {
      return res.status(400).send('Missing slug parameter');
    }

    const normalizedSlug = rawSlug.trim().toLowerCase();

    const { activeResults, dbCities, activeDealers } = await getCachedActiveCitiesData();

    // Outage guard: if database returned 0 dealers or 0 cities during an outage,
    // return 503 so valid cities are never falsely treated as 404.
    if ((!activeResults || activeResults.length === 0) && (activeDealers.length === 0 || dbCities.length === 0)) {
      return res
        .status(503)
        .set('Retry-After', '60')
        .send('Service Temporarily Unavailable');
    }

    const isActive = (activeResults || []).some(
      (c) => c.slug.toLowerCase() === normalizedSlug || slugify(c.name) === normalizedSlug
    );

    if (isActive) {
      return res.status(200).send('OK');
    }

    // City is unapproved or inactive: return 404 with X-Robots-Tag: noindex, nofollow and branded HTML
    const displayName = rawSlug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const notFoundHtml = renderCityNotFoundHtml(displayName);

    return res
      .status(404)
      .set('X-Robots-Tag', 'noindex, nofollow')
      .set('Content-Type', 'text/html; charset=utf-8')
      .send(notFoundHtml);
  } catch (err) {
    console.error('Validate City Slug Error:', err);
    return res
      .status(503)
      .set('Retry-After', '60')
      .send('Service Temporarily Unavailable');
  }
}

/**
 * GET /api/cities
 * Returns configured supported cities in MyAutoScrap.
 * Supports query param: ?active=true
 */
async function getCities(req, res) {
  try {
    const { active } = req.query;

    const {
      dbCities,
      activeCityGroups,
      activeResults,
    } = await getCachedActiveCitiesData();

    if (active === 'true') {
      return res.json(activeResults);
    }

    if (active === 'false') {
      const inactiveDbCities = dbCities
        .filter((c) => !activeCityGroups.has(c.name.trim().toLowerCase()))
        .map((c) => ({
          id: c.id,
          name: c.name,
          city: c.name,
          slug: c.slug,
          isActive: false,
          postcodes: [],
          code: c.name.slice(0, 3).toUpperCase(),
          areas: [`${c.name} Central`],
          ratePerTon: c.pricing ? Number(c.pricing.pricePerTonne) : 235,
          dealerCount: 0,
          description: `Scrap car collection in ${c.name}.`,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }));
      return res.json(inactiveDbCities);
    }

    // Default: return all DB cities plus any active groups not in DB
    const allDbFormatted = dbCities.map((c) => {
      const activeGroup = activeCityGroups.get(c.name.trim().toLowerCase());
      const postcodesArray = activeGroup ? Array.from(activeGroup.postcodes).sort() : [];
      const code = postcodesArray.length > 0 ? postcodesArray.slice(0, 3).join(', ') : c.name.slice(0, 3).toUpperCase();
      return {
        id: c.id,
        name: c.name,
        city: c.name,
        slug: c.slug,
        isActive: activeGroup ? true : c.isActive,
        postcodes: postcodesArray,
        code,
        areas: postcodesArray.length > 0 ? postcodesArray : [`${c.name} Central`],
        ratePerTon: activeGroup && activeGroup.customRates.length > 0
          ? Math.max(...activeGroup.customRates)
          : (c.pricing ? Number(c.pricing.pricePerTonne) : 235),
        dealerCount: activeGroup ? activeGroup.dealers.size : 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    for (const act of activeResults) {
      if (!allDbFormatted.some((c) => c.name.toLowerCase() === act.name.toLowerCase())) {
        allDbFormatted.push(act);
      }
    }

    allDbFormatted.sort((a, b) => a.name.localeCompare(b.name));
    return res.json(allDbFormatted);
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
          error: `"${existing.name}" is already configured as an active supported city in MyAutoScrap.`,
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

    clearActiveCitiesCache();
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

    clearActiveCitiesCache();
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

    clearActiveCitiesCache();
  } catch (err) {
    console.error('Delete City Error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCityOptions,
  getCities,
  validateCitySlug,
  createCity,
  updateCity,
  deleteCity,
};
