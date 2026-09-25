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
