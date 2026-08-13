export const TARGET_CITIES = [
  'Doncaster',
  'Leicester',
  'Peterborough',
  'London',
  'Cambridge',
  'Liverpool',
  'Manchester',
];

export const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', icon: '⏳' },
  { value: 'Contacted', label: 'Contacted', icon: '📞' },
  { value: 'Accepted', label: 'Accepted', icon: '🤝' },
  { value: 'Collected', label: 'Collected', icon: '🚚' },
  { value: 'Cancelled', label: 'Cancelled', icon: '❌' },
];

export function getCityFromPostcode(postcode = '', address = '') {
  if (!postcode && !address) return 'Unassigned';

  const cleanPostcode = (postcode || '').trim().toUpperCase();
  const cleanAddress = (address || '').trim().toUpperCase();
  const fullText = `${cleanPostcode} ${cleanAddress}`;

  // 1. Check explicit city names in text
  for (const city of TARGET_CITIES) {
    if (fullText.includes(city.toUpperCase())) {
      return city;
    }
  }

  // Common abbreviations
  if (fullText.includes('DON')) return 'Doncaster';
  if (fullText.includes('LEI')) return 'Leicester';
  if (fullText.includes('PBO')) return 'Peterborough';
  if (fullText.includes('LDN')) return 'London';
  if (fullText.includes('CBG')) return 'Cambridge';
  if (fullText.includes('LIV')) return 'Liverpool';
  if (fullText.includes('MAN')) return 'Manchester';

  // 2. UK Postcode Outward Area mapping (extract outward code letters)
  const outwardMatch = cleanPostcode.match(/^([A-Z]{1,2})\d/);
  if (outwardMatch) {
    const area = outwardMatch[1];

    if (area === 'DN') return 'Doncaster';
    if (area === 'LE') return 'Leicester';
    if (area === 'PE') return 'Peterborough';
    if (area === 'CB') return 'Cambridge';

    // London Postal Areas
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

  // 3. Single-letter prefixes for Liverpool (L) and Manchester (M)
  if (/^L\d/.test(cleanPostcode)) return 'Liverpool';
  if (/^M\d/.test(cleanPostcode)) return 'Manchester';

  return 'Other';
}
