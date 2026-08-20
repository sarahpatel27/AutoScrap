const { prisma } = require('../config/db');

/**
 * Automatically evaluates and resolves high-value vehicle enquiries whose 48-hour bidding deadline has expired.
 *
 * Rules:
 * 1. If 0 bids exist when deadline expires -> status transitions to 'BIDDING_ENDED'.
 * 2. If 1 dealer has bid -> that dealer's bid is automatically accepted as WINNING and status becomes 'DEALER_SELECTED'.
 * 3. If multiple dealers have bid -> the dealer with the highest bid amount (earliest submission on tie) is automatically accepted as WINNING, other bids become REJECTED, and status becomes 'DEALER_SELECTED'.
 *
 * @returns {Promise<{ resolvedCount: number, winningCount: number, endedNoBidCount: number }>}
 */
async function autoResolveExpiredBids() {
  try {
    const now = new Date();

    // 1. Query all high-value enquiries whose bidding window has elapsed and haven't had a winner selected yet
    const expiredEnquiries = await prisma.highValueEnquiry.findMany({
      where: {
        biddingEndsAt: {
          lte: now,
        },
        winningDealerId: null,
        status: {
          in: ['BIDDING', 'PENDING'],
        },
      },
      include: {
        bids: {
          orderBy: [
            { amount: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!expiredEnquiries || expiredEnquiries.length === 0) {
      return { resolvedCount: 0, winningCount: 0, endedNoBidCount: 0 };
    }

    let winningCount = 0;
    let endedNoBidCount = 0;

    for (const enquiry of expiredEnquiries) {
      const activeBids = (enquiry.bids || []).filter((b) => b.status !== 'WITHDRAWN');

      if (activeBids.length === 0) {
        // No bids placed within 48 hours -> Mark bidding as ended
        await prisma.highValueEnquiry.update({
          where: { id: enquiry.id },
          data: { status: 'BIDDING_ENDED' },
        });
        endedNoBidCount++;
      } else {
        // 1 or more bids -> Top bid wins (highest amount, earliest timestamp on tie)
        const topBid = activeBids[0];

        await prisma.$transaction(async (tx) => {
          // Double check enquiry hasn't already been processed concurrently
          const freshEnquiry = await tx.highValueEnquiry.findUnique({
            where: { id: enquiry.id },
          });

          if (!freshEnquiry || freshEnquiry.winningDealerId || ['PURCHASED', 'CANCELLED', 'DEALER_SELECTED'].includes(freshEnquiry.status)) {
            return;
          }

          // Mark top bid as WINNING
          await tx.dealerBid.update({
            where: { id: topBid.id },
            data: { status: 'WINNING' },
          });

          // Mark competing bids as REJECTED
          await tx.dealerBid.updateMany({
            where: {
              highValueEnquiryId: enquiry.id,
              id: { not: topBid.id },
            },
            data: { status: 'REJECTED' },
          });

          // Update HighValueEnquiry record with winning dealer details
          await tx.highValueEnquiry.update({
            where: { id: enquiry.id },
            data: {
              status: 'DEALER_SELECTED',
              winningDealerId: topBid.dealerId,
              winningBidId: topBid.id,
              winnerSelectedAt: now,
            },
          });
        });

        winningCount++;
      }
    }

    return {
      resolvedCount: expiredEnquiries.length,
      winningCount,
      endedNoBidCount,
    };
  } catch (err) {
    console.error('❌ Error during autoResolveExpiredBids:', err);
    return { resolvedCount: 0, winningCount: 0, endedNoBidCount: 0, error: err.message };
  }
}

module.exports = {
  autoResolveExpiredBids,
};
