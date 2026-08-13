const { prisma } = require('../config/db');
const { getCityFromPostcode } = require('../utils/postcodeHelper');

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
      city: row.city || getCityFromPostcode(row.postcode, row.customer?.collectionAddress),
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

async function getPastEnquiries(req, res) {
  try {
    const rows = await prisma.enquiry.findMany({
      where: {
        status: {
          in: ['archived', 'deleted'],
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
      status: row.status || 'archived',
      postcode: row.postcode,
      city: row.city || getCityFromPostcode(row.postcode, row.customer?.collectionAddress),
      vehicle: row.vehicle,
      condition: row.condition,
      customer: row.customer,
      bank: row.bank,
      quote: row.quote,
    }));

    res.json(enquiries);
  } catch (err) {
    console.error('Get Past Enquiries Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function createEnquiry(req, res) {
  try {
    const enquiryData = req.body;
    const existingId = enquiryData.id || enquiryData.enquiry?.id;

    const postcode = enquiryData.postcode || enquiryData.customer?.collectionPostcode || '';
    const address = enquiryData.customer?.collectionAddress || '';
    const city = getCityFromPostcode(postcode, address);

    // If existing enquiry ID provided, perform UPDATE using prisma.enquiry.update
    if (existingId) {
      const numericId = parseInt(existingId, 10);
      if (!isNaN(numericId)) {
        const updatedRow = await prisma.enquiry.update({
          where: { id: numericId },
          data: {
            bank: enquiryData.bank || {},
            customer: enquiryData.customer || {},
            condition: enquiryData.condition || {},
            vehicle: enquiryData.vehicle || {},
            quote: enquiryData.quote || {},
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

    // Insert new enquiry using prisma.enquiry.create
    const reference =
      enquiryData.reference ||
      `MAS-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

    const createdRow = await prisma.enquiry.create({
      data: {
        reference,
        status: 'Pending',
        postcode,
        city,
        vehicle: enquiryData.vehicle || {},
        condition: enquiryData.condition || {},
        customer: enquiryData.customer || {},
        bank: enquiryData.bank || {},
        quote: enquiryData.quote || {},
      },
    });

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

    // Update single record using prisma.enquiry.update
    await prisma.enquiry.update({
      where: { id: numericId },
      data: {
        status: status || targetEnquiry.status,
        customer: currentCustomer,
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

module.exports = {
  getEnquiries,
  getPastEnquiries,
  createEnquiry,
  updateEnquiryStatus,
  updateBulkEnquiryStatus,
  deleteEnquiry,
  deleteManyEnquiries,
};
