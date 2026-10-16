import SEO from '../components/Seo';
import { openCookiePreferences } from '../utils/consent';

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const paragraphClass = 'mb-[18px] text-slate-600 leading-relaxed text-sm sm:text-base';
const headingClass = 'mb-3.5 mt-[34px] text-[1.45rem] font-black text-[#13231d] leading-tight first:mt-0';
const subHeadingClass = 'mb-2 mt-4 text-[1.1rem] font-bold text-[#13231d]';
const tableClass = 'w-full text-left text-xs sm:text-sm border-collapse border border-slate-200 mb-6';
const thClass = 'border border-slate-200 bg-slate-100 p-2.5 sm:p-3 font-extrabold text-slate-900';
const tdClass = 'border border-slate-200 p-2.5 sm:p-3 text-slate-700 align-top';

export default function LegalPage({ type = 'Privacy Policy' }) {
  const isPrivacy = type === 'Privacy Policy';
  const isCookie = type === 'Cookie Policy';

  let metaTitle = 'Privacy Policy | MyAutoScrap';
  let metaDescription = 'Read the MyAutoScrap privacy policy explaining how vehicle details and personal information are handled and protected.';
  let canonicalUrl = '/privacy-policy';

  if (isCookie) {
    metaTitle = 'Cookie Policy | MyAutoScrap';
    metaDescription = 'Learn about the cookies used on MyAutoScrap, including strictly necessary, analytics, and marketing cookies under UK PECR.';
    canonicalUrl = '/cookie-policy';
  } else if (!isPrivacy) {
    metaTitle = 'Terms and Conditions | MyAutoScrap';
    metaDescription = 'Read the terms and conditions for MyAutoScrap scrap car valuation, enquiry, and collection services.';
    canonicalUrl = '/terms-and-conditions';
  }

  return (
    <>
      <SEO
        title={metaTitle}
        description={metaDescription}
        canonical={canonicalUrl}
      />
      <section className="bg-linear-to-br from-[#0a3626] to-[#0f704a] py-[60px] sm:py-[82px] text-white">
        <div className={containerClass}>
          <span className="mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
            Legal & Compliance
          </span>
          <h1 className="mb-3.5 text-[clamp(2.4rem,5.5vw,4.8rem)] leading-tight">
            {type}
          </h1>
          <p className="m-0 max-w-[760px] text-[1.05rem] text-[#d7e9e1]">
            {isPrivacy || isCookie
              ? 'Information on how MyAutoScrap collects data, protects your privacy, and manages cookies in accordance with UK GDPR and PECR regulations.'
              : 'Terms and conditions governing our scrap vehicle valuation, customer enquiry, and vehicle collection services.'}
          </p>
        </div>
      </section>

      <section className="py-[60px] sm:py-[80px]">
        <article className={`${containerClass} max-w-[840px]`}>
          {/* TERMS AND CONDITIONS */}
          {!isPrivacy && !isCookie && (
            <>
              <h2 className={headingClass}>1. Service Overview</h2>
              <p className={paragraphClass}>
                MyAutoScrap provides an online platform connecting vehicle owners seeking to scrap, recycle, or sell vehicles with authorized scrap car collection partners and licensed Authorised Treatment Facilities (ATFs) across supported UK postcodes.
              </p>

              <h2 className={headingClass}>2. Valuation Estimates</h2>
              <p className={paragraphClass}>
                Online quotes generated via the MyAutoScrap website are provisional estimates based on prevailing scrap metal market rates, vehicle weight specifications, and customer-declared condition details. Final purchase offers and payments are subject to physical verification of the vehicle upon collection.
              </p>

              <h2 className={headingClass}>3. Customer Warranties & Ownership</h2>
              <p className={paragraphClass}>
                You warrant that you are the legal owner of the vehicle or have explicit written authority from the registered keeper to arrange disposal. Valid photographic ID and vehicle documentation (V5C logbook) must be presented upon collection in compliance with the Scrap Metal Dealers Act 2013.
              </p>

              <h2 className={headingClass}>4. Payments</h2>
              <p className={paragraphClass}>
                In strict compliance with the Scrap Metal Dealers Act 2013, cash payments for scrap metal or end-of-life vehicles are strictly prohibited by law. All payments are executed via electronic bank transfer upon vehicle collection.
              </p>

              <h2 className={headingClass}>5. Contact Details</h2>
              <p className={paragraphClass}>
                For enquiries regarding our terms of service, please contact info@myautoscrap.co.uk or telephone 07714 423293.
              </p>
            </>
          )}

          {/* PRIVACY POLICY & COOKIE POLICY */}
          {(isPrivacy || isCookie) && (
            <>
              <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0f7b4f] m-0">
                      Manage Your Cookie Preferences
                    </h3>
                    <p className="m-0 mt-1 text-xs sm:text-sm text-slate-600">
                      You can change or withdraw your consent for optional analytics and marketing cookies at any time.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openCookiePreferences}
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#0f7b4f] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-[#075b3a] transition shrink-0"
                  >
                    Open Cookie Settings
                  </button>
                </div>
              </div>

              {isPrivacy && (
                <>
                  <h2 className={headingClass}>1. Data Controller & Scope</h2>
                  <p className={paragraphClass}>
                    MyAutoScrap operates as a data controller under the UK Data Protection Act 2018 and UK GDPR. This Privacy Policy outlines how we collect, process, and protect your personal information when you use our website and vehicle valuation services.
                  </p>

                  <h2 className={headingClass}>2. Information We Collect</h2>
                  <p className={paragraphClass}>
                    We only collect information necessary to fulfill scrap car quotes, customer enquiries, and collection arrangements:
                  </p>
                  <ul className="list-disc pl-5 mb-4 text-slate-600 space-y-1.5 text-sm sm:text-base">
                    <li><strong>Vehicle Information:</strong> Registration number (VRM), make, model, year, fuel type, weight, mileage, and condition declarations.</li>
                    <li><strong>Collection Information:</strong> Postcode, street address, and town for verifying coverage and routing licensed recovery operators.</li>
                    <li><strong>Contact Details:</strong> Name, phone number, and email address submitted when requesting collection or contacting support.</li>
                    <li><strong>Payment Information:</strong> Bank account name, sort code, and account number submitted securely for payment via bank transfer upon collection (in accordance with the Scrap Metal Dealers Act 2013).</li>
                  </ul>
                </>
              )}

              <h2 className={headingClass}>
                {isCookie ? '1. What Are Cookies?' : '3. Cookies & Tracking Technologies (PECR Compliance)'}
              </h2>
              <p className={paragraphClass}>
                Cookies are small data files placed on your computer or mobile device when you visit websites. Under the UK Privacy and Electronic Communications Regulations (PECR) and UK GDPR, we are required to obtain your prior consent before storing non-essential cookies on your device.
              </p>
              <p className={paragraphClass}>
                We categorize all cookies and tracking mechanisms on MyAutoScrap into three distinct groups:
              </p>

              <h3 className={subHeadingClass}>A. Strictly Necessary Cookies (Always Active)</h3>
              <p className={paragraphClass}>
                These cookies and storage items are essential for the operation of MyAutoScrap. They enable security, session management, core functionality, and recording your cookie consent choices. Because they are strictly necessary to provide the service you request, they do not require consent under PECR Regulation 6(4).
              </p>
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Name / Key</th>
                      <th className={thClass}>Provider</th>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`${tdClass} font-mono font-bold`}>mas_cookie_consent</td>
                      <td className={tdClass}>MyAutoScrap (First-party)</td>
                      <td className={tdClass}>Stores your cookie consent preferences and Consent Mode state so the banner does not reappear on return visits.</td>
                      <td className={tdClass}>365 days (12 months)</td>
                    </tr>
                    <tr>
                      <td className={`${tdClass} font-mono font-bold`}>autoscrap_admin_token</td>
                      <td className={tdClass}>MyAutoScrap (First-party)</td>
                      <td className={tdClass}>Secure JWT session token for authenticated staff/admin dashboard access.</td>
                      <td className={tdClass}>7 days</td>
                    </tr>
                    <tr>
                      <td className={`${tdClass} font-mono font-bold`}>autoscrap_admin_user</td>
                      <td className={tdClass}>MyAutoScrap (First-party)</td>
                      <td className={tdClass}>Administrator display profile during active authenticated sessions.</td>
                      <td className={tdClass}>7 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className={subHeadingClass}>B. Analytics Cookies (Optional - Requires Consent)</h3>
              <p className={paragraphClass}>
                Analytics cookies help us understand how visitors interact with our website by collecting information anonymously. This enables us to monitor quote conversion funnels, diagnose technical errors, and optimize page load speeds. We use Google Analytics 4 (GA4), deployed through Google Tag Manager (container ID: GTM-5GP72ZTD).
              </p>
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Name / Tag</th>
                      <th className={thClass}>Provider</th>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`${tdClass} font-mono font-bold`}>_ga, _ga_*</td>
                      <td className={tdClass}>Google LLC (GA4 via GTM)</td>
                      <td className={tdClass}>Distinguishes unique users and user sessions anonymously to compile website usage metrics.</td>
                      <td className={tdClass}>Up to 2 years (configurable in GA4; default event data retention 14 months)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className={subHeadingClass}>C. Marketing & Advertising Cookies (Optional - Requires Consent)</h3>
              <p className={paragraphClass}>
                Marketing cookies track advertising effectiveness across channels to measure quote requests originating from paid ads on Google Search and Meta (Facebook/Instagram), preventing repetitive advertising and ensuring relevant promotions.
              </p>
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Name / Tag</th>
                      <th className={thClass}>Provider</th>
                      <th className={thClass}>Purpose</th>
                      <th className={thClass}>Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`${tdClass} font-mono font-bold`}>_gcl_au, _gcl_aw</td>
                      <td className={tdClass}>Google LLC (Google Ads via GTM)</td>
                      <td className={tdClass}>Measures ad conversion efficiency when a visitor submits a quote or contact enquiry after clicking a Google Ad.</td>
                      <td className={tdClass}>90 days</td>
                    </tr>
                    <tr>
                      <td className={`${tdClass} font-mono font-bold`}>_fbp, _fbc</td>
                      <td className={tdClass}>Meta Platforms Ireland Ltd (Meta Pixel via GTM)</td>
                      <td className={tdClass}>Delivers and measures advertising campaigns on Facebook and Instagram, attributing quote requests to Meta campaigns.</td>
                      <td className={tdClass}>90 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className={headingClass}>
                {isCookie ? '2. Google Consent Mode v2 & Your Choices' : '4. How Google Consent Mode v2 Protects Your Choices'}
              </h2>
              <p className={paragraphClass}>
                MyAutoScrap implements <strong>Google Consent Mode v2</strong>. When you first visit our website, all analytics and advertising storage permissions (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-xs">analytics_storage</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-xs">ad_storage</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-xs">ad_user_data</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-xs">ad_personalization</code>) are set to <strong>denied</strong> by default before any tracking scripts load.
              </p>
              <p className={paragraphClass}>
                If you choose &ldquo;Reject Optional&rdquo;, no analytics or marketing cookies are set. If you choose &ldquo;Accept All&rdquo; or enable specific categories in &ldquo;Manage Preferences&rdquo;, permissions are granted in accordance with your explicit selection.
              </p>

              <h2 className={headingClass}>
                {isCookie ? '3. How to Withdraw or Change Consent' : '5. Withdrawing Consent or Changing Settings'}
              </h2>
              <p className={paragraphClass}>
                You can change your mind or withdraw consent at any time:
              </p>
              <ul className="list-disc pl-5 mb-4 text-slate-600 space-y-1.5 text-sm sm:text-base">
                <li>
                  Click the <strong>&ldquo;Cookie Settings&rdquo;</strong> link in the website footer on any page, or click the button below to reopen your preferences modal:
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={openCookiePreferences}
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-[#0f7b4f] bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-[#0f7b4f] hover:bg-[#e8f5ee] transition"
                    >
                      Change Cookie Preferences
                    </button>
                  </div>
                </li>
                <li className="mt-2">
                  You can also block or delete cookies directly within your browser settings (Chrome, Edge, Safari, Firefox). Please note that blocking strictly necessary cookies may prevent the quote calculation form and admin tools from functioning properly.
                </li>
              </ul>

              <h2 className={headingClass}>
                {isCookie ? '4. Items Flagged for Manual Verification' : '6. Provider-Specific Details Flagged for Verification'}
              </h2>
              <p className={paragraphClass}>
                As part of our compliance transparency under UK GDPR, the following container-specific IDs configured in Google Tag Manager (GTM-5GP72ZTD) should be verified by the site administrator:
              </p>
              <ul className="list-disc pl-5 mb-6 text-slate-600 space-y-1.5 text-sm sm:text-base">
                <li><strong>Google Analytics 4 Measurement ID</strong> (e.g. <code>G-XXXXXXXXXX</code>) linked in GTM tag configuration.</li>
                <li><strong>Google Ads Conversion Tracking ID & Conversion Labels</strong> linked to <code>begin_quote</code>, <code>quote_generated</code>, and <code>generate_lead</code> triggers in GTM.</li>
                <li><strong>Meta Pixel Dataset ID</strong> (e.g. <code>XXXXXXXXXXXXXXXX</code>) and ensure GTM consent checks require <code>ad_storage</code> before firing.</li>
              </ul>

              <h2 className={headingClass}>
                {isCookie ? '5. Contact Us' : '7. Contacting Us'}
              </h2>
              <p className={paragraphClass}>
                If you have any questions about this policy or our data protection practices, please contact us by email at <a href="mailto:info@myautoscrap.co.uk" className="text-[#0f7b4f] font-bold hover:underline">info@myautoscrap.co.uk</a> or telephone <a href="tel:+447714423293" className="text-[#0f7b4f] font-bold hover:underline">07714 423293</a>.
              </p>
            </>
          )}
        </article>
      </section>
    </>
  );
}
