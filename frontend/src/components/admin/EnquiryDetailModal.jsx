import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getCityFromPostcode } from '../../utils/cityHelper';
import { showToast } from './ToastContainer';

const STATUS_OPTIONS = [
  { value: 'Pending', icon: '⏳' },
  { value: 'Contacted', icon: '📞' },
  { value: 'Accepted', icon: '🤝' },
  { value: 'Collected', icon: '🚚' },
  { value: 'Cancelled', icon: '❌' },
];

export default function EnquiryDetailModal({
  enquiry,
  onClose,
  onUpdateStatus,
  onDelete,
  readOnly = false,
}) {
  const [status, setStatus] = useState(enquiry?.status || 'Pending');
  const [notes, setNotes] = useState(enquiry?.customer?.notes || '');
  const [saving, setSaving] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);

  const statusButtonRef = useRef(null);
  const statusMenuRef = useRef(null);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (!enquiry) return;

    setStatus(enquiry.status || 'Pending');
    setNotes(enquiry.customer?.notes || '');
    setStatusOpen(false);
    setDropdownPosition(null);
  }, [enquiry]);

  useEffect(() => {
    if (!statusOpen) return;

    const handleOutsideClick = (event) => {
      const buttonClicked =
        statusButtonRef.current?.contains(event.target);

      const menuClicked =
        statusMenuRef.current?.contains(event.target);

      if (!buttonClicked && !menuClicked) {
        setStatusOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setStatusOpen(false);
        statusButtonRef.current?.focus();
      }
    };

    const handleResize = () => {
      setStatusOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [statusOpen]);

  if (!enquiry) return null;

  const itemCity =
    enquiry.city ||
    getCityFromPostcode(
      enquiry.postcode || enquiry.customer?.collectionPostcode,
      enquiry.customer?.collectionAddress
    );

  const hasBankDetails =
    enquiry.bank?.accountNumber || enquiry.bank?.sortCode;

  const selectedStatus =
    STATUS_OPTIONS.find((item) => item.value === status) ||
    STATUS_OPTIONS[0];

  const openStatusDropdown = () => {
    if (statusOpen) {
      setStatusOpen(false);
      return;
    }

    const button = statusButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const menuHeight = 230;
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom;

    const openAbove =
      spaceBelow < menuHeight &&
      rect.top > menuHeight;

    setDropdownPosition({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      top: openAbove
        ? Math.max(8, rect.top - menuHeight - gap)
        : rect.bottom + gap,
      zIndex: 9999,
    });

    setStatusOpen(true);
  };

  const selectStatus = (value) => {
    setStatus(value);
    setStatusOpen(false);

    requestAnimationFrame(() => {
      statusButtonRef.current?.focus();
    });
  };

  const handleScroll = () => {
    if (statusOpen) {
      setStatusOpen(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdateStatus(enquiry.id, status, notes);
      showToast(`Enquiry #${enquiry.reference} status updated to "${status}"!`, 'success');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    onDelete(enquiry.id);
    onClose();
  };

  const getStatusBadgeClass = (value) => {
    switch (value) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Contacted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Collected':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-md sm:items-center sm:p-4">
        <div className="relative flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/20 bg-white shadow-2xl sm:h-auto sm:max-h-[85vh] sm:rounded-3xl">

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0b2e21] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0f7b4f] text-lg text-[#dff46b]">
                🚗
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-[#dff46b]">
                    {enquiry.reference}
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getStatusBadgeClass(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                <p className="text-[11px] font-medium text-[#c8ded4]">
                  Received{' '}
                  {new Date(enquiry.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-90"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-slate-50/50 p-4 sm:p-6"
          >
            {/* Quote */}
            <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-[#edf7f2] to-[#e4f3eb] p-4 shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0f7b4f]">
                    Calculated Scrap Valuation
                  </span>

                  <div className="text-3xl font-black tracking-tight text-[#0b2e21]">
                    £{enquiry.quote?.finalValue || 0}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex rounded-lg border border-amber-400 bg-[#f8ce3d] px-3 py-1 font-mono text-xs font-black uppercase text-slate-950">
                    {enquiry.vehicle?.registration}
                  </span>

                  <div className="mt-1 text-[10px] font-extrabold text-gray-500">
                    📍 {itemCity} ({enquiry.postcode || 'UK'})
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle + Customer */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl border border-gray-200/80 bg-white p-4">
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    Vehicle Specs
                  </span>

                  <span className="text-right text-xs font-black text-slate-900">
                    {enquiry.vehicle?.make} {enquiry.vehicle?.model}
                  </span>
                </div>

                <div className="space-y-1 text-xs font-medium text-gray-600">
                  <div className="flex justify-between gap-3">
                    <span>Year:</span>
                    <strong className="text-slate-900">
                      {enquiry.vehicle?.year || 'N/A'}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Fuel / Engine:</span>
                    <strong className="text-right text-slate-900">
                      {enquiry.vehicle?.fuelType || 'N/A'} ·{' '}
                      {enquiry.vehicle?.engineSize || 'N/A'}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Kerb Weight:</span>
                    <strong className="text-[#0f7b4f]">
                      {enquiry.vehicle?.weightKg || 'N/A'} kg
                    </strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-gray-200/80 bg-white p-4">
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    Customer Details
                  </span>

                  <span className="max-w-[170px] truncate text-xs font-black text-slate-900">
                    {enquiry.customer?.fullName}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between gap-2">
                    <span>Phone:</span>

                    <a
                      href={`tel:${enquiry.customer?.phone}`}
                      className="font-extrabold text-[#0f7b4f] hover:underline"
                    >
                      📞 {enquiry.customer?.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span>Email:</span>

                    <a
                      href={`mailto:${enquiry.customer?.email}`}
                      className="max-w-[170px] truncate font-extrabold text-[#0f7b4f] hover:underline"
                    >
                      ✉️ {enquiry.customer?.email}
                    </a>
                  </div>

                  <div className="border-t border-gray-100 pt-1 text-[11px] font-medium text-gray-500">
                    📍{' '}
                    {enquiry.customer?.collectionAddress ||
                      enquiry.postcode}
                  </div>
                </div>
              </div>
            </div>

            {/* Bank */}
            <div className="space-y-2 rounded-2xl border border-gray-200/80 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Bank Payout Info
                </span>

                {hasBankDetails ? (
                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-[#0f7b4f]">
                    💳 Bank Transfer
                  </span>
                ) : (
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-800">
                    💵 Pay on Collection
                  </span>
                )}
              </div>

              {hasBankDetails ? (
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-2">
                    <span className="block text-[10px] font-bold text-gray-400">
                      Holder
                    </span>
                    <span className="block truncate font-black text-slate-900">
                      {enquiry.bank?.accountName || 'N/A'}
                    </span>
                  </div>

                  <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-2">
                    <span className="block text-[10px] font-bold text-gray-400">
                      Sort Code
                    </span>
                    <span className="block truncate font-mono font-black text-slate-900">
                      {enquiry.bank?.sortCode || 'N/A'}
                    </span>
                  </div>

                  <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-2">
                    <span className="block text-[10px] font-bold text-gray-400">
                      Account No
                    </span>
                    <span className="block truncate font-mono font-black text-slate-900">
                      {enquiry.bank?.accountNumber || 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs italic text-gray-500">
                  No bank info provided. Driver to settle payment during
                  collection.
                </p>
              )}
            </div>

            {/* Status + Notes */}
            <div className="space-y-3 rounded-2xl border border-gray-200/80 bg-white p-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Update Status & Driver Notes
              </span>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-700">
                    Set Status
                  </label>

                  <button
                    ref={statusButtonRef}
                    type="button"
                    disabled={readOnly}
                    onClick={openStatusDropdown}
                    className={`flex w-full items-center justify-between rounded-xl border bg-gray-50 px-3.5 py-2.5 text-xs font-extrabold text-slate-800 transition outline-none ${
                      readOnly
                        ? 'opacity-80 cursor-not-allowed bg-gray-100'
                        : statusOpen
                        ? 'border-[#0f7b4f] bg-white ring-2 ring-[#0f7b4f]/10 cursor-pointer'
                        : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">
                        {selectedStatus.icon}
                      </span>
                      {selectedStatus.value}
                    </span>

                    {!readOnly && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`h-4 w-4 text-gray-500 transition-transform ${
                          statusOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 7.5 10 12.5 15 7.5"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-700">
                    Internal Remarks
                  </label>

                  <textarea
                    rows="2"
                    value={notes}
                    disabled={readOnly}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={readOnly ? 'No internal remarks recorded.' : 'Notes on collection time, driver details, price agreement...'}
                    className={`w-full resize-none rounded-xl border border-gray-300 p-2.5 text-xs font-medium outline-none transition ${
                      readOnly ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-gray-50 focus:border-[#0f7b4f] focus:bg-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white p-4">
            {readOnly ? (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <span>🔒</span> Read-Only Archived Record
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-extrabold text-red-700 transition hover:bg-red-100 active:scale-95"
              >
                🗑️ Delete
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-200 active:scale-95"
              >
                {readOnly ? 'Close' : 'Cancel'}
              </button>

              {!readOnly && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="cursor-pointer rounded-xl bg-[#0f7b4f] px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-[#075b3a] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Status'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Dropdown */}
      {statusOpen &&
        dropdownPosition &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={statusMenuRef}
            role="listbox"
            style={dropdownPosition}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.20)]"
          >
            {STATUS_OPTIONS.map((option) => {
              const active = status === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => selectStatus(option.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-bold transition ${
                    active
                      ? 'bg-[#edf7f2] text-[#0b2e21]'
                      : 'text-slate-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base leading-none">
                      {option.icon}
                    </span>
                    {option.value}
                  </span>

                  {active && (
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="h-4 w-4 text-[#0f7b4f]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4 10 4 4 8-8"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}