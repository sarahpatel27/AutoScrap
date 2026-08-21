import HighValueBiddingSection from '../HighValueBiddingSection';

describe('Admin High-Value Bidding Section', () => {
  const sampleEnquiries = [
    {
      id: '1',
      reference: 'MAS-HV-2026-1001',
      registration: 'AB16 CDE',
      make: 'BMW',
      model: '3 Series',
      year: 2018,
      mileage: 45000,
      condition: 'Good',
      city: 'London',
      postcode: 'SW1A 1AA',
      estimatedValue: 1250,
      customerExpectedValue: 1250,
      valuePreference: 'ESTIMATED_VALUE',
      bidCount: 0,
      highestBid: 0,
      status: 'PENDING',
      timeRemaining: 'N/A',
      createdAt: '2026-08-14T20:00:00.000Z',
    },
    {
      id: '2',
      reference: 'MAS-HV-2026-1002',
      registration: 'XY20 ZAA',
      make: 'Audi',
      model: 'A4',
      year: 2020,
      mileage: 30000,
      condition: 'Excellent',
      city: 'Manchester',
      postcode: 'M1 1AA',
      estimatedValue: 1500,
      customerExpectedValue: 1800,
      valuePreference: 'CUSTOM_VALUE',
      bidCount: 2,
      highestBid: 1650,
      status: 'BIDDING',
      timeRemaining: '23h 45m',
      createdAt: '2026-08-14T21:00:00.000Z',
    },
  ];

  test('keeps system estimate and customer expected value distinct', () => {
    const itemWithCustom = sampleEnquiries[1];
    expect(itemWithCustom.estimatedValue).toBe(1500);
    expect(itemWithCustom.customerExpectedValue).toBe(1800);
    expect(itemWithCustom.valuePreference).toBe('CUSTOM_VALUE');
  });

  test('correctly identifies accepted estimate', () => {
    const itemAccepted = sampleEnquiries[0];
    expect(itemAccepted.estimatedValue).toBe(itemAccepted.customerExpectedValue);
    expect(itemAccepted.valuePreference).toBe('ESTIMATED_VALUE');
  });
});
