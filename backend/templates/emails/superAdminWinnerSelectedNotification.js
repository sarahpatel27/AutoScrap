/**
 * Super Admin Winner Notification Email Template
 * Sent to Super Admin(s) with full details of both the Winning Dealer and the Customer.
 */
function superAdminWinnerSelectedNotificationTemplate({
  reference,
  recipientName = 'Super Admin',
  vehicle,
  condition,
  estimatedValue,
  customerExpectedValue,
  valuePreference,
  winningBidAmount = 0,
  postcode,
  city,
  customer,
  dealer,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || 'Unknown Make';
  const model = vehicle?.model || 'Unknown Model';
  const year = vehicle?.year ? `(${vehicle.year})` : '';
  const mileage = vehicle?.mileage || 'N/A';

  const numericBid = Number(winningBidAmount) || 0;
  const formattedBid = `£${numericBid.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const valAmount = valuePreference === 'CUSTOM_VALUE' ? (customerExpectedValue || estimatedValue) : estimatedValue;
  const numericVal = Number(valAmount) || 0;
  const formattedValuation = `£${numericVal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const customerName = customer?.fullName || customer?.name || customer?.customerName || 'N/A';
  const customerPhone = customer?.phone || customer?.customerPhone || 'N/A';
  const customerEmail = customer?.email || customer?.customerEmail || 'N/A';
  const collectionAddress = customer?.collectionAddress || '';

  const dealerName = dealer?.name || 'Valued Partner';
  const dealerEmail = dealer?.email || 'N/A';
  const dealerAreas = dealer?.coveredPostcodes && dealer.coveredPostcodes.length > 0
    ? dealer.coveredPostcodes.join(', ')
    : (dealer?.assignedCity || city || 'UK');

  const contentHtml = `
    <!-- Top Alert Card (Emerald / Forest Green Super Admin Alert) -->
    <div style="background-color: #ecfdf5; border: 1.5px solid #a7f3d0; border-left: 5px solid #0f7b4f; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        🏆 Super Admin Overview • Winning Bid Confirmed
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0f7b4f;">
        Auction Won for ${reg} — Winning Bid: ${formattedBid}
      </h1>
      <div style="font-size: 13px; color: #047857; font-weight: 500;">
        Ref: <strong style="color: #065f46; font-weight: 800;">${reference}</strong> • Status: <span style="background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 4px; font-weight: 700;">DEALER_SELECTED</span>
      </div>
    </div>

    <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
      Hello <strong>${recipientName}</strong>,
    </p>

    <p style="font-size: 15px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
      A winning dealer has been selected for high-value vehicle <strong>${make} ${model} (${reg})</strong> for <strong>${formattedBid}</strong>. Complete details for both the winning dealer and customer are summarized below.
    </p>

    <!-- Reference & Winning Price Box -->
    <div style="background-color: #f0fdf4; border: 1.5px dashed #22c55e; border-radius: 10px; padding: 16px 20px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.8px;">
        Winning Bid Amount
      </div>
      <div style="font-size: 26px; font-weight: 900; color: #0f7b4f; margin-top: 4px;">
        ${formattedBid}
      </div>
      <div style="font-size: 12.5px; color: #15803d; margin-top: 4px; font-weight: 600;">
        Winning Dealer: <strong>${dealerName}</strong> • Ref: ${reference}
      </div>
    </div>

    <!-- Winning Dealer Details Card -->
    <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        🏢 Winning Dealer Details
      </div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 35%;">Dealer Name</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${dealerName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Dealer Email</td>
          <td style="padding: 8px 0; color: #0284c7; font-weight: 600;">
            <a href="mailto:${dealerEmail}" style="color: #0284c7; text-decoration: none;">${dealerEmail}</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Assigned Areas</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${dealerAreas}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Winning Bid</td>
          <td style="padding: 8px 0; color: #0f7b4f; font-weight: 800; font-size: 15px;">${formattedBid}</td>
        </tr>
      </table>
    </div>

    <!-- Customer Details Card -->
    <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        👤 Customer Details
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
        🚗 Vehicle Summary
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
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Initial Valuation</td>
          <td style="padding: 8px 0; color: #0f7b4f; font-weight: 800;">${formattedValuation}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
      AutoScrap Internal System Notification • Super Admin Overview • Reference <strong>${reference}</strong>
    </p>
  `;

  return {
    subject: `[Auction Won: ${formattedBid}] ${reg} (${make} ${model}) - Dealer: ${dealerName} • Customer: ${customerName}`,
    html: contentHtml,
    previewText: `Winner selected for ${reg}: ${dealerName} won for ${formattedBid}. Customer: ${customerName} (${customerPhone}). Ref: ${reference}`,
  };
}

module.exports = {
  superAdminWinnerSelectedNotificationTemplate,
};
