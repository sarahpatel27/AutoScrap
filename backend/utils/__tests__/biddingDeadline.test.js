const { calculateBiddingDeadline, isBiddingExpired } = require('../../config/biddingConfig');

describe('Bidding Deadline & Duration Configuration Test', () => {
  test('calculates bidding deadline using central configuration', () => {
    const startDate = new Date('2026-08-15T00:00:00.000Z');
    const endDate = calculateBiddingDeadline(startDate);
    const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(48);
  });

  test('correctly identifies expired deadline server-side', () => {
    const pastDate = new Date(Date.now() - 1000);
    const futureDate = new Date(Date.now() + 60000);

    expect(isBiddingExpired(pastDate)).toBe(true);
    expect(isBiddingExpired(futureDate)).toBe(false);
  });
});
