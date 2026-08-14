/**
 * Dealer Bid Statuses & Server-Side Validation Helpers
 */

const BID_STATUSES = {
  ACTIVE: 'ACTIVE',
  WINNING: 'WINNING',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
  EXPIRED: 'EXPIRED',
};

/**
 * Server-side validation for bid amount in GBP.
 * Enforces positive numeric values under a sensible maximum limit (£250,000).
 *
 * @param {number|string} amount
 * @returns {{ isValid: boolean, error?: string, numericAmount?: number }}
 */
function validateBidAmount(amount) {
  if (amount === undefined || amount === null || amount === '') {
    return { isValid: false, error: 'Bid amount is required.' };
  }

  const numericAmount = Number(amount);

  if (isNaN(numericAmount)) {
    return { isValid: false, error: 'Bid amount must be a valid number.' };
  }

  if (numericAmount <= 0) {
    return { isValid: false, error: 'Bid amount must be greater than £0.' };
  }

  if (numericAmount > 250000) {
    return { isValid: false, error: 'Bid amount cannot exceed £250,000.' };
  }

  // Ensure two decimal place precision limit
  const rounded = Math.round(numericAmount * 100) / 100;

  return { isValid: true, numericAmount: rounded };
}

module.exports = {
  BID_STATUSES,
  validateBidAmount,
};
