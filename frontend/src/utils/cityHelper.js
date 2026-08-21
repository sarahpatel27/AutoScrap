export const SUPPORTED_SERVICE_AREAS = [
  'DONCASTER',
  'LEICESTER',
  'PETERBOROUGH',
  'LONDON',
  'CAMBRIDGE',
  'LIVERPOOL',
  'MANCHESTER',
];

export const TARGET_CITIES = SUPPORTED_SERVICE_AREAS.map(
  (city) => city.charAt(0) + city.slice(1).toLowerCase(),
);

export const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', icon: '⏳' },
  { value: 'Contacted', label: 'Contacted', icon: '📞' },
  { value: 'Accepted', label: 'Accepted', icon: '🤝' },
  { value: 'Collected', label: 'Collected', icon: '🚚' },
  { value: 'Cancelled', label: 'Cancelled', icon: '❌' },
];

const LONDON_BOROUGHS = [
  'CITY OF LONDON', 'WESTMINSTER', 'CAMDEN', 'ISLINGTON', 'HACKNEY',
  'TOWER HAMLETS', 'GREENWICH', 'LEWISHAM', 'SOUTHWARK', 'LAMBETH',
  'WANDSWORTH', 'HAMMERSMITH AND FULHAM', 'KENSINGTON AND CHELSEA',
  'BRENT', 'EALING', 'HOUNSLOW', 'RICHMOND UPON THAMES', 'KINGSTON UPON THAMES',
  'MERTON', 'SUTTON', 'CROYDON', 'BROMLEY', 'BEXLEY', 'HAVERING',
  'BARKING AND DAGENHAM', 'REDBRIDGE', 'WALTHAM FOREST', 'HARINGEY',
  'ENFIELD', 'BARNET', 'HARROW', 'HILLINGDON',
];

const LONDON_OUTWARD_CODES = [
  'E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC',
  'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TW', 'UB', 'WD',
];

const MANCHESTER_BOROUGHS = [
  'MANCHESTER', 'SALFORD', 'TRAFFORD', 'STOCKPORT', 'TAMESIDE',
  'OLDHAM', 'ROCHDALE', 'BURY', 'BOLTON', 'WIGAN',
];

const LIVERPOOL_BOROUGHS = [
  'LIVERPOOL', 'KNOWSLEY', 'SEFTON', 'ST. HELENS', 'ST HELENS', 'WIRRAL',
];

const LEICESTER_BOROUGHS = [
  'LEICESTER', 'BLABY', 'CHARNWOOD', 'HARBOROUGH', 'HINCKLEY AND BOSWORTH',
  'MELTON', 'OADBY AND WIGSTON', 'NORTH WEST LEICESTERSHIRE',
];

const CAMBRIDGE_DISTRICTS = [
  'CAMBRIDGE', 'SOUTH CAMBRIDGESHIRE', 'EAST CAMBRIDGESHIRE',
];

/**
 * Normalises a value by trimming and converting to uppercase.
 */
export function normaliseText(value) {
  return value?.trim().toUpperCase() || '';
}

/**
 * Determines whether the given postcode / address info corresponds to a supported service area.
 * Inspects PostTown, AdminDistrict, AdminCounty, and outward codes.
 */
export function determineServiceArea({ postTown, adminDistrict, adminCounty, postcode, addressList = [] }) {
  const normPostTown = normaliseText(postTown);
  const normAdminDistrict = normaliseText(adminDistrict);
  const normAdminCounty = normaliseText(adminCounty);
  const cleanPostcode = normaliseText(postcode);

  // 1. Inspect FormattedAddressLines.PostTown from address list
  for (const item of addressList) {
    const itemPostTown = normaliseText(item.FormattedAddressLines?.PostTown || item.postTown);
    if (itemPostTown && SUPPORTED_SERVICE_AREAS.includes(itemPostTown)) {
      return itemPostTown;
    }
  }

  // 2. Direct postTown / adminDistrict match
  if (normPostTown && SUPPORTED_SERVICE_AREAS.includes(normPostTown)) {
    return normPostTown;
  }
  if (normAdminDistrict && SUPPORTED_SERVICE_AREAS.includes(normAdminDistrict)) {
    return normAdminDistrict;
  }

  // 3. Defensive check against known counties & districts
  if (
    normAdminCounty === 'GREATER LONDON' ||
    (normAdminDistrict && LONDON_BOROUGHS.includes(normAdminDistrict))
  ) {
    return 'LONDON';
  }

  if (
    normAdminCounty === 'GREATER MANCHESTER' ||
    (normAdminDistrict && MANCHESTER_BOROUGHS.includes(normAdminDistrict))
  ) {
    return 'MANCHESTER';
  }

  if (
    normAdminCounty === 'MERSEYSIDE' ||
    (normAdminDistrict && LIVERPOOL_BOROUGHS.includes(normAdminDistrict))
  ) {
    return 'LIVERPOOL';
  }

  if (
    normAdminCounty === 'LEICESTERSHIRE' ||
    (normAdminDistrict && LEICESTER_BOROUGHS.includes(normAdminDistrict))
  ) {
    return 'LEICESTER';
  }

  if (
    normAdminCounty === 'CAMBRIDGESHIRE' ||
    (normAdminDistrict && CAMBRIDGE_DISTRICTS.includes(normAdminDistrict))
  ) {
    return 'CAMBRIDGE';
  }

  if (normAdminDistrict === 'PETERBOROUGH') {
    return 'PETERBOROUGH';
  }

  if (normAdminDistrict === 'DONCASTER') {
    return 'DONCASTER';
  }

  // 4. Outward code fallback
  const outwardMatch = cleanPostcode.match(/^([A-Z]{1,2})\d/);
  if (outwardMatch) {
    const area = outwardMatch[1];
    if (area === 'DN') return 'DONCASTER';
    if (area === 'LE') return 'LEICESTER';
    if (area === 'PE') return 'PETERBOROUGH';
    if (area === 'CB') return 'CAMBRIDGE';
    if (LONDON_OUTWARD_CODES.includes(area)) return 'LONDON';
  }

  if (/^L\d/.test(cleanPostcode)) return 'LIVERPOOL';
  if (/^M\d/.test(cleanPostcode)) return 'MANCHESTER';

  return null;
}

export function getCityFromPostcode(postcode = '', address = '') {
  if (!postcode && !address) return 'Unassigned';

  const matchedArea = determineServiceArea({
    postcode,
    postTown: address,
  });

  if (matchedArea) {
    return matchedArea.charAt(0) + matchedArea.slice(1).toLowerCase();
  }

  return 'Other';
}
