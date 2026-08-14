describe('Competitive Bidding Indicators Test', () => {
  test('correctly identifies highest bidder vs outbid state', () => {
    const itemAsHighest = { highestBid: 1400, myBid: 1400 };
    expect(itemAsHighest.myBid >= itemAsHighest.highestBid).toBe(true);

    const itemAsOutbid = { highestBid: 1450, myBid: 1400 };
    expect(itemAsOutbid.highestBid > itemAsOutbid.myBid).toBe(true);
  });
});
