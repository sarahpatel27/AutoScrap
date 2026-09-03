import { useState, useEffect } from 'react';
import HighValueEnquiryDetailModal from './HighValueEnquiryDetailModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Pagination from './Pagination';
import { deleteHighValueEnquiry } from '../../services/adminStore';
import { showToast } from './ToastContainer';
import { exportEnquiriesToExcel } from '../../utils/excelExporter';

export default function HighValueBiddingSection({ enquiries = [], onWinnerSelected, onDeleteHVEnquiry, readOnly = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page to 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredEnquiries.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">Pending</span>;
      case 'BIDDING':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> Bidding Active</span>;
      case 'BIDDING_ENDED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">Bidding Ended</span>;
      case 'DEALER_SELECTED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">Dealer Selected</span>;
      case 'PURCHASED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Purchased</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">{status}</span>;
    }
  };

  const handleExportHVData = () => {
    try {
      if (filteredEnquiries.length === 0) {
        showToast('No high-value records available to export.', 'error');
        return;
      }
      exportEnquiriesToExcel(filteredEnquiries, 'High_Value_Enquiries');
      showToast(`Exported ${filteredEnquiries.length} high-value records to Excel!`, 'success');
    } catch (err) {
      showToast(err.message || 'Export failed.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-white font-black text-xl shadow-sm">
              ⭐
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-['Manrope']">
                High Value Vehicle Bidding Portal
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Vehicles newer than 2015 routed into dealer bidding valuation flow.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 border border-slate-200/80 shadow-2xs">
            <span>Total Enquiries:</span>
            <span className="rounded-md bg-amber-500 px-2 py-0.5 text-white font-black">{enquiries.length}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reg, make, model, customer..."
              className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-[#0f7b4f] focus:bg-white focus:ring-2 focus:ring-[#0f7b4f]/20 font-medium"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
          </div>

          <button
            type="button"
            onClick={handleExportHVData}
            className="rounded-xl border border-emerald-600/30 bg-[#0f7b4f] px-3.5 py-2 text-xs font-black text-white hover:bg-[#075b3a] transition shadow-xs cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 active:scale-95"
            title="Export high-value enquiry records to Excel"
          >
            <span>📊</span>
            <span>Export Data</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0f7b4f]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="BIDDING">Bidding Active</option>
            <option value="BIDDING_ENDED">Bidding Ended</option>
            <option value="DEALER_SELECTED">Dealer Selected</option>
            <option value="PURCHASED">Purchased / Collected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4 min-w-[100px] sm:min-w-0">Date</th>
                <th className="py-3.5 px-4 min-w-[160px] sm:min-w-0">Vehicle</th>
                <th className="py-3.5 px-4 min-w-[110px] sm:min-w-0">Year & Mileage</th>
                <th className="py-3.5 px-4">Condition</th>
                <th className="py-3.5 px-4 min-w-[110px] sm:min-w-0">Location</th>
                <th className="py-3.5 px-4 bg-amber-50/50 min-w-[210px] sm:min-w-0">Valuation Comparison</th>
                <th className="py-3.5 px-4 min-w-[130px] sm:min-w-0">Bids & Timer</th>
                <th className="py-3.5 px-4 min-w-[150px] ">Status</th>
                <th className="py-3.5 px-4 text-right min-w-[120px] sm:min-w-0">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No high-value vehicle enquiries found.
                  </td>
                </tr>
              ) : (
                paginatedEnquiries.map((item) => {
                  const acceptedEstimate = item.valuePreference === 'ESTIMATED_VALUE';
                  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-medium whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {dateStr}
                      </td>

                      {/* Vehicle & Reg */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-[170px] sm:min-w-0">
                          <div className="flex flex-col gap-1">
                            <span className="font-extrabold text-slate-900 text-sm leading-tight">
                              {item.make} {item.model}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="rounded-md border border-amber-300 bg-[#f6cf3c] px-2 py-0.5 font-mono text-[11px] font-black text-black whitespace-nowrap">
                                {item.registration}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                #{item.reference}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Year & Mileage */}
                      <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                        <div>📅 <strong className="text-slate-900">{item.year}</strong></div>
                        <div className="text-slate-500 text-[11px]">
                          {item.mileage ? `${Number(item.mileage).toLocaleString('en-GB')} mi` : 'N/A'}
                        </div>
                      </td>

                      {/* Condition */}
                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-bold text-slate-800 text-[11px] whitespace-nowrap">
                          {item.condition || 'Good'}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-bold text-slate-900 whitespace-nowrap">{item.city || item.area || 'UK'}</div>
                        <div className="text-gray-400 text-[11px] font-mono whitespace-nowrap">{item.postcode}</div>
                      </td>

                      {/* Three Distinct Values Clearly Visualized */}
                      <td className="py-3.5 px-4 bg-amber-50/30">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-slate-500 font-medium">System estimate:</span>
                            <strong className="text-[#0f7b4f] font-black">
                              £{Number(item.estimatedValue || 0).toLocaleString('en-GB')}
                            </strong>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-slate-600 font-bold">Customer expectation:</span>
                            <strong className="text-amber-950 font-black">
                              £{Number(item.customerExpectedValue || 0).toLocaleString('en-GB')}
                            </strong>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5 border-t border-amber-200/80">
                            <span className="text-slate-700 font-extrabold">
                              {['DEALER_SELECTED', 'PURCHASED'].includes(item.status) ? 'Winning offer:' : 'Highest dealer bid:'}
                            </span>
                            <strong className="text-emerald-700 font-black">
                              £{Number(item.highestBid || 0).toLocaleString('en-GB')}
                            </strong>
                          </div>

                          <div className="pt-0.5">
                            {acceptedEstimate ? (
                              <span className="inline-block rounded-md bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                ✓ Accepted estimate
                              </span>
                            ) : (
                              <span className="inline-block rounded-md bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                                ✍️ Customer entered own value
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Bids & Timer */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 min-w-[135px] shadow-2xs">
                          <div className="flex items-center justify-between gap-1.5 text-[11px]">
                            <span className="font-semibold text-slate-500">Bids:</span>
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-black text-slate-800">
                              {item.bidCount || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1.5 text-[11px]">
                            <span className="font-semibold text-slate-500">High:</span>
                            <span className="text-emerald-700 font-black">
                              £{Number(item.highestBid || 0).toLocaleString('en-GB')}
                            </span>
                          </div>
                          <div className="pt-1 border-t border-slate-200/80 text-[10px] flex items-center justify-between gap-1.5">
                            <span className="font-semibold text-slate-500">Timer:</span>
                            <span className={`font-extrabold whitespace-nowrap ${item.timeRemaining === 'Ended' || item.timeRemaining === 'Bidding Ended' ? 'text-red-600' : 'text-amber-700'}`}>
                              {item.timeRemaining === 'Bidding Ended' ? 'Ended' : (item.timeRemaining || 'N/A')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedEnquiry(item)}
                            className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-extrabold text-slate-900 text-xs hover:border-[#0f7b4f] hover:bg-emerald-50 hover:text-[#0f7b4f] transition shadow-2xs cursor-pointer whitespace-nowrap text-center"
                          >
                            View Details
                          </button>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => {
                                setItemToDelete(item);
                                setDeleteModalOpen(true);
                              }}
                              className="w-full sm:w-auto rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 font-extrabold text-red-700 text-xs hover:bg-red-600 hover:text-white transition shadow-2xs cursor-pointer whitespace-nowrap text-center"
                              title="Delete enquiry record"
                            >
                              Delete
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

        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredEnquiries.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* Detail Modal Component */}
      {selectedEnquiry && (
        <HighValueEnquiryDetailModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onWinnerSelected={() => {
            setSelectedEnquiry(null);
            if (onWinnerSelected) onWinnerSelected();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title="Delete High-Value Enquiry Record?"
        subtitle="High-Value Vehicle Bidding"
        warningText={
          itemToDelete
            ? `High-value enquiry #${itemToDelete.reference} (${itemToDelete.make} ${itemToDelete.model}) will be removed from active operations and safely stored under Past Enquiries for record-keeping.`
            : 'This high-value enquiry will be removed from active operations and safely stored under Past Enquiries for record-keeping.'
        }
        onConfirm={async () => {
          if (!itemToDelete) return;
          try {
            await deleteHighValueEnquiry(itemToDelete.id);
            showToast(`Enquiry #${itemToDelete.reference} deleted & archived to Past Enquiries!`, 'success');
            if (onDeleteHVEnquiry) {
              onDeleteHVEnquiry();
            } else if (onWinnerSelected) {
              onWinnerSelected();
            }
          } catch (err) {
            showToast(err.message || 'Failed to delete high-value enquiry.', 'error');
          }
        }}
      />
    </div>
  );
}
