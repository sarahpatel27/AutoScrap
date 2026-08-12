const { pool } = require('../config/db');
const { getCityFromPostcode } = require('../utils/postcodeHelper');

async function getEnquiries(req, res) {
  try {
    const result = await pool.query('SELECT * FROM enquiries ORDER BY date DESC');
    const enquiries = result.rows.map((row) => ({
      id: String(row.id),
      reference: row.reference,
      date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
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

async function createEnquiry(req, res) {
  try {
    const enquiryData = req.body;
    const existingId = enquiryData.id || enquiryData.enquiry?.id;

    const postcode = enquiryData.postcode || enquiryData.customer?.collectionPostcode || '';
    const address = enquiryData.customer?.collectionAddress || '';
    const city = getCityFromPostcode(postcode, address);

    // If existing enquiry ID provided (e.g. updating bank details), perform UPDATE
    if (existingId) {
      const updateResult = await pool.query(
        `UPDATE enquiries
         SET bank = $1, customer = $2, condition = $3, vehicle = $4, quote = $5, postcode = $6, city = $7
         WHERE id = $8 RETURNING *`,
        [
          JSON.stringify(enquiryData.bank || {}),
          JSON.stringify(enquiryData.customer || {}),
          JSON.stringify(enquiryData.condition || {}),
          JSON.stringify(enquiryData.vehicle || {}),
          JSON.stringify(enquiryData.quote || {}),
          postcode,
          city,
          existingId,
        ],
      );

      if (updateResult.rows.length > 0) {
        const row = updateResult.rows[0];
        return res.json({
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
        });
      }
    }

    // Insert new enquiry
    const reference =
      enquiryData.reference ||
      `MAS-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

    const result = await pool.query(
      `INSERT INTO enquiries (reference, status, postcode, city, vehicle, condition, customer, bank, quote)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        reference,
        'Pending',
        postcode,
        city,
        JSON.stringify(enquiryData.vehicle || {}),
        JSON.stringify(enquiryData.condition || {}),
        JSON.stringify(enquiryData.customer || {}),
        JSON.stringify(enquiryData.bank || {}),
        JSON.stringify(enquiryData.quote || {}),
      ],
    );

    const row = result.rows[0];
    res.status(201).json({
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

    const findResult = await pool.query('SELECT * FROM enquiries WHERE id = $1', [id]);
    if (findResult.rows.length === 0) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    const currentCustomer = findResult.rows[0].customer || {};
    if (notes !== undefined) {
      currentCustomer.notes = notes;
    }

    await pool.query(
      'UPDATE enquiries SET status = $1, customer = $2 WHERE id = $3',
      [status || findResult.rows[0].status, JSON.stringify(currentCustomer), id],
    );

    const all = await pool.query('SELECT * FROM enquiries ORDER BY date DESC');
    res.json(
      all.rows.map((row) => ({
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

async function deleteEnquiry(req, res) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM enquiries WHERE id = $1', [id]);

    const all = await pool.query('SELECT * FROM enquiries ORDER BY date DESC');
    res.json(
      all.rows.map((row) => ({
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

module.exports = {
  getEnquiries,
  createEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
};
