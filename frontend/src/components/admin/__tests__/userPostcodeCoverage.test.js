import assert from 'node:assert';

// Test token parsing helper
function parsePostcodeTokens(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/[\s,;]+/)
    .map((token) => token.trim().toUpperCase())
    .filter((token) => token.length >= 2);
}

// Test natural sorting helper
function sortPostcodes(list) {
  return [...list].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
}

// Test filter logic
function filterUsers(users, searchQuery) {
  if (!searchQuery.trim()) return users;
  const query = searchQuery.toLowerCase().trim();
  return users.filter((u) => {
    const nameMatch = (u.name || '').toLowerCase().includes(query);
    const emailMatch = (u.email || '').toLowerCase().includes(query);
    const roleMatch = (u.role || '').toLowerCase().includes(query);
    const postcodeMatch = (u.coveredPostcodes || []).some((code) =>
      code.toLowerCase().includes(query)
    );
    return nameMatch || emailMatch || roleMatch || postcodeMatch;
  });
}

// Test Area Grouping logic for Scrap Rate configurator
function extractAreaGroups(districts) {
  const map = {};
  districts.forEach((d) => {
    const prefix = d.match(/^[A-Z]+/i)?.[0]?.toUpperCase() || 'OTHER';
    map[prefix] = (map[prefix] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([prefix, count]) => ({ prefix, count }));
}

// Test Dealer Role Display formatting vs Assigned Areas
function formatDealerRoleDisplay(postcodes, isSuperAdmin = false) {
  if (isSuperAdmin) return 'Super Administrator';
  if (!postcodes || postcodes.length === 0) return 'Dealer (All UK)';
  if (postcodes.length <= 3) return `Dealer (${postcodes.join(', ')})`;
  const firstThree = postcodes.slice(0, 3).join(', ');
  const remainingCount = postcodes.length - 3;
  return `Dealer (${firstThree}, +${remainingCount} more)`;
}

console.log('--- Testing Postcode Token Parsing ---');
const rawInput = 'PE1, PE2,  CB1 ; CB23\nMK40  PE30';
const parsed = parsePostcodeTokens(rawInput);
assert.deepStrictEqual(parsed, ['PE1', 'PE2', 'CB1', 'CB23', 'MK40', 'PE30']);
console.log('✔ Bulk multi-delimiter postcode parsing works as expected');

console.log('--- Testing Natural Postcode Sorting ---');
const unsorted = ['PE12', 'PE2', 'CB1', 'PE1', 'IP27', 'MK40', 'CB23'];
const sorted = sortPostcodes(unsorted);
assert.deepStrictEqual(sorted, ['CB1', 'CB23', 'IP27', 'MK40', 'PE1', 'PE2', 'PE12']);
console.log('✔ Natural alphanumeric sorting works as expected');

console.log('--- Testing User Search Filter by Postcode, Name, Email ---');
const sampleUsers = [
  {
    id: 1,
    name: 'Ali Bin Ejaz',
    email: 'aleebinejaz@gmail.com',
    role: 'City Dealer',
    coveredPostcodes: ['PE1', 'PE2', 'PE30', 'CB1', 'MK40'],
  },
  {
    id: 2,
    name: 'Nadeem Baig',
    email: 'admin@myautoscrap.co.uk',
    role: 'Super Admin',
    coveredPostcodes: [],
  },
];

// Search by postcode
const foundByPostcode = filterUsers(sampleUsers, 'PE30');
assert.strictEqual(foundByPostcode.length, 1);
assert.strictEqual(foundByPostcode[0].name, 'Ali Bin Ejaz');

// Search by dealer name
const foundByName = filterUsers(sampleUsers, 'Nadeem');
assert.strictEqual(foundByName.length, 1);
assert.strictEqual(foundByName[0].role, 'Super Admin');

// Search by partial email
const foundByEmail = filterUsers(sampleUsers, 'aleebinejaz');
assert.strictEqual(foundByEmail.length, 1);

console.log('✔ User search filter works across name, email, role, and assigned postcodes');

console.log('--- Testing Scrap Rate Area Grouping ---');
const sampleDistricts = [
  'CB1', 'CB23', 'CB24', 'CH1', 'CH2', 'CW1', 'IP27', 'MK40', 'MK41',
  'PE1', 'PE2', 'PE3', 'PE10', 'SY1', 'WA7'
];
const areaGroups = extractAreaGroups(sampleDistricts);
assert.deepStrictEqual(areaGroups, [
  { prefix: 'CB', count: 3 },
  { prefix: 'CH', count: 2 },
  { prefix: 'CW', count: 1 },
  { prefix: 'IP', count: 1 },
  { prefix: 'MK', count: 2 },
  { prefix: 'PE', count: 4 },
  { prefix: 'SY', count: 1 },
  { prefix: 'WA', count: 1 },
]);
console.log('✔ Area code grouping cleanly extracts area prefixes and counts');

console.log('--- Testing Dealer Role Display vs Full Assigned Areas ---');
const all47Postcodes = [
  'PE1', 'PE2', 'PE3', 'PE4', 'PE5', 'PE6', 'PE7', 'PE8', 'PE9', 'PE10',
  'PE11', 'PE12', 'PE13', 'PE14', 'PE15', 'PE16', 'PE17', 'PE18', 'PE19', 'PE25',
  'PE26', 'PE27', 'PE28', 'PE29', 'PE30', 'PE32', 'PE33', 'PE34', 'PE37', 'PE38',
  'CB1', 'CB3', 'CB4', 'CB5', 'CB23', 'CB24', 'CB25', 'CB6', 'CB7', 'CB8',
  'MK40', 'MK41', 'MK42', 'MK43', 'MK44', 'MK45', 'IP27'
];
const sorted47 = sortPostcodes(all47Postcodes);
const roleTitle = formatDealerRoleDisplay(sorted47, false);
assert.strictEqual(roleTitle, 'Dealer (CB1, CB3, CB4, +44 more)');
assert.strictEqual(sorted47.length, 47); // All 47 preserved for Assigned Areas
console.log('✔ Role title correctly shows first 3 and +44 more while preserving all 47 for assigned areas');

console.log('All dealer coverage and scrap rate tests passed successfully!');
