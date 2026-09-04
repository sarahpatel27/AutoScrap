/**
 * Customer Notification Email Template when a Dealer Wins / Accepts High-Value Enquiry
 * Displays assigned dealer details without exposing internal auction pricing.
 */
function customerDealerSelectedNotificationTemplate({
  reference,
  customerName = 'Valued Customer',
  vehicle,
  collectionAddress,
  postcode,
  city,
  dealer,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || '';
  const model = vehicle?.model || '';
  const year = vehicle?.year ? `(${vehicle.year})` : '';

  const dealerName = dealer?.name || 'Verified AutoScrap Partner';
  const dealerAreas = dealer?.coveredPostcodes && dealer.coveredPostcodes.length > 0
    ? dealer.coveredPostcodes.join(', ')
    : (dealer?.assignedCity || city || 'UK');
  const dealerEmail = dealer?.email || '';

  const contentHtml = `
    <!-- Top Heading -->
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
        ✓ Offer Accepted
      </span>
      <h2 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">
        Great News! Your Vehicle Offer Has Been Accepted
      </h2>
    </div>

    <p style="color: #334155; font-size: 15px; margin: 0 0 14px 0; line-height: 1.6;">
      Dear <strong>${customerName}</strong>,
    </p>

    <p style="color: #334155; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
      We are delighted to inform you that the dealer bidding for your vehicle <strong>${make} ${model} (${reg})</strong> has concluded, and an approved local recovery specialist has accepted your vehicle offer.
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
        Status: Offer Accepted & Dealer Assigned
      </div>
    </div>

    <!-- Assigned Dealer Information Box -->
    <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        🏢 Assigned Recovery Specialist
      </div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 38%;">Dealer Partner</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${dealerName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Assigned Areas</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${dealerAreas}</td>
        </tr>
        ${dealerEmail ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Contact Email</td>
          <td style="padding: 8px 0; color: #0284c7; font-weight: 600;">${dealerEmail}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- Vehicle Summary Table (No Price Shown) -->
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
        ${postcode || collectionAddress ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Collection Area</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${collectionAddress ? `${collectionAddress}, ` : ''}${postcode || ''}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <!-- Next Steps Info Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0f7b4f; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
      <div style="font-size: 14px; font-weight: 700; color: #0f7b4f; margin-bottom: 8px;">
        What happens next?
      </div>
      <ol style="margin: 0; padding-left: 18px; color: #334155; font-size: 13.5px; line-height: 1.6;">
        <li style="margin-bottom: 6px;"><strong>Collection Contact:</strong> Your assigned partner (<strong>${dealerName}</strong>) will contact you directly to confirm a convenient collection date and time window.</li>
        <li style="margin-bottom: 6px;"><strong>Documents Ready:</strong> Please have your <strong>V5C logbook</strong> (vehicle registration document) and vehicle keys ready for handover.</li>
        <li style="margin-bottom: 6px;"><strong>Personal Belongings:</strong> Please remove all personal belongings, toll tags, and documents from the vehicle before collection.</li>
        <li style="margin-bottom: 0;"><strong>Direct Payment:</strong> Payment is completed directly upon vehicle inspection and handover.</li>
      </ol>
    </div>

    <!-- Footer Note -->
    <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
      If you have any questions or need assistance, please reply directly to this email or quote reference <strong>${reference}</strong>.
    </p>
  `;

  return {
    subject: `Great News! Your Vehicle Offer Has Been Accepted - Ref: ${reference}`,
    html: contentHtml,
    previewText: `Your vehicle ${reg} (${make} ${model}) has been accepted by our verified recovery partner ${dealerName}. Reference: ${reference}`,
  };
}

module.exports = {
  customerDealerSelectedNotificationTemplate,
};
