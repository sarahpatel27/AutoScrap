/**
 * Account Generated / Credentials Notification Email Template
 * Sent to newly created Super Admins and City Dealers.
 */
function accountCredentialsTemplate({
  name,
  email,
  password,
  role,
  assignedCity,
  loginUrl = 'https://www.myautoscrap.co.uk/admin/login',
}) {
  const isSuperAdmin = role === 'Super Admin';
  const roleDisplay = isSuperAdmin
    ? 'Super Administrator'
    : `City Dealer (${assignedCity || 'All UK'})`;

  const roleBadgeBg = isSuperAdmin ? '#ecfdf5' : '#fef3c7';
  const roleBadgeBorder = isSuperAdmin ? '#6ee7b7' : '#fcd34d';
  const roleBadgeText = isSuperAdmin ? '#065f46' : '#92400e';

  const contentHtml = `
    <!-- Top Role & Welcome Card -->
    <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-left: 5px solid #0f7b4f; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="display: inline-block; font-size: 11px; font-weight: 800; background-color: ${roleBadgeBg}; border: 1px solid ${roleBadgeBorder}; color: ${roleBadgeText}; border-radius: 4px; padding: 3px 8px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
        ${roleDisplay}
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0f7b4f;">
        Your AutoScrap Portal Account Is Ready
      </h1>
      <div style="font-size: 13px; color: #166534; font-weight: 500;">
        Welcome to the AutoScrap Management & Dealer Network
      </div>
    </div>

    <p style="font-size: 15px; color: #334155; margin: 0 0 20px 0; line-height: 1.5;">
      Hello <strong>${name || 'Partner'}</strong>,<br>
      An account has been created for you on the <strong>AutoScrap Portal</strong> with the role of <strong>${roleDisplay}</strong>. You can now log in to access vehicle enquiries, manage bids, and track collections.
    </p>

    <!-- Credentials Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 14px; letter-spacing: 0.5px;">
        🔐 Login Credentials
      </div>
      
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="font-size: 14px;">
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 9px 0; color: #64748b; font-weight: 600; width: 32%;">Assigned Role:</td>
          <td style="padding: 9px 0; color: #0f172a; font-weight: 800;">
            ${roleDisplay}
          </td>
        </tr>
        ${assignedCity ? `
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Assigned City:</td>
          <td style="padding: 9px 0; color: #0f7b4f; font-weight: 800;">📍 ${assignedCity}</td>
        </tr>
        ` : ''}
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Email Address:</td>
          <td style="padding: 9px 0; color: #0f172a; font-weight: 700; font-family: monospace; font-size: 14px;">
            ${email}
          </td>
        </tr>
        <tr>
          <td style="padding: 9px 0; color: #64748b; font-weight: 600;">Password:</td>
          <td style="padding: 9px 0;">
            <span style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 10px; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700; color: #0f172a; letter-spacing: 0.5px;">
              ${password}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Login Portal URL & CTA Button -->
    <div style="text-align: center; margin: 28px 0; padding: 18px 20px; background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 10px;">
      <a href="${loginUrl}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}" target="_blank" style="display: inline-block; background-color: #0f7b4f; color: #ffffff; font-weight: 800; font-size: 15px; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(15, 123, 79, 0.25);">
        Log In to AutoScrap Portal &rarr;
      </a>
    </div>

    <!-- Security Notice -->
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px 16px; margin-top: 20px; font-size: 12px; color: #92400e; line-height: 1.5;">
      <strong>⚠️ Security Tip:</strong> For security reasons, please do not share these credentials. You can update your password at any time from your account settings inside the portal.
    </div>
  `;

  return {
    subject: `[AutoScrap] Your Account Credentials - ${roleDisplay}`,
    html: contentHtml,
    previewText: `Your AutoScrap portal account (${roleDisplay}) has been created. Login at: ${loginUrl}`,
  };
}

module.exports = {
  accountCredentialsTemplate,
};
