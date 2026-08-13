import { useState } from 'react';

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  count = 1,
  title,
  subtitle = 'Delete Confirmation',
  warningText,
  onConfirm,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const defaultTitle = count > 1 ? `Delete ${count} Records?` : 'Delete Enquiry Record?';
  const defaultWarning =
    count > 1
      ? `${count} selected records will be removed from your active operations list and safely moved to Past Enquiries as archived history.`
      : 'This record will be removed from active operations and safely stored under Past Enquiries for record-keeping.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-600 text-xl shrink-0">
            🗑️
          </span>
          <div>
            <h3 className="text-base font-black text-slate-900 font-['Manrope']">
              {title || defaultTitle}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs font-semibold text-amber-900 leading-relaxed">
          <span className="font-extrabold uppercase text-amber-950 block mb-1">⚠️ Warning:</span>
          {warningText || defaultWarning}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
