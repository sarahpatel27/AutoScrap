function getCityFromPostcode(postcode = '', address = '') {
  if (!postcode && !address) return 'Unassigned';

  const cleanPostcode = String(postcode).trim().toUpperCase();
  const cleanAddress = String(address).trim().toUpperCase();
  const fullText = `${cleanPostcode} ${cleanAddress}`;

  const TARGET_CITIES = [
    'Doncaster',
    'Leicester',
    'Peterborough',
    'London',
    'Cambridge',
    'Liverpool',
    'Manchester',
  ];

  for (const city of TARGET_CITIES) {
    if (fullText.includes(city.toUpperCase())) {
      return city;
    }
  }

  if (fullText.includes('DON')) return 'Doncaster';
  if (fullText.includes('LEI')) return 'Leicester';
  if (fullText.includes('PBO')) return 'Peterborough';
  if (fullText.includes('LDN')) return 'London';
  if (fullText.includes('CBG')) return 'Cambridge';
  if (fullText.includes('LIV')) return 'Liverpool';
  if (fullText.includes('MAN')) return 'Manchester';

  const outwardMatch = cleanPostcode.match(/^([A-Z]{1,2})\d/);
  if (outwardMatch) {
    const area = outwardMatch[1];
    if (area === 'DN') return 'Doncaster';
    if (area === 'LE') return 'Leicester';
    if (area === 'PE') return 'Peterborough';
    if (area === 'CB') return 'Cambridge';

    const londonAreas = [
      'E',
      'EC',
      'N',
      'NW',
      'SE',
      'SW',
      'W',
      'WC',
      'BR',
      'CR',
      'DA',
      'EN',
      'HA',
      'IG',
      'KT',
      'RM',
      'SM',
      'TW',
      'UB',
      'WD',
    ];
    if (londonAreas.includes(area)) return 'London';
  }

  if (/^L\d/.test(cleanPostcode)) return 'Liverpool';
  if (/^M\d/.test(cleanPostcode)) return 'Manchester';

  return 'Other';
}

module.exports = {
  getCityFromPostcode,
};
