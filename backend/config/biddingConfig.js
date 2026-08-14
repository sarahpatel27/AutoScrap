/**
 * Bidding Duration Configuration
 *
 * Central configuration value for high-value vehicle bidding duration.
 * Default: 24 hours (86,400,000 milliseconds)
 *
 * Supported configurable durations (via ENV `BIDDING_DURATION_HOURS` or default 24):
 * - 2 hours
 * - 6 hours
 * - 12 hours
 * - 24 hours
 */

const DEFAULT_BIDDING_DURATION_HOURS = parseInt(process.env.BIDDING_DURATION_HOURS, 10) || 24;
const BIDDING_DURATION_MS = DEFAULT_BIDDING_DURATION_HOURS * 60 * 60 * 1000;

function calculateBiddingDeadline(startDate = new Date()) {
  const start = new Date(startDate);
  return new Date(start.getTime() + BIDDING_DURATION_MS);
}

function isBiddingExpired(biddingEndsAt) {
  if (!biddingEndsAt) return false;
  return new Date(biddingEndsAt).getTime() <= Date.now();
}

module.exports = {
  DEFAULT_BIDDING_DURATION_HOURS,
  BIDDING_DURATION_MS,
  calculateBiddingDeadline,
  isBiddingExpired,
};
