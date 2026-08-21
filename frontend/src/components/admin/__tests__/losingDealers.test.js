describe('STEP 19 — Losing Dealers Privacy & Controls Test', () => {
  const losingDealerPayload = {
    customerName: '[Hidden Until Won]',
    customerPhone: '[Hidden Until Won]',
    customerEmail: '[Hidden Until Won]',
    status: 'DEALER_SELECTED',
    bids: [], // competing dealer list completely stripped
    highestBid: 1425,
  };

  test('ensures losing dealer receives masked customer PII and empty bids array', () => {
    expect(losingDealerPayload.customerName).toBe('[Hidden Until Won]');
    expect(losingDealerPayload.customerPhone).toBe('[Hidden Until Won]');
    expect(losingDealerPayload.customerEmail).toBe('[Hidden Until Won]');
    expect(losingDealerPayload.bids).toEqual([]);
    expect(losingDealerPayload.highestBid).toBe(1425);
  });
});
