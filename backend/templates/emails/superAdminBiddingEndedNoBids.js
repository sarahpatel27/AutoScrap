/**
 * Super Admin Email Template: 48h Bidding Window Ended with 0 Bids
 * Sent ONLY to Super Admin(s) with full customer and vehicle details for follow-up.
 */
function superAdminBiddingEndedNoBidsTemplate({
  reference,
  recipientName = 'Administrator',
  vehicle,
  condition,
  estimatedValue,
  customerExpectedValue,
  valuePreference,
  biddingEndsAt,
  postcode,
  city,
  customer,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || 'Unknown Make';
  const model = vehicle?.model || 'Unknown Model';
  const year = vehicle?.year ? `(${vehicle.year})` : '';
  const mileage = vehicle?.mileage || 'N/A';

  const valAmount = valuePreference === 'CUSTOM_VALUE' ? (customerExpectedValue || estimatedValue) : estimatedValue;
  const numericVal = Number(valAmount) || 0;
  const formattedValuation = `£${numericVal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const customerExpectedNumeric = Number(customerExpectedValue) || 0;
  const formattedExpectedValuation = customerExpectedNumeric > 0
    ? `£${customerExpectedNumeric.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  const customerName = customer?.fullName || customer?.name || customer?.customerName || 'N/A';
  const customerPhone = customer?.phone || customer?.customerPhone || 'N/A';
  const customerEmail = customer?.email || customer?.customerEmail || 'N/A';
  const collectionAddress = customer?.collectionAddress || '';

  let formattedDeadline = 'N/A';
  if (biddingEndsAt) {
    const d = new Date(biddingEndsAt);
    formattedDeadline = d.toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London',
    });
  }

  const contentHtml = `
    <!-- Top Alert Card (Red / Amber Alert for Super Admin) -->
    <div style="background-color: #fef2f2; border: 1.5px solid #fecaca; border-left: 5px solid #ef4444; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        🚨 Super Admin Alert • Bidding Ended (0 Bids)
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #991b1b;">
        No Bids Placed After 48 Hours — ${reg}
      </h1>
      <div style="font-size: 13px; color: #7f1d1d; font-weight: 500;">
        Ref: <strong style="color: #991b1b; font-weight: 800;">${reference}</strong> • Status: <span style="background-color: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-weight: 700;">BIDDING_ENDED</span>
      </div>
    </div>

    <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
      Hello <strong>${recipientName}</strong>,
    </p>

    <p style="font-size: 15px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
      The 48-hour bidding window for high-value vehicle <strong>${make} ${model} (${reg})</strong> has concluded with <strong>0 bids received from dealers</strong>.
    </p>

    <!-- Reference Box -->
    <div style="background-color: #fff1f2; border: 1.5px dashed #f43f5e; border-radius: 10px; padding: 16px 20px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #9f1239; text-transform: uppercase; letter-spacing: 0.8px;">
        Enquiry Reference Number
      </div>
      <div style="font-size: 22px; font-weight: 900; color: #be123c; margin-top: 4px;">
        ${reference}
      </div>
      <div style="font-size: 12px; color: #881337; margin-top: 4px;">
        Bidding closed on: <strong>${formattedDeadline}</strong>
      </div>
    </div>

    <!-- Customer Contact Details Box (Super Admin Exclusive) -->
    <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        👤 Customer Contact Details
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
        🚗 Vehicle & Valuation Details
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
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Estimated Valuation</td>
          <td style="padding: 8px 0; color: #0f7b4f; font-weight: 800;">${formattedValuation}</td>
        </tr>
        ${formattedExpectedValuation ? `
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Customer Expected Value</td>
          <td style="padding: 8px 0; color: #f59e0b; font-weight: 800;">${formattedExpectedValuation}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Location</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${city || 'Unassigned'} (${postcode || 'N/A'})</td>
        </tr>
      </table>
    </div>

    <!-- Admin Recommended Action -->
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
      <div style="font-size: 13.5px; font-weight: 700; color: #166534; margin-bottom: 4px;">
        Recommended Super Admin Action:
      </div>
      <p style="margin: 0; color: #166534; font-size: 13px; line-height: 1.55;">
        You may contact the customer directly at <strong>${customerPhone}</strong> to offer a manual direct valuation, discuss standard scrap collection, or re-open the listing with updated criteria.
      </p>
    </div>

    <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
      AutoScrap Internal System Notification • Sent to Super Admins only • Reference <strong>${reference}</strong>
    </p>
  `;

  return {
    subject: `[Unsold - 0 Bids] 48h Bidding Ended: ${reg} (${make} ${model}) - Customer: ${customerName}`,
    html: contentHtml,
    previewText: `48-hour bidding concluded with 0 bids on ${reg} (${make} ${model}). Customer: ${customerName} (${customerPhone}). Reference: ${reference}`,
  };
}

module.exports = {
  superAdminBiddingEndedNoBidsTemplate,
};
