const { prisma } = require('../config/db');
const {
  sendMidwayNoBidsNotification,
  sendMidwayActiveBidsNotification,
  sendSuperAdminBiddingEndedNoBidsNotification,
  sendWinningDealerAndCustomerNotifications,
} = require('./emailService');

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
          include: {
            dealer: true,
          },
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
        const customerData = typeof enquiry.customer === 'string'
          ? JSON.parse(enquiry.customer || '{}')
          : (enquiry.customer || {});

        const updatedCustomer = {
          ...customerData,
          biddingEndedNoBidsNotificationSent: true,
          biddingEndedNoBidsNotificationSentAt: now.toISOString(),
        };

        // No bids placed within 48 hours -> Mark bidding as ended
        await prisma.highValueEnquiry.update({
          where: { id: enquiry.id },
          data: {
            status: 'BIDDING_ENDED',
            customer: updatedCustomer,
          },
        });

        // Send notification email to SUPER ADMIN ONLY with customer & car details
        sendSuperAdminBiddingEndedNoBidsNotification({
          reference: enquiry.reference,
          vehicle: {
            registration: enquiry.registration,
            make: enquiry.make,
            model: enquiry.model,
            year: enquiry.year,
            mileage: enquiry.mileage,
          },
          condition: enquiry.condition,
          estimatedValue: enquiry.estimatedValue,
          customerExpectedValue: enquiry.customerExpectedValue,
          valuePreference: enquiry.valuePreference,
          biddingEndsAt: enquiry.biddingEndsAt,
          postcode: enquiry.postcode,
          city: enquiry.city,
          customer: {
            fullName: enquiry.customerName || customerData.fullName || customerData.name,
            email: enquiry.customerEmail || customerData.email,
            phone: enquiry.customerPhone || customerData.phone,
            collectionAddress: customerData.collectionAddress,
          },
        }).catch((err) => {
          console.error(`[AutoResolver] Super Admin 48h No Bids Ended email error for ${enquiry.reference}:`, err.message);
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

        // Dispatch notifications to the winning dealer (with customer details) and customer (with dealer details)
        sendWinningDealerAndCustomerNotifications({
          enquiry,
          winningBid: topBid,
          winningDealer: topBid.dealer,
        }).catch((err) => {
          console.error(`[AutoResolver] Winner notification email failed for ref ${enquiry.reference}:`, err.message);
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

/**
 * Evaluates active high-value vehicle enquiries where 24 hours have passed since bidding started.
 *
 * Cases:
 * 1. If 0 bids placed so far -> Sends "No Bids Received Yet - 24h Left" email to all dealers & Super Admins.
 * 2. If 1 or more bids placed -> Sends "X Bids Placed, Highest Bid £X" update email to all dealers & Super Admins.
 *
 * Ensures notification is sent exactly ONCE per enquiry by recording `midway24hNotificationSent: true` in customer JSON metadata.
 */
async function processMidwayBiddingNotifications() {
  try {
    const now = new Date();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;

    // Query active high-value enquiries whose bidding is still ongoing
    const activeEnquiries = await prisma.highValueEnquiry.findMany({
      where: {
        status: {
          in: ['BIDDING', 'PENDING'],
        },
        winningDealerId: null,
      },
      include: {
        bids: {
          where: {
            status: { not: 'WITHDRAWN' },
          },
          orderBy: [
            { amount: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!activeEnquiries || activeEnquiries.length === 0) {
      return { processedCount: 0, noBidsNotified: 0, activeBidsNotified: 0 };
    }

    let noBidsNotified = 0;
    let activeBidsNotified = 0;

    for (const enquiry of activeEnquiries) {
      const customerData = typeof enquiry.customer === 'string'
        ? JSON.parse(enquiry.customer || '{}')
        : (enquiry.customer || {});

      // Skip if 24h notification was already sent
      if (customerData.midway24hNotificationSent) {
        continue;
      }

      const startTime = enquiry.biddingStartAt || enquiry.createdAt;
      const endsTime = enquiry.biddingEndsAt ? new Date(enquiry.biddingEndsAt).getTime() : null;

      const elapsedMs = startTime ? now.getTime() - new Date(startTime).getTime() : 0;
      const remainingMs = endsTime ? endsTime - now.getTime() : null;

      // Triggers if 24 hours have elapsed since start OR remaining time until close is <= 24 hours (and not expired)
      const isPast24HoursElapsed = elapsedMs >= twentyFourHoursMs;
      const is24HoursOrLessRemaining = remainingMs !== null && remainingMs <= twentyFourHoursMs && remainingMs > 0;
      const isNotExpired = remainingMs !== null ? remainingMs > 0 : true;

      const shouldTrigger24hNotification = (isPast24HoursElapsed || is24HoursOrLessRemaining) && isNotExpired;

      if (shouldTrigger24hNotification) {
        const activeBids = enquiry.bids || [];
        const bidsCount = activeBids.length;

        // Atomically flag as sent before sending email
        const updatedCustomer = {
          ...customerData,
          midway24hNotificationSent: true,
          midway24hNotificationSentAt: now.toISOString(),
          midway24hBidsCountAtTrigger: bidsCount,
        };

        await prisma.highValueEnquiry.update({
          where: { id: enquiry.id },
          data: {
            customer: updatedCustomer,
          },
        });

        const vehicle = {
          registration: enquiry.registration,
          make: enquiry.make,
          model: enquiry.model,
          year: enquiry.year,
          mileage: enquiry.mileage,
        };

        if (bidsCount === 0) {
          // Case 1: No bids placed so far -> Alert dealers and super admin
          sendMidwayNoBidsNotification({
            reference: enquiry.reference,
            vehicle,
            condition: enquiry.condition,
            estimatedValue: enquiry.estimatedValue,
            customerExpectedValue: enquiry.customerExpectedValue,
            valuePreference: enquiry.valuePreference,
            biddingEndsAt: enquiry.biddingEndsAt,
            postcode: enquiry.postcode,
            city: enquiry.city,
            customer: customerData,
          }).catch((err) => console.error(`[AutoResolver] Midway No Bids notification failed for ${enquiry.reference}:`, err.message));

          noBidsNotified++;
        } else {
          // Case 2: 1 or more bids placed -> Notify dealers with bid count and highest bid
          const highestBid = activeBids[0];
          const highestBidAmount = Number(highestBid.amount) || 0;

          sendMidwayActiveBidsNotification({
            reference: enquiry.reference,
            vehicle,
            condition: enquiry.condition,
            estimatedValue: enquiry.estimatedValue,
            customerExpectedValue: enquiry.customerExpectedValue,
            valuePreference: enquiry.valuePreference,
            biddingEndsAt: enquiry.biddingEndsAt,
            postcode: enquiry.postcode,
            city: enquiry.city,
            customer: customerData,
            bidsCount,
            highestBidAmount,
          }).catch((err) => console.error(`[AutoResolver] Midway Active Bids notification failed for ${enquiry.reference}:`, err.message));

          activeBidsNotified++;
        }
      }
    }

    return {
      processedCount: activeEnquiries.length,
      noBidsNotified,
      activeBidsNotified,
    };
  } catch (err) {
    console.error('❌ Error during processMidwayBiddingNotifications:', err);
    return { processedCount: 0, noBidsNotified: 0, activeBidsNotified: 0, error: err.message };
  }
}

module.exports = {
  autoResolveExpiredBids,
  processMidwayBiddingNotifications,
};
