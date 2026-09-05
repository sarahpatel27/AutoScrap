const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { extractOutwardCode, getCityNameFromOutwardCode, getCityFromPostcode } = require('../postcodeHelper');
const { anonymizeEnquiryForDealer } = require('../dealerAnonymizer');

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

  it('excludes inactive districts from visible pricing when dealer is removed', () => {
    // Active dealers currently only cover PE1, PE2, CB1
    const activeDistricts = new Set(['PE1', 'PE2', 'CB1']);

    function getActiveOnlyDistrictPricing(rates, activeSet) {
      const result = {};
      for (const [k, v] of Object.entries(rates)) {
        if (activeSet.has(k.toUpperCase())) {
          result[k] = v;
        }
      }
      return result;
    }

    const visibleRates = getActiveOnlyDistrictPricing(allDistrictPricing, activeDistricts);
    assert.deepEqual(Object.keys(visibleRates).sort(), ['CB1', 'PE1', 'PE2']);
    assert.equal(visibleRates.SW1A, undefined); // Inactive district SW1A excluded
    assert.equal(visibleRates.M1, undefined);   // Inactive district M1 excluded

    // When dealer for PE2 is removed from territory
    activeDistricts.delete('PE2');
    const updatedVisibleRates = getActiveOnlyDistrictPricing(allDistrictPricing, activeDistricts);
    assert.deepEqual(Object.keys(updatedVisibleRates).sort(), ['CB1', 'PE1']);
    assert.equal(updatedVisibleRates.PE2, undefined); // PE2 no longer active, excluded from configuration
  });

  it('inherits parent city rate for districts without custom override while honoring specific district overrides', () => {
    // City pricing table: Peterborough = £100, Cambridge = £90
    const cityRates = {
      peterborough: 100,
      cambridge: 90,
    };

    // District pricing overrides: PE1 is specifically set to £20
    const customDistrictOverrides = {
      PE1: 20,
    };

    function resolveRateForDistrict(dist, overrides, cities, defaultBase = 235) {
      const cleanDist = dist.trim().toUpperCase();
      if (overrides[cleanDist] !== undefined) {
        return overrides[cleanDist];
      }
      const parentCity = getCityNameFromOutwardCode(cleanDist);
      if (parentCity && cities[parentCity.toLowerCase()] !== undefined) {
        return cities[parentCity.toLowerCase()];
      }
      return defaultBase;
    }

    // PE1 has specific district override of 20
    assert.equal(resolveRateForDistrict('PE1', customDistrictOverrides, cityRates), 20);

    // PE2, PE3, PE4 have no district override, so they inherit parent city (Peterborough = 100)
    assert.equal(resolveRateForDistrict('PE2', customDistrictOverrides, cityRates), 100);
    assert.equal(resolveRateForDistrict('PE3', customDistrictOverrides, cityRates), 100);
    assert.equal(resolveRateForDistrict('PE4', customDistrictOverrides, cityRates), 100);

    // CB1 has no override, inherits Cambridge city rate of 90
    assert.equal(resolveRateForDistrict('CB1', customDistrictOverrides, cityRates), 90);

    // A district in an unpriced town falls back to system base default 235
    assert.equal(resolveRateForDistrict('SW1A', customDistrictOverrides, cityRates), 235);
  });

  it('correctly maps Reading outward districts (RG1, RG2) and inherits city rate 180', () => {
    assert.equal(getCityNameFromOutwardCode('RG1'), 'Reading');
    assert.equal(getCityNameFromOutwardCode('RG2'), 'Reading');

    const cityRates = {
      reading: 180,
    };
    const customDistrictOverrides = {};

    function resolveRateForDistrict(dist, overrides, cities, defaultBase = 235) {
      const cleanDist = dist.trim().toUpperCase();
      if (overrides[cleanDist] !== undefined) {
        return overrides[cleanDist];
      }
      const parentCity = getCityNameFromOutwardCode(cleanDist);
      if (parentCity && cities[parentCity.toLowerCase()] !== undefined) {
        return cities[parentCity.toLowerCase()];
      }
      return defaultBase;
    }

    // RG2 inherits Reading city rate 180
    assert.equal(resolveRateForDistrict('RG2', customDistrictOverrides, cityRates), 180);
    assert.equal(resolveRateForDistrict('RG1', customDistrictOverrides, cityRates), 180);

    // Custom override on RG2 to 195
    customDistrictOverrides['RG2'] = 195;
    assert.equal(resolveRateForDistrict('RG2', customDistrictOverrides, cityRates), 195);
    assert.equal(resolveRateForDistrict('RG1', customDistrictOverrides, cityRates), 180);

    // Deleting override on RG2 reverts back to Reading's 180
    delete customDistrictOverrides['RG2'];
    assert.equal(resolveRateForDistrict('RG2', customDistrictOverrides, cityRates), 180);
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

describe('High-Value vs Standard Enquiry Purchased / Collected Customer Email Generation', () => {
  const { customerCollectedEnquiryTemplate } = require('../../templates/emails/customerCollectedEnquiry');
  const { sendHighValueEnquiryPurchasedEmail } = require('../../services/enquiryNotificationService');

  it('generates accurate subject, agreed settlement, and vehicle details for standard scrap collected customer email', () => {
    const template = customerCollectedEnquiryTemplate({
      reference: 'MAS-2026-77889',
      customerName: 'Marcus Rashford',
      vehicle: {
        registration: 'MR19 BPS',
        make: 'Audi',
        model: 'A4',
        year: 2019,
      },
      quoteAmount: 4850.00,
      collectionAddress: '12 Old Trafford Way',
      postcode: 'M16 0RA',
      collectionDate: new Date('2026-09-05T12:00:00Z'),
      isHighValue: false,
    });

    assert.equal(template.subject, 'Vehicle Collected Successfully - Reference MAS-2026-77889');
    assert.ok(template.html.includes('MAS-2026-77889'));
    assert.ok(template.html.includes('MR19 BPS'));
    assert.ok(template.html.includes('Audi A4 (2019)'));
    assert.ok(template.html.includes('Agreed Settlement'), 'Standard collected email MUST contain Agreed Settlement');
    assert.ok(template.html.includes('£4,850.00'));
    assert.ok(template.html.includes('Marcus Rashford'));
    assert.ok(template.html.includes('12 Old Trafford Way'));
    assert.ok(template.html.includes('M16 0RA'));
    assert.ok(template.html.includes('Your Vehicle Has Been Collected Successfully'));
  });

  it('strictly OMITS agreed settlement from email for High-Value enquiries when marked as purchased/collected', () => {
    const template = customerCollectedEnquiryTemplate({
      reference: 'MAS-HV-2026-77889',
      customerName: 'Marcus Rashford',
      vehicle: {
        registration: 'MR19 BPS',
        make: 'Audi',
        model: 'A4',
        year: 2019,
      },
      quoteAmount: 4850.00,
      collectionAddress: '12 Old Trafford Way',
      postcode: 'M16 0RA',
      collectionDate: new Date('2026-09-05T12:00:00Z'),
      isHighValue: true,
    });

    assert.equal(template.subject, 'Vehicle Collected Successfully - Reference MAS-HV-2026-77889');
    assert.ok(template.html.includes('MAS-HV-2026-77889'));
    assert.ok(template.html.includes('MR19 BPS'));
    assert.ok(template.html.includes('Audi A4 (2019)'));
    assert.ok(template.html.includes('Marcus Rashford'));
    assert.ok(template.html.includes('12 Old Trafford Way'));
    assert.ok(template.html.includes('M16 0RA'));
    assert.ok(template.html.includes('Your Vehicle Has Been Collected Successfully'));

    // Strictly ensure "agreed settlement" does NOT appear anywhere in the high-value email
    assert.ok(
      !template.html.toLowerCase().includes('agreed settlement'),
      'High-Value enquiry collected email must NOT contain Agreed Settlement'
    );
  });

  it('sendHighValueEnquiryPurchasedEmail safely processes high-value record without error', async () => {
    const fakeEnquiry = {
      id: 999,
      reference: 'HV-2026-99999',
      customerName: 'Jane Doe',
      customerEmail: 'customer@example.com',
      customerPhone: '07123456789',
      customer: {
        fullName: 'Jane Doe',
        email: 'customer@example.com',
        phone: '07123456789',
        collectionAddress: '10 High Street',
      },
      registration: 'JD67 CAR',
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2017,
      postcode: 'PE1 1AA',
      city: 'Peterborough',
      winningBidId: 55,
      bids: [
        { id: 54, amount: '3500.00', status: 'REJECTED' },
        { id: 55, amount: '3850.00', status: 'WINNING' },
      ],
      purchasedAt: new Date(),
    };

    // Should run smoothly without throwing an exception
    await assert.doesNotReject(async () => {
      await sendHighValueEnquiryPurchasedEmail(fakeEnquiry);
    });
  });
});

describe('Dealer Bidding Timer Termination Upon Winner Selection', () => {
  const { anonymizeEnquiryForDealer } = require('../dealerAnonymizer');

  it('forces timeRemaining to Ended when a winning dealer is selected even if 2 days remain', () => {
    const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 2 days in the future
    const rowWithWinner = {
      id: 101,
      reference: 'MAS-HV-2026-WINNER',
      status: 'DEALER_SELECTED',
      winningDealerId: 5,
      winningBidId: 12,
      biddingEndsAt: futureDate,
      estimatedValue: 2000,
      customerExpectedValue: 2200,
      registration: 'WN20 CAR',
      make: 'BMW',
      model: '5 Series',
      year: 2020,
      postcode: 'PE1 1AA',
      city: 'Peterborough',
      createdAt: new Date(),
      bids: [
        { id: 12, dealerId: 5, amount: '2300.00', status: 'WINNING', createdAt: new Date() },
      ],
    };

    const user = { id: 5, role: 'City Dealer' };
    const anonymized = anonymizeEnquiryForDealer(rowWithWinner, user);

    assert.equal(anonymized.timeRemaining, 'Ended');
    assert.equal(anonymized.status, 'DEALER_SELECTED');
    assert.ok(new Date(anonymized.biddingEndsAt) <= new Date());
  });

  it('shows countdown for active enquiry without winner when biddingEndsAt is in future', () => {
    const futureDate = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours in future
    const rowActive = {
      id: 102,
      reference: 'MAS-HV-2026-ACTIVE',
      status: 'BIDDING',
      winningDealerId: null,
      winningBidId: null,
      biddingEndsAt: futureDate,
      estimatedValue: 2000,
      customerExpectedValue: 2200,
      registration: 'AC20 CAR',
      make: 'Audi',
      model: 'A3',
      year: 2020,
      postcode: 'PE1 1AA',
      city: 'Peterborough',
      createdAt: new Date(),
      bids: [],
    };

    const user = { id: 5, role: 'City Dealer' };
    const anonymized = anonymizeEnquiryForDealer(rowActive, user);

    assert.notEqual(anonymized.timeRemaining, 'Ended');
    assert.ok(anonymized.timeRemaining.includes('h '));
  });
});

describe('High-Value Enquiry City Resolution and Inward Postcode Protection', () => {
  it('correctly resolves UK outward codes without returning inward code', () => {
    assert.equal(getCityNameFromOutwardCode('LU1'), 'Luton');
    assert.equal(getCityNameFromOutwardCode('LU2'), 'Luton');
    assert.equal(getCityNameFromOutwardCode('MK9'), 'Milton Keynes');
    assert.equal(getCityNameFromOutwardCode('IP1'), 'Ipswich');
    assert.equal(getCityNameFromOutwardCode('PE1'), 'Peterborough');
  });

  it('resolves city asynchronously via getCityFromPostcode without returning inward code 1aa', async () => {
    const luton = await getCityFromPostcode('LU1 1AA', 'Royal Mail, Luton Delivery Office, LU1 1AA');
    assert.equal(luton, 'Luton');
    assert.notEqual(luton.toLowerCase(), '1aa');

    const mk = await getCityFromPostcode('MK9 1AA', 'Midsummer Blvd, Milton Keynes, MK9 1AA');
    assert.equal(mk, 'Milton Keynes');
    assert.notEqual(mk.toLowerCase(), '1aa');

    const ipswich = await getCityFromPostcode('IP1 1AA', 'Crown Street, Ipswich, IP1 1AA');
    assert.equal(ipswich, 'Ipswich');
    assert.notEqual(ipswich.toLowerCase(), '1aa');
  });

  it('anonymizer sanitizes legacy 1aa city records and derives proper city and outwardDistrict', () => {
    const legacyRow = {
      id: 999,
      reference: 'MAS-HV-2026-LEGACY',
      status: 'BIDDING',
      postcode: 'LU1 1AA',
      city: '1aa',
      area: '1aa',
      registration: 'LU12 CAR',
      make: 'BMW',
      model: '3 Series',
      year: 2018,
      mileage: 45000,
      condition: 'Good',
      estimatedValue: 3500,
      customerExpectedValue: 3800,
      createdAt: new Date(),
      bids: [],
    };

    const user = { id: 1, role: 'Super Admin' };
    const anonymized = anonymizeEnquiryForDealer(legacyRow, user);

    assert.equal(anonymized.city, 'Luton');
    assert.equal(anonymized.area, 'Luton');
    assert.equal(anonymized.outwardDistrict, 'LU1');
    assert.notEqual(anonymized.city.toLowerCase(), '1aa');
  });
});



