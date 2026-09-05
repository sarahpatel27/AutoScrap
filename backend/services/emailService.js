const { getTransporter } = require('../config/mailer');
const { baseLayout } = require('../templates/emails/baseLayout');
const { customerEnquiryTemplate } = require('../templates/emails/customerEnquiry');
const { dealerEnquiryTemplate } = require('../templates/emails/dealerEnquiry');
const { customerHighValueEnquiryTemplate } = require('../templates/emails/customerHighValueEnquiry');
const { dealerHighValueBiddingTemplate } = require('../templates/emails/dealerHighValueBidding');
const { customerAcceptedEnquiryTemplate } = require('../templates/emails/customerAcceptedEnquiry');
const { customerCollectedEnquiryTemplate } = require('../templates/emails/customerCollectedEnquiry');
const { customerCancelledEnquiryTemplate } = require('../templates/emails/customerCancelledEnquiry');
const { dealerBiddingNoBidsMidwayTemplate } = require('../templates/emails/dealerBiddingNoBidsMidway');
const { dealerBiddingActiveBidsMidwayTemplate } = require('../templates/emails/dealerBiddingActiveBidsMidway');
const { superAdminBiddingEndedNoBidsTemplate } = require('../templates/emails/superAdminBiddingEndedNoBids');
const { dealerWinningBiddingNotificationTemplate } = require('../templates/emails/dealerWinningBiddingNotification');
const { customerDealerSelectedNotificationTemplate } = require('../templates/emails/customerDealerSelectedNotification');
const { superAdminWinnerSelectedNotificationTemplate } = require('../templates/emails/superAdminWinnerSelectedNotification');
const { accountCredentialsTemplate } = require('../templates/emails/accountCredentials');
const { prisma } = require('../config/db');

const DEFAULT_FROM = process.env.SMTP_FROM || 'notifications@myautoscrap.co.uk';
const DEFAULT_NAME = process.env.EMAIL_FROM_NAME || 'AutoScrap';

/**
 * Send a generic or styled email
 */
async function sendEmail({
  to,
  subject,
  html,
  text,
  useBaseLayout = true,
  attachments = [],
  from,
}) {
  try {
    if (!to) {
      throw new Error('Email recipient (to) is required');
    }

    const transporter = getTransporter();
    const sender = from || `"${DEFAULT_NAME}" <${DEFAULT_FROM}>`;
    const finalHtml = html
      ? (useBaseLayout ? baseLayout({ title: subject, contentHtml: html }) : html)
      : undefined;

    const mailOptions = {
      from: sender,
      to,
      subject,
      text: text || (html ? html.replace(/<[^>]*>?/gm, '') : ''),
      html: finalHtml,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Email sent successfully to ${to} (MessageId: ${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Trigger emails when customer submits contact details (Normal Journey <= 2015)
 * 1. Customer Confirmation Email
 * 2. Assigned City Dealer Email
 * 3. Super Admin Notification Email
 */
async function sendEnquiryCreatedNotifications({
  reference,
  customer,
  vehicle,
  condition,
  quote,
  postcode,
  city,
}) {
  const quoteAmount = quote?.finalValue || quote?.estimatedValue || 0;
  const collectionAddress = customer?.collectionAddress || '';
  const customerEmail = customer?.email?.trim();
  const customerName = customer?.fullName || 'Valued Customer';

  const sendPromises = [];

  // 1. Send Customer Confirmation Email
  if (customerEmail && customerEmail.includes('@')) {
    const custTemplate = customerEnquiryTemplate({
      reference,
      customerName,
      vehicle,
      quoteAmount,
      collectionAddress,
      postcode,
    });

    sendPromises.push(
      sendEmail({
        to: customerEmail,
        subject: custTemplate.subject,
        html: custTemplate.html,
      }).catch((err) => console.error(`[EmailService] Customer email failed for ${customerEmail}:`, err))
    );
  }

  // 2. Fetch Dealers & Admins to notify based on Outward District Postcode Coverage
  try {
    const { extractOutwardCode } = require('../utils/postcodeHelper');
    const outwardDistrict = extractOutwardCode(postcode);

    const [allCityDealers, superAdmins] = await Promise.all([
      prisma.user.findMany({
        where: {
          isActive: true,
          role: 'City Dealer',
        },
      }),
      prisma.user.findMany({
        where: {
          isActive: true,
          role: 'Super Admin',
        },
      }),
    ]);

    // Match dealers who explicitly cover this outward district (or fallback to assignedCity if none configured)
    const cityDealers = allCityDealers.filter((dealer) => {
      if (!dealer.email) return false;
      const list = (dealer.coveredPostcodes || []).map((p) => String(p).trim().toUpperCase()).filter(Boolean);
      if (list.length > 0) {
        return list.includes(outwardDistrict);
      }
      if (dealer.assignedCity && city) {
        return dealer.assignedCity.trim().toLowerCase() === city.trim().toLowerCase();
      }
      return false;
    });

    // 3. Send to Assigned District Dealer(s)
    cityDealers.forEach((dealer) => {
      const dealerTemplate = dealerEnquiryTemplate({
        reference,
        recipientRole: 'Dealer',
        recipientName: dealer.name,
        vehicle,
        condition,
        quoteAmount,
        postcode,
        city,
        customer,
      });

      sendPromises.push(
        sendEmail({
          to: dealer.email,
          subject: dealerTemplate.subject,
          html: dealerTemplate.html,
        }).catch((err) => console.error(`[EmailService] Dealer email failed for ${dealer.email}:`, err))
      );
    });

    // 4. Send to Super Admin(s)
    superAdmins.forEach((admin) => {
      const adminTemplate = dealerEnquiryTemplate({
        reference,
        recipientRole: 'Super Admin',
        recipientName: admin.name,
        vehicle,
        condition,
        quoteAmount,
        postcode,
        city,
        customer,
      });

      sendPromises.push(
        sendEmail({
          to: admin.email,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        }).catch((err) => console.error(`[EmailService] Super Admin email failed for ${admin.email}:`, err))
      );
    });

    await Promise.all(sendPromises);
    console.log(`[EmailService] All standard enquiry notification emails dispatched for ref: ${reference}`);
  } catch (error) {
    console.error(`[EmailService] Error resolving recipients for standard enquiry notifications:`, error.message);
  }
}

/**
 * Trigger emails when customer submits contact details for High-Value Enquiry (> 2015)
 * 1. Customer Confirmation Email (Bidding Started)
 * 2. All Dealers of that City (New High-Value Car Available for Bidding)
 * 3. Super Admin Notification Email (Bidding Period Started)
 */
async function sendHighValueEnquiryCreatedNotifications({
  reference,
  customer,
  vehicle,
  condition,
  estimatedValue,
  customerExpectedValue,
  valuePreference,
  biddingEndsAt,
  postcode,
  city,
}) {
  const customerEmail = customer?.email?.trim() || customer?.customerEmail;
  const customerName = customer?.fullName || customer?.customerName || 'Valued Customer';

  const sendPromises = [];

  // 1. Send Customer Confirmation Email
  if (customerEmail && customerEmail.includes('@')) {
    const custTemplate = customerHighValueEnquiryTemplate({
      reference,
      customerName,
      vehicle,
      estimatedValue,
      customerExpectedValue,
      valuePreference,
      postcode,
    });

    sendPromises.push(
      sendEmail({
        to: customerEmail,
        subject: custTemplate.subject,
        html: custTemplate.html,
      }).catch((err) => console.error(`[EmailService] Customer HV email failed for ${customerEmail}:`, err))
    );
  }

  // 2. Fetch ALL Active City Dealers Nationwide & Super Admins
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { role: 'Super Admin' },
          { role: 'City Dealer' },
        ],
      },
    });

    const superAdmins = users.filter((u) => u.role === 'Super Admin' && u.email);
    const cityDealers = users.filter((u) => u.role === 'City Dealer' && u.email);

    // 3. Send to ALL Active City Dealers Nationwide
    cityDealers.forEach((dealer) => {

      const dealerTemplate = dealerHighValueBiddingTemplate({
        reference,
        recipientRole: 'Dealer',
        recipientName: dealer.name,
        vehicle,
        condition,
        estimatedValue,
        customerExpectedValue,
        valuePreference,
        biddingEndsAt,
        postcode,
        city,
        customer,
      });

      sendPromises.push(
        sendEmail({
          to: dealer.email,
          subject: dealerTemplate.subject,
          html: dealerTemplate.html,
        }).catch((err) => console.error(`[EmailService] Dealer HV Bidding email failed for ${dealer.email}:`, err))
      );
    });

    // 4. Send to Super Admin(s)
    superAdmins.forEach((admin) => {
      const adminTemplate = dealerHighValueBiddingTemplate({
        reference,
        recipientRole: 'Super Admin',
        recipientName: admin.name,
        vehicle,
        condition,
        estimatedValue,
        customerExpectedValue,
        valuePreference,
        biddingEndsAt,
        postcode,
        city,
        customer,
      });

      sendPromises.push(
        sendEmail({
          to: admin.email,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        }).catch((err) => console.error(`[EmailService] Super Admin HV Bidding email failed for ${admin.email}:`, err))
      );
    });

    await Promise.all(sendPromises);
    console.log(`[EmailService] All High-Value Bidding notification emails dispatched for ref: ${reference}`);
  } catch (error) {
    console.error(`[EmailService] Error resolving recipients for High-Value notifications:`, error.message);
  }
}

/**
 * Trigger email to customer only when Standard Enquiry status is updated to 'Accepted'
 */
async function sendCustomerVehicleAcceptedNotification({
  reference,
  customer,
  vehicle,
  quote,
  postcode,
  city,
  bank,
}) {
  const customerEmail = customer?.email?.trim();
  const customerName = customer?.fullName || 'Valued Customer';
  const quoteAmount = quote?.finalValue || quote?.estimatedValue || 0;
  const collectionAddress = customer?.collectionAddress || '';
  const postCodeVal = postcode || customer?.collectionPostcode || '';
  const paymentMethod = bank?.accountNumber ? 'Direct Bank Transfer' : 'Bank Transfer';

  if (!customerEmail || !customerEmail.includes('@')) {
    console.warn(`[EmailService] Cannot send Vehicle Accepted email: No valid customer email for Ref: ${reference}`);
    return { success: false, error: 'No valid customer email' };
  }

  const template = customerAcceptedEnquiryTemplate({
    reference,
    customerName,
    vehicle,
    quoteAmount,
    collectionAddress,
    postcode: postCodeVal,
    paymentMethod,
  });

  return sendEmail({
    to: customerEmail,
    subject: template.subject,
    html: template.html,
  }).catch((err) => console.error(`[EmailService] Customer Vehicle Accepted email failed for ${customerEmail}:`, err));
}

/**
 * Trigger email to customer only when Standard Enquiry status is updated to 'Collected'
 */
async function sendCustomerVehicleCollectedNotification({
  reference,
  customer,
  vehicle,
  quote,
  postcode,
  city,
  bank,
  collectionDate,
}) {
  const customerEmail = customer?.email?.trim();
  const customerName = customer?.fullName || 'Valued Customer';
  const quoteAmount = quote?.finalValue || quote?.estimatedValue || 0;
  const collectionAddress = customer?.collectionAddress || '';
  const postCodeVal = postcode || customer?.collectionPostcode || '';

  if (!customerEmail || !customerEmail.includes('@')) {
    console.warn(`[EmailService] Cannot send Vehicle Collected email: No valid customer email for Ref: ${reference}`);
    return { success: false, error: 'No valid customer email' };
  }

  const template = customerCollectedEnquiryTemplate({
    reference,
    customerName,
    vehicle,
    quoteAmount,
    collectionAddress,
    postcode: postCodeVal,
    collectionDate: collectionDate || new Date(),
  });

  return sendEmail({
    to: customerEmail,
    subject: template.subject,
    html: template.html,
  }).catch((err) => console.error(`[EmailService] Customer Vehicle Collected email failed for ${customerEmail}:`, err));
}

/**
 * Trigger email to customer only when Standard Enquiry status is updated to 'Cancelled'
 */
async function sendCustomerVehicleCancelledNotification({
  reference,
  customer,
  vehicle,
  quote,
  postcode,
  city,
  bank,
}) {
  const customerEmail = customer?.email?.trim();
  const customerName = customer?.fullName || 'Valued Customer';
  const quoteAmount = quote?.finalValue || quote?.estimatedValue || 0;
  const collectionAddress = customer?.collectionAddress || '';
  const postCodeVal = postcode || customer?.collectionPostcode || '';

  if (!customerEmail || !customerEmail.includes('@')) {
    console.warn(`[EmailService] Cannot send Vehicle Cancelled email: No valid customer email for Ref: ${reference}`);
    return { success: false, error: 'No valid customer email' };
  }

  const template = customerCancelledEnquiryTemplate({
    reference,
    customerName,
    vehicle,
    quoteAmount,
    collectionAddress,
    postcode: postCodeVal,
  });

  return sendEmail({
    to: customerEmail,
    subject: template.subject,
    html: template.html,
  }).catch((err) => console.error(`[EmailService] Customer Vehicle Cancelled email failed for ${customerEmail}:`, err));
}

/**
 * Trigger emails when 24 hours have elapsed on a High-Value car with NO bids placed so far
 * Sent to: All Active City Dealers & Super Admins
 */
async function sendMidwayNoBidsNotification({
  reference,
  vehicle,
  condition,
  estimatedValue,
  customerExpectedValue,
  valuePreference,
  biddingEndsAt,
  postcode,
  city,
  customer,
}) {
  const sendPromises = [];

  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { role: 'Super Admin' },
          { role: 'City Dealer' },
        ],
      },
    });

    const superAdmins = users.filter((u) => u.role === 'Super Admin' && u.email);
    const cityDealers = users.filter((u) => u.role === 'City Dealer' && u.email);

    // 1. Send to all active City Dealers
    cityDealers.forEach((dealer) => {
      const dealerTemplate = dealerBiddingNoBidsMidwayTemplate({
        reference,
        recipientRole: 'Dealer',
        recipientName: dealer.name,
        vehicle,
        condition,
        estimatedValue,
        customerExpectedValue,
        valuePreference,
        biddingEndsAt,
        postcode,
        city,
      });

      sendPromises.push(
        sendEmail({
          to: dealer.email,
          subject: dealerTemplate.subject,
          html: dealerTemplate.html,
        }).catch((err) => console.error(`[EmailService] Midway No Bids email failed for dealer ${dealer.email}:`, err))
      );
    });

    // 2. Send to Super Admin(s)
    superAdmins.forEach((admin) => {
      const adminTemplate = dealerBiddingNoBidsMidwayTemplate({
        reference,
        recipientRole: 'Super Admin',
        recipientName: admin.name,
        vehicle,
        condition,
        estimatedValue,
        customerExpectedValue,
        valuePreference,
        biddingEndsAt,
        postcode,
        city,
      });

      sendPromises.push(
        sendEmail({
          to: admin.email,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        }).catch((err) => console.error(`[EmailService] Midway No Bids email failed for Super Admin ${admin.email}:`, err))
      );
    });

    await Promise.all(sendPromises);
    console.log(`[EmailService] All 24h Midway NO BIDS emails dispatched for ref: ${reference}`);
    return { success: true, count: sendPromises.length };
  } catch (error) {
    console.error(`[EmailService] Error dispatching 24h Midway NO BIDS emails for ref ${reference}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger emails when 24 hours have elapsed on a High-Value car with 1 or more ACTIVE bids placed
 * Sent to: All Active City Dealers & Super Admins
 */
async function sendMidwayActiveBidsNotification({
  reference,
  vehicle,
  condition,
  estimatedValue,
  customerExpectedValue,
  valuePreference,
  biddingEndsAt,
  postcode,
  city,
  customer,
  bidsCount = 1,
  highestBidAmount = 0,
}) {
  const sendPromises = [];

  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { role: 'Super Admin' },
          { role: 'City Dealer' },
        ],
      },
    });

    const superAdmins = users.filter((u) => u.role === 'Super Admin' && u.email);
    const cityDealers = users.filter((u) => u.role === 'City Dealer' && u.email);

    // 1. Send to all active City Dealers
    cityDealers.forEach((dealer) => {
      const dealerTemplate = dealerBiddingActiveBidsMidwayTemplate({
        reference,
        recipientRole: 'Dealer',
        recipientName: dealer.name,
        vehicle,
        condition,
        estimatedValue,
        customerExpectedValue,
        valuePreference,
        biddingEndsAt,
        postcode,
        city,
        bidsCount,
        highestBidAmount,
      });

      sendPromises.push(
        sendEmail({
          to: dealer.email,
          subject: dealerTemplate.subject,
          html: dealerTemplate.html,
        }).catch((err) => console.error(`[EmailService] Midway Active Bids email failed for dealer ${dealer.email}:`, err))
      );
    });

    // 2. Send to Super Admin(s)
    superAdmins.forEach((admin) => {
      const adminTemplate = dealerBiddingActiveBidsMidwayTemplate({
        reference,
        recipientRole: 'Super Admin',
        recipientName: admin.name,
        vehicle,
        condition,
        estimatedValue,
        customerExpectedValue,
        valuePreference,
        biddingEndsAt,
        postcode,
        city,
        bidsCount,
        highestBidAmount,
      });

      sendPromises.push(
        sendEmail({
          to: admin.email,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        }).catch((err) => console.error(`[EmailService] Midway Active Bids email failed for Super Admin ${admin.email}:`, err))
      );
    });

    await Promise.all(sendPromises);
    console.log(`[EmailService] All 24h Midway ACTIVE BIDS emails dispatched for ref: ${reference} (${bidsCount} bids, Top: £${highestBidAmount})`);
    return { success: true, count: sendPromises.length };
  } catch (error) {
    console.error(`[EmailService] Error dispatching 24h Midway ACTIVE BIDS emails for ref ${reference}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger email to SUPER ADMIN ONLY when 48h bidding has ended with 0 bids placed
 */
async function sendSuperAdminBiddingEndedNoBidsNotification({
  reference,
  vehicle,
  condition,
  estimatedValue,
  customerExpectedValue,
  valuePreference,
  biddingEndsAt,
  postcode,
  city,
  customer,
}) {
  const sendPromises = [];

  try {
    const superAdmins = await prisma.user.findMany({
      where: {
        isActive: true,
        role: 'Super Admin',
      },
    });

    const activeAdmins = superAdmins.filter((u) => u.email);

    activeAdmins.forEach((admin) => {
      const adminTemplate = superAdminBiddingEndedNoBidsTemplate({
        reference,
        recipientName: admin.name || 'Super Admin',
        vehicle,
        condition,
        estimatedValue,
        customerExpectedValue,
        valuePreference,
        biddingEndsAt,
        postcode,
        city,
        customer,
      });

      sendPromises.push(
        sendEmail({
          to: admin.email,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        }).catch((err) => console.error(`[EmailService] Super Admin 48h No Bids Ended email failed for ${admin.email}:`, err))
      );
    });

    await Promise.all(sendPromises);
    console.log(`[EmailService] Super Admin 48h NO BIDS ENDED notification dispatched for ref: ${reference}`);
    return { success: true, count: sendPromises.length };
  } catch (error) {
    console.error(`[EmailService] Error dispatching Super Admin 48h NO BIDS ENDED email for ref ${reference}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger emails when a dealer is selected as the winner (either automatically or manually):
 * 1. Email with full customer contact details sent to the WINNING DEALER
 * 2. Email with assigned dealer details sent to the CUSTOMER (without exposing internal bid price)
 */
async function sendWinningDealerAndCustomerNotifications({
  enquiry,
  winningBid,
  winningDealer,
}) {
  const sendPromises = [];

  const customerData = typeof enquiry.customer === 'string'
    ? JSON.parse(enquiry.customer || '{}')
    : (enquiry.customer || {});

  const customerEmail = customerData.email || enquiry.customerEmail;
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

  const winningAmount = winningBid?.amount || 0;

  // 1. Send Email to the WINNING DEALER with full customer details
  if (winningDealer?.email) {
    const dealerTemplate = dealerWinningBiddingNotificationTemplate({
      reference: enquiry.reference,
      dealerName: winningDealer.name || 'Valued Partner',
      winningBidAmount: winningAmount,
      vehicle,
      condition: enquiry.condition,
      postcode,
      city,
      customer: {
        fullName: customerName,
        phone: customerPhone,
        email: customerEmail,
        collectionAddress,
      },
    });

    sendPromises.push(
      sendEmail({
        to: winningDealer.email,
        subject: dealerTemplate.subject,
        html: dealerTemplate.html,
      }).catch((err) => console.error(`[EmailService] Winning dealer email failed for ${winningDealer.email}:`, err))
    );
  }

  // 2. Send Email to the CUSTOMER with dealer details (no price shown)
  if (customerEmail && customerEmail.includes('@')) {
    const customerTemplate = customerDealerSelectedNotificationTemplate({
      reference: enquiry.reference,
      customerName,
      vehicle,
      collectionAddress,
      postcode,
      city,
      dealer: {
        name: winningDealer?.name || 'Verified AutoScrap Partner',
        assignedCity: winningDealer?.assignedCity || city,
        email: winningDealer?.email,
      },
    });

    sendPromises.push(
      sendEmail({
        to: customerEmail,
        subject: customerTemplate.subject,
        html: customerTemplate.html,
      }).catch((err) => console.error(`[EmailService] Customer dealer-selected email failed for ${customerEmail}:`, err))
    );
  }

  // 3. Send Email to SUPER ADMIN(S) with complete winning dealer & customer details
  try {
    const superAdmins = await prisma.user.findMany({
      where: {
        isActive: true,
        role: 'Super Admin',
      },
    });

    const activeAdmins = superAdmins.filter((u) => u.email);

    activeAdmins.forEach((admin) => {
      const adminTemplate = superAdminWinnerSelectedNotificationTemplate({
        reference: enquiry.reference,
        recipientName: admin.name || 'Super Admin',
        vehicle,
        condition: enquiry.condition,
        estimatedValue: enquiry.estimatedValue,
        customerExpectedValue: enquiry.customerExpectedValue,
        valuePreference: enquiry.valuePreference,
        winningBidAmount: winningAmount,
        postcode,
        city,
        customer: {
          fullName: customerName,
          phone: customerPhone,
          email: customerEmail,
          collectionAddress,
        },
        dealer: {
          name: winningDealer?.name || 'Valued Partner',
          email: winningDealer?.email || 'N/A',
          assignedCity: winningDealer?.assignedCity || city,
        },
      });

      sendPromises.push(
        sendEmail({
          to: admin.email,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        }).catch((err) => console.error(`[EmailService] Super Admin winner notification failed for ${admin.email}:`, err))
      );
    });
  } catch (adminErr) {
    console.error(`[EmailService] Error dispatching Super Admin winner notification for ref ${enquiry.reference}:`, adminErr.message);
  }

  try {
    await Promise.all(sendPromises);
    console.log(`[EmailService] Winner emails dispatched for ref: ${enquiry.reference} (Dealer: ${winningDealer?.email}, Customer: ${customerEmail}, Super Admins notified)`);
    return { success: true, count: sendPromises.length };
  } catch (err) {
    console.error(`[EmailService] Error dispatching winner notifications for ref: ${enquiry.reference}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Trigger email when a new user / dealer account is generated from Admin Panel
 */
async function sendAccountCreatedNotification({
  name,
  email,
  password,
  role,
  assignedCity,
}) {
  try {
    if (!email || !email.includes('@')) {
      console.warn('[EmailService] Cannot send account creation email: Invalid email address');
      return { success: false, error: 'Invalid email address' };
    }

    const template = accountCredentialsTemplate({
      name,
      email,
      password,
      role,
      assignedCity,
      loginUrl: process.env.ADMIN_PORTAL_URL || 'https://www.myautoscrap.co.uk/admin/login',
    });

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });

    console.log(`[EmailService] Account credentials email sent to ${email} (Role: ${role})`);
    return result;
  } catch (error) {
    console.error(`[EmailService] Failed to send account credentials email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEmail,
  sendEnquiryCreatedNotifications,
  sendHighValueEnquiryCreatedNotifications,
  sendCustomerVehicleAcceptedNotification,
  sendCustomerVehicleCollectedNotification,
  sendCustomerVehicleCancelledNotification,
  sendMidwayNoBidsNotification,
  sendMidwayActiveBidsNotification,
  sendSuperAdminBiddingEndedNoBidsNotification,
  sendWinningDealerAndCustomerNotifications,
  sendAccountCreatedNotification,
};

