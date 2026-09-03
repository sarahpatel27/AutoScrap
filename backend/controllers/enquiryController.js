const { prisma } = require('../config/db');
const { getCityFromPostcode } = require('../utils/postcodeHelper');
const { isDealerEligibleForEnquiry } = require('../utils/dealerEligibility');
const { anonymizeEnquiryForDealer } = require('../utils/dealerAnonymizer');
const { autoResolveExpiredBids, processMidwayBiddingNotifications } = require('../services/biddingAutoResolver');
const {
  sendStandardEnquiryEmail,
  sendHighValueEnquiryEmail,
  sendStandardEnquiryStatusEmail,
} = require('../services/enquiryNotificationService');
const { sendWinningDealerAndCustomerNotifications } = require('../services/emailService');


async function getEnquiries(req, res) {
  try {
    const rows = await prisma.enquiry.findMany({
      where: {
        status: {
          notIn: ['archived', 'deleted'],
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const enquiries = rows.map((row) => ({
      id: String(row.id),
      reference: row.reference,
      date: row.date ? row.date.toISOString() : new Date().toISOString(),
      status: row.status || 'Pending',
      postcode: row.postcode,
      city: row.city || 'Unassigned',
      vehicle: row.vehicle,
      condition: row.condition,
      customer: row.customer,
      bank: row.bank,
      quote: row.quote,
    }));

    res.json(enquiries);
  } catch (err) {
    console.error('Get Enquiries Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getHighValueEnquiries(req, res) {
  try {
    const user = req.user;
    await autoResolveExpiredBids();
    await processMidwayBiddingNotifications();

    const rows = await prisma.highValueEnquiry.findMany({
      where: {
        status: {
          notIn: ['archived', 'deleted', 'ARCHIVED', 'DELETED'],
        },
      },
      include: {
        bids: {
          include: {
            dealer: {
              select: {
                id: true,
                name: true,
                email: true,
                assignedCity: true,
              },
            },
          },
          orderBy: { amount: 'desc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Backend territory filtering: Super Admin gets all, City Dealers only see eligible territory enquiries
    const eligibleRows = rows.filter((row) => isDealerEligibleForEnquiry(user, row));

    // Server-side Anonymization: Strips customer name/email/phone and competing dealer identities for non-winning dealers
    let items = eligibleRows.map((row) => anonymizeEnquiryForDealer(row, user));

    // Role-based visibility logic:
    // For Winning Dealer (DEALER_SELECTED): Remains in High Value Bidding section for winning dealer & Super Admin.
    // For non-winning City Dealers: Ended, non-winning DEALER_SELECTED, purchased, or cancelled enquiries move to Past Enquiries.
    if (user?.role === 'City Dealer') {
      items = items.filter((item) => {
        const isWinningDealer = item.winningDealerId && String(item.winningDealerId) === String(user.id);
        if (item.status === 'DEALER_SELECTED' && isWinningDealer) {
          return true;
        }
        return !['BIDDING_ENDED', 'DEALER_SELECTED', 'PURCHASED', 'CANCELLED', 'ARCHIVED', 'DELETED'].includes(item.status);
      });
    }

    res.json(items);
  } catch (err) {
    console.error('Get High Value Enquiries Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getPastEnquiries(req, res) {
  try {
    const user = req.user;
    await autoResolveExpiredBids();

    const [standardRows, highValueRows] = await Promise.all([
      prisma.enquiry.findMany({
        where: {
          status: {
            in: ['archived', 'deleted', 'ARCHIVED', 'DELETED'],
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.highValueEnquiry.findMany({
        where: {
          OR: [
            {
              status: {
                in: ['archived', 'deleted', 'ARCHIVED', 'DELETED', 'BIDDING_ENDED', 'DEALER_SELECTED', 'PURCHASED', 'CANCELLED'],
              },
            },
            {
              biddingEndsAt: {
                lte: new Date(),
              },
            },
          ],
        },
        include: {
          bids: {
            include: {
              dealer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  assignedCity: true,
                },
              },
            },
            orderBy: { amount: 'desc' },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const enquiries = standardRows.map((row) => ({
      id: String(row.id),
      reference: row.reference,
      date: row.date ? row.date.toISOString() : new Date().toISOString(),
      status: row.status || 'archived',
      postcode: row.postcode,
      city: row.city || 'Unassigned',
      vehicle: row.vehicle,
      condition: row.condition,
      customer: row.customer,
      bank: row.bank,
      quote: row.quote,
    }));

    const eligibleHVRows = highValueRows.filter((row) => isDealerEligibleForEnquiry(user, row));
    let pastHighValueEnquiries = eligibleHVRows.map((row) => anonymizeEnquiryForDealer(row, user));

    // Role-based visibility logic for Past Enquiries:
    // For Super Admin: Only show enquiries explicitly deleted/archived by admin.
    // For City Dealers: Active DEALER_SELECTED stays in High Value Bidding tab for winning dealer.
    // All ended, selected (for non-winners), purchased, cancelled, archived, and deleted enquiries appear in Past Enquiries for City Dealers.
    if (user?.role === 'Super Admin') {
      pastHighValueEnquiries = pastHighValueEnquiries.filter((item) =>
        ['archived', 'deleted', 'ARCHIVED', 'DELETED'].includes(item.status)
      );
    } else if (user?.role === 'City Dealer') {
      pastHighValueEnquiries = pastHighValueEnquiries.filter((item) => {
        const isWinningDealer = Boolean(item.winningDealerId) && String(item.winningDealerId) === String(user.id);

        // Active DEALER_SELECTED stays in High Value Bidding tab for winning dealer (not Past Enquiries)
        if (item.status === 'DEALER_SELECTED' && isWinningDealer) {
          return false;
        }

        // Active open bidding or pending enquiries stay in High Value Bidding tab (not Past Enquiries)
        if (['BIDDING', 'PENDING'].includes(item.status)) {
          const isExpired = item.biddingEndsAt && new Date(item.biddingEndsAt) <= new Date();
          if (!isExpired) {
            return false;
          }
        }

        // All ended, selected, purchased, cancelled, archived, or deleted high-value enquiries appear in Past Enquiries
        return true;
      });
    }

    res.json({
      pastEnquiries: enquiries,
      pastHighValueEnquiries,
    });
  } catch (err) {
    console.error('Get Past Enquiries Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteHighValueEnquiry(req, res) {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Invalid High-Value Enquiry ID' });
    }

    await prisma.highValueEnquiry.update({
      where: { id: numericId },
      data: { status: 'archived' },
    });

    const user = req.user;
    const remainingRows = await prisma.highValueEnquiry.findMany({
      where: {
        status: {
          notIn: ['archived', 'deleted', 'ARCHIVED', 'DELETED'],
        },
      },
      include: {
        bids: {
          include: {
            dealer: {
              select: {
                id: true,
                name: true,
                email: true,
                assignedCity: true,
              },
            },
          },
          orderBy: { amount: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = remainingRows
      .filter((row) => isDealerEligibleForEnquiry(user, row))
      .map((row) => anonymizeEnquiryForDealer(row, user));

    res.json(items);
  } catch (err) {
    console.error('Delete High Value Enquiry Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteManyHighValueEnquiries(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const numericIds = ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));

    await prisma.highValueEnquiry.updateMany({
      where: {
        id: {
          in: numericIds,
        },
      },
      data: {
        status: 'archived',
      },
    });

    const user = req.user;
    const remainingRows = await prisma.highValueEnquiry.findMany({
      where: {
        status: {
          notIn: ['archived', 'deleted', 'ARCHIVED', 'DELETED'],
        },
      },
      include: {
        bids: {
          include: {
            dealer: {
              select: {
                id: true,
                name: true,
                email: true,
                assignedCity: true,
              },
            },
          },
          orderBy: { amount: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = remainingRows
      .filter((row) => isDealerEligibleForEnquiry(user, row))
      .map((row) => anonymizeEnquiryForDealer(row, user));

    res.json(items);
  } catch (err) {
    console.error('Delete Many High Value Enquiries Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function createEnquiry(req, res) {
  try {
    const enquiryData = req.body || {};
    const existingId = enquiryData.id || enquiryData.enquiry?.id;

    // Helper to safely parse stringified JSON or keep object
    const parseJsonField = (val, fallback = {}) => {
      if (!val) return fallback;
      if (typeof val === 'object') return val;
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    };

    const customerObj = parseJsonField(enquiryData.customer, {
      fullName: enquiryData.customerName || '',
      email: enquiryData.customerEmail || '',
      phone: enquiryData.customerPhone || '',
      collectionAddress: enquiryData.collectionAddress || '',
      additionalAddressDetails: enquiryData.additionalAddressDetails || '',
    });

    const vehicleObj = parseJsonField(enquiryData.vehicle, {
      registration: enquiryData.registration || '',
      make: enquiryData.make || '',
      model: enquiryData.model || '',
      year: enquiryData.year || '',
      fuelType: enquiryData.fuelType || '',
      engineSize: enquiryData.engineSize || '',
      colour: enquiryData.colour || '',
    });

    const conditionObj = parseJsonField(enquiryData.condition, enquiryData.vehicleCondition || 'Good');
    const bankObj = parseJsonField(enquiryData.bank, {});
    const quoteObj = parseJsonField(enquiryData.quote, {});

    const postcode = enquiryData.postcode || customerObj.collectionPostcode || '';
    let city = enquiryData.city || enquiryData.matchedServiceArea;
    if (!city || city === 'Other' || city === 'Unassigned') {
      city = await getCityFromPostcode(postcode, address);
    }

    // Type conversion helpers
    const toInteger = (val, fallback = null) => {
      if (val === null || val === undefined || val === '') return fallback;
      const num = parseInt(val, 10);
      return isNaN(num) ? fallback : num;
    };

    const toNumber = (val, fallback = 0) => {
      if (val === null || val === undefined || val === '') return fallback;
      const num = parseFloat(val);
      return isNaN(num) ? fallback : num;
    };

    const isHighValueReq =
      String(enquiryData.isHighValue) === 'true' ||
      enquiryData.isHighValue === true ||
      (vehicleObj?.year && Number(vehicleObj.year) > 2015) ||
      (enquiryData.year && Number(enquiryData.year) > 2015);

    // If existing enquiry ID provided, try updating HighValueEnquiry or Enquiry accordingly
    if (existingId) {
      const numericId = parseInt(existingId, 10);
      if (!isNaN(numericId)) {
        // First check if this ID exists in HighValueEnquiry table
        const existingHV = await prisma.highValueEnquiry.findUnique({ where: { id: numericId } });
        if (existingHV) {
          const updatedHV = await prisma.highValueEnquiry.update({
            where: { id: numericId },
            data: {
              customerName: customerObj.fullName || existingHV.customerName,
              customerEmail: customerObj.email || existingHV.customerEmail,
              customerPhone: customerObj.phone || existingHV.customerPhone,
              customer: customerObj,
              bank: bankObj,
              postcode: postcode || existingHV.postcode,
              city: city || existingHV.city,
            },
          });
          return res.json({
            id: String(updatedHV.id),
            reference: updatedHV.reference,
            isHighValue: true,
            date: updatedHV.createdAt,
            status: updatedHV.status,
            postcode: updatedHV.postcode,
            city: updatedHV.city,
            vehicle: vehicleObj,
            customer: updatedHV.customer || customerObj,
            bank: updatedHV.bank,
            estimatedValue: Number(updatedHV.estimatedValue),
            customerExpectedValue: Number(updatedHV.customerExpectedValue),
            valuePreference: updatedHV.valuePreference,
          });
        }

        // Check standard Enquiry table
        const existingStd = await prisma.enquiry.findUnique({ where: { id: numericId } });
        if (existingStd) {
          const updatedRow = await prisma.enquiry.update({
            where: { id: numericId },
            data: {
              bank: bankObj,
              customer: customerObj,
              condition: conditionObj,
              vehicle: vehicleObj,
              quote: quoteObj,
              postcode,
              city,
            },
          });

          return res.json({
            id: String(updatedRow.id),
            reference: updatedRow.reference,
            date: updatedRow.date,
            status: updatedRow.status,
            postcode: updatedRow.postcode,
            city: updatedRow.city,
            vehicle: updatedRow.vehicle,
            condition: updatedRow.condition,
            customer: updatedRow.customer,
            bank: updatedRow.bank,
            quote: updatedRow.quote,
          });
        }
      }
    }

    // Process uploaded photos strictly from multer files
    const photos = (req.files && Array.isArray(req.files))
      ? req.files.map((file) => ({
          name: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/high-value/${file.filename}`,
        }))
      : [];

    // Check if this is a High-Value Enquiry (>2015)
    if (isHighValueReq) {
      const reference =
        enquiryData.reference ||
        `MAS-HV-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

      const rawEstimated = enquiryData.estimatedValue || quoteObj?.finalValue || 1250;
      const estimatedValue = toNumber(rawEstimated, 1250);
      const valuePreference = enquiryData.valuePreference || 'ESTIMATED_VALUE';
      const customerExpectedValue = valuePreference === 'CUSTOM_VALUE'
        ? toNumber(enquiryData.customerExpectedValue || estimatedValue, estimatedValue)
        : estimatedValue;

      const yearVal = toInteger(vehicleObj.year || enquiryData.year, new Date().getFullYear());
      const mileageVal = toInteger(enquiryData.mileage || vehicleObj.mileage, null);

      const { calculateBiddingDeadline } = require('../config/biddingConfig');
      const now = new Date();
      const biddingEndsAt = calculateBiddingDeadline(now);

      const highValueRecord = await prisma.highValueEnquiry.create({
        data: {
          reference,
          customerName: customerObj.fullName || enquiryData.customerName || 'Anonymous Customer',
          customerEmail: customerObj.email || enquiryData.customerEmail || 'no-email@autoscrap.co.uk',
          customerPhone: customerObj.phone || enquiryData.customerPhone || '',
          customer: customerObj,
          registration: vehicleObj.registration || enquiryData.registration || '',
          make: vehicleObj.make || enquiryData.make || 'Unknown Make',
          model: vehicleObj.model || enquiryData.model || 'Unknown Model',
          year: yearVal,
          mileage: mileageVal,
          condition: typeof conditionObj === 'string' ? conditionObj : (enquiryData.vehicleCondition || 'Good'),
          photos: photos,
          postcode,
          city,
          area: city,
          estimatedValue,
          customerExpectedValue,
          valuePreference,
          bank: bankObj,
          status: 'BIDDING',
          biddingStartAt: now,
          biddingEndsAt: biddingEndsAt,
        },
      });

      // Asynchronously dispatch notification emails for High-Value Enquiry Bidding Start
      sendHighValueEnquiryEmail(highValueRecord, {
        ...enquiryData,
        customer: customerObj,
        vehicle: vehicleObj,
      });

      return res.status(201).json({
        id: String(highValueRecord.id),
        reference: highValueRecord.reference,
        isHighValue: true,
        date: highValueRecord.createdAt,
        status: highValueRecord.status,
        postcode: highValueRecord.postcode,
        city: highValueRecord.city,
        vehicle: vehicleObj,
        customer: customerObj,
        photos: highValueRecord.photos,
        estimatedValue: Number(highValueRecord.estimatedValue),
        customerExpectedValue: Number(highValueRecord.customerExpectedValue),
        valuePreference: highValueRecord.valuePreference,
        biddingStartAt: highValueRecord.biddingStartAt,
        biddingEndsAt: highValueRecord.biddingEndsAt,
        winningDealerId: highValueRecord.winningDealerId,
        winningBidId: highValueRecord.winningBidId,
      });
    }

    // Standard Scrap Enquiry Insert using prisma.enquiry.create
    const reference =
      enquiryData.reference ||
      `MAS-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

    const createdRow = await prisma.enquiry.create({
      data: {
        reference,
        status: 'Pending',
        postcode,
        city,
        vehicle: vehicleObj || enquiryData.vehicle || {},
        condition: typeof conditionObj === 'object' ? conditionObj : { overallCondition: conditionObj },
        customer: customerObj || enquiryData.customer || {},
        bank: bankObj || enquiryData.bank || {},
        quote: quoteObj || enquiryData.quote || {},
      },
    });

    // Asynchronously dispatch notification emails to Customer, City Dealer & Super Admin
    sendStandardEnquiryEmail(createdRow);

    res.status(201).json({

      id: String(createdRow.id),
      reference: createdRow.reference,
      date: createdRow.date,
      status: createdRow.status,
      postcode: createdRow.postcode,
      city: createdRow.city,
      vehicle: createdRow.vehicle,
      condition: createdRow.condition,
      customer: createdRow.customer,
      bank: createdRow.bank,
      quote: createdRow.quote,
    });
  } catch (err) {
    console.error('Create/Update Enquiry Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function updateEnquiryStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const numericId = parseInt(id, 10);

    const targetEnquiry = await prisma.enquiry.findUnique({
      where: { id: numericId },
    });

    if (!targetEnquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    const currentCustomer = targetEnquiry.customer || {};
    if (notes !== undefined) {
      currentCustomer.notes = notes;
    }

    const newStatus = status || targetEnquiry.status;

    // Update single record using prisma.enquiry.update
    const updatedRecord = await prisma.enquiry.update({
      where: { id: numericId },
      data: {
        status: newStatus,
        customer: currentCustomer,
      },
    });

    // Send customer notification email if status is updated to Accepted or Collected
    if (newStatus && (newStatus.toLowerCase() === 'accepted' || newStatus.toLowerCase() === 'collected')) {
      sendStandardEnquiryStatusEmail(updatedRecord, newStatus);
    }

    const all = await prisma.enquiry.findMany({
      where: {
        status: {
          notIn: ['archived', 'deleted'],
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(
      all.map((row) => ({
        id: String(row.id),
        reference: row.reference,
        date: row.date,
        status: row.status,
        postcode: row.postcode,
        city: row.city,
        vehicle: row.vehicle,
        condition: row.condition,
        customer: row.customer,
        bank: row.bank,
        quote: row.quote,
      })),
    );
  } catch (err) {
    console.error('Update Enquiry Status Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function updateBulkEnquiryStatus(req, res) {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ error: 'ids array and status are required' });
    }

    const numericIds = ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));

    // Update multiple records using Prisma ORM method updateMany
    await prisma.enquiry.updateMany({
      where: {
        id: {
          in: numericIds,
        },
      },
      data: {
        status,
      },
    });

    // Trigger status emails for bulk update if status is Accepted or Collected
    if (status && (status.toLowerCase() === 'accepted' || status.toLowerCase() === 'collected')) {
      const affectedEnquiries = await prisma.enquiry.findMany({
        where: {
          id: {
            in: numericIds,
          },
        },
      });
      affectedEnquiries.forEach((item) => {
        sendStandardEnquiryStatusEmail(item, status);
      });
    }

    const all = await prisma.enquiry.findMany({
      where: {
        status: {
          notIn: ['archived', 'deleted'],
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(
      all.map((row) => ({
        id: String(row.id),
        reference: row.reference,
        date: row.date,
        status: row.status,
        postcode: row.postcode,
        city: row.city,
        vehicle: row.vehicle,
        condition: row.condition,
        customer: row.customer,
        bank: row.bank,
        quote: row.quote,
      })),
    );
  } catch (err) {
    console.error('Bulk Update Enquiry Status Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteEnquiry(req, res) {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    // Soft delete: update status to 'archived' instead of permanently deleting record
    await prisma.enquiry.update({
      where: { id: numericId },
      data: { status: 'archived' },
    });

    const all = await prisma.enquiry.findMany({
      where: {
        status: {
          notIn: ['archived', 'deleted'],
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(
      all.map((row) => ({
        id: String(row.id),
        reference: row.reference,
        date: row.date,
        status: row.status,
        postcode: row.postcode,
        city: row.city,
        vehicle: row.vehicle,
        condition: row.condition,
        customer: row.customer,
        bank: row.bank,
        quote: row.quote,
      })),
    );
  } catch (err) {
    console.error('Delete Enquiry Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteManyEnquiries(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const numericIds = ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));

    // Soft delete multiple records by updating status to 'archived'
    await prisma.enquiry.updateMany({
      where: {
        id: {
          in: numericIds,
        },
      },
      data: {
        status: 'archived',
      },
    });

    const all = await prisma.enquiry.findMany({
      where: { 
        status: {
          notIn: ['archived', 'deleted'],
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(
      all.map((row) => ({
        id: String(row.id),
        reference: row.reference,
        date: row.date,
        status: row.status,
        postcode: row.postcode,
        city: row.city,
        vehicle: row.vehicle,
        condition: row.condition,
        customer: row.customer,
        bank: row.bank,
        quote: row.quote,
      })),
    );
  } catch (err) {
    console.error('Delete Many Enquiries Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function placeDealerBid(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to place a bid.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'Your dealer account has been deactivated because coverage for your assigned city was removed.' });
    }

    const { enquiryId, amount } = req.body;
    const numericEnquiryId = parseInt(enquiryId, 10);

    if (isNaN(numericEnquiryId)) {
      return res.status(400).json({ error: 'Valid high-value enquiry ID is required.' });
    }

    // Server-side money validation
    const { validateBidAmount } = require('../utils/bidValidation');
    const validation = validateBidAmount(amount);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Retrieve HighValueEnquiry from database
    const enquiry = await prisma.highValueEnquiry.findUnique({
      where: { id: numericEnquiryId },
    });

    if (!enquiry) {
      return res.status(404).json({ error: 'High-value enquiry not found.' });
    }

    // Check completion & archived/deleted status
    if (['archived', 'deleted', 'ARCHIVED', 'DELETED', 'PURCHASED', 'CANCELLED', 'DEALER_SELECTED', 'BIDDING_ENDED'].includes(enquiry.status)) {
      return res.status(400).json({ error: `Bidding is permanently closed for this vehicle (status: ${enquiry.status}).` });
    }

    // Authoritative Server-Side Deadline Check using central biddingConfig
    const { isBiddingExpired, calculateBiddingDeadline } = require('../config/biddingConfig');

    if (isBiddingExpired(enquiry.biddingEndsAt)) {
      // ONLY update status to BIDDING_ENDED if status is currently active (PENDING or BIDDING)
      // Do NOT overwrite 'archived', 'deleted', 'PURCHASED', 'CANCELLED', or 'DEALER_SELECTED'
      if (['PENDING', 'BIDDING'].includes(enquiry.status)) {
        await prisma.highValueEnquiry.update({
          where: { id: numericEnquiryId },
          data: { status: 'BIDDING_ENDED' },
        });
      }
      return res.status(400).json({ error: 'Bidding period for this vehicle has ended.' });
    }

    // Server-side territory eligibility validation
    const { isDealerEligibleForEnquiry } = require('../utils/dealerEligibility');
    if (!isDealerEligibleForEnquiry(user, enquiry)) {
      return res.status(403).json({ error: 'You are not eligible to bid on enquiries outside your assigned territory.' });
    }

    // Perform upsert on DealerBid table (updates existing dealer bid or creates new)
    const bid = await prisma.dealerBid.upsert({
      where: {
        highValueEnquiryId_dealerId: {
          highValueEnquiryId: numericEnquiryId,
          dealerId: user.id,
        },
      },
      update: {
        amount: validation.numericAmount,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      create: {
        highValueEnquiryId: numericEnquiryId,
        dealerId: user.id,
        amount: validation.numericAmount,
        status: 'ACTIVE',
      },
    });

    // Ensure biddingStartAt and biddingEndsAt are set using enquiry creation date if missing
    if (!enquiry.biddingEndsAt) {
      const startDate = enquiry.biddingStartAt || enquiry.createdAt || new Date();
      const endDate = calculateBiddingDeadline(startDate);

      await prisma.highValueEnquiry.update({
        where: { id: numericEnquiryId },
        data: {
          status: enquiry.status === 'PENDING' ? 'BIDDING' : enquiry.status,
          biddingStartAt: startDate,
          biddingEndsAt: endDate,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Your bid of £${validation.numericAmount.toLocaleString('en-GB')} has been submitted successfully.`,
      bid: {
        id: String(bid.id),
        enquiryId: String(bid.highValueEnquiryId),
        dealerId: String(bid.dealerId),
        amount: Number(bid.amount),
        status: bid.status,
      },
    });
  } catch (err) {
    console.error('Place Dealer Bid Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error while submitting bid.' });
  }
}

async function selectWinningDealer(req, res) {
  try {
    const user = req.user;
    if (!user || user.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Admin can select a winning dealer.' });
    }

    const { enquiryId, bidId } = req.body;
    const numericEnquiryId = parseInt(enquiryId, 10);
    const numericBidId = parseInt(bidId, 10);

    if (isNaN(numericEnquiryId) || isNaN(numericBidId)) {
      return res.status(400).json({ error: 'Valid enquiry ID and bid ID are required.' });
    }

    // Transaction-Safe Winner Selection: Guarantees single winner under concurrency
    const result = await prisma.$transaction(async (tx) => {
      const enquiry = await tx.highValueEnquiry.findUnique({
        where: { id: numericEnquiryId },
      });

      if (!enquiry) {
        throw new Error('High-value enquiry not found.');
      }

      if (enquiry.status === 'PURCHASED' || enquiry.status === 'CANCELLED') {
        throw new Error(`Enquiry is already ${enquiry.status}.`);
      }

      if (enquiry.winningDealerId || enquiry.winningBidId) {
        throw new Error('A winning dealer has already been selected for this enquiry.');
      }

      const targetBid = await tx.dealerBid.findUnique({
        where: { id: numericBidId },
        include: { dealer: true },
      });

      if (!targetBid || targetBid.highValueEnquiryId !== numericEnquiryId) {
        throw new Error('Target bid not found for this enquiry.');
      }

      const now = new Date();

      // 1. Update target bid status to WINNING
      const updatedBid = await tx.dealerBid.update({
        where: { id: numericBidId },
        data: { status: 'WINNING' },
      });

      // 2. Mark all other bids for this enquiry as REJECTED
      await tx.dealerBid.updateMany({
        where: {
          highValueEnquiryId: numericEnquiryId,
          id: { not: numericBidId },
        },
        data: { status: 'REJECTED' },
      });

      // 3. Update HighValueEnquiry record
      const updatedEnquiry = await tx.highValueEnquiry.update({
        where: { id: numericEnquiryId },
        data: {
          status: 'DEALER_SELECTED',
          winningDealerId: targetBid.dealerId,
          winningBidId: targetBid.id,
          winnerSelectedAt: now,
        },
      });

      return {
        enquiry: updatedEnquiry,
        bid: updatedBid,
        dealer: targetBid.dealer,
      };
    });

    // Asynchronously dispatch notifications to the winning dealer (with customer details) and customer (with dealer details)
    sendWinningDealerAndCustomerNotifications({
      enquiry: result.enquiry,
      winningBid: result.bid,
      winningDealer: result.dealer,
    }).catch((err) => {
      console.error(`[EnquiryController] Winner notification failed for ref ${result.enquiry.reference}:`, err.message);
    });

    res.status(200).json({
      success: true,
      message: `Dealer '${result.dealer?.name || 'Selected Dealer'}' has been selected as the winner for £${Number(result.bid.amount).toLocaleString('en-GB')}.`,
      data: {
        enquiryId: String(result.enquiry.id),
        winningDealerId: String(result.enquiry.winningDealerId),
        winningBidId: String(result.enquiry.winningBidId),
        winnerSelectedAt: result.enquiry.winnerSelectedAt.toISOString(),
        status: result.enquiry.status,
      },
    });
  } catch (err) {
    console.error('Select Winning Dealer Error:', err);
    res.status(400).json({ error: err.message || 'Failed to select winning dealer.' });
  }
}

async function markEnquiryPurchased(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { enquiryId } = req.body;
    const numericEnquiryId = parseInt(enquiryId, 10);

    if (isNaN(numericEnquiryId)) {
      return res.status(400).json({ error: 'Valid high-value enquiry ID is required.' });
    }

    const enquiry = await prisma.highValueEnquiry.findUnique({
      where: { id: numericEnquiryId },
    });

    if (!enquiry) {
      return res.status(404).json({ error: 'High-value enquiry not found.' });
    }

    const isSuperAdmin = user.role === 'Super Admin';
    const isWinningDealer = Number(enquiry.winningDealerId) === Number(user.id);

    if (!isSuperAdmin && !isWinningDealer) {
      return res.status(403).json({ error: 'Only the winning dealer or an admin can mark this transaction complete.' });
    }

    if (enquiry.status === 'PURCHASED') {
      return res.status(400).json({ error: 'Enquiry has already been marked as PURCHASED.' });
    }

    const now = new Date();
    const updated = await prisma.highValueEnquiry.update({
      where: { id: numericEnquiryId },
      data: {
        status: 'PURCHASED',
        purchasedAt: now,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Transaction completed successfully! Vehicle marked as PURCHASED.',
      data: {
        id: String(updated.id),
        status: updated.status,
        purchasedAt: updated.purchasedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('Mark Enquiry Purchased Error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete transaction.' });
  }
}

module.exports = {
  getEnquiries,
  getHighValueEnquiries,
  getPastEnquiries,
  createEnquiry,
  placeDealerBid,
  selectWinningDealer,
  markEnquiryPurchased,
  updateEnquiryStatus,
  updateBulkEnquiryStatus,
  deleteEnquiry,
  deleteManyEnquiries,
  deleteHighValueEnquiry,
  deleteManyHighValueEnquiries,
};
