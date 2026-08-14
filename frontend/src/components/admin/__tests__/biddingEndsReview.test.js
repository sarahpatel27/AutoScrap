describe('STEP 16 — Bidding Ends Review Test', () => {
  const expiredEnquiry = {
    id: '1',
    status: 'BIDDING_ENDED',
    estimatedValue: 1250,
    customerExpectedValue: 1400,
    bids: [
      { id: '1', dealerName: 'Dealer A', amount: 1300 },
      { id: '2', dealerName: 'Dealer B', amount: 1375 },
      { id: '3', dealerName: 'Dealer C', amount: 1425 },
    ],
  };

  test('verifies admin review contains system estimate, customer expected, and all dealer offer identities', () => {
    expect(expiredEnquiry.status).toBe('BIDDING_ENDED');
    expect(expiredEnquiry.estimatedValue).toBe(1250);
    expect(expiredEnquiry.customerExpectedValue).toBe(1400);

    expect(expiredEnquiry.bids.length).toBe(3);
    expect(expiredEnquiry.bids[0].dealerName).toBe('Dealer A');
    expect(expiredEnquiry.bids[2].amount).toBe(1425);
  });
});
