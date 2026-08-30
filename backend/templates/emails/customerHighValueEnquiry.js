/**
 * Customer High-Value Enquiry Confirmation Email Template
 */
function customerHighValueEnquiryTemplate({
  reference,
  customerName,
  vehicle,
  estimatedValue,
  customerExpectedValue,
  valuePreference,
  postcode,
}) {
  const reg = vehicle?.registration || 'N/A';
  const make = vehicle?.make || 'Unknown Make';
  const model = vehicle?.model || 'Unknown Model';
  const year = vehicle?.year ? `(${vehicle.year})` : '';
  const mileage = vehicle?.mileage || 'N/A';

  const valAmount = valuePreference === 'CUSTOM_VALUE' ? (customerExpectedValue || estimatedValue) : estimatedValue;
  const numericVal = Number(valAmount) || 0;
  const formattedValuation = `£${numericVal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const contentHtml = `
    <!-- Top Heading -->
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">
      Thank You for Your High-Value Enquiry!
    </h2>

    <p style="color: #334155; font-size: 15px; margin: 0 0 14px 0; line-height: 1.6;">
      Dear <strong>${customerName || 'Valued Customer'}</strong>,
    </p>

    <p style="color: #334155; font-size: 15px; margin: 0 0 24px 0; line-height: 1.6;">
      We have received your vehicle details and your high-value enquiry has been officially submitted into our verified dealer network for competitive bidding.
    </p>

    <!-- Reference Number Box -->
    <div style="background-color: #f0fdf4; border: 1.5px dashed #22c55e; border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 26px;">
      <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.8px;">
        High-Value Enquiry Reference
      </div>
      <div style="font-size: 24px; font-weight: 800; color: #0f7b4f; letter-spacing: 1px; margin-top: 6px;">
        ${reference}
      </div>
    </div>

    <!-- Details Table -->
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
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Mileage</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${typeof mileage === 'number' ? `${mileage.toLocaleString('en-GB')} miles` : mileage}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Estimated Valuation</td>
          <td style="padding: 11px 0; color: #0f7b4f; font-weight: 800; font-size: 18px;">${formattedValuation}</td>
        </tr>
        ${postcode ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 11px 0; color: #64748b; font-weight: 600;">Location</td>
          <td style="padding: 11px 0; color: #0f172a; font-weight: 600;">${postcode}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <!-- Next Steps Info Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0f7b4f; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
      <div style="font-size: 14px; font-weight: 700; color: #0f7b4f; margin-bottom: 4px;">
        What happens next?
      </div>
      <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
        Verified local dealers are now actively reviewing your vehicle and placing bids. Once the bidding concludes, you will receive the highest competitive offer to proceed with collection and payment.
      </p>
    </div>

    <!-- Footer Note -->
    <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
      If you have questions or wish to provide additional details/photos for your vehicle, reply directly to this email or quote reference <strong>${reference}</strong>.
    </p>
  `;

  return {
    subject: `High-Value Enquiry Submitted for Bidding - ${reference}`,
    html: contentHtml,
    previewText: `Thank you for your high-value enquiry. Your ${make} ${model} (${reg}) is now live for bidding. Reference: ${reference}`,
  };
}

module.exports = {
  customerHighValueEnquiryTemplate,
};
