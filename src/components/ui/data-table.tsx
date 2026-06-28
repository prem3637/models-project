import React from "react";
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  cn
} from "./table";
import { DataTablePagination } from "./data-table-pagination";
import { Inbox } from "lucide-react";
import { Skeleton } from "./Skeleton";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  showPagination: boolean;
  isLoading?: boolean;
  noResultMessage?: string;
  maxHeight?: string;  // tailwind max-h- class or custom value like "500px"
  minHeight?: string;  // tailwind min-h- class or custom value like "500px"
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData>({
  table,
  showPagination,
  children,
  className,
  isLoading = false,
  noResultMessage = "No Records Found",
  maxHeight = "550px",
  minHeight = "350px",
  onRowClick,
  ...props
}: DataTableProps<TData>) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)} {...props}>
      {children}
      <div className="rounded-2xl border border-slate-200 dark:border-navy-border overflow-hidden bg-white dark:bg-navy-card transition-colors duration-200">
        <div 
          className="overflow-auto custom-scrollbar" 
          style={{ maxHeight: maxHeight, minHeight: minHeight }}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-slate-50 dark:bg-navy-950/40">
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: header.getSize() }}
                        className={cn(isSortable && "select-none")}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                            className={cn(
                              "flex items-center gap-1.5",
                              isSortable && "cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                            )}
                          >
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {typeof header.column.columnDef.header === "string" && sortDirection === "asc" && (
                              <span className="text-accent-500 font-bold">↑</span>
                            )}
                            {typeof header.column.columnDef.header === "string" && sortDirection === "desc" && (
                              <span className="text-accent-500 font-bold">↓</span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="border-b border-slate-100 dark:border-navy-border/50">
                    {table.getAllColumns().map((column, colIndex) => {
                      const widths = ["w-1/2", "w-3/4", "w-2/3", "w-5/6", "w-full", "w-1/3"];
                      const widthClass = widths[(rowIndex + colIndex) % widths.length];
                      return (
                        <TableCell key={colIndex}>
                          <Skeleton className={`h-4 ${widthClass}`} />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(
                      "hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors",
                      onRowClick ? "cursor-pointer" : undefined
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="text-center"
                    style={{ height: minHeight }}
                  >
                    <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
                      <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{noResultMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {showPagination && <DataTablePagination table={table} />}
    </div>
  );
}
