import React from "react";
import type { Table } from "@tanstack/react-table";
import Button from "./Button";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [5, 10, 20, 30, 40, 50, 100],
  showPageSize = true,
}: DataTablePaginationProps<TData>) {
  const {
    pageIndex,
    pageSize,
  } = table.getState().pagination;

  return (
    <div className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-2 sm:flex-row sm:gap-8 text-xs md:text-sm">
      {/* Page size selector */}
      {showPageSize && (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-405 font-semibold">
          <span>Rows per page</span>
          <select
            className="h-8 rounded-md border border-slate-300 dark:border-navy-border bg-white dark:bg-navy-950 px-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500 cursor-pointer"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size} className="bg-white dark:bg-navy-card">
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-6">
        <div className="font-semibold text-slate-600 dark:text-slate-400">
          Page {pageIndex + 1} of {table.getPageCount() || 1}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            aria-label="Go to first page"
            variant="secondary"
            size="sm"
            className="p-1 w-8 h-8 flex items-center justify-center dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Button>

          <Button
            aria-label="Go to previous page"
            variant="secondary"
            size="sm"
            className="p-1 w-8 h-8 flex items-center justify-center dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          <Button
            aria-label="Go to next page"
            variant="secondary"
            size="sm"
            className="p-1 w-8 h-8 flex items-center justify-center dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>

          <Button
            aria-label="Go to last page"
            variant="secondary"
            size="sm"
            className="p-1 w-8 h-8 flex items-center justify-center dark:bg-[#0f1422] dark:border-navy-border dark:text-slate-350 dark:hover:bg-slate-800"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
