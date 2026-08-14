const { anonymizeEnquiryForDealer } = require('../dealerAnonymizer');

describe('Server-Side Privacy & Anonymization before winning', () => {
  const superAdmin = { id: 1, role: 'Super Admin' };
  const dealerUser = { id: 2, role: 'City Dealer', assignedCity: 'Manchester' };

  const sampleRow = {
    id: 10,
    reference: 'MAS-HV-2026-8888',
    customerName: 'John Doe Private',
    customerEmail: 'john@private.com',
    customerPhone: '07123456789',
    registration: 'AB17 XYZ',
    make: 'Ford',
    model: 'Focus',
    year: 2017,
    mileage: 40000,
    condition: 'Good',
    postcode: 'M1 1AA',
    city: 'Manchester',
    estimatedValue: '1250.00',
    customerExpectedValue: '1400.00',
    valuePreference: 'CUSTOM_VALUE',
    status: 'BIDDING',
    winningDealerId: null,
    createdAt: new Date(),
    bids: [
      {
        id: 1,
        dealerId: 2,
        amount: '1300.00',
        status: 'ACTIVE',
        createdAt: new Date(),
        dealer: { id: 2, name: 'Manchester Motors', email: 'manchester@autoscrap.co.uk', assignedCity: 'Manchester' },
      },
      {
        id: 2,
        dealerId: 3,
        amount: '1350.00',
        status: 'ACTIVE',
        createdAt: new Date(),
        dealer: { id: 3, name: 'Competitor Dealer', email: 'competitor@autoscrap.co.uk', assignedCity: 'Manchester' },
      },
    ],
  };

  test('strips customer PII (name, email, phone) from dealer response before winning', () => {
    const res = anonymizeEnquiryForDealer(sampleRow, dealerUser);
    expect(res.customerName).toBe('[Hidden Until Won]');
    expect(res.customerEmail).toBe('[Hidden Until Won]');
    expect(res.customerPhone).toBe('[Hidden Until Won]');
  });

  test('strips competing dealer list identities from dealer response before winning', () => {
    const res = anonymizeEnquiryForDealer(sampleRow, dealerUser);
    expect(res.bids).toEqual([]);
    expect(res.bidCount).toBe(2);
    expect(res.highestBid).toBe(1350);
    expect(res.myBid).toBe(1300);
  });

  test('Super Admin receives full customer and dealer information', () => {
    const res = anonymizeEnquiryForDealer(sampleRow, superAdmin);
    expect(res.customerName).toBe('John Doe Private');
    expect(res.customerEmail).toBe('john@private.com');
    expect(res.bids.length).toBe(2);
  });
});
