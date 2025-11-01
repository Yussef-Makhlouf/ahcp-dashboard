"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { ParasiteControlStats } from "@/components/dashboard/parasite-control-stats";

import { getColumns } from "./components/columns";
import { Button } from "@/components/ui/button";
import { Plus, Bug, Shield, TrendingUp, TrendingDown, Activity, Clock, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParasiteControl } from "@/types";
import { formatDate } from "@/lib/utils";
import { parasiteControlApi } from "@/lib/api/parasite-control";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { ParasiteControlDialog } from "./components/parasite-control-dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ImportExportManager } from "@/components/import-export";
import { ImportDialog } from "@/components/common/ImportDialog";
import { ResponsiveActions, createActions } from "@/components/ui/responsive-actions";
import { apiConfig } from "@/lib/api-config";
import { TableFilters, useTableFilters } from "@/components/data-table/table-filters";
import { getTableFilterConfig, filtersToApiParams } from "@/lib/table-filter-configs";
import { DateRange } from "react-day-picker";

// تعريف حقول النموذج
const formFields = [
  {
    name: "date",
    label: "تاريخ المكافحة",
    type: "date" as const,
    required: true,
  },
  {
    name: "owner.name",
    label: "اسم المربي",
    type: "text" as const,
    required: true,
    placeholder: "أدخل اسم المربي",
  },
  {
    name: "owner.id",
    label: "رقم الهوية",
    type: "text" as const,
    required: true,
    placeholder: "1234567890",
  },
  {
    name: "owner.phone",
    label: "رقم الهاتف",
    type: "text" as const,
    required: true,
    placeholder: "+966501234567",
  },
  {
    name: "supervisor",
    label: "المشرف",
    type: "text" as const,
    required: true,
    placeholder: "اسم المشرف",
  },
  {
    name: "vehicleNo",
    label: "رقم المركبة",
    type: "text" as const,
    required: true,
    placeholder: "ABC-123",
  },
  {
    name: "herdLocation",
    label: "موقع القطيع",
    type: "text" as const,
    required: true,
    placeholder: "موقع المزرعة",
  },
  {
    name: "herdHealthStatus",
    label: "حالة القطيع الصحية",
    type: "select" as const,
    required: true,
    options: [
      { value: "Healthy", label: "سليم" },
      { value: "Sick", label: "مريض" },
      { value: "Under Treatment", label: "تحت العلاج" },
    ],
  },
  {
    name: "complying",
    label: "الامتثال للتعليمات",
    type: "select" as const,
    required: true,
    options: [
      { value: "Comply", label: "ملتزم" },
      { value: "Not Comply", label: "غير ملتزم" },
    ],
  },
  {
    name: "insecticide.type",
    label: "نوع المبيد",
    type: "text" as const,
    required: true,
    placeholder: "نوع المبيد المستخدم",
  },
  {
    name: "insecticide.volume_ml",
    label: "كمية المبيد (مل)",
    type: "number" as const,
    required: true,
  },
  {
    name: "remarks",
    label: "ملاحظات",
    type: "textarea" as const,
    placeholder: "أدخل أي ملاحظات إضافية",
  },
];

// تعريف أعمدة الجدول
const tableColumns = [
  {
    key: "serialNo",
    title: "الرقم التسلسلي",
    width: "100px",
  },
  {
    key: "date",
    title: "التاريخ",
    render: (value: string) => formatDate(value),
    width: "120px",
  },
  {
    key: "owner.name",
    title: "اسم المربي",
    render: (value: any, record: ParasiteControl) => record.owner?.name || "-",
  },
  {
    key: "owner.birthDate",
    title: "تاريخ ميلاد المربي",
    render: (value: any, record: ParasiteControl) => {
      const birthDate = record.owner?.birthDate;
      if (!birthDate) return "-";
      const date = new Date(birthDate);
      return date.toLocaleDateString("en-GB", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    width: "140px",
  },
  {
    key: "owner.phone",
    title: "رقم الهاتف",
    render: (value: any, record: ParasiteControl) => record.owner?.phone || "-",
    width: "140px",
  },
  {
    key: "supervisor",
    title: "المشرف",
    width: "120px",
  },
  {
    key: "herdHealthStatus",
    title: "حالة القطيع",
    render: (value: string) => (
      <Badge 
        variant={
          value === "Healthy" ? "default" : 
          value === "Sick" ? "destructive" : 
          "secondary"
        }
      >
        {value === "Healthy" ? "سليم" : 
         value === "Sick" ? "مريض" : 
         "تحت العلاج"}
      </Badge>
    ),
    width: "120px",
  },
  {
    key: "complying",
    title: "الامتثال",
    render: (value: string) => (
      <Badge variant={value === "Comply" ? "default" : "destructive"}>
        {value === "Comply" ? "ملتزم" : "غير ملتزم"}
      </Badge>
    ),
    width: "100px",
  },
  {
    key: "insecticide.type",
    title: "نوع المبيد",
    render: (value: any, record: ParasiteControl) => record.insecticide?.type || "-",
    width: "140px",
  },
];

// فلاتر الجدول
const tableFilters = [
  {
    key: "herdHealthStatus",
    label: "حالة القطيع",
    options: [
      { value: "Healthy", label: "سليم" },
      { value: "Sick", label: "مريض" },
      { value: "Under Treatment", label: "تحت العلاج" },
    ],
  },
  {
    key: "complying",
    label: "الامتثال",
    options: [
      { value: "Comply", label: "ملتزم" },
      { value: "Not Comply", label: "غير ملتزم" },
    ],
  },
];

export default function ParasiteControlPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ParasiteControl | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const { checkPermission } = usePermissions();
  const queryClient = useQueryClient();

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

  // Fetch parasite control data using React Query with pagination and filters
  const { data: parasiteControlData, isLoading, refetch } = useQuery({
    queryKey: ['parasite-control', currentPage, pageSize, filters, dateRange],
    queryFn: () => {
      const apiParams = filtersToApiParams({ ...filters, dateRange });
      return parasiteControlApi.getList({
        page: currentPage,
        limit: pageSize,
        ...apiParams,
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });


  const data = parasiteControlData?.data || [];
  const totalCount = parasiteControlData?.total || 0;
  const totalPages = parasiteControlData?.totalPages || 0;



  const handleDelete = async (id: string | number) => {
    try {
      await parasiteControlApi.delete(id);
      queryClient.invalidateQueries({ queryKey: ['parasite-control'] });
      queryClient.invalidateQueries({ queryKey: ['parasite-control-stats'] });
      toast.success('تم حذف السجل بنجاح');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('فشل في حذف السجل');
    }
  };

  // Handle bulk delete selected records
  const handleBulkDelete = async (selectedRows: ParasiteControl[]) => {
    console.log('🗑️ handleBulkDelete called with:', selectedRows.length, 'rows');
    try {
      const ids = selectedRows.map(row => row._id || row.serialNo);
      console.log('🔍 IDs to delete:', ids);
      const result = await parasiteControlApi.bulkDelete(ids);
      console.log('✅ Bulk delete result:', result);
      queryClient.invalidateQueries({ queryKey: ['parasite-control'] });
      queryClient.invalidateQueries({ queryKey: ['parasite-control-stats'] });
      toast.success(`تم حذف ${result.deletedCount || ids.length} سجل بنجاح`);
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      toast.error('فشل في حذف السجلات المحددة');
    }
  };

  // Handle delete all records
  const handleDeleteAll = async () => {
    try {
      const result = await parasiteControlApi.deleteAll();
      console.log('✅ Delete all result:', result);
      queryClient.invalidateQueries({ queryKey: ['parasite-control'] });
      queryClient.invalidateQueries({ queryKey: ['parasite-control-stats'] });
      toast.success(`تم حذف ${result.deletedCount || 'جميع'} السجلات بنجاح`);
    } catch (error) {
      console.error('❌ Delete all failed:', error);
      toast.error('فشل في حذف جميع السجلات');
    }
  };

  // This function is now handled in the dialog component
  // const handleSave = async (data: any) => {
  //   try {
  //     if (selectedItem) {
  //       await parasiteControlApi.update(selectedItem._id || selectedItem.serialNo, data);
  //       alert('تم تحديث السجل بنجاح');
  //     } else {
  //       await parasiteControlApi.create(data);
  //       alert('تم إضافة السجل بنجاح');
  //     }
  //     refetch(); // Refresh data
  //     setIsDialogOpen(false);
  //     setSelectedItem(null);
  //   } catch (error) {
  //     console.error('Save failed:', error);
  //     alert('فشل في حفظ السجل');
  //   }
  // };

  const handleEdit = (item: ParasiteControl) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleView = (item: ParasiteControl) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleImportSuccess = () => {
    // إلغاء جميع queries المتعلقة بمكافحة الطفيليات
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const queryKey = query.queryKey as string[];
        return queryKey[0] === 'parasite-control' || queryKey[0] === 'parasite-control-stats';
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">مكافحة الطفيليات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة سجلات مكافحة الطفيليات للحيوانات
            </p>
          </div>
          <ResponsiveActions
            primaryAction={checkPermission({ module: 'parasite-control', action: 'create' }) ? 
              createActions.add(handleAdd, "إضافة سجل جديد") : undefined
            }
            actions={[
              createActions.importDromo(() => setIsImportDialogOpen(true))
            ]}
            maxVisibleActions={2}
          />
          
          {/* ImportExportManager - Now visible for file upload */}
          <ImportExportManager
            exportEndpoint={apiConfig.endpoints.parasiteControl.export}
            importEndpoint={apiConfig.endpoints.parasiteControl.import}
            templateEndpoint={apiConfig.endpoints.parasiteControl.template}
            title="مكافحة الطفيليات"
            queryKey="parasite-control"
            acceptedFormats={[".csv", ".xlsx"]}
            maxFileSize={10}
            currentFilters={filters}
            currentDateRange={dateRange}
            onImportSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['parasite-control'] });
            }}
            onExportSuccess={() => {
              toast.success('تم تصدير البيانات بنجاح');
            }}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['parasite-control'] });
            }}
          />
        </div>

        {/* الفلاتر */}
        <TableFilters
          dateFilter={{
            enabled: true,
            label: "فلترة بتاريخ المكافحة",
            value: dateRange,
            onDateChange: updateDateRange,
          }}
          fieldFilters={getTableFilterConfig('parasiteControl')}
          filterValues={filters}
          onFiltersChange={updateFilters}
          defaultExpanded={hasActiveFilters}
          className="mb-6"
        />

        {/* Department Dashboard - Parasite Control */}
        <ParasiteControlStats />

        {/* Data Table */}
        <DataTable
          columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete, onView: handleView })}
          data={data}
          isLoading={isLoading}
          enableBulkDelete={true}
          onDeleteSelected={handleBulkDelete}
          onDeleteAll={handleDeleteAll}
          module="parasite-control"
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          showPagination={true}
          exportEndpoint="/api/parasite-control/export"
          exportFilename="مكافحة_الطفيليات"
          currentFilters={filters}
          currentDateRange={dateRange}
        />

        {/* Parasite Control Dialog */}
        <ParasiteControlDialog
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
          tableType="parasite_control"
          templateKey={process.env.NEXT_PUBLIC_DROMO_TEMPLATE_PARASITE || ''}
          onImportSuccess={handleImportSuccess}
        />
      </div>
    </MainLayout>
  );
}
