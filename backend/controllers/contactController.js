const { prisma } = require('../config/db');

// Submit a new contact message (Public)
async function submitContactMessage(req, res) {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields (name, phone, email, subject, message) are required.' });
    }

    const contact = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully!',
      contact,
    });
  } catch (err) {
    console.error('Submit Contact Error:', err);
    res.status(500).json({ error: 'Failed to submit contact message.' });
  }
}

// Fetch all contact messages (Super Admin only)
async function getContactSubmissions(req, res) {
  try {
    // Access check: Only Super Admin
    if (req.user?.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access denied. Super Admin privileges required.' });
    }

    const contacts = await prisma.contactSubmission.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    res.json(contacts);
  } catch (err) {
    console.error('Get Contact Submissions Error:', err);
    res.status(500).json({ error: 'Failed to fetch contact submissions.' });
  }
}

// Delete a contact message (Super Admin only)
async function deleteContactSubmission(req, res) {
  try {
    if (req.user?.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Access denied. Super Admin privileges required.' });
    }

    const { id } = req.params;
    await prisma.contactSubmission.delete({
      where: { id: parseInt(id, 10) },
    });

    const remaining = await prisma.contactSubmission.findMany({
      orderBy: { date: 'desc' },
    });

    res.json(remaining);
  } catch (err) {
    console.error('Delete Contact Submission Error:', err);
    res.status(500).json({ error: 'Failed to delete contact message.' });
  }
}

module.exports = {
  submitContactMessage,
  getContactSubmissions,
  deleteContactSubmission,
};
