import { useState } from 'react';
import { selectWinnerDealer } from '../../services/adminStore';
import { showToast } from './ToastContainer';
import { getImageUrl } from '../../config/api';

export default function HighValueEnquiryDetailModal({ enquiry, onClose, onWinnerSelected }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const [selectingWinnerId, setSelectingWinnerId] = useState(null);
  const [winnerError, setWinnerError] = useState('');
  const [winnerSuccess, setWinnerSuccess] = useState('');

  if (!enquiry) return null;

  const isAcceptedEstimate = enquiry.valuePreference === 'ESTIMATED_VALUE';
  const photos = Array.isArray(enquiry.photos) ? enquiry.photos : [];
  const bids = Array.isArray(enquiry.bids) ? enquiry.bids : [];

  const maxBidAmount = bids.length > 0 ? Math.max(...bids.map((b) => Number(b.amount))) : 0;
  const hasWinner = Boolean(enquiry.winningDealerId || enquiry.status === 'DEALER_SELECTED');

  const handleSelectWinner = async (bidId) => {
    setWinnerError('');
    setWinnerSuccess('');
    try {
      setSelectingWinnerId(bidId);
      const res = await selectWinnerDealer(enquiry.id, bidId);
      const msg = res.message || 'Winning dealer selected successfully.';
      setWinnerSuccess(msg);
      showToast(msg, 'success');

      if (onWinnerSelected) {
        onWinnerSelected();
      }
    } catch (err) {
      const errMsg = err.message || 'Failed to select winning dealer.';
      setWinnerError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSelectingWinnerId(null);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-slate-900 font-['DM_Sans',sans-serif] cursor-default"
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-amber-300 bg-[#f6cf3c] px-3.5 py-1.5 font-mono text-lg font-black text-black shadow-xs">
              {enquiry.registration}
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 font-['Manrope']">
                {enquiry.make} {enquiry.model} ({enquiry.year})
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                Ref: #{enquiry.reference} • Submitted {new Date(enquiry.createdAt).toLocaleString('en-GB')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
              {enquiry.status}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 font-bold text-slate-500 hover:bg-slate-200 transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Feedback Banners */}
        {winnerSuccess && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-100 p-4 text-xs font-extrabold text-emerald-900 flex items-center gap-2">
            <span>🤝</span> {winnerSuccess}
          </div>
        )}
        {winnerError && (
          <div className="rounded-2xl border border-red-300 bg-red-100 p-4 text-xs font-extrabold text-red-900 flex items-center gap-2">
            <span>⚠️</span> {winnerError}
          </div>
        )}

        {/* Valuation Section (Three Distinct Values Displayed Side-by-Side) */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <span>💰</span> Valuation Comparison Breakdown (3 Key Metrics)
            </h3>
            {isAcceptedEstimate ? (
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-extrabold text-emerald-800">
                ✓ Accepted System Estimate
              </span>
            ) : (
              <span className="rounded-full bg-amber-200 border border-amber-400 px-3 py-0.5 text-xs font-extrabold text-amber-950">
                ✍️ Customer Entered Own Expected Value
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-2xs">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                System Estimate
              </span>
              <div className="text-2xl font-black text-[#0f7b4f]">
                £{Number(enquiry.estimatedValue || 0).toLocaleString('en-GB')}
              </div>
              <p className="mt-1 text-[10px] text-slate-500">MyAutoScrap rule calculation</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-2xs">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Customer Expectation
              </span>
              <div className="text-2xl font-black text-amber-900">
                £{Number(enquiry.customerExpectedValue || 0).toLocaleString('en-GB')}
              </div>
              <p className="mt-1 text-[10px] text-slate-500">Customer asking price</p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-2xs">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {hasWinner ? 'Winning Offer' : 'Highest Dealer Bid'}
              </span>
              <div className="text-2xl font-black text-blue-900">
                £{Number(enquiry.highestBid || 0).toLocaleString('en-GB')}
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                {hasWinner ? 'Selected offer price' : 'Current top auction bid'}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Photos Gallery */}
        {photos.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-slate-50/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>📸</span> Vehicle Photos ({photos.length} uploaded)
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">Click any photo to enlarge</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {photos.map((photo, idx) => {
                const rawUrl = typeof photo === 'string' ? photo : (photo.previewUrl || photo.url);
                const imgUrl = getImageUrl(rawUrl);
                return (
                  <div
                    key={idx}
                    onClick={() => setActivePhoto(imgUrl)}
                    className="group relative h-24 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200 cursor-pointer shadow-xs hover:shadow-md transition"
                  >
                    <img
                      src={imgUrl}
                      alt={`Vehicle photo ${idx + 1}`}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                      🔍 Enlarge
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Details */}
          <div className="rounded-2xl border border-gray-200 bg-slate-50/60 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-gray-200 pb-2">
              🚗 Vehicle & Location Specifications
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-500 block">Registration</span><strong className="font-mono text-slate-900 text-sm">{enquiry.registration}</strong></div>
              <div><span className="text-slate-500 block">Make & Model</span><strong className="text-slate-900">{enquiry.make} {enquiry.model}</strong></div>
              <div><span className="text-slate-500 block">Year</span><strong className="text-slate-900">{enquiry.year}</strong></div>
              <div><span className="text-slate-500 block">Mileage</span><strong className="text-slate-900">{enquiry.mileage ? `${Number(enquiry.mileage).toLocaleString('en-GB')} miles` : 'N/A'}</strong></div>
              <div><span className="text-slate-500 block">Condition</span><strong className="text-slate-900">{enquiry.condition || 'Good'}</strong></div>
              <div><span className="text-slate-500 block">Location</span><strong className="text-slate-900">{enquiry.postcode} ({enquiry.city || enquiry.area || 'UK'})</strong></div>
            </div>
          </div>

          {/* Customer Contact & Bank Details */}
          <div className="rounded-2xl border border-gray-200 bg-slate-50/60 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-gray-200 pb-2">
              👤 Authorised Customer & Payment Information
            </h3>

            <div className="space-y-2.5 text-xs">
              <div><span className="text-slate-500 block">Full Name</span><strong className="text-slate-900 text-sm">{enquiry.customerName || enquiry.customer?.fullName || 'N/A'}</strong></div>
              <div><span className="text-slate-500 block">Phone</span><a href={`tel:${enquiry.customerPhone || enquiry.customer?.phone}`} className="font-bold text-[#0f7b4f] hover:underline">📞 {enquiry.customerPhone || enquiry.customer?.phone || 'N/A'}</a></div>
              <div><span className="text-slate-500 block">Email</span><a href={`mailto:${enquiry.customerEmail || enquiry.customer?.email}`} className="font-bold text-[#0f7b4f] hover:underline">✉️ {enquiry.customerEmail || enquiry.customer?.email || 'N/A'}</a></div>
              
              <div className="pt-2 border-t border-gray-200/80 space-y-1.5">
                <div>
                  <span className="text-slate-500 block font-semibold">📍 Collection Address:</span>
                  <strong className="text-slate-900 break-words block">
                    {enquiry.customer?.collectionAddress || enquiry.address || enquiry.postcode}
                  </strong>
                </div>
                {(enquiry.customer?.additionalAddressDetails || enquiry.additionalAddressDetails) && (
                  <div>
                    <span className="text-emerald-800 font-semibold block text-[11px]">🏠 Flat / House / Additional Address Details:</span>
                    <strong className="text-emerald-900 break-words block">
                      {enquiry.customer?.additionalAddressDetails || enquiry.additionalAddressDetails}
                    </strong>
                  </div>
                )}
              </div>

              {enquiry.bank && (enquiry.bank.accountNumber || enquiry.bank.sortCode) ? (
                <div className="pt-2 border-t border-gray-200/80 space-y-1">
                  <span className="text-amber-800 font-extrabold block text-[11px]">🏦 Customer Bank Payout Details:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-800">
                    <div><span className="text-slate-400 block text-[10px]">Account Name</span><strong>{enquiry.bank.accountName || 'N/A'}</strong></div>
                    <div><span className="text-slate-400 block text-[10px]">Sort Code</span><strong>{enquiry.bank.sortCode || 'N/A'}</strong></div>
                    <div><span className="text-slate-400 block text-[10px]">Account Number</span><strong>{enquiry.bank.accountNumber || 'N/A'}</strong></div>
                    <div><span className="text-slate-400 block text-[10px]">Bank Name</span><strong>{enquiry.bank.bankName || 'N/A'}</strong></div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Dealer Bidding & Bids History Section with SELECT WINNING DEALER */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              ⚡ Dealer Bids Review & Winner Selection
            </h3>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span>Total Bids: <strong className="text-slate-900">{enquiry.bidCount || bids.length}</strong></span>
              <span>Highest Bid: <strong className="text-[#0f7b4f]">£{Number(enquiry.highestBid || 0).toLocaleString('en-GB')}</strong></span>
            </div>
          </div>

          {/* Individual Dealer Bids Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2">Submitted Dealer Bids (Admins can evaluate & select best dealer)</h4>
            {bids.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400 font-medium">
                No dealer bids submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Dealer Identity</th>
                      <th className="py-2.5 px-3">City / Territory</th>
                      <th className="py-2.5 px-3">Bid Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {bids.map((bid) => {
                      const amount = Number(bid.amount);
                      const isHighest = amount === maxBidAmount && maxBidAmount > 0;
                      const isWinner = bid.status === 'WINNING' || Number(enquiry.winningBidId) === Number(bid.id);

                      return (
                        <tr key={bid.id} className={`hover:bg-slate-50/50 ${isHighest ? 'bg-amber-50/40' : ''}`}>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2 max-sm:gap-0.5">
                              <strong className="block text-slate-900">{bid.dealerName}</strong>
                              {isHighest && (
                                <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[9px] font-black text-amber-900">
                                  ⭐
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">{bid.dealerEmail}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{bid.dealerCity || 'UK'}</td>
                          <td className="py-2.5 px-3 font-black text-sm text-[#0f7b4f]">
                            £{amount.toLocaleString('en-GB')}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isWinner
                                ? 'bg-emerald-100 text-emerald-800'
                                : bid.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isWinner ? 'WINNER' : bid.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            {isWinner ? (
                              <span className="text-xs font-black text-emerald-700">✓ WINNING DEALER</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectWinner(bid.id)}
                                disabled={selectingWinnerId === bid.id || hasWinner}
                                className="rounded-lg bg-[#0f7b4f] px-2.5 py-1 text-[10px] sm:text-xs font-bold text-white hover:bg-[#075b3a] transition cursor-pointer disabled:opacity-50 tracking-tight"
                              >
                                {selectingWinnerId === bid.id ? (
                                  'Selecting…'
                                ) : (
                                  <>
                                    <span className="inline sm:hidden">Select Winner</span>
                                    <span className="hidden sm:inline">Select Winning Dealer</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Close Detail View
          </button>
        </div>
      </div>

      {/* Expanded Photo Lightbox */}
      {activePhoto && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setActivePhoto(null);
          }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center justify-center"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhoto(null);
              }}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white hover:bg-white/40 transition cursor-pointer"
              title="Close Photo"
            >
              ✕
            </button>
            <img
              src={activePhoto}
              alt="Expanded vehicle"
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
