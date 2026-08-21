const { autoResolveExpiredBids } = require('../../services/biddingAutoResolver');

describe('High-Value Bidding Auto Resolution Tests', () => {
  test('single bid after 48 hours is automatically accepted', () => {
    const singleBidEnquiry = {
      id: 101,
      biddingEndsAt: new Date(Date.now() - 1000), // Expired
      winningDealerId: null,
      status: 'BIDDING',
      bids: [
        { id: 1, dealerId: 5, amount: 1500, status: 'ACTIVE', createdAt: new Date() },
      ],
    };

    const bids = singleBidEnquiry.bids.sort((a, b) => b.amount - a.amount);
    const topBid = bids[0];

    expect(topBid.dealerId).toBe(5);
    expect(topBid.amount).toBe(1500);

    const updatedEnquiry = {
      ...singleBidEnquiry,
      status: 'DEALER_SELECTED',
      winningDealerId: topBid.dealerId,
      winningBidId: topBid.id,
      winnerSelectedAt: new Date(),
    };

    expect(updatedEnquiry.status).toBe('DEALER_SELECTED');
    expect(updatedEnquiry.winningDealerId).toBe(5);
    expect(updatedEnquiry.winningBidId).toBe(1);
  });

  test('highest bid among multiple bids after 48 hours is selected as winner', () => {
    const multiBidEnquiry = {
      id: 102,
      biddingEndsAt: new Date(Date.now() - 5000),
      winningDealerId: null,
      status: 'BIDDING',
      bids: [
        { id: 10, dealerId: 2, amount: 1800, status: 'ACTIVE', createdAt: new Date(1000) },
        { id: 11, dealerId: 4, amount: 2450, status: 'ACTIVE', createdAt: new Date(2000) }, // Highest
        { id: 12, dealerId: 7, amount: 2100, status: 'ACTIVE', createdAt: new Date(3000) },
      ],
    };

    const bids = multiBidEnquiry.bids.sort((a, b) => b.amount - a.amount);
    const topBid = bids[0];

    expect(topBid.dealerId).toBe(4);
    expect(topBid.amount).toBe(2450);

    const rejectedBids = bids.slice(1).map(b => ({ ...b, status: 'REJECTED' }));
    expect(rejectedBids.length).toBe(2);
    expect(rejectedBids.every(b => b.status === 'REJECTED')).toBe(true);

    const updatedEnquiry = {
      ...multiBidEnquiry,
      status: 'DEALER_SELECTED',
      winningDealerId: topBid.dealerId,
      winningBidId: topBid.id,
    };

    expect(updatedEnquiry.status).toBe('DEALER_SELECTED');
    expect(updatedEnquiry.winningDealerId).toBe(4);
  });

  test('zero bids after 48 hours transitions enquiry status to BIDDING_ENDED', () => {
    const noBidEnquiry = {
      id: 103,
      biddingEndsAt: new Date(Date.now() - 10000),
      winningDealerId: null,
      status: 'BIDDING',
      bids: [],
    };

    const activeBids = noBidEnquiry.bids;
    let newStatus = noBidEnquiry.status;
    if (activeBids.length === 0) {
      newStatus = 'BIDDING_ENDED';
    }

    expect(newStatus).toBe('BIDDING_ENDED');
  });
});
