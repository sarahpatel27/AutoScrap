/**
 * Customer Vehicle Accepted Email Template
 * Sent to customer when standard enquiry status is updated to 'Accepted'
 */
function customerAcceptedEnquiryTemplate({
  reference,
  customerName,
  vehicle,
  quoteAmount,
  collectionAddress,
  postcode,
  paymentMethod,
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
      <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
        ✓ Vehicle Accepted
      </span>
      <h2 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">
        Great News! Your Vehicle Offer Has Been Accepted
      </h2>
    </div>

    <p style="color: #334155; font-size: 15px; margin: 0 0 14px 0; line-height: 1.6;">
      Dear <strong>${customerName || 'Valued Customer'}</strong>,
    </p>

    <p style="color: #334155; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
      We are pleased to inform you that your scrap vehicle valuation has been officially <strong>accepted</strong> and approved for collection.
    </p>

    <!-- Reference Number Box -->
    <div style="background-color: #f0fdf4; border: 1.5px dashed #22c55e; border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 26px;">
      <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.8px;">
        Enquiry Reference Number
      </div>
      <div style="font-size: 24px; font-weight: 800; color: #0f7b4f; letter-spacing: 1px; margin-top: 6px;">
        ${reference}
      </div>
      <div style="font-size: 13px; color: #15803d; margin-top: 4px; font-weight: 600;">
        Status: Accepted & Confirmed
      </div>
    </div>

    <!-- Vehicle & Valuation Summary -->
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
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Agreed Price</td>
          <td style="padding: 11px 0; color: #0f7b4f; font-weight: 800; font-size: 18px;">${formattedQuote}</td>
        </tr>
        ${postcode || collectionAddress ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Collection Location</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${collectionAddress ? `${collectionAddress}, ` : ''}${postcode || ''}</td>
        </tr>
        ` : ''}
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Payment Mode</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${paymentMethod || 'Direct Bank Transfer'}</td>
        </tr>
      </tbody>
    </table>

    <!-- Next Steps Info Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0f7b4f; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
      <div style="font-size: 14px; font-weight: 700; color: #0f7b4f; margin-bottom: 8px;">
        What happens next?
      </div>
      <ol style="margin: 0; padding-left: 18px; color: #334155; font-size: 13.5px; line-height: 1.6;">
        <li style="margin-bottom: 6px;"><strong>Collection Scheduling:</strong> Our recovery driver/agent will contact you shortly to confirm your preferred collection date and time window.</li>
        <li style="margin-bottom: 6px;"><strong>Documents Ready:</strong> Please have your <strong>V5C logbook</strong> (registration document) and vehicle keys ready.</li>
        <li style="margin-bottom: 6px;"><strong>Vehicle Clearance:</strong> Make sure to remove all personal belongings, documents, and toll tags from the vehicle before collection.</li>
        <li style="margin-bottom: 0;"><strong>Instant Payment:</strong> Payment will be settled directly upon physical handover and vehicle collection.</li>
      </ol>
    </div>

    <!-- Footer Note -->
    <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
      If you have any questions or need to discuss your collection arrangements, please reply directly to this email or quote reference <strong>${reference}</strong>.
    </p>
  `;

  return {
    subject: `Vehicle Offer Accepted - Reference ${reference}`,
    html: contentHtml,
    previewText: `Great news! Your vehicle offer for ${reg} (${make} ${model}) has been accepted. Agreed Price: ${formattedQuote}. Reference: ${reference}`,
  };
}

module.exports = {
  customerAcceptedEnquiryTemplate,
};
