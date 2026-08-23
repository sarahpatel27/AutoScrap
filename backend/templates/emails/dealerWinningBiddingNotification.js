/**
 * Winning Dealer Notification Email Template
 * Sent to the winning dealer with customer contact details and collection info.
 */
function dealerWinningBiddingNotificationTemplate({
  reference,
  dealerName = 'Valued Partner',
  winningBidAmount = 0,
  vehicle,
  condition,
  postcode,
  city,
  customer,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || 'Unknown Make';
  const model = vehicle?.model || 'Unknown Model';
  const year = vehicle?.year ? `(${vehicle.year})` : '';
  const mileage = vehicle?.mileage || 'N/A';

  const numericBid = Number(winningBidAmount) || 0;
  const formattedBid = `£${numericBid.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const customerName = customer?.fullName || customer?.name || customer?.customerName || 'N/A';
  const customerPhone = customer?.phone || customer?.customerPhone || 'N/A';
  const customerEmail = customer?.email || customer?.customerEmail || 'N/A';
  const collectionAddress = customer?.collectionAddress || '';

  const contentHtml = `
    <!-- Top Winning Header Card -->
    <div style="background-color: #ecfdf5; border: 1.5px solid #a7f3d0; border-left: 5px solid #0f7b4f; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        🎉 Auction Won • Winning Dealer Confirmation
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0f7b4f;">
        Congratulations! You Won the Bidding for ${reg}
      </h1>
      <div style="font-size: 13px; color: #047857; font-weight: 500;">
        Ref: <strong style="color: #065f46; font-weight: 800;">${reference}</strong> • Territory: <strong>${city || 'UK'}</strong>
      </div>
    </div>

    <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
      Hello <strong>${dealerName}</strong>,
    </p>

    <p style="font-size: 15px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
      Congratulations! Your bid of <strong>${formattedBid}</strong> has won the auction for <strong>${make} ${model} (${reg})</strong>. Customer contact information and vehicle handover details are provided below.
    </p>

    <!-- Winning Bid Summary Box -->
    <div style="background-color: #f0fdf4; border: 1.5px dashed #22c55e; border-radius: 10px; padding: 16px 20px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.8px;">
        Your Winning Bid Amount
      </div>
      <div style="font-size: 26px; font-weight: 900; color: #0f7b4f; margin-top: 4px;">
        ${formattedBid}
      </div>
      <div style="font-size: 12.5px; color: #15803d; margin-top: 4px; font-weight: 600;">
        Status: DEALER_SELECTED • Reference: ${reference}
      </div>
    </div>

    <!-- Customer Contact Details Box -->
    <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        👤 Customer Contact Information
      </div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Customer Name</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${customerName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone Number</td>
          <td style="padding: 8px 0; color: #0f7b4f; font-weight: 800; font-size: 15px;">
            <a href="tel:${customerPhone}" style="color: #0f7b4f; text-decoration: none;">${customerPhone}</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email Address</td>
          <td style="padding: 8px 0; color: #0284c7; font-weight: 600;">
            <a href="mailto:${customerEmail}" style="color: #0284c7; text-decoration: none;">${customerEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Collection Address</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">
            ${collectionAddress ? `${collectionAddress}, ` : ''}${city || ''} ${postcode || ''}
          </td>
        </tr>
      </table>
    </div>

    <!-- Vehicle Details Table -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        🚗 Vehicle Details
      </div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 38%;">Registration</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-transform: uppercase;">${reg}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Make & Model</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${make} ${model} ${year}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Mileage</td>
          <td style="padding: 8px 0; color: #0f172a;">${typeof mileage === 'number' ? `${mileage.toLocaleString('en-GB')} miles` : mileage}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Condition</td>
          <td style="padding: 8px 0; color: #0f172a;">${condition || 'Good'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Location</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${city || 'Unassigned'} (${postcode || 'N/A'})</td>
        </tr>
      </table>
    </div>

    <!-- Dealer Action Guidance -->
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
      <div style="font-size: 13.5px; font-weight: 700; color: #065f46; margin-bottom: 6px;">
        Next Steps for Collection:
      </div>
      <ol style="margin: 0; padding-left: 18px; color: #334155; font-size: 13px; line-height: 1.6;">
        <li style="margin-bottom: 4px;">Contact the customer directly at <strong>${customerPhone}</strong> to schedule a collection date & time window.</li>
        <li style="margin-bottom: 4px;">Verify the vehicle condition and complete the V5C logbook transfer (Section 9/yellow slip).</li>
        <li style="margin-bottom: 0;">Disburse the agreed winning amount (<strong>${formattedBid}</strong>) to the customer upon handover.</li>
      </ol>
    </div>

    <p style="font-size: 12.5px; color: #64748b; margin: 0; line-height: 1.5;">
      AutoScrap Dealer Network • High-Value Enquiry Reference <strong>${reference}</strong>
    </p>
  `;

  return {
    subject: `[You Won!] Customer Contact Details for ${reg} (${make} ${model}) - Ref: ${reference}`,
    html: contentHtml,
    previewText: `Congratulations! You won the bidding on ${reg} for ${formattedBid}. Customer: ${customerName} (${customerPhone}). Ref: ${reference}`,
  };
}

module.exports = {
  dealerWinningBiddingNotificationTemplate,
};
