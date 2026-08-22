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

  // St Albans
  "st albans": "St Albans",
  "st. albans": "St Albans",
};

/**
 * Outward postcode prefix mapping
 */
const POSTCODE_AREA_PREFIX_MAP = {
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
 * Centrally resolves an addressData object into a supported database City record (or null).
 * 
 * Flow:
 * 1. Normalize all address components (PostTown, AdminDistrict, AdminCounty, AddressList, Postcode).
 * 2. Resolve known aliases centrally.
 * 3. Match against active cities in database (case/punctuation insensitive, exact or contains).
 * 
 * @param {Object} addressData - Data containing postcode, addressList, locationDetails, postTown, adminDistrict
 * @returns {Promise<{ isSupported: boolean, city: Object|null, matchedCityName: string|null, ratePerTon: number|null }>}
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

  const candidates = [];

  // Extract all potential candidates in priority order
  if (postTown) candidates.push(postTown);
  if (adminDistrict) candidates.push(adminDistrict);
  if (adminCounty) candidates.push(adminCounty);
  if (address) candidates.push(address);

  for (const item of addressList) {
    const pt = item.FormattedAddressLines?.PostTown || item.postTown;
    if (pt) candidates.push(pt);
    const summary = item.SummaryAddress || item.summaryAddress;
    if (summary) candidates.push(summary);
  }

  const ons = locationDetails.OnsGeography || {};
  if (ons.AdminDistrict?.Name) candidates.push(ons.AdminDistrict.Name);
  if (ons.AdminCounty?.Name) candidates.push(ons.AdminCounty.Name);

  // Outward postcode prefix candidate
  const cleanPostcode = normalizeLocationString(postcode).replace(/\s+/g, "");
  const outwardMatch = cleanPostcode.match(/^([a-z]{1,2})\d/i);
  if (outwardMatch) {
    const prefix = outwardMatch[1].toLowerCase();
    if (POSTCODE_AREA_PREFIX_MAP[prefix]) {
      candidates.push(POSTCODE_AREA_PREFIX_MAP[prefix]);
    }
  }

  // Fetch all active supported cities and their current pricing from DB
  const activeCities = await prisma.city.findMany({
    where: { isActive: true },
    include: { pricing: true },
  });

  if (!activeCities || activeCities.length === 0) {
    return {
      isSupported: false,
      city: null,
      matchedCityName: null,
      ratePerTon: null,
    };
  }

  // Match candidates against active database cities
  for (const rawCandidate of candidates) {
    const norm = normalizeLocationString(rawCandidate);
    if (!norm) continue;

    // Check alias first
    const mappedAlias = CITY_ALIASES[norm];
    const targetToSearch = mappedAlias ? normalizeLocationString(mappedAlias) : norm;

    // Match against active cities
    for (const city of activeCities) {
      const normCityName = normalizeLocationString(city.name);

      if (
        normCityName === targetToSearch ||
        normCityName === norm ||
        targetToSearch.includes(normCityName) ||
        norm.includes(normCityName)
      ) {
        return {
          isSupported: true,
          city,
          matchedCityName: city.name,
          ratePerTon: city.pricing ? Number(city.pricing.pricePerTonne || city.pricing.pricePerTon) : 235,
        };
      }
    }
  }

  return {
    isSupported: false,
    city: null,
    matchedCityName: null,
    ratePerTon: null,
  };
}

/**
 * Convenience backward-compatible wrapper for address controller
 */
async function determineServiceArea(addressDetails = {}) {
  const result = await resolveSupportedCity(addressDetails);
  return result.isSupported ? result.matchedCityName.toUpperCase() : null;
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
  resolveSupportedCity,
  determineServiceArea,
  getCityFromPostcode,
};
