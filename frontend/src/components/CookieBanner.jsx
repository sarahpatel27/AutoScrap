import { useState, useEffect } from 'react';
import { getStoredConsent, saveConsent } from '../utils/consent';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Granular preference state
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    const existingConsent = getStoredConsent();
    if (!existingConsent) {
      setShowBanner(true);
    } else {
      setAnalyticsEnabled(existingConsent.analytics);
      setMarketingEnabled(existingConsent.marketing);
    }

    const handleOpenPreferences = () => {
      const current = getStoredConsent();
      if (current) {
        setAnalyticsEnabled(current.analytics);
        setMarketingEnabled(current.marketing);
      }
      setShowPreferences(true);
    };

    window.addEventListener('open_cookie_preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('open_cookie_preferences', handleOpenPreferences);
    };
  }, []);

  // Handle escape key to close preferences modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPreferences) {
        setShowPreferences(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPreferences]);

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setAnalyticsEnabled(true);
    setMarketingEnabled(true);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleRejectOptional = () => {
    saveConsent({ analytics: false, marketing: false });
    setAnalyticsEnabled(false);
    setMarketingEnabled(false);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    saveConsent({
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
    });
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner && !showPreferences) {
    return null;
  }

  return (
    <>
      {/* 1. Main Bottom Cookie Banner (shown on first visit before any choice is made) */}
      {showBanner && !showPreferences && (
        <section
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-5"
        >
          <div className="mx-auto max-w-[1140px] rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,35,25,0.22)] backdrop-blur-md sm:p-6 text-slate-900">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[720px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#e8f5ee] text-[#0f7b4f] text-sm">
                    🍪
                  </span>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-[#13231d] m-0">
                    We value your privacy & cookie choices
                  </h3>
                </div>
                <p className="m-0 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We use cookies and similar technologies to ensure our scrap car valuation and collection service operates securely. We also use optional analytics and marketing cookies to measure service performance and campaign attribution. You can accept all, reject optional cookies, or tailor your preferences.
                </p>
              </div>

              {/* Action Buttons: Equal prominence for Accept and Reject per UK ICO standards */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
                <button
                  type="button"
                  id="cookie-reject-optional-btn"
                  onClick={handleRejectOptional}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  id="cookie-accept-all-btn"
                  onClick={handleAcceptAll}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-transparent bg-[#0f7b4f] px-5 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(15,123,79,0.25)] transition hover:bg-[#075b3a] active:scale-[0.98]"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  id="cookie-manage-prefs-btn"
                  onClick={() => setShowPreferences(true)}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-transparent px-3 py-2 text-xs sm:text-sm font-extrabold text-[#0f7b4f] underline underline-offset-4 hover:text-[#075b3a]"
                >
                  Manage Preferences
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Granular Preferences Modal */}
      {showPreferences && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="relative flex max-h-[90vh] w-full max-w-[680px] flex-col rounded-2xl bg-white shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 bg-[#f8faf8]">
              <div>
                <h2
                  id="cookie-preferences-title"
                  className="text-lg sm:text-xl font-black text-[#13231d] m-0"
                >
                  Cookie Preferences
                </h2>
                <p className="m-0 mt-0.5 text-xs text-slate-500">
                  Manage how MyAutoScrap uses cookies and third-party tracking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                aria-label="Close preferences modal"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Category Accordion/List */}
            <div className="overflow-y-auto p-6 space-y-4 sm:space-y-5 text-sm">
              <p className="text-xs sm:text-sm text-slate-600 m-0">
                Cookies are small text files stored on your device. Strictly necessary cookies are required for the website and scrap quote system to function. You have the right under UK PECR to allow or disallow optional analytics and marketing cookies.
              </p>

              {/* Category 1: Strictly Necessary */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#13231d]">1. Strictly Necessary Cookies</span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#e8f5ee] px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#0f7b4f]">
                    Always Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 m-0 leading-relaxed">
                  Required for essential website operations, network security, authenticated administrator sessions, and remembering your cookie consent choices. These cannot be disabled.
                </p>
                <div className="mt-2 text-[11px] text-slate-400 font-mono">
                  Cookies: mas_cookie_consent, autoscrap_admin_token
                </div>
              </div>

              {/* Category 2: Analytics Cookies */}
              <div className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <label
                    htmlFor="toggle-analytics"
                    className="font-extrabold text-[#13231d] cursor-pointer"
                  >
                    2. Analytics Cookies
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="toggle-analytics"
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-[#0f7b4f]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f7b4f]"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 m-0 leading-relaxed">
                  Allow us to analyze aggregated visitor traffic, page load performance, and quote calculation completion rates using Google Analytics 4 (GA4). Helps us identify broken features and improve website reliability without identifying you personally.
                </p>
                <div className="mt-2 text-[11px] text-slate-400 font-mono">
                  Provider: Google Analytics 4 (via GTM)
                </div>
              </div>

              {/* Category 3: Marketing & Advertising Cookies */}
              <div className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <label
                    htmlFor="toggle-marketing"
                    className="font-extrabold text-[#13231d] cursor-pointer"
                  >
                    3. Marketing & Advertising Cookies
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="toggle-marketing"
                      type="checkbox"
                      checked={marketingEnabled}
                      onChange={(e) => setMarketingEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-[#0f7b4f]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f7b4f]"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 m-0 leading-relaxed">
                  Used by Google Ads and Meta Pixel (managed via Google Tag Manager) to measure ad conversion efficiency (e.g. quote enquiries originating from search or social ads), attribute marketing campaigns, and ensure ads are relevant.
                </p>
                <div className="mt-2 text-[11px] text-slate-400 font-mono">
                  Providers: Google Ads, Meta Pixel (via GTM)
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200 bg-[#f8faf8] p-4 sm:px-6">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-700 hover:bg-slate-100 transition"
              >
                Reject All Optional
              </button>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-[#0f7b4f] bg-white px-4 py-2.5 text-xs sm:text-sm font-extrabold text-[#0f7b4f] hover:bg-[#e8f5ee] transition"
                >
                  Save Preferences
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#0f7b4f] px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-sm hover:bg-[#075b3a] transition"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
