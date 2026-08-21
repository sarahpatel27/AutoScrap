const { isDealerEligibleForEnquiry } = require('../dealerEligibility');

describe('Server-Side Dealer Eligibility Validation', () => {
  const superAdmin = { id: 1, role: 'Super Admin', assignedCity: null };
  const manchesterDealer = { id: 2, role: 'City Dealer', assignedCity: 'Manchester' };
  const londonDealer = { id: 3, role: 'City Dealer', assignedCity: 'London' };

  const manchesterEnquiry = {
    id: '101',
    postcode: 'M1 1AA',
    city: 'Manchester',
  };

  const londonEnquiry = {
    id: '102',
    postcode: 'SW1A 1AA',
    city: 'London',
  };

  test('Super Admin is eligible for all UK enquiries', () => {
    expect(isDealerEligibleForEnquiry(superAdmin, manchesterEnquiry)).toBe(true);
    expect(isDealerEligibleForEnquiry(superAdmin, londonEnquiry)).toBe(true);
  });

  test('All authenticated dealers (Super Admin & City Dealers) are eligible for UK high-value enquiries', () => {
    expect(isDealerEligibleForEnquiry(manchesterDealer, manchesterEnquiry)).toBe(true);
    expect(isDealerEligibleForEnquiry(manchesterDealer, londonEnquiry)).toBe(true);

    expect(isDealerEligibleForEnquiry(londonDealer, londonEnquiry)).toBe(true);
    expect(isDealerEligibleForEnquiry(londonDealer, manchesterEnquiry)).toBe(true);
  });

  test('Rejects invalid dealer objects (null or unauthenticated)', () => {
    expect(isDealerEligibleForEnquiry(null, manchesterEnquiry)).toBe(false);
    expect(isDealerEligibleForEnquiry({ role: 'Guest' }, manchesterEnquiry)).toBe(false);
  });
});
