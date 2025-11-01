"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import type { PaginatedResponse } from '@/types';
import { TableDateFilter } from './date-filter';
import { FilteredExportButton } from './filtered-export-button';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

interface ApiDataTableProps<T> {
  // API functions
  fetchData: (params?: any) => Promise<PaginatedResponse<T>>;
  deleteItem?: (id: string | number) => Promise<void>;
  exportData?: (ids?: (string | number)[]) => Promise<Blob>;
  
  // Table configuration
  columns: Column<T>[];
  title: string;
  queryKey: string;
  
  // Optional props
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  searchPlaceholder?: string;
  enableExport?: boolean;
  enableImport?: boolean;
  enableDelete?: boolean;
  
  // Export configuration
  exportEndpoint?: string;
  exportFilename?: string;
  
  // Custom filters
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
}

export function ApiDataTable<T extends { id?: string | number; _id?: string }>({
  fetchData,
  deleteItem,
  exportData,
  columns,
  title,
  queryKey,
  onAdd,
  onEdit,
  onView,
  searchPlaceholder = "البحث بالاسم، رقم التسلسل، الهوية، أو الهاتف...",
  enableExport = true,
  enableImport = false,
  enableDelete = true,
  exportEndpoint,
  exportFilename,
  filters = []
}: ApiDataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [dateFilter, setDateFilter] = useState<{ startDate?: string; endDate?: string }>({});
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());

  const queryClient = useQueryClient();

  // Fetch data with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [queryKey, page, limit, search, selectedFilters, dateFilter],
    queryFn: () => fetchData({
      page,
      limit,
      search: search || undefined,
      ...selectedFilters,
      ...dateFilter
    }),
    placeholderData: (previousData) => previousData,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteItem!,
    onSuccess: () => {
      toast.success('تم الحذف بنجاح');
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setSelectedItems(new Set());
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء الحذف');
    }
  });

  // Export function
  const handleExport = useCallback(async () => {
    if (!exportData) return;
    
    try {
      const selectedIds = Array.from(selectedItems);
      const blob = await exportData(selectedIds.length > 0 ? selectedIds : undefined);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${queryKey}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء التصدير');
    }
  }, [exportData, selectedItems, queryKey]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((key: string, value: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      if (value === 'all') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
    setPage(1);
  }, []);

  // Handle item selection
  const handleItemSelect = useCallback((id: string | number, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked && data?.data) {
      const allIds = data.data.map(item => item.id || item._id!);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  }, [data?.data]);

  // Handle delete selected
  const handleDeleteSelected = useCallback(async () => {
    if (!deleteItem || selectedItems.size === 0) return;
    
    if (confirm(`هل أنت متأكد من حذف ${selectedItems.size} عنصر؟`)) {
      try {
        await Promise.all(
          Array.from(selectedItems).map(id => deleteMutation.mutateAsync(id))
        );
      } catch (error) {
        // Error handling is done in the mutation
      }
    }
  }, [deleteItem, selectedItems, deleteMutation]);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const hasSelection = selectedItems.size > 0;

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            حدث خطأ في تحميل البيانات: {(error as Error).message}
            <Button onClick={() => refetch()} className="mr-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2">
            {onAdd && (
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة جديد
              </Button>
            )}
            {enableExport && exportEndpoint && (
              <FilteredExportButton
                exportEndpoint={exportEndpoint}
                filters={selectedFilters}
                dateRange={
                  dateFilter.startDate && dateFilter.endDate
                    ? {
                        from: new Date(dateFilter.startDate),
                        to: new Date(dateFilter.endDate),
                      }
                    : undefined
                }
                filename={exportFilename || queryKey}
                buttonText="تصدير"
                variant="outline"
              />
            )}
            {enableExport && exportData && !exportEndpoint && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                تصدير {hasSelection ? `(${selectedItems.size})` : ''}
              </Button>
            )}
            {hasSelection && enableDelete && deleteItem && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteSelected}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                حذف المحدد ({selectedItems.size})
              </Button>
            )}
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          
          {/* فلتر التاريخ */}
          <TableDateFilter
            onFilterChange={(params) => {
              setDateFilter(params);
              setPage(1); // إعادة تعيين الصفحة عند تغيير الفلتر
            }}
            className="min-w-[300px]"
          />

          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={selectedFilters[filter.key] || ''}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="mr-2">جاري التحميل...</span>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={!!(data?.data?.length && data.data.length > 0 && selectedItems.size === data.data.length)}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead key={column.key as string} style={{ width: column.width }}>
                      {column.title}
                    </TableHead>
                  ))}
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((item) => {
                  const itemId = item.id || item._id!;
                  return (
                    <TableRow key={itemId}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(itemId)}
                          onChange={(e) => handleItemSelect(itemId, e.target.checked)}
                          className="rounded"
                        />
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={column.key as string}>
                          {column.render 
                            ? column.render((item as any)[column.key], item)
                            : (item as any)[column.key]
                          }
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex gap-1">
                          {onView && (
                            <Button size="sm" variant="ghost" onClick={() => onView(item)}>
                              عرض
                            </Button>
                          )}
                          {onEdit && (
                            <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {enableDelete && deleteItem && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteMutation.mutate(itemId)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                عرض {((page - 1) * limit) + 1} إلى {Math.min(page * limit, data?.total || 0)} من {data?.total || 0} عنصر
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <span className="text-sm">
                  {page} من {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ApiDataTable;
