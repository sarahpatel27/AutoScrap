/**
 * New Car Enquiry Notification Email Template for City Dealer & Super Admin
 * Engineered for 100% readability across Light and Dark email clients (iOS Mail, Gmail, Outlook).
 */
function dealerEnquiryTemplate({
  reference,
  recipientRole = 'City Dealer', // 'City Dealer' | 'Super Admin'
  recipientName = '',
  vehicle,
  quoteAmount,
  postcode,
  city,
  customer,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || 'Unknown Make';
  const model = vehicle?.model || 'Unknown Model';
  const year = vehicle?.year ? `(${vehicle.year})` : '';
  const numericQuote = Number(quoteAmount) || 0;
  const formattedQuote = `£${numericQuote.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const customerName = customer?.fullName || 'N/A';
  const customerPhone = customer?.phone || 'N/A';
  const customerEmail = customer?.email || 'N/A';
  const collectionAddress = customer?.collectionAddress || '';

  const isSuperAdmin = recipientRole === 'Super Admin';
  const headingTitle = isSuperAdmin ? 'New Car Enquiry (Super Admin)' : `New Car Enquiry - ${city || 'Territory'}`;

  const contentHtml = `
    <!-- Top Alert Card (Clean Emerald Theme with high contrast) -->
    <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-left: 5px solid #0f7b4f; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        ${recipientRole} Notification
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0f7b4f;">
        ${headingTitle}
      </h1>
      <div style="font-size: 13px; color: #166534; font-weight: 500;">
        Ref: <strong style="color: #0f7b4f; font-weight: 800;">${reference}</strong> • Territory: <strong>${city || 'UK'}</strong>
      </div>
    </div>

    <p style="font-size: 15px; color: #334155; margin: 0 0 20px 0; line-height: 1.5;">
      ${recipientName ? `Hello <strong>${recipientName}</strong>, a` : 'A'} new customer vehicle enquiry has been submitted.
    </p>

    <!-- Vehicle Details Table -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
        Vehicle Details
      </div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Registration</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-transform: uppercase;">${reg}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Make & Model</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${make} ${model} ${year}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Quote Amount</td>
          <td style="padding: 8px 0; color: #0f7b4f; font-weight: 800; font-size: 16px;">${formattedQuote}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">City / Postcode</td>
          <td style="padding: 8px 0; color: #0f172a;">${city || 'Unassigned'} (${postcode || 'N/A'})</td>
        </tr>
        ${collectionAddress ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Collection Address</td>
          <td style="padding: 8px 0; color: #0f172a;">${collectionAddress}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- Customer Contact Info Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">
        Customer Contact Details
      </div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 7px 0; color: #64748b; font-weight: 600; width: 35%;">Full Name</td>
          <td style="padding: 7px 0; color: #0f172a; font-weight: 600;">${customerName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Phone Number</td>
          <td style="padding: 7px 0; color: #0f7b4f; font-weight: 700;">
            <a href="tel:${customerPhone}" style="color: #0f7b4f; text-decoration: none;">${customerPhone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Email Address</td>
          <td style="padding: 7px 0; color: #0284c7;">
            <a href="mailto:${customerEmail}" style="color: #0284c7; text-decoration: none;">${customerEmail}</a>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
      Please log in to the AutoScrap Portal to manage this enquiry.
    </p>
  `;

  return {
    subject: `[New Enquiry] ${reg} (${make} ${model}) - ${city || 'UK'} [Ref: ${reference}]`,
    html: contentHtml,
    previewText: `New enquiry ${reference}: ${reg} ${make} ${model}, ${city || 'UK'}. Quote: ${formattedQuote}`,
  };
}

module.exports = {
  dealerEnquiryTemplate,
};
