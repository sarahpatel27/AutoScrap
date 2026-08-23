/**
 * Dealer & Super Admin Email Template: 24h Midway Alert (No Bids Placed Yet)
 */
function dealerBiddingNoBidsMidwayTemplate({
  reference,
  recipientRole = 'City Dealer',
  recipientName = '',
  vehicle,
  condition,
  estimatedValue,
  customerExpectedValue,
  valuePreference,
  biddingEndsAt,
  postcode,
  city,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || 'Unknown Make';
  const model = vehicle?.model || 'Unknown Model';
  const year = vehicle?.year ? `(${vehicle.year})` : '';
  const mileage = vehicle?.mileage || 'N/A';

  const valAmount = valuePreference === 'CUSTOM_VALUE' ? (customerExpectedValue || estimatedValue) : estimatedValue;
  const numericVal = Number(valAmount) || 0;
  const formattedValuation = `£${numericVal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  let formattedDeadline = 'in approx. 24 hours';
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

  const contentHtml = `
    <!-- Top Warning Alert Banner -->
    <div style="background-color: #fffbeb; border: 1.5px solid #fde68a; border-left: 5px solid #f59e0b; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        ⏰ 24-Hour Midway Alert • 0 Bids Received
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #92400e;">
        No Bids Placed So Far — 24 Hours Remaining
      </h1>
      <div style="font-size: 13px; color: #78350f; font-weight: 500;">
        Ref: <strong style="color: #92400e; font-weight: 800;">${reference}</strong> • Territory: <strong>${city || 'UK'}</strong>
      </div>
    </div>

    <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
      ${recipientName ? `Hello <strong>${recipientName}</strong>,` : 'Hello,'} this is a 24-hour bidding update.
    </p>

    <p style="font-size: 15px; color: #334155; margin: 0 0 22px 0; line-height: 1.6;">
      The high-value vehicle <strong>${make} ${model} (${reg})</strong> has been available for bidding for 24 hours, and <strong>no bids have been placed on this car so far</strong>.
    </p>

    <!-- Deadline Box -->
    <div style="background-color: #fef2f2; border: 1.5px dashed #ef4444; border-radius: 10px; padding: 16px 20px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.8px;">
        Bidding Window Closes In ~24 Hours
      </div>
      <div style="font-size: 18px; font-weight: 800; color: #b91c1c; margin-top: 4px;">
        ⏰ ${formattedDeadline}
      </div>
    </div>

    <!-- Vehicle Details Table -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
        Vehicle Details
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
          <td style="padding: 8px 0; color: #0f7b4f; font-weight: 800; font-size: 16px;">${formattedValuation}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Location</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${city || 'Unassigned'} (${postcode || 'N/A'})</td>
        </tr>
      </table>
    </div>

    <!-- Action Prompt -->
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
      <p style="margin: 0; color: #166534; font-size: 13.5px; line-height: 1.55;">
        <strong>Opportunity:</strong> Be the first dealer to place a competitive bid and secure this vehicle before the bidding concludes.
      </p>
    </div>

    <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;">
      Log in to your AutoScrap dealer portal to inspect photos and submit your bid quoting reference <strong>${reference}</strong>.
    </p>
  `;

  return {
    subject: `[24h Left: No Bids Yet] ${reg} (${make} ${model}) - Ref: ${reference}`,
    html: contentHtml,
    previewText: `No bids placed so far on ${reg} (${make} ${model}). 24 hours remaining to submit your bid. Reference: ${reference}`,
  };
}

module.exports = {
  dealerBiddingNoBidsMidwayTemplate,
};
