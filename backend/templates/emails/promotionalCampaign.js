/**
 * Promotional Campaign Email Template
 * Used by Super Admin to dispatch marketing and announcement campaigns to customers.
 */
function promotionalCampaignTemplate({
  customerName = 'Valued Customer',
  subject = 'Special Offer from AutoScrap UK',
  message = '',
  ctaText = 'Get Instant Scrap Quote',
  ctaUrl = 'https://myautoscrap.co.uk/scrap-my-car',
}) {
  // Convert newlines in message text to paragraphs if plain text was provided
  let formattedMessageHtml = '';
  if (message.includes('<p>') || message.includes('<div>') || message.includes('<br>')) {
    formattedMessageHtml = message;
  } else {
    formattedMessageHtml = message
      .split('\n\n')
      .filter((p) => p.trim())
      .map((p) => `<p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.65;">${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  const contentHtml = `
    <!-- Top Campaign Banner -->
    <div style="margin-bottom: 24px;">
      <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;">
        ⭐ Special AutoScrap Announcement
      </span>
      <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.25;">
        ${subject}
      </h1>
    </div>

    <p style="color: #334155; font-size: 15px; margin: 0 0 16px 0; line-height: 1.6;">
      Dear <strong>${customerName || 'Valued Customer'}</strong>,
    </p>

    <!-- Main Dynamic Campaign Message Body -->
    <div style="margin-bottom: 28px; color: #334155; font-size: 15px; line-height: 1.65;">
      ${formattedMessageHtml}
    </div>

    <!-- Why AutoScrap Feature Card Grid -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
      <div style="font-size: 12px; font-weight: 800; color: #0f7b4f; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px;">
        Why Recycle or Sell with AutoScrap?
      </div>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
        <tr>
          <td width="50%" style="padding: 6px 8px 6px 0; vertical-align: top;">
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a;">💰 Best Price Guarantee</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Real-time competitive metal rates</div>
          </td>
          <td width="50%" style="padding: 6px 0 6px 8px; vertical-align: top;">
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a;">🚚 100% Free Collection</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">At your doorstep, no hidden fees</div>
          </td>
        </tr>
        <tr>
          <td width="50%" style="padding: 10px 8px 6px 0; vertical-align: top;">
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a;">⚡ Instant Direct Payout</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Direct bank transfer upon collection</div>
          </td>
          <td width="50%" style="padding: 10px 0 6px 8px; vertical-align: top;">
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a;">📋 Official DVLA Paperwork</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Certified Certificate of Destruction</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Call to Action Button -->
    ${ctaText && ctaUrl ? `
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${ctaUrl}" target="_blank" style="display: inline-block; background-color: #0f7b4f; color: #ffffff; font-weight: 800; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 12px rgba(15, 123, 79, 0.25); letter-spacing: 0.3px;">
        ${ctaText} →
      </a>
    </div>
    ` : ''}

    <!-- Compliance / Opt-out footer note -->
    <p style="color: #94a3b8; font-size: 11.5px; margin: 0; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
      You are receiving this update because you previously requested a valuation or enquired with AutoScrap UK. If you no longer wish to receive promotional announcements, simply reply to this email with "Unsubscribe".
    </p>
  `;

  return {
    subject,
    html: contentHtml,
    previewText: `${subject} - AutoScrap UK Announcements`,
  };
}

module.exports = {
  promotionalCampaignTemplate,
};
