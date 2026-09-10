export const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending", icon: "⏳" },
  { value: "Contacted", label: "Contacted", icon: "📞" },
  { value: "Accepted", label: "Accepted", icon: "🤝" },
  { value: "Collected", label: "Collected", icon: "🚚" },
  { value: "Cancelled", label: "Cancelled", icon: "❌" },
];

/**
 * All 124 UK outward postal area prefixes mapped to authoritative city/town names
 */
export const POSTCODE_AREA_PREFIX_MAP = {
  ab: "Aberdeen",
  al: "St Albans",
  b: "Birmingham",
  ba: "Bath",
  bb: "Blackburn",
  bd: "Bradford",
  bh: "Bournemouth",
  bl: "Bolton",
  bn: "Brighton",
  br: "London",
  bs: "Bristol",
  bt: "Belfast",
  ca: "Carlisle",
  cb: "Cambridge",
  cf: "Cardiff",
  ch: "Chester",
  cm: "Chelmsford",
  co: "Colchester",
  cr: "London",
  ct: "Canterbury",
  cv: "Coventry",
  cw: "Crewe",
  da: "London",
  dd: "Dundee",
  de: "Derby",
  dg: "Dumfries",
  dh: "Durham",
  dl: "Darlington",
  dn: "Doncaster",
  dt: "Dorchester",
  dy: "Dudley",
  e: "London",
  ec: "London",
  eh: "Edinburgh",
  en: "London",
  ex: "Exeter",
  fk: "Falkirk",
  fy: "Blackpool",
  g: "Glasgow",
  gl: "Gloucester",
  gu: "Guildford",
  ha: "London",
  hd: "Huddersfield",
  hg: "Harrogate",
  hp: "Hemel Hempstead",
  hr: "Hereford",
  hs: "Outer Hebrides",
  hu: "Kingston upon Hull",
  hx: "Halifax",
  ig: "London",
  ip: "Ipswich",
  iv: "Inverness",
  ka: "Kilmarnock",
  kt: "London",
  kw: "Kirkwall",
  ky: "Kirkcaldy",
  l: "Liverpool",
  la: "Lancaster",
  ld: "Llandrindod Wells",
  le: "Leicester",
  ll: "Llandudno",
  ln: "Lincoln",
  ls: "Leeds",
  lu: "Luton",
  m: "Manchester",
  me: "Medway",
  mk: "Milton Keynes",
  ml: "Motherwell",
  n: "London",
  ne: "Newcastle upon Tyne",
  ng: "Nottingham",
  nn: "Northampton",
  np: "Newport",
  nr: "Norwich",
  nw: "London",
  ol: "Oldham",
  ox: "Oxford",
  pa: "Paisley",
  pe: "Peterborough",
  ph: "Perth",
  pl: "Plymouth",
  po: "Portsmouth",
  pr: "Preston",
  rg: "Reading",
  rh: "Redhill",
  rm: "London",
  s: "Sheffield",
  sa: "Swansea",
  se: "London",
  sg: "Stevenage",
  sk: "Stockport",
  sl: "Slough",
  sm: "London",
  sn: "Swindon",
  so: "Southampton",
  sp: "Salisbury",
  sr: "Sunderland",
  ss: "Southend-on-Sea",
  st: "Stoke-on-Trent",
  sw: "London",
  sy: "Shrewsbury",
  ta: "Taunton",
  td: "Galashiels",
  tf: "Telford",
  tn: "Tonbridge",
  tq: "Torquay",
  tr: "Truro",
  ts: "Cleveland",
  tw: "London",
  ub: "London",
  w: "London",
  wa: "Warrington",
  wc: "London",
  wd: "London",
  wf: "Wakefield",
  wn: "Wigan",
  wr: "Worcester",
  ws: "Walsall",
  wv: "Wolverhampton",
  yo: "York",
  ze: "Shetland",
};

/**
 * Normalises a value by trimming and converting to uppercase.
 */
export function normaliseText(value) {
  return String(value || "").trim().toUpperCase();
}

/**
 * Extracts outward code from UK postcode (e.g. "LU1 1AA" -> "LU1", "MK9 1AA" -> "MK9")
 */
export function extractOutwardCode(postcode = "") {
  if (!postcode || typeof postcode !== "string") return "";
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, " ");
  const parts = clean.split(" ");
  if (parts.length > 1) {
    return parts[0].trim();
  }
  const fullMatch = clean.match(/^([A-Z]{1,2}\d[A-Z\d]?)\d[A-Z]{2}$/i);
  if (fullMatch) {
    return fullMatch[1].toUpperCase().trim();
  }
  const match = clean.match(/^([A-Z]{1,2}\d[A-Z\d]?)/i);
  return match ? match[1].toUpperCase().trim() : clean;
}

/**
 * Resolves UK outward code to city name
 */
export function getCityNameFromOutwardCode(outwardDistrict) {
  if (!outwardDistrict || typeof outwardDistrict !== "string") return "";
  const clean = outwardDistrict.trim().toUpperCase();
  const match = clean.match(/^([A-Z]{1,2})/);
  if (!match) return clean;
  const prefix = match[1].toLowerCase();
  return POSTCODE_AREA_PREFIX_MAP[prefix] || clean;
}

/**
 * Derives a city name from postcode / address strings.
 * Never returns an inward postcode (like "1aa").
 */
export function getCityFromPostcode(postcode = "", address = "") {
  if (!postcode && !address) return "Unassigned";

  // 1. Try resolving outward code from postcode
  const outward = extractOutwardCode(postcode);
  if (outward) {
    const resolved = getCityNameFromOutwardCode(outward);
    if (resolved && resolved !== outward && !/^\d[A-Za-z]{2}$/i.test(resolved)) {
      return resolved;
    }
  }

  // 2. Try extracting UK postcode from address string
  const normAddress = String(address || "").trim();
  if (normAddress) {
    const pcMatch = normAddress.match(/([A-Za-z]{1,2}\d[A-Za-z\d]?)\s*(\d[A-Za-z]{2})?/);
    if (pcMatch && pcMatch[1]) {
      const resolved = getCityNameFromOutwardCode(pcMatch[1]);
      if (resolved && resolved !== pcMatch[1] && !/^\d[A-Za-z]{2}$/i.test(resolved)) {
        return resolved;
      }
    }

    // 3. Search comma-separated parts of address from back to front
    const parts = normAddress
      .split(/[,]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    for (let i = parts.length - 1; i >= 0; i--) {
      const token = parts[i].trim();
      // Skip if purely inward code (e.g. "1AA") or full postcode or numbers
      if (
        /^\d[A-Za-z]{2}$/i.test(token) ||
        /^[A-Za-z]{1,2}\d[A-Za-z\d]?(\s*\d[A-Za-z]{2})?$/i.test(token) ||
        /^\d+$/.test(token)
      ) {
        continue;
      }
      // Skip common road words
      if (/\b(street|road|avenue|lane|drive|way|close|terrace|court|place|crescent|boulevard)\b/i.test(token)) {
        continue;
      }
      // Check against known cities
      const lower = token.toLowerCase();
      const matchedCity = Object.values(POSTCODE_AREA_PREFIX_MAP).find((c) => c.toLowerCase() === lower);
      if (matchedCity) return matchedCity;

      if (token.length > 2) {
        return token.charAt(0).toUpperCase() + token.slice(1);
      }
    }
  }

  // 4. Fallback: outward district or "UK"
  if (outward) {
    const fallback = getCityNameFromOutwardCode(outward);
    if (fallback && !/^\d[A-Za-z]{2}$/i.test(fallback)) {
      return fallback;
    }
  }

  return "UK";
}

/**
 * Formats a city name to clean Title Case. Rejects inward postcodes like "1aa".
 */
export function formatCityName(city = "") {
  if (!city || typeof city !== "string") return "";
  const trimmed = city.trim();
  if (!trimmed) return "";
  if (trimmed.toLowerCase() === "other") return "Other";
  if (trimmed.toLowerCase() === "unassigned") return "Unassigned";
  // Reject inward postcodes like "1aa" or raw outward code
  if (/^\d[a-zA-Z]{2}$/i.test(trimmed)) return "";

  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns consistent styling classes for city badges across all cities
 */
export function getCityBadgeClass(city = "") {
  return "bg-teal-50 text-teal-800 border-teal-200";
}
