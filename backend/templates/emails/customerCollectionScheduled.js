/**
 * Customer Vehicle Collection Scheduled Email Template
 * Sent to customer when an Admin or Dealer confirms a collection date and time.
 */
function customerCollectionScheduledTemplate({
  reference,
  customerName,
  vehicle,
  quoteAmount,
  collectionAddress,
  additionalAddressDetails,
  postcode,
  paymentMethod,
  collectionDate,
  collectionTime,
  collectionNotes,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || '';
  const model = vehicle?.model || '';
  const year = vehicle?.year ? `(${vehicle.year})` : '';
  const numericQuote = Number(quoteAmount) || 0;
  const formattedQuote = `£${numericQuote.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Format date nicely (e.g., "Friday, 8 November 2026")
  let formattedDate = collectionDate;
  if (collectionDate) {
    try {
      const d = new Date(collectionDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    } catch {
      formattedDate = collectionDate;
    }
  }

  const timeSlot = collectionTime || 'Agreed Daytime Window';

  const contentHtml = `
    <!-- Top Heading -->
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
        ✓ Collection Confirmed & Scheduled
      </span>
      <h2 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">
        Your Vehicle Collection Has Been Scheduled
      </h2>
    </div>

    <p style="color: #334155; font-size: 15px; margin: 0 0 14px 0; line-height: 1.6;">
      Dear <strong>${customerName || 'Valued Customer'}</strong>,
    </p>

    <p style="color: #334155; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
      Following our phone conversation, we are pleased to confirm that the collection of your vehicle has been officially booked. Our recovery driver has been scheduled for the agreed date and time window below.
    </p>

    <!-- Collection Date & Time Banner (Prominent Callout) -->
    <div style="background-color: #0b2e21; border-radius: 12px; padding: 22px 20px; text-align: center; margin-bottom: 26px; color: #ffffff;">
      <div style="font-size: 11px; font-weight: 800; color: #dff46b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
        📅 Scheduled Collection Date & Time
      </div>
      <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.2px; margin-bottom: 6px;">
        ${formattedDate}
      </div>
      <div style="display: inline-block; background-color: rgba(223, 244, 107, 0.15); border: 1px solid #dff46b; color: #dff46b; padding: 4px 14px; border-radius: 9999px; font-size: 13px; font-weight: 800;">
        ⏰ Window: ${timeSlot}
      </div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 10px;">
        Reference: <strong style="color: #ffffff; font-family: monospace;">${reference}</strong>
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
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Agreed Payout</td>
          <td style="padding: 11px 0; color: #0f7b4f; font-weight: 800; font-size: 18px;">${formattedQuote}</td>
        </tr>
        ${postcode || collectionAddress ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Collection Address</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">
            ${collectionAddress ? `${collectionAddress}, ` : ''}${postcode || ''}
            ${additionalAddressDetails ? `<div style="margin-top: 4px; color: #0f7b4f; font-weight: 700; font-size: 13px;">Additional Address Details: ${additionalAddressDetails}</div>` : ''}
          </td>
        </tr>
        ` : ''}
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Payment Mode</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${paymentMethod || 'Direct Bank Transfer'}</td>
        </tr>
        ${collectionNotes ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Driver Instructions</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${collectionNotes}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <!-- Collection Day Checklist -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0f7b4f; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
      <div style="font-size: 14px; font-weight: 800; color: #0b2e21; margin-bottom: 10px; display: flex; items-center;">
        📋 Please Have the Following Ready for Collection:
      </div>
      <ol style="margin: 0; padding-left: 18px; color: #334155; font-size: 13.5px; line-height: 1.65;">
        <li style="margin-bottom: 6px;"><strong>V5C Logbook:</strong> The registration document (logbook). Our recovery agent will sign and hand you the relevant yellow section (Section 9/V5C/3).</li>
        <li style="margin-bottom: 6px;"><strong>Vehicle Keys:</strong> Any keys, fobs, and wheel locking nuts available for the vehicle.</li>
        <li style="margin-bottom: 6px;"><strong>Personal Belongings:</strong> Please double-check the glove compartment, boot, and under seats to remove all personal items, documents, and dashcams.</li>
        <li style="margin-bottom: 6px;"><strong>Photo Identification:</strong> A valid UK Driving Licence or Passport for collection verification.</li>
        <li style="margin-bottom: 0;"><strong>Direct Payment:</strong> Your payment of <strong>${formattedQuote}</strong> will be processed directly upon physical vehicle handover.</li>
      </ol>
    </div>

    <!-- Need to reschedule? -->
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
      <p style="color: #166534; font-size: 13px; margin: 0; line-height: 1.5;">
        <strong>Need to reschedule or running late?</strong><br>
        Please reply directly to this email or contact us as soon as possible quoting reference <strong>${reference}</strong> so we can adjust our driver's schedule.
      </p>
    </div>

    <!-- Footer Note -->
    <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
      Thank you for choosing MyAutoScrap. We look forward to seeing you on <strong>${formattedDate}</strong>.
    </p>
  `;

  return {
    subject: `🚗 Collection Scheduled: ${reg} on ${formattedDate} (${timeSlot}) - Ref ${reference}`,
    html: contentHtml,
    previewText: `Your vehicle collection has been scheduled for ${formattedDate} (${timeSlot}). Agreed Price: ${formattedQuote}. Reference: ${reference}`,
  };
}

module.exports = {
  customerCollectionScheduledTemplate,
};

