import { useState, useEffect, useMemo } from 'react';
import {
  fetchCustomerAudience,
  previewPromotionalCampaign,
  sendPromotionalCampaign,
} from '../../services/adminStore';
import { showToast } from './ToastContainer';

const PRESET_TEMPLATES = [
  {
    id: 'price-boost',
    name: '💰 Scrap Price Boost',
    badge: 'High Conversion',
    subject: '⚡ Special Price Boost: Get Top Cash for Your Scrap Vehicle Today!',
    message: `We have great news! AutoScrap UK has just updated our metal recycling rates with increased price-per-tonne bonuses across your local area.

If you have an old, damaged, non-running, or MOT-failure vehicle sitting on your driveway, now is the perfect time to convert it into instant cash.

✓ Guaranteed best price with zero hidden fees
✓ 100% Free doorstep collection at your convenience
✓ Instant direct bank transfer upon collection
✓ Official DVLA Certificate of Destruction issued

Click below to check your updated free quote in under 30 seconds!`,
    ctaText: 'Check Your Updated Quote Now',
    ctaUrl: 'https://myautoscrap.co.uk/scrap-my-car',
  },
  {
    id: 'high-value-bidding',
    name: '⭐ High-Value Dealer Bidding',
    badge: 'Prestige & 2015+',
    subject: '⭐ Have a 2015+ Car to Sell? Get Verified Dealer Bids with AutoScrap',
    message: `Did you know AutoScrap now offers exclusive nationwide dealer bidding for newer vehicles (2015 and above)?

Instead of settling for standard scrap rates or low trade-in offers, verified dealers across our UK network place competitive bids to guarantee you the highest possible payout.

✓ Free listing into our nationwide verified dealer network
✓ 48-hour competitive bidding window
✓ Zero obligation: accept the best offer or keep your car
✓ Free collection arranged directly with the winning specialist

Enter your registration today to see what verified dealers will offer for your vehicle!`,
    ctaText: 'Start Free Vehicle Valuation',
    ctaUrl: 'https://myautoscrap.co.uk/scrap-my-car',
  },
  {
    id: 'free-collection',
    name: '🚚 Free Collection & DVLA Care',
    badge: 'Convenience',
    subject: '🚚 Fast, Free Collection & Instant Payment for Any Scrap Car',
    message: `Still deciding what to do with your unused vehicle? Let AutoScrap take the hassle off your hands.

Our approved recovery teams operate daily across the UK, offering reliable, scheduled collection at absolutely zero cost to you.

✓ Zero towing charges or collection fees
✓ Instant payment issued on vehicle handover
✓ Full DVLA logbook transfer (Section 9) handled legally & seamlessly

Get your free, no-obligation valuation today and choose a collection slot that suits your schedule.`,
    ctaText: 'Book Free Collection',
    ctaUrl: 'https://myautoscrap.co.uk/scrap-my-car',
  },
  {
    id: 'custom',
    name: '✍️ Custom Campaign',
    badge: 'Blank Template',
    subject: '',
    message: `Hello {name},\n\n`,
    ctaText: 'Visit AutoScrap UK',
    ctaUrl: 'https://myautoscrap.co.uk',
  },
];

export default function PromotionalEmailsSection() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('ALL');

  // Recipient selection state (Set of customer emails)
  const [selectedEmails, setSelectedEmails] = useState(new Set());

  // Campaign Form State
  const [activePreset, setActivePreset] = useState('price-boost');
  const [subject, setSubject] = useState(PRESET_TEMPLATES[0].subject);
  const [message, setMessage] = useState(PRESET_TEMPLATES[0].message);
  const [ctaText, setCtaText] = useState(PRESET_TEMPLATES[0].ctaText);
  const [ctaUrl, setCtaUrl] = useState(PRESET_TEMPLATES[0].ctaUrl);

  // Preview Modal State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Send Confirmation & Sending Progress State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  // Load audience on mount
  const loadAudience = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomerAudience();
      const list = data.customers || [];
      setCustomers(list);
      // By default, select all unique customers
      setSelectedEmails(new Set(list.map((c) => c.email)));
    } catch (err) {
      console.error('Failed to fetch audience:', err);
      showToast(err.message || 'Failed to load customer audience', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudience();
  }, []);

  // Filtered customer audience
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.postcode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSource =
        selectedSourceFilter === 'ALL' ||
        c.sources.some((s) => s.toLowerCase().includes(selectedSourceFilter.toLowerCase()));

      return matchesSearch && matchesSource;
    });
  }, [customers, searchQuery, selectedSourceFilter]);

  // Selection handlers
  const handleSelectAllFiltered = () => {
    const next = new Set(selectedEmails);
    filteredCustomers.forEach((c) => next.add(c.email));
    setSelectedEmails(next);
  };

  const handleDeselectAllFiltered = () => {
    const next = new Set(selectedEmails);
    filteredCustomers.forEach((c) => next.delete(c.email));
    setSelectedEmails(next);
  };

  const handleToggleCustomer = (email) => {
    const next = new Set(selectedEmails);
    if (next.has(email)) {
      next.delete(email);
    } else {
      next.add(email);
    }
    setSelectedEmails(next);
  };

  const isAllFilteredSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((c) => selectedEmails.has(c.email));

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setSubject(preset.subject);
    setMessage(preset.message);
    setCtaText(preset.ctaText);
    setCtaUrl(preset.ctaUrl);
  };

  // Preview Campaign
  const handleGeneratePreview = async () => {
    if (!subject.trim() || !message.trim()) {
      showToast('Please enter both a subject and message body to preview.', 'warning');
      return;
    }
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      const sample = customers.find((c) => selectedEmails.has(c.email)) || customers[0];
      const data = await previewPromotionalCampaign({
        subject,
        message,
        ctaText,
        ctaUrl,
        sampleName: sample?.name || 'Jane Doe',
      });
      setPreviewHtml(data.html);
    } catch (err) {
      showToast(err.message || 'Failed to generate preview', 'error');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Dispatch Campaign
  const handleSendCampaign = async () => {
    const selectedRecipients = customers
      .filter((c) => selectedEmails.has(c.email))
      .map((c) => ({ email: c.email, name: c.name }));

    if (selectedRecipients.length === 0) {
      showToast('Please select at least one customer recipient.', 'warning');
      return;
    }

    if (!subject.trim()) {
      showToast('Please provide an email subject.', 'warning');
      return;
    }

    if (!message.trim()) {
      showToast('Please provide an email message body.', 'warning');
      return;
    }

    setSending(true);
    try {
      const res = await sendPromotionalCampaign({
        recipients: selectedRecipients,
        subject,
        message,
        ctaText,
        ctaUrl,
      });

      setSendResult(res);
      showToast(`Campaign sent successfully to ${res.successCount} customers!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to send promotional campaign.', 'error');
    } finally {
      setSending(false);
    }
  };

  const selectedCount = selectedEmails.size;
  const totalCount = customers.length;

  return (
    <div className="space-y-6 font-['DM_Sans',sans-serif]">
      {/* Top Header Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-xl text-emerald-700">
            👥
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Unique Customers
            </div>
            <div className="text-xl font-black text-slate-900 font-['Manrope']">
              {loading ? '...' : totalCount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xl text-blue-700">
            ✉️
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Selected Recipients
            </div>
            <div className="text-xl font-black text-blue-700 font-['Manrope']">
              {selectedCount.toLocaleString()}{' '}
              <span className="text-xs font-bold text-slate-400">/ {totalCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-purple-200/80 bg-white p-4 shadow-xs">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-purple-50 text-xl text-purple-700">
            🛡️
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Deduplication Status
            </div>
            <div className="text-sm font-black text-purple-700">
              100% Unique Verified Emails
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Customer Audience Selector (5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 font-['Manrope']">
                  Target Audience
                </h2>
                <p className="text-[11px] font-medium text-slate-500">
                  Select customers from database records
                </p>
              </div>

              <div className="text-xs font-black text-[#0f7b4f] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {selectedCount} Selected
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search name, email, city, postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-xs font-medium text-slate-800 placeholder-gray-400 outline-none transition focus:border-[#0f7b4f] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Source Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
              {['ALL', 'Standard', 'High-Value', 'Contact'].map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelectedSourceFilter(src)}
                  className={`rounded-lg px-2.5 py-1 font-bold transition cursor-pointer ${
                    selectedSourceFilter === src
                      ? 'bg-[#0f7b4f] text-white shadow-2xs'
                      : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                  }`}
                >
                  {src === 'ALL' ? 'All Sources' : src}
                </button>
              ))}
            </div>

            {/* Bulk Selection Bar */}
            <div className="flex items-center justify-between border-y border-gray-100 py-2.5 mb-2 text-xs">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllFilteredSelected}
                  onChange={(e) =>
                    e.target.checked
                      ? handleSelectAllFiltered()
                      : handleDeselectAllFiltered()
                  }
                  className="h-4 w-4 rounded-md border-gray-300 text-[#0f7b4f] focus:ring-[#0f7b4f] cursor-pointer"
                />
                <span>Select All Filtered ({filteredCustomers.length})</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-[11px] font-bold text-[#0f7b4f] hover:underline cursor-pointer"
                >
                  All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedEmails(new Set())}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Audience Scrollable List */}
            <div className="max-h-[520px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-50">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium animate-pulse">
                  Loading customer database...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 font-medium">
                  No customer matching &quot;{searchQuery}&quot; found.
                </div>
              ) : (
                filteredCustomers.map((cust) => {
                  const isChecked = selectedEmails.has(cust.email);
                  return (
                    <div
                      key={cust.email}
                      onClick={() => handleToggleCustomer(cust.email)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-emerald-50/60 border border-emerald-200/60'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded-md border-gray-300 text-[#0f7b4f] focus:ring-[#0f7b4f] cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {cust.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                            {cust.city || 'UK'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">
                          {cust.email}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                            {cust.primarySource}
                          </span>
                          {cust.phone !== 'N/A' && (
                            <span className="text-[10px] text-slate-400">
                              📞 {cust.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Campaign Composer (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-5">
            {/* Header & Presets */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Manrope']">
                  Campaign Message Composer
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  Step 2 of 2
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Choose a ready-to-send promotional template or create your own custom announcement.
              </p>
            </div>

            {/* Template Selector Pills */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Quick Template Presets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectPreset(tpl)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      activePreset === tpl.id
                        ? 'border-[#0f7b4f] bg-emerald-50/50 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-black text-slate-900">
                      {tpl.name}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-[#0f7b4f] font-bold">
                        {tpl.badge}
                      </span>
                      {activePreset === tpl.id && (
                        <span className="text-xs text-[#0f7b4f] font-black">✓ Active</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Email Subject Line <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {subject.length} characters
                </span>
              </div>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. ⚡ Special Rate: Get Top Cash for Your Scrap Vehicle Today"
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs sm:text-sm font-bold text-slate-900 outline-none transition focus:border-[#0f7b4f] focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Message Body Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Email Message Body <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0f7b4f] bg-emerald-50 px-2 py-0.5 rounded">
                  <span>💡 Tag:</span>
                  <code>{'{name}'}</code>
                </div>
              </div>
              <textarea
                rows={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your email announcement here..."
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs sm:text-sm font-medium leading-relaxed text-slate-800 outline-none transition focus:border-[#0f7b4f] focus:ring-2 focus:ring-emerald-100 font-sans"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                You can insert <code className="font-bold text-emerald-700 bg-emerald-50 px-1 rounded">{'{name}'}</code> to automatically insert each customer&apos;s personal name.
              </p>
            </div>

            {/* Call to Action Button Options */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-3">
              <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Call-to-Action (CTA) Button Link
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Check Your Quote Now"
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#0f7b4f]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Target URL
                  </label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://myautoscrap.co.uk/scrap-my-car"
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#0f7b4f]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleGeneratePreview}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
              >
                <span>👁️</span> Live Email Preview
              </button>

              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                disabled={selectedCount === 0 || !subject.trim() || !message.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0f7b4f] px-6 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-[#075b3a] active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>🚀</span> Send Campaign ({selectedCount} Recipients)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Email Preview Modal */}
      {previewOpen && (
        <div
          onClick={() => setPreviewOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0b2e21] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✉️</span>
                <div>
                  <h3 className="text-sm font-black font-['Manrope']">
                    Campaign Live Preview
                  </h3>
                  <p className="text-[11px] text-[#c8ded4]">
                    Rendered with AutoScrap production email layout
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6">
              {previewLoading ? (
                <div className="flex h-64 items-center justify-center text-xs text-gray-500 font-bold animate-pulse">
                  Rendering email template...
                </div>
              ) : (
                <div className="mx-auto max-w-[600px] overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md">
                  <iframe
                    title="Promotional Email Preview"
                    srcDoc={previewHtml}
                    className="h-[600px] w-full border-0"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-3.5">
              <div className="text-xs text-slate-500 font-medium">
                Showing sample for customer: <strong className="text-slate-800">Jane Doe</strong>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-gray-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation & Progress Modal */}
      {confirmModalOpen && (
        <div
          onClick={() => !sending && setConfirmModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl cursor-default"
          >
            {sendResult ? (
              // Completion View
              <div className="text-center space-y-4">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-3xl text-[#0f7b4f]">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-['Manrope']">
                    Campaign Dispatched!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your promotional email has been processed and delivered.
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Total Recipients:</span>
                    <span>{sendResult.totalRecipients}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Successfully Sent:</span>
                    <span>{sendResult.successCount}</span>
                  </div>
                  {sendResult.failCount > 0 && (
                    <div className="flex justify-between font-bold text-red-600">
                      <span>Failed:</span>
                      <span>{sendResult.failCount}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSendResult(null);
                    setConfirmModalOpen(false);
                  }}
                  className="w-full rounded-xl bg-[#0f7b4f] py-2.5 text-xs font-black text-white hover:bg-[#075b3a]"
                >
                  Done
                </button>
              </div>
            ) : (
              // Confirmation View
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-2xl text-[#0f7b4f] shrink-0">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-['Manrope']">
                      Confirm Campaign Dispatch
                    </h3>
                    <p className="text-xs text-slate-500">
                      Are you sure you want to send this promotional email?
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-xs space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Subject Line:
                    </span>
                    <strong className="text-slate-900 block truncate">{subject}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Target Audience:
                    </span>
                    <strong className="text-[#0f7b4f]">
                      {selectedCount} unique customers selected
                    </strong>
                  </div>
                </div>

                {/* <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg leading-relaxed">
                  ⚠️ Note: Emails will be dispatched directly to real customer inboxes using your configured SMTP mail server.
                </p> */}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => setConfirmModalOpen(false)}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={sending}
                    onClick={handleSendCampaign}
                    className="flex items-center gap-2 rounded-xl bg-[#0f7b4f] px-5 py-2.5 text-xs font-black text-white hover:bg-[#075b3a] disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      `Send to ${selectedCount} Customers`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
