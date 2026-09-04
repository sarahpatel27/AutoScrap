const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { extractOutwardCode } = require('../postcodeHelper');

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
