/**
 * Anonymizes high-value enquiry response objects before returning them to dealers.
 *
 * PRIVACY RULES (Before a dealer wins):
 * Do NOT expose to non-winning dealers:
 * - Customer name
 * - Customer phone
 * - Customer email
 * - Other dealer names, company names, emails, or phone numbers
 *
 * ALLOWED for dealers:
 * - Registration, Make, Model, Year, Mileage, Condition, Photos, City/Area, Postcode
 * - System Estimated Value
 * - Customer Expected Price
 * - Total Bids count
 * - Current Highest Bid amount
 * - Dealer's Own Bid amount
 *
 * @param {Object} row - Raw DB high-value enquiry object
 * @param {Object} requestingUser - Authenticated user making the API request
 * @returns {Object} Server-side anonymized payload
 */
function anonymizeEnquiryForDealer(row, requestingUser) {
  const isSuperAdmin = requestingUser?.role === 'Super Admin';
  const isWinningDealer =
    Number(row.winningDealerId) === Number(requestingUser?.id) &&
    ['DEALER_SELECTED', 'PURCHASED'].includes(row.status);

  const bidCount = row.bids ? row.bids.length : 0;
  const highestBid = bidCount > 0 ? Number(row.bids[0].amount) : 0;
  const estimatedValue = Number(row.estimatedValue);
  const customerExpectedValue = Number(row.customerExpectedValue);

  // My bid lookup
  const myBidObj = row.bids ? row.bids.find((b) => Number(b.dealerId) === Number(requestingUser?.id)) : null;
  const myBid = myBidObj ? Number(myBidObj.amount) : null;

  // Time remaining & status resolution
  let timeRemaining = 'N/A';
  let resolvedStatus = row.status;

  if (row.biddingEndsAt) {
    const diffMs = new Date(row.biddingEndsAt).getTime() - Date.now();
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      timeRemaining = `${hours}h ${mins}m`;
    } else {
      timeRemaining = 'Bidding Ended';
      if (resolvedStatus === 'BIDDING' || resolvedStatus === 'PENDING') {
        resolvedStatus = 'BIDDING_ENDED';
      }
    }
  }

  // Base anonymized object
  const payload = {
    id: String(row.id),
    reference: row.reference,
    registration: row.registration,
    make: row.make,
    model: row.model,
    year: row.year,
    mileage: row.mileage,
    condition: row.condition,
    photos: row.photos,
    postcode: row.postcode,
    city: row.city,
    area: row.area || row.city,
    estimatedValue,
    customerExpectedValue,
    valuePreference: row.valuePreference,
    bidCount,
    highestBid,
    myBid,
    status: resolvedStatus,
    biddingStartAt: row.biddingStartAt ? row.biddingStartAt.toISOString() : null,
    biddingEndsAt: row.biddingEndsAt ? row.biddingEndsAt.toISOString() : null,
    timeRemaining,
    createdAt: row.createdAt.toISOString(),
  };

  // If Super Admin OR Winning Dealer (after winning selection/purchase), include full contact, address & bank details
  if (isSuperAdmin || isWinningDealer) {
    payload.customerName = row.customerName;
    payload.customerEmail = row.customerEmail;
    payload.customerPhone = row.customerPhone;
    payload.customer = row.customer || {
      fullName: row.customerName,
      email: row.customerEmail,
      phone: row.customerPhone,
      collectionPostcode: row.postcode,
      collectionAddress: row.address || '',
      additionalAddressDetails: row.additionalAddressDetails || '',
    };
    payload.bank = row.bank || null;
    payload.bids = (row.bids || []).map((b) => ({
      id: String(b.id),
      dealerId: String(b.dealerId),
      dealerName: b.dealer?.name || 'Dealer',
      dealerEmail: b.dealer?.email || '',
      dealerCity: b.dealer?.assignedCity || 'UK',
      amount: Number(b.amount),
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }));
  } else {
    // Non-winning dealer view BEFORE winning: Completely strip sensitive customer & address identities
    payload.customerName = '[Hidden Until Won]';
    payload.customerEmail = '[Hidden Until Won]';
    payload.customerPhone = '[Hidden Until Won]';
    payload.customer = {
      fullName: '[Hidden Until Won]',
      email: '[Hidden Until Won]',
      phone: '[Hidden Until Won]',
      collectionPostcode: row.postcode,
      collectionAddress: '[Hidden Until Won]',
      additionalAddressDetails: '[Hidden Until Won]',
    };
    // Completely omit individual competing dealer identities array
    payload.bids = [];
  }

  return payload;
}

module.exports = {
  anonymizeEnquiryForDealer,
};
