/**
 * Helper to push events safely to Google Tag Manager dataLayer.
 *
 * @param {string} event - The GTM custom event name
 * @param {Record<string, any>} [params={}] - Optional event parameters (no PII)
 */
export function pushToDataLayer(event, params = {}) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...params,
    });
  }
}

/**
 * Track lead generation event in GTM without any PII.
 *
 * @param {'normal' | 'high_value'} leadType - The category of enquiry
 */
export function trackLeadGenerated(leadType) {
  pushToDataLayer('generate_lead', {
    lead_type: leadType,
  });
}

/**
 * Track quote journey initiation event in GTM without any PII.
 *
 * @param {'normal' | 'high_value'} [leadType] - The category of enquiry if known
 */
export function trackBeginQuote(leadType) {
  const params = {};
  if (leadType) {
    params.lead_type = leadType;
  }
  pushToDataLayer('begin_quote', params);
}

/**
 * Track quote generation event in GTM without any PII.
 *
 * @param {'normal' | 'high_value'} leadType - The category of enquiry
 * @param {number} [quoteValue] - Optional calculated quote amount (numeric only, no currency symbols)
 */
export function trackQuoteGenerated(leadType, quoteValue) {
  const params = {
    lead_type: leadType,
  };

  const numericValue = typeof quoteValue === 'number' ? quoteValue : Number(quoteValue);
  if (!isNaN(numericValue) && numericValue > 0) {
    params.quote_value = numericValue;
  }

  pushToDataLayer('quote_generated', params);
}

/**
 * Track successful Contact Us form submission in GTM without any PII.
 */
export function trackContactFormSubmitted() {
  pushToDataLayer('contact_form_submit', {
    form_name: 'contact_us',
  });
}
