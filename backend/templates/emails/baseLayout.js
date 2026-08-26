/**
 * Modern, Full-Width, Dark-Mode Safe Email Layout Wrapper
 * Styled cleanly with AutoScrap Emerald / Forest Green & Orange branding
 */
function baseLayout({ title = 'AutoScrap Notification', contentHtml, previewText = '' }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${title}</title>
  <style>
    /* Global Resets */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background-color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
    }

    /* Dark Mode Handling */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #18191a !important; }
      .email-card { background-color: #242526 !important; border-color: #3a3b3c !important; }
      .text-dark { color: #f5f6f7 !important; }
      .text-muted { color: #b0b3b8 !important; }
      .info-box { background-color: #1e293b !important; border-color: #334155 !important; }
      .table-row { border-color: #334155 !important; }
      .brand-scrap { color: #ffffff !important; }
    }

    /* Mobile Responsive */
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .header-padding { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  ${previewText ? `<div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}

  <!-- Outer Container -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; width: 100%;" class="email-bg">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        
        <!-- Email Card (Max 600px) -->
        <table role="presentation" class="email-container email-card" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          
          <!-- Top Clean Header (White background with crisp AutoScrap logo) -->
          <tr>
            <td align="left" class="header-padding" style="padding: 24px 32px; background-color: #ffffffff; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; line-height: 1;">
                      <a href="https://myautoscrap.co.uk" target="_blank" style="text-decoration: none; color: #0f7b4f;">
                        <span style="color: #0f7b4f;">Auto</span><span class="brand-scrap" style="color: #000000;">Scrap</span><span style="color: #0f7b4f; font-size: 14px; font-weight: 700;">.co.uk</span>
                      </a>
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500;">
                      The UK's Trusted Scrap & Salvage Network
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Email Body -->
          <tr>
            <td class="content-padding" style="padding: 32px 32px 28px 32px; background-color: #ffffff;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Clean Professional Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: left;">
              <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
                <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">AutoScrap UK</p>
                <p style="margin: 0 0 6px 0;">Need assistance? Reply directly to this email or visit our website.</p>
                <p style="margin: 0; color: #94a3b8; font-size: 11px;">© ${new Date().getFullYear()} AutoScrap. All rights reserved.</p>
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = {
  baseLayout,
};
