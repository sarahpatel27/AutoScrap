// Google Consent Mode v2 & Cookie Consent Management for MyAutoScrap
import { getCookie, setCookie } from './cookieHelper';

export const CONSENT_COOKIE_NAME = 'mas_cookie_consent';
export const CONSENT_COOKIE_DAYS = 365; // 12 months retention (UK ICO standard)
export const CONSENT_VERSION = '1.0';

/**
 * Retrieves the stored consent object from first-party cookie or localStorage fallback.
 * Returns null if no valid consent has been recorded yet.
 *
 * @returns {{ necessary: true, analytics: boolean, marketing: boolean, timestamp: number, version: string } | null}
 */
export function getStoredConsent() {
  if (typeof window === 'undefined') return null;

  try {
    const rawCookie = getCookie(CONSENT_COOKIE_NAME);
    if (rawCookie) {
      const parsed = JSON.parse(rawCookie);
      if (typeof parsed === 'object' && parsed !== null && parsed.necessary === true) {
        return {
          necessary: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
          timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
          version: parsed.version || CONSENT_VERSION,
        };
      }
    }

    // LocalStorage fallback in case cookies were partially restricted
    const rawStorage = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (rawStorage) {
      const parsed = JSON.parse(rawStorage);
      if (typeof parsed === 'object' && parsed !== null && parsed.necessary === true) {
        return {
          necessary: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
          timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
          version: parsed.version || CONSENT_VERSION,
        };
      }
    }
  } catch (err) {
    console.warn('Could not read stored cookie consent:', err);
  }

  return null;
}

/**
 * Saves visitor consent preferences, updates Google Consent Mode v2,
 * updates GTM dataLayer, and stores preferences in a first-party cookie.
 *
 * @param {{ analytics: boolean, marketing: boolean }} preferences
 * @returns {{ necessary: true, analytics: boolean, marketing: boolean, timestamp: number, version: string }}
 */
export function saveConsent({ analytics, marketing }) {
  const consentRecord = {
    necessary: true,
    analytics: Boolean(analytics),
    marketing: Boolean(marketing),
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };

  // 1. Store in first-party cookie (365 days expiry, no PII)
  try {
    setCookie(CONSENT_COOKIE_NAME, JSON.stringify(consentRecord), CONSENT_COOKIE_DAYS);
  } catch (err) {
    console.warn('Failed to save consent cookie:', err);
  }

  // 2. Also keep localStorage fallback
  try {
    localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(consentRecord));
  } catch (_) {
    // Ignore storage quota/security errors
  }

  // 3. Update Google Consent Mode v2 immediately
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];

    const consentUpdatePayload = {
      analytics_storage: consentRecord.analytics ? 'granted' : 'denied',
      ad_storage: consentRecord.marketing ? 'granted' : 'denied',
      ad_user_data: consentRecord.marketing ? 'granted' : 'denied',
      ad_personalization: consentRecord.marketing ? 'granted' : 'denied',
    };

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', consentUpdatePayload);
    } else {
      window.dataLayer.push(['consent', 'update', consentUpdatePayload]);
    }

    // 4. Push custom event for GTM triggers and Meta Pixel blocking/triggering
    window.dataLayer.push({
      event: 'consent_update',
      consent_analytics: consentRecord.analytics,
      consent_marketing: consentRecord.marketing,
    });

    // 5. Notify any listening React components
    window.dispatchEvent(
      new CustomEvent('cookie_consent_updated', { detail: consentRecord })
    );
  }

  return consentRecord;
}

/**
 * Helper to dispatch window event opening the preferences modal.
 */
export function openCookiePreferences() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open_cookie_preferences'));
  }
}
