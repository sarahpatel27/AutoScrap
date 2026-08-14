const { anonymizeEnquiryForDealer } = require('../dealerAnonymizer');

describe('STEP 18 — Release Customer Details to Winner Only Test', () => {
  const winnerDealerUser = { id: 5, role: 'City Dealer', assignedCity: 'London' };
  const loserDealerUser = { id: 9, role: 'City Dealer', assignedCity: 'London' };

  const selectedEnquiryRow = {
    id: 100,
    winningDealerId: 5,
    status: 'DEALER_SELECTED',
    customerName: 'Secret Customer',
    customerPhone: '07000000000',
    customerEmail: 'secret@customer.co.uk',
    bids: [],
  };

  test('releases customer PII ONLY to winning dealer upon DEALER_SELECTED status', () => {
    const winnerRes = anonymizeEnquiryForDealer(selectedEnquiryRow, winnerDealerUser);
    expect(winnerRes.customerName).toBe('Secret Customer');
    expect(winnerRes.customerPhone).toBe('07000000000');
    expect(winnerRes.customerEmail).toBe('secret@customer.co.uk');
  });

  test('blocks customer PII from non-winning dealer upon DEALER_SELECTED status', () => {
    const loserRes = anonymizeEnquiryForDealer(selectedEnquiryRow, loserDealerUser);
    expect(loserRes.customerName).toBe('[Hidden Until Won]');
    expect(loserRes.customerPhone).toBe('[Hidden Until Won]');
    expect(loserRes.customerEmail).toBe('[Hidden Until Won]');
  });
});
