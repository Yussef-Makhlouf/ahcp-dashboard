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
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Hash,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  onExport?: (type: "csv" | "pdf", selectedRows?: TData[]) => void;
  onView?: (item: TData) => void;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onExport,
  onView,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [selectedViewItem, setSelectedViewItem] = React.useState<TData | null>(null);

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

  // Helper function to handle view item
  const handleViewItem = (item: TData) => {
    setSelectedViewItem(item);
    setViewModalOpen(true);
    if (onView) {
      onView(item);
    }
  };

  // Helper function to get field icon
  const getFieldIcon = (key: string, value: any) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('email')) return <Mail className="h-4 w-4 text-blue-500" />;
    if (lowerKey.includes('phone')) return <Phone className="h-4 w-4 text-green-500" />;
    if (lowerKey.includes('date') || lowerKey.includes('time')) return <Calendar className="h-4 w-4 text-purple-500" />;
    if (lowerKey.includes('user') || lowerKey.includes('name') || lowerKey.includes('client')) return <User className="h-4 w-4 text-indigo-500" />;
    if (lowerKey.includes('location') || lowerKey.includes('address') || lowerKey.includes('coordinate')) return <MapPin className="h-4 w-4 text-red-500" />;
    if (lowerKey.includes('id') || lowerKey.includes('serial') || lowerKey.includes('code')) return <Hash className="h-4 w-4 text-gray-500" />;
    if (lowerKey.includes('created') || lowerKey.includes('updated')) return <Clock className="h-4 w-4 text-orange-500" />;
    return <FileText className="h-4 w-4 text-gray-400" />;
  };

  // Helper function to format field value
  const formatFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'غير محدد';
    if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'فارغ';
      return JSON.stringify(value, null, 2);
    }
    if (key.toLowerCase().includes('date') && typeof value === 'string') {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('ar-SA');
      } catch {
        return value;
      }
    }
    return String(value);
  };

  // Helper function to get field label in Arabic
  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      // Common fields
      'id': 'المعرف',
      'serialNo': 'رقم التسلسل',
      'name': 'الاسم',
      'clientName': 'اسم العميل',
      'clientId': 'رقم هوية العميل',
      'clientPhone': 'هاتف العميل',
      'clientBirthDate': 'تاريخ ميلاد العميل',
      'email': 'البريد الإلكتروني',
      'phone': 'رقم الهاتف',
      'address': 'العنوان',
      'farmLocation': 'موقع المزرعة',
      'location': 'الموقع',
      'coordinates': 'الإحداثيات',
      'latitude': 'خط العرض',
      'longitude': 'خط الطول',
      'date': 'التاريخ',
      'createdAt': 'تاريخ الإنشاء',
      'updatedAt': 'تاريخ التحديث',
      'status': 'الحالة',
      'type': 'النوع',
      'sampleCode': 'رمز العينة',
      'sampleType': 'نوع العينة',
      'sampleNumber': 'رقم العينة',
      'collector': 'جامع العينة',
      'positiveCases': 'الحالات الإيجابية',
      'negativeCases': 'الحالات السلبية',
      'remarks': 'ملاحظات',
      'speciesCounts': 'عدد الأنواع',
      // Animal care specific
      'species': 'النوع',
      'breed': 'السلالة',
      'color': 'اللون',
      'weight': 'الوزن',
      'veterinarian': 'الطبيب البيطري',
      'diagnosis': 'التشخيص',
      'treatment': 'العلاج',
    };
    return labels[key] || key;
  };

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
    <div className="space-y-4 w-full max-w-none" dir="rtl">
      {/* Enhanced Toolbar */}
      <div className="">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md border rounded-md shadow-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                placeholder="البحث في البيانات..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="form-input pl-10 text-right"
              />
            </div>
            {globalFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGlobalFilter("")}
                className="hidden sm:flex"
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
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      تصدير CSV {selectedRows.length > 0 && `(${selectedRows.length} محدد)`}
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    onClick={() => onExport("pdf", selectedRows.length > 0 ? selectedRows : undefined)}
                    className="cursor-pointer"
                  >
                 
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm"
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
      <div className="table-container">
        <div className="overflow-x-auto overflow-y-auto min-h-[400px] max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mobile-table-container">
          <table className="table min-w-full mobile-table" style={{ minWidth: '1200px', direction: 'rtl' }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id} className="text-right">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      {columns.map((_, colIndex) => (
                        <td key={colIndex}>
                          <div className="animate-pulse">
                            <div className="h-4 bg-secondary rounded w-3/4"></div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      row.getIsSelected() && "bg-hover"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="text-right">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                        <Eye className="h-8 w-8 text-muted" />
                      </div>
                      <span className="text-secondary text-lg">لا توجد نتائج</span>
                      <span className="text-muted text-sm">جرب تغيير معايير البحث</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="card">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="text-sm text-secondary bg-card px-3 py-2 rounded-md border order-2 lg:order-1">
            <span className="font-medium text-primary">
              {table.getFilteredSelectedRowModel().rows.length}
            </span> من{" "}
            <span className="font-medium text-primary">
              {table.getFilteredRowModel().rows.length}
            </span> صف محدد
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 order-1 lg:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="hidden sm:flex"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 bg-card px-3 sm:px-4 py-2 rounded-md border shadow-sm">
              <span className="text-sm font-medium text-primary whitespace-nowrap">
                صفحة {table.getState().pagination.pageIndex + 1} من{" "}
                {table.getPageCount()}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="hidden sm:flex"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">
              عرض التفاصيل
            </DialogTitle>
          </DialogHeader>
          
          {selectedViewItem && (
            <div className="grid gap-4 py-4" dir="rtl">
              {Object.entries(selectedViewItem as Record<string, any>)
                .filter(([key, value]) => 
                  !key.startsWith('_') && 
                  key !== '__v' && 
                  value !== null && 
                  value !== undefined &&
                  value !== ''
                )
                .map(([key, value]) => (
                  <Card key={key} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getFieldIcon(key, value)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {getFieldLabel(key)}
                            </h4>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {key}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 break-words">
                            {typeof value === 'object' && value !== null ? (
                              <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded border">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            ) : (
                              <span className="font-medium">
                                {formatFieldValue(key, value)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
