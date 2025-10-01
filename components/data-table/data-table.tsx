"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  Search,
  Settings2,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  onExport?: (type: "csv" | "pdf", selectedRows?: TData[]) => void;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onExport,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);

  // Skeleton loading component
  const SkeletonRow = () => (
    <TableRow>
      {columns.map((_, index) => (
        <TableCell key={index} className="px-6 py-4 min-w-[120px]">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <div className="space-y-4 w-full max-w-none">
      {/* Enhanced Toolbar */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="البحث في البيانات..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pr-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
            {globalFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGlobalFilter("")}
                className="text-gray-600 hover:text-gray-800 hidden sm:flex"
              >
                مسح البحث
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Export buttons */}
            {onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-700 hover:text-blue-800 transition-all duration-200 shadow-sm"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    تصدير
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuCheckboxItem
                    onClick={() => onExport("csv", selectedRows.length > 0 ? selectedRows : undefined)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      تصدير CSV {selectedRows.length > 0 && `(${selectedRows.length} محدد)`}
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    onClick={() => onExport("pdf", selectedRows.length > 0 ? selectedRows : undefined)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      تصدير PDF {selectedRows.length > 0 && `(${selectedRows.length} محدد)`}
                    </div>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white border-green-300 hover:bg-green-50 hover:border-green-400 text-green-700 hover:text-green-800 transition-all duration-200 shadow-sm"
                >
                  <Settings2 className="ml-2 h-4 w-4" />
                  الأعمدة
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize cursor-pointer"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto min-h-[400px]">
          <Table className="w-full min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow 
                  key={headerGroup.id}
                  className="bg-blue-50 border-b border-blue-200"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id}
                        className="h-14 px-6 text-right font-semibold text-blue-800 min-w-[120px]"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))}
                </>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b border-gray-100 transition-all duration-200 hover:bg-blue-50",
                      row.getIsSelected() && "bg-blue-100 border-blue-300",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className="px-6 py-4 text-right align-middle text-gray-700 min-w-[120px]"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Eye className="h-8 w-8 text-gray-400" />
                      </div>
                      <span className="text-gray-600 text-lg">لا توجد نتائج</span>
                      <span className="text-gray-500 text-sm">جرب تغيير معايير البحث</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-300 order-2 lg:order-1">
            <span className="font-medium text-gray-800">
              {table.getFilteredSelectedRowModel().rows.length}
            </span> من{" "}
            <span className="font-medium text-gray-800">
              {table.getFilteredRowModel().rows.length}
            </span> صف محدد
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 order-1 lg:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="bg-white border-purple-300 hover:bg-purple-50 hover:border-purple-400 text-purple-700 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hidden sm:flex"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-white border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-700 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-300 shadow-sm">
              <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                صفحة {table.getState().pagination.pageIndex + 1} من{" "}
                {table.getPageCount()}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-white border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-700 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="bg-white border-purple-300 hover:bg-purple-50 hover:border-purple-400 text-purple-700 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hidden sm:flex"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
