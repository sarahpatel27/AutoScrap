import { useState } from 'react';

export default function EnquiryDetailModal({ enquiry, onClose, onUpdateStatus, onDelete }) {
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.customer?.notes || '');
  const [saving, setSaving] = useState(false);

  if (!enquiry) return null;

  const handleSave = async () => {
    setSaving(true);
    await onUpdateStatus(enquiry.id, status, notes);
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete enquiry ${enquiry.reference}?`)) {
      await onDelete(enquiry.id);
      onClose();
    }
  };

  const getStatusBadgeClass = (s) => {
    switch (s) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#0b2e21] px-6 py-5 text-white">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-black text-[#dff46b]">{enquiry.reference}</span>
              <span className={`rounded-full border px-3 py-0.5 text-xs font-black ${getStatusBadgeClass(status)}`}>
                {status}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#c8ded4]">
              Submitted on {new Date(enquiry.date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
          {/* Top Row: Vehicle Reg Card & Customer Info */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Vehicle Card */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Vehicle Info</span>
              <div className="mt-3 flex items-center gap-3">
                <div className="inline-flex items-center overflow-hidden rounded-md border border-amber-300 bg-[#f6cf3c] font-mono text-base font-black text-black shadow-xs">
                  <span className="bg-[#003399] px-2 py-1.5 text-[10px] font-bold text-white flex flex-col items-center leading-none select-none">
                    <span className="text-yellow-300 text-[8px]">★</span>
                    UK
                  </span>
                  <span className="px-3 py-1.5 tracking-[0.14em]">
                    {enquiry.vehicle?.registration}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {enquiry.vehicle?.make} {enquiry.vehicle?.model}
                  </h4>
                  <p className="text-xs text-gray-500">Year {enquiry.vehicle?.year} · {enquiry.vehicle?.fuelType} · {enquiry.vehicle?.engineSize}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-gray-200 pt-3">
                <div><span className="text-gray-500">Weight:</span> <strong className="text-gray-900">{enquiry.vehicle?.weightKg || 'N/A'} kg</strong></div>
                <div><span className="text-gray-500">Postcode:</span> <strong className="text-gray-900">{enquiry.postcode || 'N/A'}</strong></div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Customer Details</span>
              <h4 className="mt-2 text-lg font-extrabold text-slate-900">{enquiry.customer?.fullName}</h4>
              <div className="mt-2 space-y-1.5 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <span>📞 Phone:</span>
                  <a href={`tel:${enquiry.customer?.phone}`} className="font-bold text-[#0f7b4f] hover:underline">
                    {enquiry.customer?.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span>✉️ Email:</span>
                  <a href={`mailto:${enquiry.customer?.email}`} className="font-bold text-[#0f7b4f] hover:underline">
                    {enquiry.customer?.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span>💬 Preferred Contact:</span>
                  <span className="font-bold capitalize">{enquiry.customer?.preferredContact || 'phone'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Valuation Summary */}
          <div className="rounded-2xl border border-[#c9e8d8] bg-[#edf7f2] p-5 text-emerald-950">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0f7b4f]">Calculated Scrap Value</span>
                <div className="text-3xl font-black text-[#0b2e21]">£{enquiry.quote?.finalValue}</div>
              </div>
              <div className="text-right text-xs text-emerald-800">
                <div>Base Rate: £{enquiry.quote?.pricePerTonne || 235}/tonne</div>
                <div>Base Value: £{enquiry.quote?.baseValue}</div>
              </div>
            </div>
          </div>

          {/* Admin Status & Notes Editor */}
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Update Status & Admin Notes</h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Enquiry Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-bold outline-none focus:border-[#0f7b4f]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Collected">Collected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Admin Notes / Remarks</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about collection schedule, agreed pricing, driver updates..."
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs outline-none focus:border-[#0f7b4f]"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
          >
            🗑️ Delete Enquiry
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl border border-0 bg-[#0f7b4f] px-5 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#075b3a]"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
