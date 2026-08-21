import React from 'react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}) {
  if (totalItems === 0) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array with smart ellipsis if many pages
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 bg-gray-50/80 border-t border-gray-200 text-xs">
      {/* Information text */}
      <div className="text-gray-600 font-medium text-center sm:text-left">
        Showing <span className="font-black text-slate-900">{startItem}</span> to{' '}
        <span className="font-black text-slate-900">{endItem}</span> of{' '}
        <span className="font-black text-slate-900">{totalItems}</span> entries
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            currentPage === 1
              ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs active:scale-95'
          }`}
        >
          <span>‹</span>
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Page numbers */}
        {pages.map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400 font-bold">
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-[32px] px-2.5 py-1 rounded-xl font-black transition cursor-pointer text-xs flex items-center justify-center ${
                isCurrent
                  ? 'bg-[#0f7b4f] text-white shadow-xs ring-2 ring-[#0f7b4f]/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs active:scale-95'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            currentPage === totalPages || totalPages === 0
              ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs active:scale-95'
          }`}
        >
          <span className="hidden xs:inline">Next</span>
          <span>›</span>
        </button>
      </div>
    </div>
  );
}
