const SUPPORTED_SERVICE_AREAS = [
  'DONCASTER',
  'LEICESTER',
  'PETERBOROUGH',
  'LONDON',
  'CAMBRIDGE',
  'LIVERPOOL',
  'MANCHESTER',
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
 * Defensively determines whether a postcode/address details match one of the central SUPPORTED_SERVICE_AREAS.
 * @param {Object} addressDetails - Vehicle Data Global AddressDetails object or params
 * @param {Array} addressDetails.addressList - AddressList array
 * @param {Object} addressDetails.locationDetails - LocationDetails object
 * @param {string} addressDetails.postcode - Clean input postcode
 * @returns {string|null} The matched service area name in uppercase, or null if unsupported.
 */
function determineServiceArea(addressDetails = {}) {
  const { addressList = [], locationDetails = {}, postcode = '' } = addressDetails;
  const cleanPostcode = String(postcode).trim().toUpperCase();

  // 1. Inspect FormattedAddressLines.PostTown from AddressList items
  for (const item of addressList) {
    const postTown = item.FormattedAddressLines?.PostTown?.trim().toUpperCase();
    if (postTown && SUPPORTED_SERVICE_AREAS.includes(postTown)) {
      return postTown;
    }
  }

  // 2. Inspect OnsGeography.AdminDistrict.Name & AdminCounty.Name
  const ons = locationDetails.OnsGeography || {};
  const adminDistrict = ons.AdminDistrict?.Name?.trim().toUpperCase();
  const adminCounty = ons.AdminCounty?.Name?.trim().toUpperCase();

  if (adminDistrict && SUPPORTED_SERVICE_AREAS.includes(adminDistrict)) {
    return adminDistrict;
  }

  // 3. Defensive check using admin regions & boroughs
  if (
    postTownMatches(addressList, 'LONDON') ||
    adminCounty === 'GREATER LONDON' ||
    (adminDistrict && LONDON_BOROUGHS.includes(adminDistrict))
  ) {
    return 'LONDON';
  }

  if (
    postTownMatches(addressList, 'MANCHESTER') ||
    adminCounty === 'GREATER MANCHESTER' ||
    (adminDistrict && MANCHESTER_BOROUGHS.includes(adminDistrict))
  ) {
    return 'MANCHESTER';
  }

  if (
    postTownMatches(addressList, 'LIVERPOOL') ||
    adminCounty === 'MERSEYSIDE' ||
    (adminDistrict && LIVERPOOL_BOROUGHS.includes(adminDistrict))
  ) {
    return 'LIVERPOOL';
  }

  if (
    postTownMatches(addressList, 'LEICESTER') ||
    adminCounty === 'LEICESTERSHIRE' ||
    (adminDistrict && LEICESTER_BOROUGHS.includes(adminDistrict))
  ) {
    return 'LEICESTER';
  }

  if (
    postTownMatches(addressList, 'CAMBRIDGE') ||
    adminCounty === 'CAMBRIDGESHIRE' ||
    (adminDistrict && CAMBRIDGE_DISTRICTS.includes(adminDistrict))
  ) {
    return 'CAMBRIDGE';
  }

  if (postTownMatches(addressList, 'PETERBOROUGH') || adminDistrict === 'PETERBOROUGH') {
    return 'PETERBOROUGH';
  }

  if (postTownMatches(addressList, 'DONCASTER') || adminDistrict === 'DONCASTER') {
    return 'DONCASTER';
  }

  // 4. Outward Postcode Area fallback check
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

function postTownMatches(addressList, targetCity) {
  return addressList.some(
    (item) => item.FormattedAddressLines?.PostTown?.trim().toUpperCase() === targetCity,
  );
}

function getCityFromPostcode(postcode = '', address = '') {
  if (!postcode && !address) return 'Unassigned';

  const matched = determineServiceArea({
    postcode,
    addressList: address ? [{ FormattedAddressLines: { PostTown: address } }] : [],
  });

  if (matched) {
    return matched.charAt(0) + matched.slice(1).toLowerCase();
  }

  return 'Other';
}

module.exports = {
  SUPPORTED_SERVICE_AREAS,
  determineServiceArea,
  getCityFromPostcode,
};
