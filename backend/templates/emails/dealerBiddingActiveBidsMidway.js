/**
 * Dealer & Super Admin Email Template: 24h Midway Update (Active Bids Placed)
 */
function dealerBiddingActiveBidsMidwayTemplate({
  reference,
  recipientRole = 'Dealer',
  recipientName = '',
  vehicle,
  condition,
  estimatedValue,
  customerExpectedValue,
  valuePreference,
  biddingEndsAt,
  postcode,
  city,
  bidsCount = 1,
  highestBidAmount = 0,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || 'Unknown Make';
  const model = vehicle?.model || 'Unknown Model';
  const year = vehicle?.year ? `(${vehicle.year})` : '';
  const mileage = vehicle?.mileage || 'N/A';

  const numericHighest = Number(highestBidAmount) || 0;
  const formattedHighestBid = `£${numericHighest.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

  const pluralBids = bidsCount === 1 ? '1 bid' : `${bidsCount} bids`;

  const contentHtml = `
    <!-- Top Active Alert Banner -->
    <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-left: 5px solid #0f7b4f; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        ⚡ 24-Hour Bidding Update • ${pluralBids} Placed
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0f7b4f;">
        ${pluralBids.toUpperCase()} on ${reg} — Highest Bid: ${formattedHighestBid}
      </h1>
      <div style="font-size: 13px; color: #166534; font-weight: 500;">
        Ref: <strong style="color: #0f7b4f; font-weight: 800;">${reference}</strong> • Area: <strong>${city || 'UK'}</strong>
      </div>
    </div>

    <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
      ${recipientName ? `Hello <strong>${recipientName}</strong>,` : 'Hello,'} this is a 24-hour midway bidding update for <strong>${make} ${model} (${reg})</strong>.
    </p>

    <p style="font-size: 15px; color: #334155; margin: 0 0 22px 0; line-height: 1.6;">
      24 hours have passed since this vehicle went live for bidding. There are currently <strong>${pluralBids}</strong> placed on this vehicle, with the current top bid standing at <strong>${formattedHighestBid}</strong>.
    </p>

    <!-- Top Bid & Deadline Highlights -->
    <div style="display: table; width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-left: -10px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
        <tr>
          <td width="50%" style="background-color: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 10px; padding: 16px; text-align: center; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px;">
              Current Highest Bid
            </div>
            <div style="font-size: 22px; font-weight: 900; color: #0f7b4f; margin-top: 4px;">
              ${formattedHighestBid}
            </div>
            <div style="font-size: 11.5px; color: #047857; margin-top: 2px;">
              Total: ${pluralBids}
            </div>
          </td>
          <td width="50%" style="background-color: #fefce8; border: 1.5px solid #fef08a; border-radius: 10px; padding: 16px; text-align: center; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 700; color: #854d0e; text-transform: uppercase; letter-spacing: 0.5px;">
              Bidding Closes At
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #a16207; margin-top: 6px;">
              ⏰ ${formattedDeadline}
            </div>
            <div style="font-size: 11.5px; color: #ca8a04; margin-top: 2px;">
              ~24 Hours Remaining
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Vehicle Details Table -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
        Vehicle Summary
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
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Estimated Valuation</td>
          <td style="padding: 8px 0; color: #0f7b4f; font-weight: 800; font-size: 16px;">${formattedValuation}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Area / Postcode</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${city || 'Unassigned'} (${postcode || 'N/A'})</td>
        </tr>
      </table>
    </div>

    <!-- Action Prompt -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0f7b4f; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
      <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
        <strong>Want to secure this car?</strong> Log in to the dealer portal to review the bidding leaderboard and place or increase your bid before the remaining 24-hour countdown ends.
      </p>
    </div>

    <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;">
      AutoScrap Dealer Network • Reference <strong>${reference}</strong>
    </p>
  `;

  return {
    subject: `[24h Update: ${pluralBids}] Top Bid ${formattedHighestBid} on ${reg} (${make} ${model})`,
    html: contentHtml,
    previewText: `Midway Update: ${pluralBids} received on ${reg}. Current highest bid is ${formattedHighestBid}. 24 hours remaining.`,
  };
}

module.exports = {
  dealerBiddingActiveBidsMidwayTemplate,
};
