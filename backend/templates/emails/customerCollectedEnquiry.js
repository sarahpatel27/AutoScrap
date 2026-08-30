/**
 * Customer Vehicle Collected Email Template
 * Sent to customer when standard enquiry status is updated to 'Collected'
 */
function customerCollectedEnquiryTemplate({
  reference,
  customerName,
  vehicle,
  quoteAmount,
  collectionAddress,
  postcode,
  collectionDate,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || '';
  const model = vehicle?.model || '';
  const year = vehicle?.year ? `(${vehicle.year})` : '';
  const numericQuote = Number(quoteAmount) || 0;
  const formattedQuote = `£${numericQuote.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formattedDate = collectionDate
    ? new Date(collectionDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  const contentHtml = `
    <!-- Top Heading -->
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #faf5ff; color: #6b21a8; border: 1px solid #e9d5ff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
        ✓ Vehicle Collected
      </span>
      <h2 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">
        Your Vehicle Has Been Collected Successfully
      </h2>
    </div>

    <p style="color: #334155; font-size: 15px; margin: 0 0 14px 0; line-height: 1.6;">
      Dear <strong>${customerName || 'Valued Customer'}</strong>,
    </p>

    <p style="color: #334155; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
      We are pleased to confirm that your vehicle has been successfully collected by our recovery agent. Thank you for choosing AutoScrap!
    </p>

    <!-- Reference Number Box -->
    <div style="background-color: #faf5ff; border: 1.5px dashed #a855f7; border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 26px;">
      <div style="font-size: 12px; font-weight: 700; color: #6b21a8; text-transform: uppercase; letter-spacing: 0.8px;">
        Enquiry Reference Number
      </div>
      <div style="font-size: 24px; font-weight: 800; color: #7e22ce; letter-spacing: 1px; margin-top: 6px;">
        ${reference}
      </div>
      <div style="font-size: 13px; color: #6b21a8; margin-top: 4px; font-weight: 600;">
        Status: Collected & Completed
      </div>
    </div>

    <!-- Vehicle & Settlement Summary -->
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
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Agreed Settlement</td>
          <td style="padding: 11px 0; color: #0f7b4f; font-weight: 800; font-size: 18px;">${formattedQuote}</td>
        </tr>
        ${postcode || collectionAddress ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Collection Location</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${collectionAddress ? `${collectionAddress}, ` : ''}${postcode || ''}</td>
        </tr>
        ` : ''}
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Collection Date</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${formattedDate}</td>
        </tr>
      </tbody>
    </table>

    <!-- Important Information & Post-Collection Guidance -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #8b5cf6; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
      <div style="font-size: 14px; font-weight: 700; color: #6b21a8; margin-bottom: 8px;">
        Important Information & Paperwork
      </div>
      <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 13.5px; line-height: 1.6;">
        <li style="margin-bottom: 6px;"><strong>DVLA Notification:</strong> The transfer/destruction record for your vehicle is processed in line with DVLA regulations. Retain your yellow slip (Section 9 / V5C/3) or driver handover confirmation for your records.</li>
        <li style="margin-bottom: 6px;"><strong>Payment:</strong> Your agreed payment of <strong>${formattedQuote}</strong> is issued via bank transfer. Depending on your bank, funds typically reflect immediately or within standard clearing times.</li>
        <li style="margin-bottom: 6px;"><strong>Road Tax Refund:</strong> If you had full remaining months on your vehicle tax, DVLA will automatically process a refund to the registered keeper.</li>
        <li style="margin-bottom: 0;"><strong>Insurance:</strong> Don't forget to cancel or transfer your vehicle insurance policy now that the collection is complete.</li>
      </ul>
    </div>

    <!-- Footer Note -->
    <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
      Thank you for recycling with AutoScrap! If you need any further documentation or have questions, please reply directly to this email or quote reference <strong>${reference}</strong>.
    </p>
  `;

  return {
    subject: `Vehicle Collected Successfully - Reference ${reference}`,
    html: contentHtml,
    previewText: `Your vehicle ${reg} (${make} ${model}) has been collected successfully. Reference: ${reference}`,
  };
}

module.exports = {
  customerCollectedEnquiryTemplate,
};
