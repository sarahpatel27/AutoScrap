const { prisma } = require("../config/db");

/**
 * Normalizes an input string:
 * - lowercase
 * - trim outer whitespace
 * - collapse multiple spaces
 * - remove punctuation and symbols (dots, commas, hyphens, slashes)
 */
function normalizeLocationString(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%^&*;:{}=\-_\`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Centrally maps Royal ID / address API localities, administrative areas,
 * and regional boroughs to their official UK city names.
 */
const CITY_ALIASES = {
  // London aliases & boroughs
  "city of london": "London",
  "greater london": "London",
  "westminster": "London",
  "camden": "London",
  "islington": "London",
  "hackney": "London",
  "tower hamlets": "London",
  "greenwich": "London",
  "lewisham": "London",
  "southwark": "London",
  "lambeth": "London",
  "wandsworth": "London",
  "hammersmith and fulham": "London",
  "kensington and chelsea": "London",
  "brent": "London",
  "ealing": "London",
  "hounslow": "London",
  "richmond upon thames": "London",
  "kingston upon thames": "London",
  "merton": "London",
  "sutton": "London",
  "croydon": "London",
  "bromley": "London",
  "bexley": "London",
  "havering": "London",
  "barking and dagenham": "London",
  "redbridge": "London",
  "waltham forest": "London",
  "haringey": "London",
  "enfield": "London",
  "barnet": "London",
  "harrow": "London",
  "hillingdon": "London",

  // Manchester aliases & boroughs
  "greater manchester": "Manchester",
  "salford": "Manchester",
  "trafford": "Manchester",
  "stockport": "Manchester",
  "tameside": "Manchester",
  "oldham": "Manchester",
  "rochdale": "Manchester",
  "bury": "Manchester",
  "bolton": "Manchester",
  "wigan": "Manchester",

  // Liverpool / Merseyside aliases
  "merseyside": "Liverpool",
  "knowsley": "Liverpool",
  "sefton": "Liverpool",
  "st helens": "Liverpool",
  "st. helens": "Liverpool",
  "wirral": "Liverpool",
  "bootle": "Liverpool",

  // Leicester / Leicestershire aliases
  "leicestershire": "Leicester",
  "blaby": "Leicester",
  "charnwood": "Leicester",
  "harborough": "Leicester",
  "hinckley and bosworth": "Leicester",
  "melton": "Leicester",
  "oadby and wigston": "Leicester",
  "north west leicestershire": "Leicester",
  "loughborough": "Leicester",

  // Cambridge / Cambridgeshire aliases
  "cambridgeshire": "Cambridge",
  "south cambridgeshire": "Cambridge",
  "east cambridgeshire": "Cambridge",

  // Newcastle / Tyne and Wear
  "tyne and wear": "Newcastle upon Tyne",
  "newcastle": "Newcastle upon Tyne",
  "gateshead": "Newcastle upon Tyne",
  "north tyneside": "Newcastle upon Tyne",
  "south tyneside": "Newcastle upon Tyne",

  // Brighton
  "brighton": "Brighton and Hove",
  "hove": "Brighton and Hove",

  // Hull
  "hull": "Kingston upon Hull",

  // Stoke
  "stoke": "Stoke-on-Trent",
  "stoke on trent": "Stoke-on-Trent",

  // Southend
  "southend": "Southend-on-Sea",
  "southend on sea": "Southend-on-Sea",

  // Bedfordshire & Luton aliases
  "luton": "Bedfordshire",
  "bedfordshire": "Bedfordshire",
  "central bedfordshire": "Bedfordshire",
  "bedford": "Bedfordshire",
  "dunstable": "Bedfordshire",
  "houghton regis": "Bedfordshire",
  "leighton buzzard": "Bedfordshire",
  "biggleswade": "Bedfordshire",

  // St Albans
  "st albans": "St Albans",
  "st. albans": "St Albans",
};

/**
 * Outward postcode prefix mapping
 */
const POSTCODE_AREA_PREFIX_MAP = {
  lu: "Bedfordshire",
  dn: "Doncaster",
  le: "Leicester",
  pe: "Peterborough",
  cb: "Cambridge",
  l: "Liverpool",
  m: "Manchester",
  b: "Birmingham",
  bs: "Bristol",
  ls: "Leeds",
  s: "Sheffield",
  ne: "Newcastle upon Tyne",
  ng: "Nottingham",
  cv: "Coventry",
  so: "Southampton",
  po: "Portsmouth",
  ox: "Oxford",
  nr: "Norwich",
  ex: "Exeter",
  pl: "Plymouth",
  gl: "Gloucester",
  ct: "Canterbury",
  ba: "Bath",
  bd: "Bradford",
  ca: "Carlisle",
  cm: "Chelmsford",
  ch: "Chester",
  de: "Derby",
  dh: "Durham",
  hr: "Hereford",
  hu: "Kingston upon Hull",
  la: "Lancaster",
  ln: "Lincoln",
  mk: "Milton Keynes",
  pr: "Preston",
  sp: "Salisbury",
  ss: "Southend-on-Sea",
  al: "St Albans",
  st: "Stoke-on-Trent",
  sr: "Sunderland",
  tr: "Truro",
  wf: "Wakefield",
  so: "Winchester",
  wv: "Wolverhampton",
  wr: "Worcester",
  yo: "York",
  e: "London",
  ec: "London",
  n: "London",
  nw: "London",
  se: "London",
  sw: "London",
  w: "London",
  wc: "London",
  br: "London",
  cr: "London",
  da: "London",
  en: "London",
  ha: "London",
  ig: "London",
  kt: "London",
  rm: "London",
  sm: "London",
  tw: "London",
  ub: "London",
  wd: "London",
};

/**
 * Extracts the UK Outward Code (district) from a given postcode.
 * Examples:
 * - "PE1 1AA" -> "PE1"
 * - "PE29 4TU" -> "PE29"
 * - "SW1A 1AA" -> "SW1A"
 * - "M1 1AE" -> "M1"
 * - "PE1" -> "PE1"
 * 
 * @param {string} postcode 
 * @returns {string} Normalized uppercase outward district code
 */
function extractOutwardCode(postcode) {
  if (!postcode || typeof postcode !== "string") return "";
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, " ");
  const parts = clean.split(" ");
  if (parts.length > 1) {
    return parts[0].trim();
  }
  // If no space, check if it's a full UK postcode (which always ends with inward code: 1 digit + 2 letters, e.g. 1AA)
  const fullMatch = clean.match(/^([A-Z]{1,2}\d[A-Z\d]?)\d[A-Z]{2}$/i);
  if (fullMatch) {
    return fullMatch[1].toUpperCase().trim();
  }
  const match = clean.match(/^([A-Z]{1,2}\d[A-Z\d]?)/i);
  return match ? match[1].toUpperCase().trim() : clean;
}

/**
 * Checks if at least one active dealer covers the specified outward district.
 * 
 * @param {string} outwardDistrict 
 * @returns {Promise<boolean>}
 */
async function isDistrictCoveredByActiveDealer(outwardDistrict) {
  if (!outwardDistrict) return false;
  const target = outwardDistrict.trim().toUpperCase();

  try {
    const activeDealers = await prisma.user.findMany({
      where: {
        role: "City Dealer",
        isActive: true,
      },
      select: {
        id: true,
        coveredPostcodes: true,
      },
    });

    return activeDealers.some((dealer) => {
      const list = dealer.coveredPostcodes || [];
      return list.some((p) => String(p).trim().toUpperCase() === target);
    });
  } catch (err) {
    console.error("Error checking district dealer coverage:", err);
    return false;
  }
}

/**
 * Retrieves the scrap rate per tonne for a given outward district.
 * Checks district_pricing table first, falls back to default 235.00.
 * 
 * @param {string} outwardDistrict 
 * @returns {Promise<number>}
 */
async function getDistrictRate(outwardDistrict) {
  if (!outwardDistrict) return 235;
  const cleanDistrict = outwardDistrict.trim().toUpperCase();

  try {
    const pricing = await prisma.districtPricing.findUnique({
      where: { district: cleanDistrict },
    });
    if (pricing && pricing.pricePerTonne) {
      return Number(pricing.pricePerTonne);
    }
  } catch (err) {
    console.error("Error fetching district rate:", err);
  }
  return 235;
}

/**
 * Centrally resolves an addressData object into a supported database City record (or null).
 * 
 * Flow:
 * 1. Extract UK outward district code from postcode.
 * 2. Strictly check if at least one active dealer covers this outward district.
 *    If no active dealer covers this district, mark isSupported: false.
 * 3. Retrieve rate per tonne configured for this outward district (Option B).
 * 4. Resolve city name from candidates, aliases, or active cities in DB for display.
 * 
 * @param {Object} addressData - Data containing postcode, addressList, locationDetails, postTown, adminDistrict
 * @returns {Promise<{ isSupported: boolean, city: Object|null, matchedCityName: string|null, ratePerTon: number|null, outwardDistrict: string }>}
 */
async function resolveSupportedCity(addressData = {}) {
  const {
    addressList = [],
    locationDetails = {},
    postcode = "",
    postTown = "",
    adminDistrict = "",
    adminCounty = "",
    address = "",
  } = addressData;

  const cleanPostcode = normalizeLocationString(postcode).replace(/\s+/g, "");
  const outwardDistrict = extractOutwardCode(postcode);

  // 1. Strict Dealer Coverage Validation:
  // Must be covered by at least one active City Dealer
  const isCovered = await isDistrictCoveredByActiveDealer(outwardDistrict);
  if (!isCovered) {
    return {
      isSupported: false,
      city: null,
      matchedCityName: null,
      ratePerTon: null,
      outwardDistrict,
    };
  }

  // 2. Fetch district rate per tonne (Option B)
  const ratePerTon = await getDistrictRate(outwardDistrict);

  // 3. Resolve city name for display / administrative context
  const candidates = [];
  if (postTown) candidates.push(postTown);
  if (adminDistrict) candidates.push(adminDistrict);
  if (adminCounty) candidates.push(adminCounty);
  if (address) candidates.push(address);

  for (const item of addressList) {
    const lines = item.FormattedAddressLines || {};
    const county = lines.County || item.county;
    if (county) candidates.push(county);
    const pt = lines.PostTown || item.postTown;
    if (pt) candidates.push(pt);
    const locality = lines.Locality || item.locality;
    if (locality) candidates.push(locality);
    const summary = item.SummaryAddress || item.summaryAddress;
    if (summary) candidates.push(summary);
  }

  const ons = locationDetails.OnsGeography || {};
  if (ons.AdminDistrict?.Name) candidates.push(ons.AdminDistrict.Name);
  if (ons.AdminCounty?.Name) candidates.push(ons.AdminCounty.Name);

  // Outward postcode prefix candidate
  const outwardMatch = cleanPostcode.match(/^([a-z]{1,2})\d/i);
  if (outwardMatch) {
    const prefix = outwardMatch[1].toLowerCase();
    if (POSTCODE_AREA_PREFIX_MAP[prefix]) {
      candidates.push(POSTCODE_AREA_PREFIX_MAP[prefix]);
    }
  }

  // Fetch active cities from DB to map name if possible
  const activeCities = await prisma.city.findMany({
    where: { isActive: true },
    include: { pricing: true },
  });

  let matchedCity = null;
  let matchedCityName = postTown || outwardDistrict;

  if (activeCities && activeCities.length > 0) {
    for (const rawCandidate of candidates) {
      const norm = normalizeLocationString(rawCandidate);
      if (!norm) continue;

      const mappedAlias = CITY_ALIASES[norm];
      const targetToSearch = mappedAlias ? normalizeLocationString(mappedAlias) : norm;

      for (const city of activeCities) {
        const normCityName = normalizeLocationString(city.name);
        if (
          normCityName === targetToSearch ||
          normCityName === norm ||
          targetToSearch.includes(normCityName) ||
          norm.includes(normCityName) ||
          normCityName.includes(targetToSearch)
        ) {
          matchedCity = city;
          matchedCityName = city.name;
          break;
        }
      }
      if (matchedCity) break;
    }
  }

  return {
    isSupported: true,
    city: matchedCity,
    matchedCityName: matchedCityName || outwardDistrict,
    ratePerTon,
    outwardDistrict,
  };
}

/**
 * Convenience backward-compatible wrapper for address controller
 */
async function determineServiceArea(addressDetails = {}) {
  const result = await resolveSupportedCity(addressDetails);
  return result.isSupported ? (result.matchedCityName || result.outwardDistrict).toUpperCase() : null;
}

/**
 * Convenience helper to get city name from postcode / address
 */
async function getCityFromPostcode(postcode = "", address = "") {
  if (!postcode && !address) return "Unassigned";

  const result = await resolveSupportedCity({
    postcode,
    address,
    addressList: address ? [{ FormattedAddressLines: { PostTown: address } }] : [],
  });

  return result.isSupported ? result.matchedCityName : "Other";
}

module.exports = {
  normalizeLocationString,
  extractOutwardCode,
  isDistrictCoveredByActiveDealer,
  getDistrictRate,
  resolveSupportedCity,
  determineServiceArea,
  getCityFromPostcode,
};
