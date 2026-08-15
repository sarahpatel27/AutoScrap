import { useState, useEffect } from 'react';
import EnquiryDetailModal from './EnquiryDetailModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import BulkStatusModal from './BulkStatusModal';
import { showToast } from './ToastContainer';
import { TARGET_CITIES, getCityFromPostcode } from '../../utils/cityHelper';
import { useAuth } from '../../context/AuthContext';
import { exportEnquiriesToExcel } from '../../utils/excelExporter';

export default function EnquiriesTable({ enquiries, onUpdateStatus, onUpdateBulkStatus, onDelete, onDeleteBulk, readOnly = false }) {
  const { user } = useAuth();
  const isDealer = !!user?.assignedCity;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState(user?.assignedCity || 'All');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('Contacted');
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Modal controls
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null); // single delete ID or null for bulk

  useEffect(() => {
    if (user?.assignedCity) {
      setCityFilter(user.assignedCity);
    }
  }, [user]);

  const statuses = ['All', 'Pending', 'Contacted', 'Accepted', 'Collected', 'Cancelled'];
  const cities = ['All', ...TARGET_CITIES];

  const baseEnquiries = enquiries.filter((e) => {
    const itemCity = e.city || getCityFromPostcode(e.postcode || e.customer?.collectionPostcode, e.customer?.collectionAddress);

    // Dealer scope constraint
    if (isDealer && itemCity !== user.assignedCity) {
      return false;
    }

    const matchesCity = cityFilter === 'All' || itemCity === cityFilter;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesCity;

    const matchesSearch =
      (e.reference && e.reference.toLowerCase().includes(term)) ||
      (e.vehicle?.registration && e.vehicle.registration.toLowerCase().includes(term)) ||
      (e.customer?.fullName && e.customer.fullName.toLowerCase().includes(term)) ||
      (e.customer?.phone && e.customer.phone.toLowerCase().includes(term)) ||
      (e.customer?.email && e.customer.email.toLowerCase().includes(term)) ||
      (e.postcode && e.postcode.toLowerCase().includes(term)) ||
      itemCity.toLowerCase().includes(term);

    return matchesCity && matchesSearch;
  });

  const filteredEnquiries = baseEnquiries.filter((e) => {
    return statusFilter === 'All' || e.status === statusFilter;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEnquiries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEnquiries.map((item) => String(item.id)));
    }
  };

  const toggleSelectId = (id) => {
    const stringId = String(id);
    setSelectedIds((prev) =>
      prev.includes(stringId) ? prev.filter((i) => i !== stringId) : [...prev, stringId],
    );
  };

  const handleConfirmBulkStatus = async (statusToApply) => {
    if (selectedIds.length === 0) return;
    setBulkUpdating(true);
    if (onUpdateBulkStatus) {
      await onUpdateBulkStatus(selectedIds, statusToApply);
    } else {
      for (const id of selectedIds) {
        await onUpdateStatus(id, statusToApply);
      }
    }
    showToast(`Updated status to "${statusToApply}" for ${selectedIds.length} records!`, 'success');
    setSelectedIds([]);
    setBulkUpdating(false);
  };

  const openSingleDeleteModal = (id) => {
    setTargetDeleteId(id);
    setDeleteModalOpen(true);
  };

  const openBulkDeleteModal = () => {
    setTargetDeleteId(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setBulkDeleting(true);
    if (targetDeleteId) {
      // Single delete
      await onDelete(targetDeleteId);
      showToast(`Enquiry deleted & archived to Past Enquiries!`, 'success');
    } else {
      // Bulk delete
      const count = selectedIds.length;
      if (onDeleteBulk) {
        await onDeleteBulk(selectedIds);
      } else {
        for (const id of selectedIds) {
          await onDelete(id);
        }
      }
      showToast(`${count} enquiries deleted & archived to Past Enquiries!`, 'success');
      setSelectedIds([]);
    }
    setBulkDeleting(false);
  };

  const handleExportData = () => {
    try {
      let recordsToExport = [];
      if (selectedIds.length > 0) {
        const idSet = new Set(selectedIds.map(String));
        recordsToExport = filteredEnquiries.filter((item) => idSet.has(String(item.id)));
      } else {
        recordsToExport = filteredEnquiries;
      }

      if (recordsToExport.length === 0) {
        showToast('No records available to export.', 'error');
        return;
      }

      exportEnquiriesToExcel(recordsToExport, 'Vehicle_Enquiries');
      showToast(`Exported ${recordsToExport.length} ${recordsToExport.length === 1 ? 'record' : 'records'} to Excel!`, 'success');
    } catch (err) {
      showToast(err.message || 'Export failed.', 'error');
    }
  };

  const handleBulkExport = () => {
    try {
      const idSet = new Set(selectedIds.map(String));
      const recordsToExport = filteredEnquiries.filter((item) => idSet.has(String(item.id)));

      if (recordsToExport.length === 0) {
        showToast('No selected records available to export.', 'error');
        return;
      }

      exportEnquiriesToExcel(recordsToExport, `Selected_${recordsToExport.length}_Vehicle_Enquiries`);
      showToast(`Exported ${recordsToExport.length} selected ${recordsToExport.length === 1 ? 'record' : 'records'} to Excel!`, 'success');
    } catch (err) {
      showToast(err.message || 'Export failed.', 'error');
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
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

  const getCityBadgeClass = (city) => {
    switch (city) {
      case 'Doncaster':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Leicester':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'Peterborough':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'London':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Cambridge':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Liverpool':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Manchester':
        return 'bg-violet-50 text-violet-800 border-violet-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden relative">
      {/* Bulk Action Sticky Floating Toolbar */}
      {!readOnly && selectedIds.length > 0 && (
        <div className="bg-[#0b2e21] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top duration-200 border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-[#0f7b4f] px-2.5 py-1 text-xs font-black text-white">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs font-medium text-[#c8ded4]">
              Simultaneous Batch Actions
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkStatusModalOpen(true)}
              disabled={bulkUpdating || bulkDeleting}
              className="rounded-xl bg-[#0f7b4f] px-3.5 py-1.5 text-xs font-black text-white hover:bg-emerald-600 transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              🔄 Batch Update Status ({selectedIds.length})
            </button>

            <button
              type="button"
              onClick={handleBulkExport}
              disabled={bulkUpdating || bulkDeleting}
              className="rounded-xl bg-emerald-700/90 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-black text-white hover:bg-emerald-800 transition cursor-pointer active:scale-95 disabled:opacity-50"
              title="Export selected records to Excel"
            >
              📊 Export ({selectedIds.length})
            </button>

            <button
              type="button"
              onClick={openBulkDeleteModal}
              disabled={bulkUpdating || bulkDeleting}
              className="rounded-xl bg-red-600/90 border border-red-500/30 px-3.5 py-1.5 text-xs font-black text-white hover:bg-red-700 transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              🗑️ Delete Selected ({selectedIds.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-[#c8ded4] hover:text-white px-2 py-1 cursor-pointer font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col gap-3 sm:gap-4 border-b border-gray-200 p-3.5 sm:p-5">
        {/* City Filter Bar / Dealer Notice */}
        {isDealer ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl sm:rounded-2xl border border-amber-300 bg-amber-50 p-3 sm:px-4 sm:py-3 text-amber-900">
            <div className="flex items-start gap-2">
              <span className="text-lg sm:text-xl shrink-0 mt-0.5">📍</span>
              <div>
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-950">
                  {user.assignedCity} Dealer View
                </span>
                <p className="text-xs text-amber-800 font-medium leading-tight">
                  Showing customer scrap enquiries strictly assigned to the <strong>{user.assignedCity}</strong> territory.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center rounded-xl bg-amber-400 px-2.5 py-0.5 text-xs font-black text-slate-950 uppercase shrink-0">
              {filteredEnquiries.length} Enquiries
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              📍 Filter by City Location:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {cities.map((city) => {
                const count =
                  city === 'All'
                    ? enquiries.length
                    : enquiries.filter(
                        (item) =>
                          (item.city || getCityFromPostcode(item.postcode || item.customer?.collectionPostcode, item.customer?.collectionAddress)) === city,
                      ).length;

                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setCityFilter(city)}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
                      cityFilter === city
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{city === 'All' ? 'All Cities' : city}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        cityFilter === city ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Tabs & Search */}
        <div className={`flex flex-col gap-3 pt-2 border-t border-gray-100 lg:flex-row lg:items-center ${readOnly ? 'lg:justify-end' : 'lg:justify-between'}`}>
          {/* Status Filter Tabs (Only shown when readOnly is false) */}
          {!readOnly && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {statuses.map((s) => {
                const count =
                  s === 'All'
                    ? baseEnquiries.length
                    : baseEnquiries.filter((item) => item.status === s).length;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 py-1.5 text-xs font-extrabold transition cursor-pointer whitespace-nowrap shrink-0 ${
                      statusFilter === s
                        ? 'bg-[#0f7b4f] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{s}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        statusFilter === s ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Search Input & Always Visible Export Data Button */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-72">
              <span className="absolute left-3.5 top-2.5 text-sm text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search reg, ref, postcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2 pl-9 pr-8 text-xs outline-none focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)] font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportData}
              className="rounded-xl border border-emerald-600/30 bg-[#0f7b4f] px-3.5 py-2 text-xs font-black text-white hover:bg-[#075b3a] transition shadow-xs cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 active:scale-95"
              title={selectedIds.length > 0 ? `Export ${selectedIds.length} selected records to Excel` : 'Export all enquiry records to Excel'}
            >
              <span>📊</span>
              <span>
                {selectedIds.length > 0 ? `Export Data (${selectedIds.length})` : 'Export Data'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE CARD VIEW (Distinct Standalone Individual Card Widgets with Selection) */}
      <div className="block md:hidden p-3 space-y-3.5 bg-slate-100/70">
        {!readOnly && filteredEnquiries.length > 0 && (
          <div className="flex items-center justify-between px-1 text-xs text-slate-600 font-bold">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredEnquiries.length && filteredEnquiries.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-[#0f7b4f] focus:ring-[#0f7b4f] cursor-pointer"
              />
              <span>Select All ({filteredEnquiries.length})</span>
            </label>
            {selectedIds.length > 0 && (
              <span className="text-[#0f7b4f] font-black">{selectedIds.length} Selected</span>
            )}
          </div>
        )}

        {filteredEnquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="font-extrabold text-gray-700">No enquiries found</p>
            <p className="text-xs text-gray-400 mt-1">
              {isDealer
                ? `No ${user.assignedCity} enquiries match your active filters.`
                : 'Try selecting a different city or clearing your search filter.'}
            </p>
          </div>
        ) : (
          filteredEnquiries.map((e) => {
            const itemCity = e.city || getCityFromPostcode(e.postcode || e.customer?.collectionPostcode, e.customer?.collectionAddress);
            const isSelected = selectedIds.includes(String(e.id));

            return (
              <div
                key={e.id}
                onClick={() => setSelectedEnquiry(e)}
                className={`rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer space-y-3 relative overflow-hidden ${
                  !readOnly && isSelected ? 'border-[#0f7b4f] ring-2 ring-[#0f7b4f]/15' : 'border-gray-200/90'
                }`}
              >
                {/* Accent top stripe per status */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  e.status === 'Pending' ? 'bg-amber-400' :
                  e.status === 'Contacted' ? 'bg-blue-400' :
                  e.status === 'Accepted' ? 'bg-emerald-500' :
                  e.status === 'Collected' ? 'bg-purple-500' :
                  ['archived', 'deleted'].includes(e.status) ? 'bg-slate-400' : 'bg-red-400'
                }`} />

                {/* Card Header: Checkbox, Reg Plate, Ref, & Status Badge */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    {!readOnly && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(ev) => ev.stopPropagation()}
                        onChange={() => toggleSelectId(e.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#0f7b4f] focus:ring-[#0f7b4f] cursor-pointer shrink-0"
                      />
                    )}
                    <span className="inline-flex items-center rounded-lg border border-amber-400/90 bg-[#f8ce3d] px-2.5 py-0.5 font-mono font-black text-xs text-slate-950 uppercase shadow-xs">
                      {e.vehicle?.registration}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-gray-400">#{e.reference}</span>
                  </div>

                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${getBadgeClass(e.status)}`}>
                    {e.status}
                  </span>
                </div>

                {/* Main Card Body */}
                <div className="flex items-center justify-between gap-3 bg-slate-50/80 rounded-xl p-3 border border-gray-100">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-black text-sm text-slate-900 truncate">
                      {e.vehicle?.make} {e.vehicle?.model}
                    </h4>
                    <p className="text-xs font-bold text-gray-600 truncate flex items-center gap-1">
                      <span>👤</span> <span>{e.customer?.fullName || 'Customer'}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold">Quote</div>
                    <div className="text-xl font-black text-[#0f7b4f]">£{e.quote?.finalValue || 0}</div>
                  </div>
                </div>

                {/* Card Footer: Location & Action */}
                <div className="flex items-center justify-between pt-0.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-md border px-2 py-0.5 font-black text-[10px] ${getCityBadgeClass(itemCity)}`}>
                      📍 {itemCity}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      • {new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {e.customer?.phone && (
                      <a
                        href={`tel:${e.customer.phone}`}
                        onClick={(ev) => ev.stopPropagation()}
                        className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-[#0f7b4f] hover:bg-emerald-200 transition font-bold"
                        title="Call Customer"
                      >
                        📞
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSelectedEnquiry(e);
                      }}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-800 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      Details →
                    </button>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openSingleDeleteModal(e.id);
                        }}
                        className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-extrabold text-red-700 hover:bg-red-600 hover:text-white transition cursor-pointer"
                        title="Delete enquiry record"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP/TABLET TABLE VIEW (Shown on `md` screens and above) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-200 bg-gray-50/80 font-extrabold uppercase tracking-wider text-gray-500">
            <tr>
              {!readOnly && (
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredEnquiries.length && filteredEnquiries.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-[#0f7b4f] focus:ring-[#0f7b4f] cursor-pointer"
                  />
                </th>
              )}
              <th className="px-5 py-3.5">Reference</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Vehicle</th>
              <th className="px-5 py-3.5">City / Location</th>
              <th className="px-5 py-3.5">Quote</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 font-medium">
            {filteredEnquiries.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? 8 : 9} className="px-5 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🔍</span>
                    <p className="font-extrabold text-gray-700">No enquiries found</p>
                    <p className="text-xs text-gray-400">
                      {isDealer
                        ? `No ${user.assignedCity} enquiries match your active filters.`
                        : 'Try selecting a different city or clearing your search filter.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEnquiries.map((e) => {
                const itemCity = e.city || getCityFromPostcode(e.postcode || e.customer?.collectionPostcode, e.customer?.collectionAddress);
                const isSelected = selectedIds.includes(String(e.id));

                return (
                  <tr
                    key={e.id}
                    className={`transition hover:bg-emerald-50/40 cursor-pointer ${!readOnly && isSelected ? 'bg-emerald-50/60' : ''}`}
                    onClick={() => setSelectedEnquiry(e)}
                  >
                    {!readOnly && (
                      <td className="px-4 py-4 text-center" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectId(e.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#0f7b4f] focus:ring-[#0f7b4f] cursor-pointer"
                        />
                      </td>
                    )}

                    <td className="px-5 py-4">
                      <span className="font-mono font-black text-slate-900">{e.reference}</span>
                    </td>

                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(e.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900">{e.customer?.fullName || 'N/A'}</div>
                      <div className="text-[11px] text-gray-500">{e.customer?.phone}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-[#d1aa16] bg-[#f8ce3d] px-2 py-0.5 font-mono font-black text-[10px] text-black uppercase shrink-0">
                          {e.vehicle?.registration}
                        </span>
                        <span className="font-bold text-gray-800">
                          {e.vehicle?.make} {e.vehicle?.model}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className={`rounded-lg border px-2 py-0.5 font-black text-[11px] ${getCityBadgeClass(itemCity)}`}>
                          📍 {itemCity}
                        </span>
                        {e.postcode && (
                          <span className="font-mono text-[10px] text-gray-500 uppercase">
                            ({e.postcode})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-black text-[#0f7b4f]">
                        £{e.quote?.finalValue || 'N/A'}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-black ${getBadgeClass(e.status)}`}>
                        {e.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEnquiry(e)}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-extrabold text-gray-700 shadow-2xs hover:border-[#0f7b4f] hover:text-[#0f7b4f] cursor-pointer"
                        >
                          View Details
                        </button>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => openSingleDeleteModal(e.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-extrabold text-red-700 shadow-2xs hover:bg-red-600 hover:text-white transition cursor-pointer"
                            title="Delete enquiry record"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal View */}
      {selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onUpdateStatus={onUpdateStatus}
          onDelete={openSingleDeleteModal}
          readOnly={readOnly}
        />
      )}

      {/* Bulk Status Update Modal */}
      <BulkStatusModal
        isOpen={bulkStatusModalOpen}
        onClose={() => setBulkStatusModalOpen(false)}
        selectedCount={selectedIds.length}
        onConfirm={handleConfirmBulkStatus}
      />

      {/* Delete Confirmation Modal (Single or Bulk) */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        count={targetDeleteId ? 1 : selectedIds.length}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
