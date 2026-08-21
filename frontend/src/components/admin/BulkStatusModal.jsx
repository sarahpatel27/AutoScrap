import { useState } from 'react';
import { STATUS_OPTIONS } from '../../utils/cityHelper';

export default function BulkStatusModal({ isOpen, onClose, selectedCount, onConfirm }) {
  const [selectedStatus, setSelectedStatus] = useState('Contacted');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(selectedStatus);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl space-y-5 cursor-default"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-[#0f7b4f] text-lg font-black">
              🔄
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 font-['Manrope']">
                Bulk Status Update
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Updating status for {selectedCount} selected {selectedCount === 1 ? 'record' : 'records'}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Select New Target Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = selectedStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedStatus(opt.value)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-extrabold transition cursor-pointer ${
                      isSelected
                        ? 'border-[#0f7b4f] bg-emerald-50 text-[#0f7b4f] ring-2 ring-[#0f7b4f]/20'
                        : 'border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#0f7b4f] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#075b3a] transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Updating...' : `Update ${selectedCount} Records`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
