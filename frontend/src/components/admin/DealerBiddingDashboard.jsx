import { useState, useEffect } from 'react';
import { submitDealerBid, markEnquiryAsPurchased } from '../../services/adminStore';
import { showToast } from './ToastContainer';
import Pagination from './Pagination';
import { getImageUrl } from '../../config/api';

export function isEnquiryEnded(item) {
  if (!item) return true;

  const isClosedStatus = ['BIDDING_ENDED', 'DEALER_SELECTED', 'PURCHASED', 'CANCELLED', 'archived', 'deleted', 'ARCHIVED', 'DELETED'].includes(item.status);
  const isTimerExpired = item.timeRemaining === 'Ended' || item.timeRemaining === 'Bidding Ended' || (item.biddingEndsAt && new Date(item.biddingEndsAt) <= new Date());
  const isWinner = item.customerName && item.customerName !== '[Hidden Until Won]';
  const isLosingDealer = ['DEALER_SELECTED', 'PURCHASED'].includes(item.status) && !isWinner;

  return isClosedStatus || isTimerExpired || isLosingDealer || isWinner;
}

export default function DealerBiddingDashboard({ enquiries = [], onBidSubmitted }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Bidding state inside modal
  const [bidAmountInput, setBidAmountInput] = useState('');
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [biddingError, setBiddingError] = useState('');

  // Reset page to 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredEnquiries = enquiries.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.registration?.toLowerCase().includes(term) ||
      item.make?.toLowerCase().includes(term) ||
      item.model?.toLowerCase().includes(term) ||
      item.city?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredEnquiries.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleOpenModal = (item) => {
    setSelectedEnquiry(item);
    setBidAmountInput(item.myBid ? String(item.myBid) : String(item.customerExpectedValue || item.estimatedValue || ''));
    setBiddingError('');
  };

  const handleAcceptCustomerPrice = async (item) => {
    setBiddingError('');
    if (!item || isEnquiryEnded(item)) {
      const errMsg = 'Bidding is permanently closed for this vehicle.';
      setBiddingError(errMsg);
      showToast(errMsg, 'error');
      return;
    }

    const targetPrice = Number(item.customerExpectedValue || item.estimatedValue);

    if (!targetPrice || isNaN(targetPrice) || targetPrice <= 0) {
      const errMsg = 'Invalid customer price to accept.';
      setBiddingError(errMsg);
      showToast(errMsg, 'error');
      return;
    }

    try {
      setBiddingLoading(true);
      const res = await submitDealerBid(item.id, targetPrice);

      const successToast = res.message || `Your bid of £${targetPrice.toLocaleString('en-GB')} matching customer expected price has been submitted successfully.`;
      showToast(successToast, 'success');

      setSelectedEnquiry(null);

      if (onBidSubmitted) {
        onBidSubmitted();
      }
    } catch (err) {
      const errMsg = err.message || 'Failed to submit bid.';
      setBiddingError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setBiddingLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBiddingError('');

    if (!selectedEnquiry || isEnquiryEnded(selectedEnquiry)) {
      const errMsg = 'Bidding is permanently closed for this vehicle.';
      setBiddingError(errMsg);
      showToast(errMsg, 'error');
      return;
    }

    const num = Number(bidAmountInput);
    if (!bidAmountInput || isNaN(num) || num <= 0) {
      const errMsg = 'Please enter a valid positive GBP bid amount (greater than £0).';
      setBiddingError(errMsg);
      showToast(errMsg, 'error');
      return;
    }

    try {
      setBiddingLoading(true);
      const res = await submitDealerBid(selectedEnquiry.id, num);

      const successToast = res.message || `Your bid of £${num.toLocaleString('en-GB')} has been submitted successfully.`;
      showToast(successToast, 'success');

      setSelectedEnquiry(null);

      if (onBidSubmitted) {
        onBidSubmitted();
      }
    } catch (err) {
      const errMsg = err.message || 'Failed to submit bid.';
      setBiddingError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setBiddingLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-['DM_Sans',sans-serif]">
      {/* Territory Opportunity Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0f7b4f] text-[#dff46b] font-black text-2xl shadow-md">
              ⚡
            </div>
            <div>
              <h2 className="text-xl font-black font-['Manrope'] text-white tracking-tight">
                Dealer Territory Bidding Portal
              </h2>
              <p className="text-xs text-emerald-200 font-medium leading-relaxed mt-0.5">
                Review eligible high-value vehicle opportunities assigned to your dealer territory.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-extrabold text-white border border-white/10 shadow-xs">
            <span>Eligible Vehicles:</span>
            <span className="rounded-md bg-[#dff46b] px-2.5 py-0.5 text-[#082d1c] font-black">{enquiries.length}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reg, make, model or city..."
            className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-[#0f7b4f] focus:bg-white focus:ring-2 focus:ring-[#0f7b4f]/20 font-medium"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>
      </div>

      {/* Vehicles Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEnquiries.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-gray-300 bg-white p-8">
            <span className="text-3xl block mb-2">🚗</span>
            <h4 className="text-sm font-bold text-slate-800">No High-Value Vehicles Available</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no high-value vehicle enquiries in your assigned territory. Check back soon!
            </p>
          </div>
        ) : (
          paginatedEnquiries.map((item) => {
            const photos = Array.isArray(item.photos) ? item.photos : [];
            const hasPhotos = photos.length > 0;
            const rawPreview = hasPhotos ? (photos[0].previewUrl || photos[0].url) : null;
            const previewPhoto = getImageUrl(rawPreview);
            const expectedPrice = Number(item.customerExpectedValue || item.estimatedValue || 0);

            // Bidding Status Indicators
            const myBid = item.myBid ? Number(item.myBid) : null;
            const highestBid = Number(item.highestBid || 0);

            const isHighestBidder = myBid && myBid >= highestBid && highestBid > 0;
            const isOutbid = myBid && highestBid > myBid;

            const isWinner = item.customerName && item.customerName !== '[Hidden Until Won]';
            const isLosingDealer = ['DEALER_SELECTED', 'PURCHASED'].includes(item.status) && !isWinner;
            const isEnded = isEnquiryEnded(item);

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-[#0f7b4f]/40 space-y-4"
              >
                <div>
                  {/* Top Bar: VRM Badge & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-md border border-amber-300 bg-[#f6cf3c] px-2.5 py-1 font-mono text-xs font-black text-black shadow-2xs">
                      {item.registration}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      isWinner
                        ? 'bg-emerald-100 text-emerald-800'
                        : isLosingDealer
                        ? 'bg-purple-100 text-purple-800'
                        : isEnded
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isWinner ? '🏆 OFFER SELECTED' : isLosingDealer ? '🤝 OFFER SELECTED' : isEnded ? 'BIDDING ENDED' : (item.status || 'BIDDING')}
                    </span>
                  </div>

                  {/* Photo Thumbnail if available */}
                  {hasPhotos && previewPhoto && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 h-36 w-full">
                      <img
                        src={previewPhoto}
                        alt={`${item.make} ${item.model}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Title & Specs */}
                  <h3 className="text-base font-black text-slate-900">
                    {item.make} {item.model} <span className="text-slate-500 font-normal">({item.year})</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Mileage</span>
                      <strong className="text-slate-900">
                        {item.mileage ? `${Number(item.mileage).toLocaleString('en-GB')} mi` : 'N/A'}
                      </strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Condition</span>
                      <strong className="text-slate-900">{item.condition || 'Good'}</strong>
                    </div>
                  </div>

                  {/* Approximate Location */}
                  <div className="mt-3 text-xs text-slate-600 font-medium flex items-center gap-1.5">
                    <span>📍</span>
                    <span>Approx. Location: <strong>{item.city || item.area || 'UK'}</strong> ({item.postcode})</span>
                  </div>

                  {/* System Estimate vs Customer Expected */}
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">System estimate:</span>
                      <strong className="text-[#0f7b4f] font-black">
                        £{Number(item.estimatedValue || 0).toLocaleString('en-GB')}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200/60">
                      <span className="text-slate-600 font-bold">Customer expected:</span>
                      <strong className="text-amber-950 font-black">
                        £{expectedPrice.toLocaleString('en-GB')}
                      </strong>
                    </div>
                  </div>

                  {/* Competitive Bidding Indicators */}
                  <div className="mt-3 rounded-xl bg-slate-950 p-3 text-white space-y-2 text-[11px]">
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div>
                        <span className="block text-slate-400 text-[9px] uppercase font-bold">Highest Bid</span>
                        <strong className="text-[#dff46b] font-black">
                          £{highestBid.toLocaleString('en-GB')}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-slate-400 text-[9px] uppercase font-bold">Your Bid</span>
                        <strong className="text-white font-black">
                          {myBid ? `£${myBid.toLocaleString('en-GB')}` : 'None'}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-slate-400 text-[9px] uppercase font-bold">Total Bids</span>
                        <strong className="text-white font-black">{item.bidCount || 0}</strong>
                      </div>

                      <div>
                        <span className="block text-slate-400 text-[9px] uppercase font-bold">Timer</span>
                        <strong className="text-amber-300 font-black">{item.timeRemaining || 'Ended'}</strong>
                      </div>
                    </div>

                    {/* Losing Dealer Banner */}
                    {isLosingDealer && (
                      <div className="rounded-lg bg-blue-500/20 border border-blue-400/40 p-2 text-center text-xs font-bold text-blue-200">
                        Bidding has ended and another offer was selected.
                      </div>
                    )}

                    {/* Winner Banner */}
                    {isWinner && (
                      <div className="rounded-lg bg-emerald-500/20 border border-emerald-400/40 p-2 text-center text-xs font-black text-emerald-300">
                        🏆 Your offer was selected by the customer / admin!
                      </div>
                    )}

                    {/* Anonymous High Bidder / Outbid Indicator Banners when active */}
                    {!isLosingDealer && !isWinner && (
                      <>
                        {isHighestBidder && (
                          <div className="rounded-lg bg-emerald-500/20 border border-emerald-400/40 p-2 text-center text-xs font-black text-emerald-300 flex items-center justify-center gap-1.5">
                            <span>🏆</span> You currently have the highest bid.
                          </div>
                        )}

                        {isOutbid && (
                          <div className="rounded-lg bg-amber-500/20 border border-amber-400/40 p-2 text-center text-xs font-black text-amber-300 flex items-center justify-center gap-1.5">
                            <span>⚠️</span> Your bid has been outbid.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-2">
                  {isLosingDealer ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-100 p-3 text-center text-xs font-bold text-slate-500">
                      Bidding has ended and another offer was selected.
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAcceptCustomerPrice(item)}
                        disabled={biddingLoading || isEnded}
                        className="w-full rounded-xl bg-[#0f7b4f] py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-[#075b3a] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <span>🤝</span> ACCEPT CUSTOMER PRICE (£{expectedPrice.toLocaleString('en-GB')})
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        disabled={isEnded && !isWinner}
                        className="w-full rounded-xl border border-slate-300 bg-white py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                      >
                        {isWinner ? 'VIEW CUSTOMER DETAILS' : isEnded ? 'BIDDING ENDED' : 'PLACE DIFFERENT BID'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={filteredEnquiries.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      {/* Dealer Detail View & PLACE BID Modal */}
      {selectedEnquiry && (
        <div
          onClick={() => setSelectedEnquiry(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto cursor-default"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded-xl border border-amber-300 bg-[#f6cf3c] px-3 py-1 font-mono text-base font-black text-black">
                  {selectedEnquiry.registration}
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedEnquiry.make} {selectedEnquiry.model} ({selectedEnquiry.year})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Ref: #{selectedEnquiry.reference}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-full bg-slate-100 h-8 w-8 text-slate-500 font-bold hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* PLACE BID Form Box */}
            {isEnquiryEnded(selectedEnquiry) ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 text-center text-xs font-bold text-slate-600 space-y-1">
                <span className="text-xl block mb-1">🔒</span>
                <p className="font-extrabold text-slate-800">Bidding Closed</p>
                <p className="text-[#64748b]">Bidding period for this vehicle is permanently closed. No further bids can be submitted.</p>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-[#0f7b4f] bg-emerald-50/90 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wider text-[#0f7b4f] flex items-center gap-2">
                    <span>⚡</span> SUBMIT DEALER BID / ACCEPT OFFER
                  </h4>
                  {selectedEnquiry.myBid && (
                    <span className="rounded-full bg-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-900">
                      Your Current Bid: £{Number(selectedEnquiry.myBid).toLocaleString('en-GB')}
                    </span>
                  )}
                </div>

                {/* Quick Accept Option */}
                <div className="flex flex-wrap items-center justify-between rounded-xl bg-white p-3.5 border border-emerald-300 shadow-2xs">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Customer Expected Price</span>
                    <strong className="text-base font-black text-amber-950">
                      £{Number(selectedEnquiry.customerExpectedValue || selectedEnquiry.estimatedValue || 0).toLocaleString('en-GB')}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAcceptCustomerPrice(selectedEnquiry)}
                    disabled={biddingLoading}
                    className="rounded-xl bg-[#0f7b4f] px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-[#075b3a] cursor-pointer disabled:opacity-50"
                  >
                    ACCEPT £{Number(selectedEnquiry.customerExpectedValue || selectedEnquiry.estimatedValue || 0).toLocaleString('en-GB')}
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-emerald-200"></div></div>
                  <span className="relative bg-emerald-50 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-800">OR PLACE DIFFERENT BID</span>
                </div>

                <form onSubmit={handlePlaceBid} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Your Different Bid Amount (GBP £) *
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 font-extrabold text-slate-500">
                        £
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={bidAmountInput}
                        onChange={(e) => setBidAmountInput(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="e.g. 1325"
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-8 pr-3 font-mono font-extrabold text-slate-900 outline-none focus:border-[#0f7b4f] focus:ring-2 focus:ring-[#0f7b4f]/20 text-base"
                        required
                      />
                    </div>
                  </div>

                  {biddingError && <p className="text-xs font-bold text-red-600">{biddingError}</p>}

                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    <button
                      type="submit"
                      disabled={biddingLoading}
                      className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                    >
                      {biddingLoading ? 'Submitting Bid…' : 'PLACE DIFFERENT BID'}
                    </button>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Participates in normal competitive bidding.
                    </span>
                  </div>
                </form>
              </div>
            )}

            {/* Valuation Context Banner */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                💰 Vehicle Valuation Context
              </h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-white p-3.5 border border-emerald-200">
                  <span className="block text-xs text-slate-500 font-medium mb-1">System Estimated Value</span>
                  <strong className="text-xl font-black text-[#0f7b4f]">
                    £{Number(selectedEnquiry.estimatedValue || 0).toLocaleString('en-GB')}
                  </strong>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-amber-200">
                  <span className="block text-xs text-slate-500 font-medium mb-1">Customer Expected Price</span>
                  <strong className="text-xl font-black text-amber-950">
                    £{Number(selectedEnquiry.customerExpectedValue || selectedEnquiry.estimatedValue || 0).toLocaleString('en-GB')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Vehicle Photos Gallery */}
            {Array.isArray(selectedEnquiry.photos) && selectedEnquiry.photos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  📷 Vehicle Photos ({selectedEnquiry.photos.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedEnquiry.photos.map((photo, idx) => {
                    const rawUrl = typeof photo === 'string' ? photo : (photo.previewUrl || photo.url);
                    const imgUrl = getImageUrl(rawUrl);
                    return (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Vehicle photo ${idx + 1}`}
                        onClick={() => setActivePhoto(imgUrl)}
                        className="h-28 w-full rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-90"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Release Customer Details Banner for Winner */}
            {selectedEnquiry.customerName && selectedEnquiry.customerName !== '[Hidden Until Won]' ? (
              <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-900 p-5 text-white shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm uppercase tracking-wide">
                    <span>🏆</span> YOUR OFFER HAS BEEN SELECTED!
                  </div>
                  {selectedEnquiry.status === 'PURCHASED' ? (
                    <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-emerald-950">
                      ✅ PURCHASED & COLLECTED
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await markEnquiryAsPurchased(selectedEnquiry.id);
                          showToast('Vehicle marked as PURCHASED & completed successfully!', 'success');
                          setSelectedEnquiry(null);
                          if (onBidSubmitted) onBidSubmitted();
                        } catch (err) {
                          const errMsg = err.message || 'Failed to mark as purchased.';
                          setBiddingError(errMsg);
                          showToast(errMsg, 'error');
                        }
                      }}
                      className="rounded-xl bg-[#dff46b] px-4 py-2 text-xs font-black text-[#082d1c] shadow-md hover:bg-yellow-300 transition cursor-pointer"
                    >
                      MARK AS PURCHASED / COLLECTED
                    </button>
                  )}
                </div>

                <p className="text-xs text-emerald-100 font-medium">
                  Contact the customer to arrange purchase and collection.
                </p>

                <div className="rounded-xl bg-white/10 p-3.5 border border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-emerald-300 block font-bold text-[10px] uppercase">Customer Name</span>
                    <strong className="text-white text-sm block">{selectedEnquiry.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-300 block font-bold text-[10px] uppercase">Customer Phone</span>
                    <a href={`tel:${selectedEnquiry.customerPhone}`} className="text-[#dff46b] font-black text-sm hover:underline block">
                      📞 {selectedEnquiry.customerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-emerald-300 block font-bold text-[10px] uppercase">Customer Email</span>
                    <a href={`mailto:${selectedEnquiry.customerEmail}`} className="text-[#dff46b] font-black text-sm hover:underline block truncate">
                      ✉️ {selectedEnquiry.customerEmail}
                    </a>
                  </div>
                </div>

                {/* Collection Address & Additional Address Details */}
                <div className="rounded-xl bg-white/10 p-3.5 border border-white/20 space-y-2 text-xs">
                  <div>
                    <span className="text-emerald-300 block font-bold text-[10px] uppercase">📍 Collection Address</span>
                    <strong className="text-white text-sm block">
                      {selectedEnquiry.customer?.collectionAddress || selectedEnquiry.address || selectedEnquiry.postcode}
                    </strong>
                  </div>
                  {(selectedEnquiry.customer?.additionalAddressDetails || selectedEnquiry.additionalAddressDetails) && (
                    <div>
                      <span className="text-emerald-300 block font-bold text-[10px] uppercase">🏠 Flat / House / Additional Address Details</span>
                      <strong className="text-[#dff46b] text-sm block">
                        {selectedEnquiry.customer?.additionalAddressDetails || selectedEnquiry.additionalAddressDetails}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Customer Payment / Bank Details for Payout */}
                {selectedEnquiry.bank && (selectedEnquiry.bank.accountNumber || selectedEnquiry.bank.sortCode) ? (
                  <div className="rounded-xl bg-slate-950/80 p-3.5 border border-emerald-400/40 space-y-2">
                    <span className="text-amber-300 block font-extrabold text-[11px] uppercase tracking-wider">
                      🏦 Customer Payment / Bank Details for Payout:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Account Name</span>
                        <strong className="text-white font-mono">{selectedEnquiry.bank.accountName || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Sort Code</span>
                        <strong className="text-[#dff46b] font-mono">{selectedEnquiry.bank.sortCode || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Account Number</span>
                        <strong className="text-[#dff46b] font-mono">{selectedEnquiry.bank.accountNumber || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bank Name</span>
                        <strong className="text-white">{selectedEnquiry.bank.bankName || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Vehicle Specs & Location */}
            <div className="rounded-xl bg-slate-50 p-4 space-y-3 text-xs">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Vehicle Specifications & Location</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><span className="text-slate-500 block">Registration</span><strong className="text-slate-900 font-mono">{selectedEnquiry.registration}</strong></div>
                <div><span className="text-slate-500 block">Mileage</span><strong className="text-slate-900">{selectedEnquiry.mileage ? `${Number(selectedEnquiry.mileage).toLocaleString('en-GB')} mi` : 'N/A'}</strong></div>
                <div><span className="text-slate-500 block">Condition</span><strong className="text-slate-900">{selectedEnquiry.condition}</strong></div>
                <div><span className="text-slate-500 block">Location Area</span><strong className="text-slate-900">{selectedEnquiry.city || selectedEnquiry.area} ({selectedEnquiry.postcode})</strong></div>
              </div>

              {selectedEnquiry.customerName !== '[Hidden Until Won]' && selectedEnquiry.customer?.collectionAddress && selectedEnquiry.customer?.collectionAddress !== '[Hidden Until Won]' && (
                <div className="border-t border-slate-200 pt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block font-semibold">📍 Collection Address:</span>
                    <strong className="text-slate-900 break-words">{selectedEnquiry.customer?.collectionAddress}</strong>
                  </div>
                  {selectedEnquiry.customer?.additionalAddressDetails && selectedEnquiry.customer?.additionalAddressDetails !== '[Hidden Until Won]' && (
                    <div>
                      <span className="text-slate-500 block font-semibold">🏠 Flat / House / Extra:</span>
                      <strong className="text-emerald-800 break-words">{selectedEnquiry.customer?.additionalAddressDetails}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
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
