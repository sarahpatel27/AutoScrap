const { prisma } = require('../config/db');
const { sendEmail } = require('../services/emailService');
const { promotionalCampaignTemplate } = require('../templates/emails/promotionalCampaign');
const { baseLayout } = require('../templates/emails/baseLayout');

/**
 * Helper to normalize email addresses for strict deduplication
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Helper to check if string is a valid email
 */
function isValidEmail(email) {
  const normalized = normalizeEmail(email);
  return normalized.length > 4 && normalized.includes('@') && normalized.includes('.');
}

/**
 * Fetch deduplicated customer audience across all database tables:
 * 1. Standard Enquiries (enquiries)
 * 2. High-Value Enquiries (high_value_enquiries)
 * 3. Website Contact Submissions (contact_submissions)
 */
async function getCustomerAudience(req, res) {
  try {
    const [standardEnquiries, highValueEnquiries, contactSubmissions] = await Promise.all([
      prisma.enquiry.findMany({
        where: {
          status: {
            notIn: ['deleted'],
          },
        },
        select: {
          id: true,
          reference: true,
          date: true,
          city: true,
          postcode: true,
          customer: true,
          vehicle: true,
        },
      }),
      prisma.highValueEnquiry.findMany({
        where: {
          status: {
            notIn: ['deleted', 'DELETED'],
          },
        },
        select: {
          id: true,
          reference: true,
          createdAt: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          customer: true,
          city: true,
          postcode: true,
          registration: true,
          make: true,
          model: true,
        },
      }),
      prisma.contactSubmission.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          date: true,
        },
      }),
    ]);

    const customerMap = new Map();

    // 1. Process Standard Enquiries
    for (const item of standardEnquiries) {
      const cust = typeof item.customer === 'string'
        ? JSON.parse(item.customer || '{}')
        : (item.customer || {});

      const email = normalizeEmail(cust.email);
      if (!isValidEmail(email)) continue;

      const rawName = cust.fullName || cust.name || '';
      const phone = cust.phone || cust.phoneNumber || '';
      const city = item.city || cust.collectionCity || '';
      const postcode = item.postcode || cust.collectionPostcode || '';
      const itemDate = item.date ? new Date(item.date) : new Date();

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          name: rawName,
          phone,
          city,
          postcode,
          sources: ['Standard Enquiry'],
          lastActive: itemDate,
          totalInteractions: 1,
          latestReference: item.reference,
        });
      } else {
        const existing = customerMap.get(email);
        existing.totalInteractions += 1;
        if (!existing.sources.includes('Standard Enquiry')) {
          existing.sources.push('Standard Enquiry');
        }
        if (!existing.name && rawName) existing.name = rawName;
        if (!existing.phone && phone) existing.phone = phone;
        if (!existing.city && city) existing.city = city;
        if (itemDate > existing.lastActive) {
          existing.lastActive = itemDate;
          existing.latestReference = item.reference;
        }
      }
    }

    // 2. Process High-Value Enquiries
    for (const item of highValueEnquiries) {
      const cust = typeof item.customer === 'string'
        ? JSON.parse(item.customer || '{}')
        : (item.customer || {});

      const email = normalizeEmail(item.customerEmail || cust.email);
      if (!isValidEmail(email)) continue;

      const rawName = item.customerName || cust.fullName || cust.name || '';
      const phone = item.customerPhone || cust.phone || '';
      const city = item.city || '';
      const postcode = item.postcode || '';
      const itemDate = item.createdAt ? new Date(item.createdAt) : new Date();

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          name: rawName,
          phone,
          city,
          postcode,
          sources: ['High-Value Bidding'],
          lastActive: itemDate,
          totalInteractions: 1,
          latestReference: item.reference,
        });
      } else {
        const existing = customerMap.get(email);
        existing.totalInteractions += 1;
        if (!existing.sources.includes('High-Value Bidding')) {
          existing.sources.push('High-Value Bidding');
        }
        if ((!existing.name || existing.name === 'Anonymous Customer') && rawName) {
          existing.name = rawName;
        }
        if (!existing.phone && phone) existing.phone = phone;
        if (!existing.city && city) existing.city = city;
        if (itemDate > existing.lastActive) {
          existing.lastActive = itemDate;
          existing.latestReference = item.reference;
        }
      }
    }

    // 3. Process Contact Form Submissions
    for (const item of contactSubmissions) {
      const email = normalizeEmail(item.email);
      if (!isValidEmail(email)) continue;

      const rawName = item.name || '';
      const phone = item.phone || '';
      const itemDate = item.date ? new Date(item.date) : new Date();

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          name: rawName,
          phone,
          city: '',
          postcode: '',
          sources: ['Contact Message'],
          lastActive: itemDate,
          totalInteractions: 1,
          latestReference: null,
        });
      } else {
        const existing = customerMap.get(email);
        existing.totalInteractions += 1;
        if (!existing.sources.includes('Contact Message')) {
          existing.sources.push('Contact Message');
        }
        if (!existing.name && rawName) existing.name = rawName;
        if (!existing.phone && phone) existing.phone = phone;
        if (itemDate > existing.lastActive) {
          existing.lastActive = itemDate;
        }
      }
    }

    // Convert map to sorted list
    const customers = Array.from(customerMap.values())
      .map((c, index) => ({
        id: `cust_${index + 1}`,
        email: c.email,
        name: c.name || 'Valued Customer',
        phone: c.phone || 'N/A',
        city: c.city || 'UK',
        postcode: c.postcode || '',
        sources: c.sources,
        primarySource: c.sources.join(' & '),
        lastActive: c.lastActive.toISOString(),
        totalInteractions: c.totalInteractions,
        latestReference: c.latestReference,
      }))
      .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());

    res.json({
      totalCount: customers.length,
      customers,
    });
  } catch (err) {
    console.error('Error fetching customer audience:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch customer audience.' });
  }
}

/**
 * Generate preview HTML for a campaign before sending
 */
async function previewPromotionalCampaign(req, res) {
  try {
    const { subject, message, ctaText, ctaUrl, sampleName } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required for preview.' });
    }

    const nameToUse = sampleName || 'John Doe';
    const personalizedMessage = message
      .replace(/\{name\}/gi, nameToUse)
      .replace(/\{email\}/gi, 'john.doe@example.com');

    const template = promotionalCampaignTemplate({
      customerName: nameToUse,
      subject,
      message: personalizedMessage,
      ctaText: ctaText || 'Get Instant Scrap Quote',
      ctaUrl: ctaUrl || 'https://myautoscrap.co.uk/scrap-my-car',
    });

    const fullHtml = baseLayout({
      title: template.subject,
      contentHtml: template.html,
      previewText: template.previewText,
    });

    res.json({
      subject: template.subject,
      html: fullHtml,
    });
  } catch (err) {
    console.error('Error generating campaign preview:', err);
    res.status(500).json({ error: err.message || 'Failed to generate campaign preview.' });
  }
}

/**
 * Dispatch promotional email campaign to selected recipients
 */
async function sendPromotionalCampaign(req, res) {
  try {
    const { recipients, subject, message, ctaText, ctaUrl } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient is required.' });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Campaign subject line is required.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Campaign message content is required.' });
    }

    // Deduplicate recipients list
    const seenEmails = new Set();
    const cleanRecipients = [];

    for (const r of recipients) {
      const email = typeof r === 'string' ? normalizeEmail(r) : normalizeEmail(r.email);
      const name = (typeof r === 'object' && r.name) ? r.name.trim() : '';

      if (isValidEmail(email) && !seenEmails.has(email)) {
        seenEmails.add(email);
        cleanRecipients.push({ email, name: name || 'Valued Customer' });
      }
    }

    if (cleanRecipients.length === 0) {
      return res.status(400).json({ error: 'No valid recipient email addresses provided.' });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // Send emails in batches of 10 for performance and throughput
    const batchSize = 10;
    for (let i = 0; i < cleanRecipients.length; i += batchSize) {
      const batch = cleanRecipients.slice(i, i + batchSize);

      const batchPromises = batch.map(async (recipient) => {
        try {
          const personalizedName = recipient.name && recipient.name !== 'Valued Customer' ? recipient.name : '';
          const greetingName = personalizedName || 'Valued Customer';

          const personalizedMessage = message
            .replace(/\{name\}/gi, greetingName)
            .replace(/\{email\}/gi, recipient.email);

          const template = promotionalCampaignTemplate({
            customerName: greetingName,
            subject,
            message: personalizedMessage,
            ctaText: ctaText || 'Get Instant Scrap Quote',
            ctaUrl: ctaUrl || 'https://myautoscrap.co.uk/scrap-my-car',
          });

          const result = await sendEmail({
            to: recipient.email,
            subject: template.subject,
            html: template.html,
          });

          if (result.success) {
            successCount++;
          } else {
            failCount++;
            errors.push({ email: recipient.email, error: result.error });
          }
        } catch (error) {
          failCount++;
          errors.push({ email: recipient.email, error: error.message });
        }
      });

      await Promise.all(batchPromises);
    }

    console.log(`[PromotionController] Campaign "${subject}" finished: ${successCount} sent, ${failCount} failed out of ${cleanRecipients.length} recipients.`);

    res.json({
      success: true,
      totalRecipients: cleanRecipients.length,
      successCount,
      failCount,
      errors: errors.slice(0, 10), // return first 10 errors if any
    });
  } catch (err) {
    console.error('Error dispatching promotional campaign:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch promotional campaign.' });
  }
}

module.exports = {
  getCustomerAudience,
  previewPromotionalCampaign,
  sendPromotionalCampaign,
};
