/**
 * Customer Vehicle Cancelled Email Template
 * Sent to customer when standard enquiry status is updated to 'Cancelled'
 */
function customerCancelledEnquiryTemplate({
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
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
        ✕ Enquiry Cancelled
      </span>
      <h2 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">
        Your Vehicle Enquiry Has Been Cancelled
      </h2>
    </div>

    <p style="color: #334155; font-size: 15px; margin: 0 0 14px 0; line-height: 1.6;">
      Dear <strong>${customerName || 'Valued Customer'}</strong>,
    </p>

    <p style="color: #334155; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
      We are writing to confirm that your scrap vehicle enquiry for reference <strong>${reference}</strong> has been cancelled.
    </p>

    <!-- Reference Number Box -->
    <div style="background-color: #fef2f2; border: 1.5px dashed #ef4444; border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 26px;">
      <div style="font-size: 12px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.8px;">
        Enquiry Reference Number
      </div>
      <div style="font-size: 24px; font-weight: 800; color: #b91c1c; letter-spacing: 1px; margin-top: 6px;">
        ${reference}
      </div>
      <div style="font-size: 13px; color: #991b1b; margin-top: 4px; font-weight: 600;">
        Status: Cancelled
      </div>
    </div>

    <!-- Vehicle & Enquiry Summary -->
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
        ${numericQuote > 0 ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Quoted Valuation</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 800; font-size: 16px;">${formattedQuote}</td>
        </tr>
        ` : ''}
        ${postcode || collectionAddress ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Location</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${collectionAddress ? `${collectionAddress}, ` : ''}${postcode || ''}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <!-- Important Information Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
      <div style="font-size: 14px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">
        Important Information & Next Steps
      </div>
      <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 13.5px; line-height: 1.6;">
        <li style="margin-bottom: 6px;"><strong>No Further Action Required:</strong> If you requested this cancellation or no longer wish to scrap your vehicle, no further steps are needed from your end.</li>
        <li style="margin-bottom: 6px;"><strong>Changed Your Mind?</strong> If you would like to proceed in the future or get an updated scrap valuation, you are welcome to submit a new quote request anytime at MyAutoScrap.</li>
        <li style="margin-bottom: 0;"><strong>Cancelled by Mistake?</strong> If you believe this cancellation occurred in error, please reply directly to this email or contact our support team immediately quoting reference <strong>${reference}</strong>.</li>
      </ul>
    </div>

    <!-- Footer Note -->
    <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
      Thank you for considering AutoScrap! If you need any further assistance, please feel free to reach out to us.
    </p>
  `;

  return {
    subject: `Scrap Vehicle Enquiry Cancelled - Reference ${reference}`,
    html: contentHtml,
    previewText: `Your scrap vehicle enquiry for ${reg} (${make} ${model}) has been cancelled. Reference: ${reference}`,
  };
}

module.exports = {
  customerCancelledEnquiryTemplate,
};
