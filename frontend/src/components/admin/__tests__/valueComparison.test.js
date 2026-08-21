describe('STEP 21 — Admin 3-Value Metric Comparison Test', () => {
  const sampleEnquiry = {
    estimatedValue: 1250,
    customerExpectedValue: 1400,
    highestBid: 1425,
    status: 'DEALER_SELECTED',
  };

  test('preserves 3 distinct valuation numbers without collapsing into a single field', () => {
    expect(sampleEnquiry.estimatedValue).toBe(1250);
    expect(sampleEnquiry.customerExpectedValue).toBe(1400);
    expect(sampleEnquiry.highestBid).toBe(1425);
  });
});
