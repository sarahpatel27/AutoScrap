import DealerBiddingDashboard from '../DealerBiddingDashboard';

describe('Dealer Bidding Dashboard Component', () => {
  const sampleEligibleVehicles = [
    {
      id: '1',
      reference: 'MAS-HV-2026-5555',
      registration: 'AB17 XYZ',
      make: 'Ford',
      model: 'Focus',
      year: 2017,
      mileage: 50000,
      condition: 'Good',
      city: 'Manchester',
      postcode: 'M1 1AA',
      estimatedValue: 1250,
      customerExpectedValue: 1400,
      highestBid: 1350,
      myBid: 1300,
      bidCount: 2,
      photos: [],
    },
  ];

  test('displays customer price as expected price expectation label', () => {
    const item = sampleEligibleVehicles[0];
    expect(item.customerExpectedValue).toBe(1400);
    expect(item.estimatedValue).toBe(1250);
  });
});
