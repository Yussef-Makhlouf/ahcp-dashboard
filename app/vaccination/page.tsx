"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Vaccination } from "@/types";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { VaccinationDialog } from "./components/vaccination-dialog";
import { getColumns } from "./components/columns";
import { vaccinationApi } from "@/lib/api/vaccination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { toast } from "sonner";
import { ImportExportManager } from "@/components/import-export";
import { ImportDialog } from "@/components/common/ImportDialog";
import { ResponsiveActions, createActions } from "@/components/ui/responsive-actions";
import { apiConfig } from "@/lib/api-config";
import { VaccinationStats } from "@/components/dashboard/vaccination-stats";
import { TableFilters, useTableFilters } from "@/components/data-table/table-filters";
import { getTableFilterConfig, filtersToApiParams } from "@/lib/table-filter-configs";
import { DateRange } from "react-day-picker";


export default function VaccinationPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Vaccination | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const queryClient = useQueryClient();
  const { checkPermission } = usePermissions();

  // إعداد الفلاتر
  const {
    filters,
    dateRange,
    updateFilters,
    updateDateRange,
    clearFilters,
    hasActiveFilters
  } = useTableFilters({}, (newFilters) => {
    // إعادة تعيين الصفحة عند تغيير الفلاتر
    setCurrentPage(1);
  });

  // Fetch vaccination data using React Query with pagination and filters
  const { data: vaccinationData, isLoading, refetch } = useQuery({
    queryKey: ['vaccination', currentPage, pageSize, filters, dateRange],
    queryFn: () => {
      const apiParams = filtersToApiParams({ ...filters, dateRange });
      return vaccinationApi.getList({
        page: currentPage,
        limit: pageSize,
        ...apiParams,
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });


  const data = vaccinationData?.data || [];
  const totalCount = vaccinationData?.total || 0;
  const totalPages = vaccinationData?.totalPages || 0;



  const handleDelete = async (item: Vaccination) => {
    try {
      // Use _id for deletion, fallback to serialNo if _id is not available
      const deleteId = item._id || item.serialNo;
      console.log('🗑️ Deleting vaccination with ID:', deleteId);
      
      await vaccinationApi.delete(deleteId);
      queryClient.invalidateQueries({ queryKey: ['vaccination'] });
      queryClient.invalidateQueries({ queryKey: ['vaccination-stats'] });
      toast.success('تم حذف السجل بنجاح');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('فشل في حذف السجل');
    }
  };

  // Handle bulk delete selected records
  const handleBulkDelete = async (selectedRows: Vaccination[]) => {
    console.log('🗑️ handleBulkDelete called with:', selectedRows.length, 'rows');
    try {
      const ids = selectedRows.map(row => row._id || row.id || row.serialNo);
      console.log('🔍 IDs to delete:', ids);
      const result = await vaccinationApi.bulkDelete(ids);
      console.log('✅ Bulk delete result:', result);
      queryClient.invalidateQueries({ queryKey: ['vaccination'] });
      queryClient.invalidateQueries({ queryKey: ['vaccination-stats'] });
      toast.success(`تم حذف ${result.deletedCount || ids.length} سجل بنجاح`);
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      toast.error('فشل في حذف السجلات المحددة');
    }
  };

  // Handle delete all records
  const handleDeleteAll = async () => {
    try {
      const result = await vaccinationApi.deleteAll();
      console.log('✅ Delete all result:', result);
      queryClient.invalidateQueries({ queryKey: ['vaccination'] });
      queryClient.invalidateQueries({ queryKey: ['vaccination-stats'] });
      toast.success(`تم حذف ${result.deletedCount || 'جميع'} السجلات بنجاح`);
    } catch (error) {
      console.error('❌ Delete all failed:', error);
      toast.error('فشل في حذف جميع السجلات');
    }
  };

  const handleEdit = (item: Vaccination) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleView = (item: Vaccination) => {
    // This will be handled by the DataTable's built-in view modal
    console.log("Viewing vaccination item:", item);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleImportSuccess = () => {
    // إلغاء جميع queries المتعلقة بالتطعيمات
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const queryKey = query.queryKey as string[];
        return queryKey[0] === 'vaccination' || queryKey[0] === 'vaccination-stats';
      }
    });
    
    // إعادة تحميل البيانات فوراً
    refetch();
    
    toast.success('تم استيراد البيانات بنجاح - جاري تحديث الجدول');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">التطعيمات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة سجلات التطعيمات واللقاحات للحيوانات
            </p>
          </div>
          <ResponsiveActions
            primaryAction={checkPermission({ module: 'vaccination', action: 'create' }) ? 
              createActions.add(handleAdd, "إضافة تطعيم جديد") : undefined
            }
            actions={[
              createActions.importDromo(() => setIsImportDialogOpen(true))
            ]}
            maxVisibleActions={2}
          />
          
          {/* ImportExportManager - Now visible for file upload */}
          <ImportExportManager
            exportEndpoint={apiConfig.endpoints.vaccination.export}
            importEndpoint={apiConfig.endpoints.vaccination.import}
            templateEndpoint={apiConfig.endpoints.vaccination.template}
            title="التطعيمات"
            queryKey="vaccination"
            acceptedFormats={[".csv", ".xlsx"]}
            maxFileSize={10}
            currentFilters={filters}
            currentDateRange={dateRange}
            onImportSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['vaccination'] });
            }}
            onExportSuccess={() => {
              toast.success('تم تصدير البيانات بنجاح');
            }}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['vaccination'] });
            }}
          />
        </div>

        {/* الفلاتر */}
        <TableFilters
          dateFilter={{
            enabled: true,
            label: "فلترة بتاريخ التطعيم",
            value: dateRange,
            onDateChange: updateDateRange,
          }}
          fieldFilters={getTableFilterConfig('vaccination')}
          filterValues={filters}
          onFiltersChange={updateFilters}
          defaultExpanded={hasActiveFilters}
          className="mb-6"
        />

        {/* Department Dashboard - Vaccination */}
        <VaccinationStats />

        {/* Data Table */}
        <DataTable
          columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete, onView: handleView })}
          data={data}
          isLoading={isLoading}
          enableBulkDelete={true}
          onDeleteSelected={handleBulkDelete}
          onDeleteAll={handleDeleteAll}
          module="vaccination"
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          showPagination={true}
        />

        {/* Vaccination Dialog */}
        <VaccinationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={selectedItem}
          onSuccess={() => {
            refetch();
            setIsDialogOpen(false);
            setSelectedItem(null);
          }}
        />

        {/* Import Dialog */}
        <ImportDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          tableType="vaccination"
          templateKey={process.env.NEXT_PUBLIC_DROMO_TEMPLATE_VACCINATION || ''}
          onImportSuccess={handleImportSuccess}
        />
      </div>
    </MainLayout>
  );
}
