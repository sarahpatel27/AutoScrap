/**
 * Customer Enquiry Confirmation Email Template
 * Combines exact original content/details with a modern, beautiful, dark-mode-safe layout.
 */
function customerEnquiryTemplate({
  reference,
  customerName,
  vehicle,
  quoteAmount,
  collectionAddress,
  postcode,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || '';
  const model = vehicle?.model || '';
  const year = vehicle?.year ? `(${vehicle.year})` : '';
  const numericQuote = Number(quoteAmount) || 0;
  const formattedQuote = `£${numericQuote.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const contentHtml = `
    <!-- Top Heading -->
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">
      Thank You for Your Enquiry!
    </h2>

    <p style="color: #334155; font-size: 15px; margin: 0 0 14px 0; line-height: 1.6;">
      Dear <strong>${customerName || 'Valued Customer'}</strong>,
    </p>

    <p style="color: #334155; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
      We have received your vehicle details and your enquiry reference has been created. Here is a summary of your valuation and request:
    </p>

    <!-- Reference Number Box -->
    <div style="background-color: #f0fdf4; border: 1.5px dashed #22c55e; border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 26px;">
      <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.8px;">
        Enquiry Reference Number
      </div>
      <div style="font-size: 24px; font-weight: 800; color: #0f7b4f; letter-spacing: 1px; margin-top: 6px;">
        ${reference}
      </div>
    </div>

    <!-- Details Table -->
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600; width: 38%;">Vehicle</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 700;">${make} ${model} ${year}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Registration</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 800; text-transform: uppercase;">${reg}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Quote Amount</td>
          <td style="padding: 11px 0; color: #0f7b4f; font-weight: 800; font-size: 18px;">${formattedQuote}</td>
        </tr>
        ${postcode ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Collection Area</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${collectionAddress ? `${collectionAddress}, ` : ''}${postcode}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <!-- Next Steps Info Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0f7b4f; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
      <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
        <strong style="color: #0f7b4f;">What's next?</strong> Our local approved recovery agent will contact you shortly to confirm your collection slot and finalize the handover.
      </p>
    </div>

    <!-- Footer Note -->
    <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
      If you have any questions or need to update your details, please reply directly to this email or quote reference <strong>${reference}</strong>.
    </p>
  `;

  return {
    subject: `Your AutoScrap Quote & Enquiry Confirmation - ${reference}`,
    html: contentHtml,
    previewText: `Thank you for your enquiry. Your vehicle quote for ${reg} is ${formattedQuote}. Reference: ${reference}`,
  };
}

module.exports = {
  customerEnquiryTemplate,
};
