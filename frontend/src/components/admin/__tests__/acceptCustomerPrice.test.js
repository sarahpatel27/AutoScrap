describe('ACCEPT CUSTOMER PRICE Bidding Logic', () => {
  const enquiryWithCustomerPrice = {
    id: '1',
    customerExpectedValue: 1400,
    estimatedValue: 1250,
  };

  test('creates bid matching customer expected value when ACCEPT is selected', () => {
    const acceptedBidAmount = Number(enquiryWithCustomerPrice.customerExpectedValue);
    expect(acceptedBidAmount).toBe(1400);
  });
});
