const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { extractOutwardCode, getCityNameFromOutwardCode } = require('../postcodeHelper');

describe('UK Outward District Postcode Extraction', () => {
  it('correctly extracts outward code from standard UK postcodes with space', () => {
    assert.equal(extractOutwardCode('PE1 1AA'), 'PE1');
    assert.equal(extractOutwardCode('PE29 4TU'), 'PE29');
    assert.equal(extractOutwardCode('SW1A 1AA'), 'SW1A');
    assert.equal(extractOutwardCode('M1 1AE'), 'M1');
    assert.equal(extractOutwardCode('B1 2AB'), 'B1');
    assert.equal(extractOutwardCode('CB1 3DF'), 'CB1');
    assert.equal(extractOutwardCode('EC1A 1BB'), 'EC1A');
  });

  it('correctly extracts outward code from postcodes without spaces', () => {
    assert.equal(extractOutwardCode('PE11AA'), 'PE1');
    assert.equal(extractOutwardCode('PE294TU'), 'PE29');
    assert.equal(extractOutwardCode('SW1A1AA'), 'SW1A');
    assert.equal(extractOutwardCode('M11AE'), 'M1');
  });

  it('normalizes lowercase or extra-spaced postcodes', () => {
    assert.equal(extractOutwardCode('  pe2   8ty '), 'PE2');
    assert.equal(extractOutwardCode('cb21 5aa'), 'CB21');
  });

  it('handles already-truncated outward district inputs', () => {
    assert.equal(extractOutwardCode('PE1'), 'PE1');
    assert.equal(extractOutwardCode('pe2'), 'PE2');
    assert.equal(extractOutwardCode('SW1A'), 'SW1A');
  });

  it('handles empty or non-string inputs safely', () => {
    assert.equal(extractOutwardCode(''), '');
    assert.equal(extractOutwardCode(null), '');
    assert.equal(extractOutwardCode(undefined), '');
  });
});

describe('Dealer Postcode Coverage Matching Logic', () => {
  const dealerA = {
    id: 1,
    name: 'Peterborough North Dealer',
    role: 'City Dealer',
    coveredPostcodes: ['PE1', 'PE2', 'PE3'],
  };

  const dealerB = {
    id: 2,
    name: 'Peterborough East Dealer',
    role: 'City Dealer',
    coveredPostcodes: ['PE2', 'PE4', 'PE5'],
  };

  const dealerC = {
    id: 3,
    name: 'Cambridge Dealer',
    role: 'City Dealer',
    coveredPostcodes: ['CB1', 'CB2'],
  };

  const dealers = [dealerA, dealerB, dealerC];

  function getMatchingDealers(postcode) {
    const outward = extractOutwardCode(postcode);
    return dealers.filter((d) => (d.coveredPostcodes || []).includes(outward));
  }

  it('matches only Dealer A for PE1', () => {
    const matches = getMatchingDealers('PE1 4AA');
    assert.equal(matches.length, 1);
    assert.equal(matches[0].name, 'Peterborough North Dealer');
  });

  it('matches BOTH Dealer A and Dealer B for overlapping PE2', () => {
    const matches = getMatchingDealers('PE2 8TY');
    assert.equal(matches.length, 2);
    const names = matches.map((m) => m.name);
    assert.ok(names.includes('Peterborough North Dealer'));
    assert.ok(names.includes('Peterborough East Dealer'));
  });

  it('matches only Dealer C for CB1', () => {
    const matches = getMatchingDealers('CB1 1AA');
    assert.equal(matches.length, 1);
    assert.equal(matches[0].name, 'Cambridge Dealer');
  });

  it('returns no matching dealers for uncovered district PE15', () => {
    const matches = getMatchingDealers('PE15 2XY');
    assert.equal(matches.length, 0);
  });
});

describe('Dealer District Scrap Rate Isolation and Authorization', () => {
  const dealer = {
    id: 4,
    name: 'Peterborough Dealer',
    role: 'City Dealer',
    coveredPostcodes: ['PE1', 'PE2'],
  };

  const allDistrictPricing = {
    PE1: 245.5,
    PE2: 240.0,
    CB1: 235.0,
    SW1A: 260.0,
    M1: 250.0,
  };

  function canDealerUpdateDistrict(user, targetDistrict) {
    if (user.role === 'Super Admin') return true;
    if (user.role === 'City Dealer') {
      const covered = (user.coveredPostcodes || []).map((p) => p.toUpperCase());
      return covered.includes(targetDistrict.toUpperCase());
    }
    return false;
  }

  function getVisibleDistrictPricing(user, districtRates) {
    if (user.role === 'Super Admin') return districtRates;
    if (user.role === 'City Dealer') {
      const covered = new Set((user.coveredPostcodes || []).map((p) => p.toUpperCase()));
      const filtered = {};
      for (const [k, v] of Object.entries(districtRates)) {
        if (covered.has(k.toUpperCase())) {
          filtered[k] = v;
        }
      }
      return filtered;
    }
    return {};
  }

  it('allows dealer to update scrap rate for their own assigned district PE1', () => {
    assert.equal(canDealerUpdateDistrict(dealer, 'PE1'), true);
    assert.equal(canDealerUpdateDistrict(dealer, 'pe2'), true);
  });

  it('FORBIDS dealer from updating scrap rate for another town/district (CB1, SW1A, M1)', () => {
    assert.equal(canDealerUpdateDistrict(dealer, 'CB1'), false);
    assert.equal(canDealerUpdateDistrict(dealer, 'SW1A'), false);
    assert.equal(canDealerUpdateDistrict(dealer, 'M1'), false);
    assert.equal(canDealerUpdateDistrict(dealer, 'PE15'), false);
  });

  it('strictly isolates pricing visibility so dealer can ONLY see their own districts', () => {
    const visible = getVisibleDistrictPricing(dealer, allDistrictPricing);
    assert.deepEqual(Object.keys(visible).sort(), ['PE1', 'PE2']);
    assert.equal(visible.CB1, undefined);
    assert.equal(visible.SW1A, undefined);
    assert.equal(visible.M1, undefined);
  });

  it('allows Super Admin to view and update any district rate', () => {
    const admin = { id: 1, role: 'Super Admin' };
    assert.equal(canDealerUpdateDistrict(admin, 'CB1'), true);
    assert.equal(canDealerUpdateDistrict(admin, 'SW1A'), true);
    const visible = getVisibleDistrictPricing(admin, allDistrictPricing);
    assert.equal(Object.keys(visible).length, 5);
  });
});

describe('Outward District to City Resolution & Active Coverage Aggregation', () => {
  it('accurately resolves UK outward codes to their correct city/town names', () => {
    assert.equal(getCityNameFromOutwardCode('PE1'), 'Peterborough');
    assert.equal(getCityNameFromOutwardCode('PE29'), 'Peterborough');
    assert.equal(getCityNameFromOutwardCode('M13'), 'Manchester');
    assert.equal(getCityNameFromOutwardCode('SW1A'), 'London');
    assert.equal(getCityNameFromOutwardCode('LE2'), 'Leicester');
    assert.equal(getCityNameFromOutwardCode('DN4'), 'Doncaster');
    assert.equal(getCityNameFromOutwardCode('B15'), 'Birmingham');
    assert.equal(getCityNameFromOutwardCode('CB1'), 'Cambridge');
    assert.equal(getCityNameFromOutwardCode('L1'), 'Liverpool');
  });

  it('aggregates active coverage dynamically so ONLY areas with active dealers are returned', () => {
    const activeDealers = [
      { id: 1, isActive: true, coveredPostcodes: ['PE1', 'PE2'] },
      { id: 2, isActive: true, coveredPostcodes: ['LE1', 'LE2', 'LE3'] },
      { id: 3, isActive: true, coveredPostcodes: ['M13', 'SW1A'] },
      { id: 4, isActive: false, coveredPostcodes: ['DN1', 'DN2'] }, // Inactive dealer
    ];

    const activeGroups = new Map();
    for (const dealer of activeDealers) {
      if (!dealer.isActive) continue; // Inactive dealers are excluded
      for (const pc of dealer.coveredPostcodes) {
        const outcode = extractOutwardCode(pc);
        const city = getCityNameFromOutwardCode(outcode);
        if (!activeGroups.has(city)) {
          activeGroups.set(city, { name: city, postcodes: new Set(), dealerCount: 0 });
        }
        const group = activeGroups.get(city);
        group.postcodes.add(outcode);
        group.dealerCount += 1;
      }
    }

    assert.equal(activeGroups.has('Peterborough'), true);
    assert.equal(activeGroups.has('Leicester'), true);
    assert.equal(activeGroups.has('Manchester'), true);
    assert.equal(activeGroups.has('London'), true);
    assert.equal(activeGroups.has('Doncaster'), false); // Dealer 4 is inactive, must NOT show!

    assert.deepEqual(Array.from(activeGroups.get('Peterborough').postcodes).sort(), ['PE1', 'PE2']);
    assert.deepEqual(Array.from(activeGroups.get('Leicester').postcodes).sort(), ['LE1', 'LE2', 'LE3']);
    assert.deepEqual(Array.from(activeGroups.get('Manchester').postcodes), ['M13']);
    assert.deepEqual(Array.from(activeGroups.get('London').postcodes), ['SW1A']);
  });
});

describe('Dealer Bids Anonymizer Postcode Resolution', () => {
  const { anonymizeEnquiryForDealer } = require('../dealerAnonymizer');

  it('maps dealer coveredPostcodes to dealerPostcodes and coveredPostcodes in bids array for Admin', () => {
    const admin = { id: 1, role: 'Super Admin' };
    const fakeRow = {
      id: 99,
      reference: 'MAS-HV-2026-0001',
      customerName: 'Test Customer',
      customerEmail: 'customer@test.co.uk',
      customerPhone: '07123456789',
      postcode: 'PE1 1AA',
      createdAt: new Date(),
      bids: [
        {
          id: 101,
          dealerId: 10,
          amount: '1850.00',
          status: 'ACTIVE',
          createdAt: new Date(),
          dealer: {
            id: 10,
            name: 'Peterborough Breakers',
            email: 'pt@dealers.co.uk',
            assignedCity: 'Peterborough',
            coveredPostcodes: ['PE1', 'PE2', 'PE3'],
          },
        },
        {
          id: 102,
          dealerId: 20,
          amount: '1700.00',
          status: 'ACTIVE',
          createdAt: new Date(),
          dealer: {
            id: 20,
            name: 'Nationwide Dealer',
            email: 'all@dealers.co.uk',
            assignedCity: 'UK',
            coveredPostcodes: [],
          },
        },
      ],
    };

    const result = anonymizeEnquiryForDealer(fakeRow, admin);
    assert.equal(result.bids.length, 2);

    // Dealer 1 with coveredPostcodes ['PE1', 'PE2', 'PE3']
    assert.equal(result.bids[0].dealerName, 'Peterborough Breakers');
    assert.deepEqual(result.bids[0].coveredPostcodes, ['PE1', 'PE2', 'PE3']);
    assert.equal(result.bids[0].dealerPostcodes, 'PE1, PE2, PE3');

    // Dealer 2 with no coveredPostcodes (fallback to All UK)
    assert.equal(result.bids[1].dealerName, 'Nationwide Dealer');
    assert.deepEqual(result.bids[1].coveredPostcodes, []);
    assert.equal(result.bids[1].dealerPostcodes, 'All UK');
  });
});

describe('Standard Enquiry Cancelled Status Email Generation', () => {
  const { customerCancelledEnquiryTemplate } = require('../../templates/emails/customerCancelledEnquiry');

  it('generates accurate subject, reference, and vehicle summary for cancelled status email', () => {
    const template = customerCancelledEnquiryTemplate({
      reference: 'MAS-2026-99123',
      customerName: 'Sarah Connor',
      vehicle: {
        registration: 'AB12 CDE',
        make: 'Ford',
        model: 'Fiesta',
        year: 2012,
      },
      quoteAmount: 285.50,
      collectionAddress: '10 High Street',
      postcode: 'PE1 1AA',
    });

    assert.equal(template.subject, 'Scrap Vehicle Enquiry Cancelled - Reference MAS-2026-99123');
    assert.ok(template.html.includes('MAS-2026-99123'));
    assert.ok(template.html.includes('Status: Cancelled'));
    assert.ok(template.html.includes('AB12 CDE'));
    assert.ok(template.html.includes('Ford Fiesta (2012)'));
    assert.ok(template.html.includes('£285.50'));
    assert.ok(template.html.includes('Sarah Connor'));
  });
});


