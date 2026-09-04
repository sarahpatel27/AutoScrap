/**
 * Dealer & Super Admin Email Template for New High-Value Car Available for Bidding
 */
function dealerHighValueBiddingTemplate({
  reference,
  recipientRole = 'Dealer', // 'Dealer' | 'Super Admin'
  recipientName = '',
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

  // Format deadline cleanly
  let formattedDeadline = 'Standard window';
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

  const isSuperAdmin = recipientRole === 'Super Admin';
  const headingTitle = isSuperAdmin
    ? 'New High-Value Enquiry Bidding Started'
    : `New High-Value Car Available for Bidding - ${city || 'Assigned Area'}`;

  const customerName = customer?.fullName || customer?.name || 'N/A';
  const customerPhone = customer?.phone || 'N/A';
  const customerEmail = customer?.email || 'N/A';

  const contentHtml = `
    <!-- Top Alert Card (High-Contrast Emerald/Green Theme) -->
    <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-left: 5px solid #0f7b4f; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        ${recipientRole === 'City Dealer' ? 'Dealer' : recipientRole} Bidding Alert
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0f7b4f;">
        ${headingTitle}
      </h1>
      <div style="font-size: 13px; color: #166534; font-weight: 500;">
        Ref: <strong style="color: #0f7b4f; font-weight: 800;">${reference}</strong> • Area: <strong>${city || 'UK'}</strong>
      </div>
    </div>

    <p style="font-size: 15px; color: #334155; margin: 0 0 20px 0; line-height: 1.5;">
      ${recipientName ? `Hello <strong>${recipientName}</strong>, a` : 'A'} new premium/high-value vehicle enquiry is now live for dealer bidding in your portal.
    </p>

    <!-- Bidding Deadline Banner -->
    <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 700; color: #854d0e; text-transform: uppercase; letter-spacing: 0.5px;">
        Bidding Closes At
      </div>
      <div style="font-size: 16px; font-weight: 800; color: #a16207; margin-top: 2px;">
        ⏰ ${formattedDeadline}
      </div>
    </div>

    <!-- Vehicle Details Table -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
        Vehicle & Valuation Details
      </div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 38%;">Registration</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 800; text-transform: uppercase;">${reg}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Make & Model</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${make} ${model} ${year}</td>
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
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Estimated / Target Value</td>
          <td style="padding: 8px 0; color: #0f7b4f; font-weight: 800; font-size: 16px;">${formattedValuation}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Area / Postcode</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${city || 'Unassigned'} (${postcode || 'N/A'})</td>
        </tr>
      </table>
    </div>

    ${isSuperAdmin ? `
    <!-- Super Admin Customer Overview Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">
        Customer Information (Admin Only)
      </div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 7px 0; color: #64748b; font-weight: 600; width: 35%;">Name</td>
          <td style="padding: 7px 0; color: #0f172a; font-weight: 600;">${customerName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Phone</td>
          <td style="padding: 7px 0; color: #0f7b4f; font-weight: 700;">${customerPhone}</td>
        </tr>
        <tr>
          <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Email</td>
          <td style="padding: 7px 0; color: #0284c7;">${customerEmail}</td>
        </tr>
      </table>
    </div>
    ` : ''}

    <p style="font-size: 13.5px; color: #475569; line-height: 1.5; margin: 0 0 20px 0;">
      Log in to your AutoScrap dealer dashboard to inspect photos, review specifications, and place your competitive bid before the deadline.
    </p>
  `;

  return {
    subject: `[Bidding Open] ${reg} (${make} ${model}) - ${city || 'UK'} [Ref: ${reference}]`,
    html: contentHtml,
    previewText: `New high-value vehicle ${reference}: ${reg} ${make} ${model} in ${city || 'UK'}. Estimated: ${formattedValuation}`,
  };
}

module.exports = {
  dealerHighValueBiddingTemplate,
};
