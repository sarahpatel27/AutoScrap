/**
 * Enquiry Notification Service
 * 
 * Centralized service for sending all email notifications related to:
 * 1. Standard Scrap Enquiries (<= 2015)
 * 2. High-Value Bidding Enquiries (> 2015)
 * 
 * Any future notification customization (recipients, templates, filters) can be done here.
 */

const {
  sendEnquiryCreatedNotifications,
  sendHighValueEnquiryCreatedNotifications,
  sendCustomerVehicleAcceptedNotification,
  sendCustomerVehicleCollectedNotification,
  sendCustomerVehicleCancelledNotification,
  sendEmail,
} = require('./emailService');

/**
 * Dispatches notification emails for Standard Enquiries (<= 2015)
 * Sends to: Customer, Assigned Dealer, Super Admin
 * 
 * @param {Object} enquiry - Created Prisma enquiry record or enquiry payload
 */
function sendStandardEnquiryEmail(enquiry) {
  if (!enquiry) return;

  const payload = {
    reference: enquiry.reference,
    customer: enquiry.customer || {},
    vehicle: enquiry.vehicle || {},
    condition: enquiry.condition || {},
    quote: enquiry.quote || {},
    postcode: enquiry.postcode || '',
    city: enquiry.city || '',
  };

  // Run in background without blocking API response
  sendEnquiryCreatedNotifications(payload).catch((err) => {
    console.error(`[NotificationService] Standard enquiry email failed for Ref ${enquiry.reference}:`, err.message);
  });
}

/**
 * Dispatches notification emails for High-Value Enquiries (> 2015)
 * Sends to: Customer, All Active Dealers Nationwide, Super Admin
 * 
 * @param {Object} record - Created Prisma HighValueEnquiry record
 * @param {Object} [rawData={}] - Original enquiry request payload (for any extra vehicle/customer metadata)
 */
function sendHighValueEnquiryEmail(record, rawData = {}) {
  if (!record) return;

  const payload = {
    reference: record.reference,
    customer: record.customer || rawData.customer || {
      fullName: record.customerName,
      email: record.customerEmail,
      phone: record.customerPhone,
    },
    vehicle: {
      ...(rawData.vehicle || {}),
      registration: record.registration || rawData.registration || rawData.vehicle?.registration,
      make: record.make || rawData.vehicle?.make,
      model: record.model || rawData.vehicle?.model,
      year: record.year || rawData.vehicle?.year,
      mileage: record.mileage || rawData.mileage || rawData.vehicle?.mileage,
    },
    condition: record.condition || rawData.vehicleCondition || 'Good',
    estimatedValue: record.estimatedValue,
    customerExpectedValue: record.customerExpectedValue,
    valuePreference: record.valuePreference,
    biddingEndsAt: record.biddingEndsAt,
    postcode: record.postcode,
    city: record.city,
  };

  // Run in background without blocking API response
  sendHighValueEnquiryCreatedNotifications(payload).catch((err) => {
    console.error(`[NotificationService] High-Value enquiry email failed for Ref ${record.reference}:`, err.message);
  });
}

/**
 * Dispatches status change notification email to customer only
 * For standard enquiry when status changes to 'Accepted', 'Collected', or 'Cancelled'
 * 
 * @param {Object} enquiry - Updated Prisma enquiry record or enquiry payload
 * @param {string} [newStatus] - The target status (e.g. 'Accepted', 'Collected', 'Cancelled')
 */
function sendStandardEnquiryStatusEmail(enquiry, newStatus) {
  if (!enquiry) return;

  const targetStatus = (newStatus || enquiry.status || '').toLowerCase();

  const customerData = typeof enquiry.customer === 'string'
    ? JSON.parse(enquiry.customer || '{}')
    : (enquiry.customer || {});

  const vehicleData = typeof enquiry.vehicle === 'string'
    ? JSON.parse(enquiry.vehicle || '{}')
    : (enquiry.vehicle || {});

  const quoteData = typeof enquiry.quote === 'string'
    ? JSON.parse(enquiry.quote || '{}')
    : (enquiry.quote || {});

  const bankData = typeof enquiry.bank === 'string'
    ? JSON.parse(enquiry.bank || '{}')
    : (enquiry.bank || {});

  const payload = {
    reference: enquiry.reference,
    customer: customerData,
    vehicle: vehicleData,
    quote: quoteData,
    bank: bankData,
    postcode: enquiry.postcode || customerData.collectionPostcode || '',
    city: enquiry.city || '',
  };

  if (targetStatus === 'accepted') {
    sendCustomerVehicleAcceptedNotification(payload).catch((err) => {
      console.error(`[NotificationService] Standard enquiry Accepted status email failed for Ref ${enquiry.reference}:`, err.message);
    });
  } else if (targetStatus === 'collected') {
    sendCustomerVehicleCollectedNotification(payload).catch((err) => {
      console.error(`[NotificationService] Standard enquiry Collected status email failed for Ref ${enquiry.reference}:`, err.message);
    });
  } else if (targetStatus === 'cancelled') {
    sendCustomerVehicleCancelledNotification(payload).catch((err) => {
      console.error(`[NotificationService] Standard enquiry Cancelled status email failed for Ref ${enquiry.reference}:`, err.message);
    });
  }
}

/**
 * Dispatches notification email to customer when High-Value enquiry is marked as Purchased/Collected
 * 
 * @param {Object} enquiry - HighValueEnquiry record (with bids)
 */
function sendHighValueEnquiryPurchasedEmail(enquiry) {
  if (!enquiry) return;

  const customerData = typeof enquiry.customer === 'string'
    ? JSON.parse(enquiry.customer || '{}')
    : (enquiry.customer || {});

  const customerEmail = (customerData.email || enquiry.customerEmail || '').trim();
  const customerName = customerData.fullName || enquiry.customerName || 'Valued Customer';
  const customerPhone = customerData.phone || enquiry.customerPhone || '';
  const collectionAddress = customerData.collectionAddress || '';
  const postcode = enquiry.postcode || customerData.collectionPostcode || '';
  const city = enquiry.city || '';

  const vehicle = {
    registration: enquiry.registration,
    make: enquiry.make,
    model: enquiry.model,
    year: enquiry.year,
    mileage: enquiry.mileage,
  };

  // Find winning bid amount if available
  let settlementAmount = 0;
  if (Array.isArray(enquiry.bids) && enquiry.bids.length > 0) {
    const winningBid = enquiry.bids.find((b) => b.id === enquiry.winningBidId || b.status === 'WINNING');
    if (winningBid && winningBid.amount != null) {
      if (typeof winningBid.amount === 'object' && typeof winningBid.amount.toNumber === 'function') {
        settlementAmount = winningBid.amount.toNumber();
      } else {
        const num = Number(winningBid.amount);
        settlementAmount = isNaN(num) ? 0 : num;
      }
    }
  }

  // Fallback to customerExpectedValue or estimatedValue if no winning bid found
  if (!settlementAmount) {
    const exp = enquiry.customerExpectedValue;
    const est = enquiry.estimatedValue;
    const numExp = exp && typeof exp === 'object' && typeof exp.toNumber === 'function' ? exp.toNumber() : Number(exp);
    const numEst = est && typeof est === 'object' && typeof est.toNumber === 'function' ? est.toNumber() : Number(est);
    settlementAmount = numExp || numEst || 0;
  }

  const bankData = typeof enquiry.bank === 'string'
    ? JSON.parse(enquiry.bank || '{}')
    : (enquiry.bank || {});

  const payload = {
    reference: enquiry.reference,
    customer: {
      ...customerData,
      fullName: customerName,
      email: customerEmail,
      phone: customerPhone,
      collectionAddress,
    },
    vehicle,
    quote: {
      finalValue: settlementAmount,
    },
    bank: bankData,
    postcode,
    city,
    collectionDate: enquiry.purchasedAt || new Date(),
  };

  return sendCustomerVehicleCollectedNotification(payload).catch((err) => {
    console.error(`[NotificationService] High-value enquiry Purchased/Collected email failed for Ref ${enquiry.reference}:`, err.message);
  });
}

/**
 * Unified helper to trigger emails for any enquiry type
 * 
 * @param {Object} options
 * @param {boolean} options.isHighValue - Whether it is a high-value enquiry
 * @param {Object} options.record - Database record
 * @param {Object} [options.rawData] - Original request payload
 */
function sendEnquiryNotification({ isHighValue, record, rawData = {} }) {
  if (isHighValue) {
    sendHighValueEnquiryEmail(record, rawData);
  } else {
    sendStandardEnquiryEmail(record);
  }
}

module.exports = {
  sendStandardEnquiryEmail,
  sendHighValueEnquiryEmail,
  sendStandardEnquiryStatusEmail,
  sendHighValueEnquiryPurchasedEmail,
  sendEnquiryNotification,
  sendEmail,
};
