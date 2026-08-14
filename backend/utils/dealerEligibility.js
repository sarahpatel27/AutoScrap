/**
 * Server-side Dealer Eligibility Validation
 *
 * Rules:
 * 1. High-value vehicle bidding is open nationwide across all UK cities.
 * 2. All authenticated dealers (Super Admin & City Dealers) can view and bid on all high-value enquiries.
 *
 * @param {Object} dealerUser - Authenticated user object from req.user
 * @param {Object} enquiry - HighValueEnquiry object
 * @returns {boolean} true if authenticated dealer, false otherwise
 */
function isDealerEligibleForEnquiry(dealerUser, enquiry) {
  if (!dealerUser || !enquiry) return false;

  // Allow all authenticated dealers (City Dealers & Super Admin) to bid on all UK high-value enquiries
  if (['Super Admin', 'City Dealer'].includes(dealerUser.role)) {
    return true;
  }

  return false;
}

module.exports = {
  isDealerEligibleForEnquiry,
};
