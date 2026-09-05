import { useState } from 'react';

/**
 * Returns { start: Date|null, end: Date|null } for a given preset or custom dates.
 * Normalizes start to 00:00:00.000 and end to 23:59:59.999 in local time.
 */
export function getDateRangeBoundaries(preset, customStart, customEnd) {
  const now = new Date();

  if (preset === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
  }

  if (preset === 'yesterday') {
    const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const start = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate(), 0, 0, 0, 0);
    const end = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate(), 23, 59, 59, 999);
    return { start, end };
  }

  if (preset === 'last7') {
    const sevenAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const start = new Date(sevenAgo.getFullYear(), sevenAgo.getMonth(), sevenAgo.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
  }

  if (preset === 'thisMonth') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start, end };
  }

  if (preset === 'custom') {
    let start = null;
    let end = null;
    if (customStart) {
      const parts = customStart.split('-').map(Number);
      if (parts.length === 3) {
        start = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
      }
    }
    if (customEnd) {
      const parts = customEnd.split('-').map(Number);
      if (parts.length === 3) {
        end = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
      }
    }
    return { start, end };
  }

  return { start: null, end: null };
}

/**
 * Filter an array of items based on date preset and custom start/end strings.
 * Resolves item timestamp from item.date or item.createdAt.
 */
export function filterByDateRange(items, preset, customStart, customEnd, customDateField = null) {
  if (!Array.isArray(items)) return [];
  if (!preset || preset === 'all') return items;

  const { start, end } = getDateRangeBoundaries(preset, customStart, customEnd);
  if (!start && !end) return items;

  return items.filter((item) => {
    if (!item) return false;
    const rawVal = customDateField ? item[customDateField] : (item.date || item.createdAt);
    if (!rawVal) return false;

    const itemTime = new Date(rawVal).getTime();
    if (isNaN(itemTime)) return false;

    if (start && itemTime < start.getTime()) return false;
    if (end && itemTime > end.getTime()) return false;

    return true;
  });
}

/**
 * Modern, responsive Date Filter Component with quick-presets and custom range pickers.
 */
export default function DateRangeFilter({
  preset = 'all',
  onPresetChange,
  customStart = '',
  onCustomStartChange,
  customEnd = '',
  onCustomEndChange,
  onReset,
  label = 'Filter by Date',
  className = '',
}) {
  const presets = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7', label: 'Last 7 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'custom', label: 'Custom Range 📅' },
  ];

  const isCustomActive = preset === 'custom';
  const hasActiveFilter = preset !== 'all' || Boolean(customStart) || Boolean(customEnd);

  const handlePresetSelect = (id) => {
    if (onPresetChange) {
      onPresetChange(id);
    }
    if (id !== 'custom') {
      if (onCustomStartChange) onCustomStartChange('');
      if (onCustomEndChange) onCustomEndChange('');
    }
  };

  const handleClear = () => {
    if (onPresetChange) onPresetChange('all');
    if (onCustomStartChange) onCustomStartChange('');
    if (onCustomEndChange) onCustomEndChange('');
    if (onReset) onReset();
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && (
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>📅</span>
            <span>{label}:</span>
          </span>
        )}

        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>✕</span>
            <span>Reset Date Filter</span>
          </button>
        )}
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {presets.map((p) => {
          const isSelected = preset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetSelect(p.id)}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Inputs (Displayed when preset is 'custom') */}
      {isCustomActive && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 px-2.5 py-1 text-gray-700">
            <span className="font-bold text-[11px] text-gray-500 uppercase">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange && onCustomStartChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-900 outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 px-2.5 py-1 text-gray-700">
            <span className="font-bold text-[11px] text-gray-500 uppercase">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange && onCustomEndChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-900 outline-none cursor-pointer"
            />
          </div>

          {(customStart || customEnd) && (
            <button
              type="button"
              onClick={() => {
                if (onCustomStartChange) onCustomStartChange('');
                if (onCustomEndChange) onCustomEndChange('');
              }}
              className="rounded-lg bg-gray-200 px-2 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-300 cursor-pointer"
            >
              Clear Range
            </button>
          )}
        </div>
      )}
    </div>
  );
}
