import React from 'react';

interface PaginationProps {
  pageIndex: number;        // 0-based current page
  pageCount: number;        // total number of pages
  pageSize: number;         // rows per page
  totalRows: number;        // total filtered rows
  canPreviousPage: boolean;
  canNextPage: boolean;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  onPageSizeChange: (size: number) => void;
  onPageChange?: (index: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  pageIndex,
  pageCount,
  pageSize,
  totalRows,
  canPreviousPage,
  canNextPage,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onPageSizeChange,
  onPageChange,
  pageSizeOptions = [5, 10, 25, 50]
}) => {
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to   = Math.min((pageIndex + 1) * pageSize, totalRows);

  // Build page number buttons (show at most 5 around current page)
  const buildPageNumbers = () => {
    if (pageCount <= 0) return [];
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i);
    const pages: (number | '…')[] = [];
    pages.push(0);
    if (pageIndex > 3) pages.push('…');
    for (let i = Math.max(1, pageIndex - 1); i <= Math.min(pageCount - 2, pageIndex + 1); i++) {
      pages.push(i);
    }
    if (pageIndex < pageCount - 4) pages.push('…');
    pages.push(pageCount - 1);
    return pages;
  };

  const pageNumbers = buildPageNumbers();

  const btnBase =
    'inline-flex items-center justify-center h-8 min-w-[32px] rounded-lg text-xs font-bold transition-all border';
  const btnActive =
    'bg-accent-600 text-white border-accent-600 shadow-sm shadow-accent-500/25';
  const btnIdle =
    'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300';
  const btnDisabled =
    'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 border-t border-slate-100 bg-white">
      {/* Left: row info + rows-per-page */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="font-medium">
          {totalRows === 0
            ? 'No results'
            : `Showing ${from}–${to} of ${totalRows}`}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Rows:</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="h-7 px-1.5 pr-5 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-accent-500 cursor-pointer"
          >
            {pageSizeOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={onFirstPage}
          disabled={!canPreviousPage}
          className={`${btnBase} px-2 ${canPreviousPage ? btnIdle : btnDisabled}`}
          title="First page"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Prev */}
        <button
          onClick={onPreviousPage}
          disabled={!canPreviousPage}
          className={`${btnBase} px-2 ${canPreviousPage ? btnIdle : btnDisabled}`}
          title="Previous page"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((p, idx) =>
          p === '…' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => {
                if (onPageChange) {
                  onPageChange(p as number);
                } else {
                  // Navigate directly to page p
                  const diff = (p as number) - pageIndex;
                  if (diff > 0) for (let i = 0; i < diff; i++) onNextPage();
                  else for (let i = 0; i < -diff; i++) onPreviousPage();
                }
              }}
              className={`${btnBase} px-2.5 ${p === pageIndex ? btnActive : btnIdle}`}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={onNextPage}
          disabled={!canNextPage}
          className={`${btnBase} px-2 ${canNextPage ? btnIdle : btnDisabled}`}
          title="Next page"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Last */}
        <button
          onClick={onLastPage}
          disabled={!canNextPage}
          className={`${btnBase} px-2 ${canNextPage ? btnIdle : btnDisabled}`}
          title="Last page"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
