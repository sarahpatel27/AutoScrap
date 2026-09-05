import HighValueEnquiryDetailModal from '../HighValueEnquiryDetailModal';

describe('HighValueEnquiryDetailModal Component', () => {
  const sampleEnquiry = {
    id: '10',
    reference: 'MAS-HV-2026-9999',
    registration: 'TEST123',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2019,
    mileage: 35000,
    condition: 'Excellent',
    postcode: 'SW1A 1AA',
    city: 'London',
    customerName: 'Alice Smith',
    customerEmail: 'alice@example.com',
    customerPhone: '07999999999',
    estimatedValue: 1250,
    customerExpectedValue: 1400,
    valuePreference: 'CUSTOM_VALUE',
    photos: [{ url: 'https://example.com/photo1.jpg' }],
    bids: [
      {
        id: '1',
        dealerName: 'London Scrap Dealer',
        dealerEmail: 'london@autoscrap.co.uk',
        dealerCity: 'London',
        coveredPostcodes: ['SW1', 'SW2'],
        dealerPostcodes: 'SW1, SW2',
        amount: 1550,
        status: 'WINNING',
        createdAt: '2026-08-14T22:00:00.000Z',
      },
    ],
    bidCount: 1,
    highestBid: 1550,
    status: 'BIDDING',
  };

  test('displays both system estimated value and customer expected value', () => {
    expect(sampleEnquiry.estimatedValue).toBe(1250);
    expect(sampleEnquiry.customerExpectedValue).toBe(1400);
    expect(sampleEnquiry.valuePreference).toBe('CUSTOM_VALUE');
  });

  test('contains dealer bids list for authorized admin view', () => {
    expect(sampleEnquiry.bids.length).toBe(1);
    expect(sampleEnquiry.bids[0].dealerName).toBe('London Scrap Dealer');
    expect(sampleEnquiry.bids[0].amount).toBe(1550);
  });
});
