"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { TableFilters, useTableFilters } from "@/components/data-table/table-filters";
import { getTableFilterConfig, filtersToApiParams } from "@/lib/table-filter-configs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Heart, FileSpreadsheet, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { equineHealthApi } from "@/lib/api/equine-health";
import { EquineHealthDialog } from "./components/equine-health-dialog";
import { getColumns } from "./components/columns";
import { usePermissions } from "@/lib/hooks/usePermissions";
import type { EquineHealth } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImportExportManager } from "@/components/import-export";
import { ImportDialog } from "@/components/common/ImportDialog";
import { ResponsiveActions, createActions } from "@/components/ui/responsive-actions";
import { apiConfig } from "@/lib/api-config";
import { DateRange } from "react-day-picker";

export default function EquineHealthPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquineHealth | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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
    setPage(1);
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["equineHealth", page, search, filters, dateRange],
    queryFn: () => {
      const apiParams = filtersToApiParams({ ...filters, dateRange });
      console.log('🔍 Current filters:', filters);
      console.log('🔄 API params:', apiParams);
      console.log('📡 Final request params:', {
        page,
        limit: 30,
        search,
        ...apiParams,
      });
      return equineHealthApi.getList({
        page,
        limit: 30,
        search,
        ...apiParams,
      });
    },
  });




  const handleEdit = (item: EquineHealth) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      await equineHealthApi.delete(id);
      refetch();
    }
  };

  const handleView = (item: EquineHealth) => {
    // This will be handled by the DataTable's built-in view modal
    console.log("Viewing equine health item:", item);
  };

  const handleImportSuccess = () => {
    // إلغاء جميع queries المتعلقة بصحة الخيول
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const queryKey = query.queryKey as string[];
        return queryKey[0] === 'equineHealth';
      }
    });
    
    // إعادة تحميل البيانات فوراً
    refetch();
    
    toast.success('تم استيراد البيانات بنجاح - جاري تحديث الجدول');
  };

  // Handle bulk delete selected records
  const handleBulkDelete = async (selectedRows: EquineHealth[]) => {
    console.log('🗑️ handleBulkDelete called with:', selectedRows.length, 'rows');
    try {
      const ids: (string | number)[] = selectedRows
        .map(row => row._id || row.serialNo)
        .filter(id => id !== undefined && id !== null && id !== '') as (string | number)[];
      const result = await equineHealthApi.bulkDelete(ids);
      console.log('✅ Bulk delete result:', result);
      toast.success(`تم حذف ${result.deletedCount} سجل بنجاح`);
      refetch();
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      toast.error('فشل في حذف السجلات المحددة');
    }
  };

  // Calculate statistics
  const totalRecords = data?.total || 0;
  const totalHorses = data?.data?.reduce((sum, item) => sum + (item.horseCount || 0), 0) || 0;
  const clinicalExaminations = data?.data?.filter(item => item.interventionCategory === "Clinical Examination").length || 0;
  const surgicalOperations = data?.data?.filter(item => item.interventionCategory === "Surgical Operation").length || 0;
  const ultrasonographyCases = data?.data?.filter(item => item.interventionCategory === "Ultrasonography").length || 0;
  const labAnalysisCases = data?.data?.filter(item => item.interventionCategory === "Lab Analysis").length || 0;
  const farrieryCases = data?.data?.filter(item => item.interventionCategory === "Farriery").length || 0;
  const followUpRequired = data?.data?.filter(item => item.followUpRequired).length || 0;
  const closedRequests = data?.data?.filter(item => item.request?.situation === "Closed").length || 0;
  const surgicalShare = totalRecords > 0 ? ((surgicalOperations / totalRecords) * 100).toFixed(1) : '0.0';
  const averageHorses = totalRecords > 0 ? (totalHorses / totalRecords).toFixed(1) : '0.0';
  const activeCategories = [
    clinicalExaminations,
    surgicalOperations,
    ultrasonographyCases,
    labAnalysisCases,
    farrieryCases
  ].filter(count => count > 0).length;

  const interventionStats = [
    {
      key: 'clinical-examination',
      title: 'الفحص السريري',
      value: clinicalExaminations,
      background: 'bg-orange-100',
      accent: 'text-orange-600'
    },
    {
      key: 'surgical-operation',
      title: 'العمليات الجراحية',
      value: surgicalOperations,
      background: 'bg-red-100',
      accent: 'text-red-600'
    },
    {
      key: 'ultrasonography',
      title: 'التصوير بالموجات فوق الصوتية',
      value: ultrasonographyCases,
      background: 'bg-purple-100',
      accent: 'text-purple-600'
    },
    {
      key: 'lab-analysis',
      title: 'التحاليل المخبرية',
      value: labAnalysisCases,
      background: 'bg-blue-100',
      accent: 'text-blue-600'
    },
    {
      key: 'farriery',
      title: 'خدمات الحدادة',
      value: farrieryCases,
      background: 'bg-emerald-100',
      accent: 'text-emerald-600'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">صحة الخيول</h1>
            <p className="text-muted-foreground mt-2">
              إدارة خدمات صحة الخيول والفحوصات الطبية
            </p>
          </div>
          <ResponsiveActions
            primaryAction={checkPermission({ module: 'equine-health', action: 'create' }) ? 
              createActions.add(() => {
                setSelectedItem(null);
                setIsDialogOpen(true);
              }, "إضافة سجل جديد") : undefined
            }
            actions={[
              createActions.importDromo(() => setIsImportDialogOpen(true))
            ]}
            maxVisibleActions={2}
          />
          
          {/* ImportExportManager - Now visible for file upload */}
          <ImportExportManager
            exportEndpoint={apiConfig.endpoints.equineHealth.export}
            importEndpoint={apiConfig.endpoints.equineHealth.import}
            templateEndpoint={apiConfig.endpoints.equineHealth.template}
            title="صحة الخيول"
            queryKey="equineHealth"
            acceptedFormats={[".csv", ".xlsx"]}
            maxFileSize={10}
            currentFilters={filters}
            currentDateRange={dateRange}
            onImportSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['equineHealth'] });
            }}
            onExportSuccess={() => {
              toast.success('تم تصدير البيانات بنجاح');
            }}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['equineHealth'] });
            }}
          />
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <Heart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
                <p className="text-2xl font-bold">{totalRecords}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-green-100 p-2">
                <Heart className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الخيول</p>
                <p className="text-2xl font-bold">{totalHorses}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Heart className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">سجلات تتطلب متابعة</p>
                <p className="text-2xl font-bold">{followUpRequired}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Heart className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الطلبات المغلقة</p>
                <p className="text-2xl font-bold">{closedRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Intervention Breakdown */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
          {interventionStats.map((stat) => (
            <div key={stat.key} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className={`rounded-lg p-2 ${stat.background}`}>
                  <Heart className={`h-4 w-4 ${stat.accent}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">متوسط عدد الخيول لكل سجل</p>
            <p className="text-2xl font-bold">{averageHorses}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">عدد الفئات النشطة</p>
            <p className="text-2xl font-bold">{activeCategories}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">نسبة العمليات الجراحية</p>
            <p className="text-2xl font-bold">{`${surgicalShare}%`}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث في سجلات صحة الخيول..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page when search changes
            }}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="rounded-lg border bg-card p-4">
          <TableFilters
            fieldFilters={getTableFilterConfig("equineHealth")}
            filterValues={filters}
            onFiltersChange={(newFilters) => {
              updateFilters(newFilters);
              setPage(1); // Reset to first page when filters change
            }}
            defaultExpanded={hasActiveFilters}
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete, onView: handleView })}
          data={data?.data || []}
          isLoading={isLoading}
          enableBulkDelete={true}
          onDeleteSelected={handleBulkDelete}
          module="equine-health"
          totalCount={data?.total || 0}
          currentPage={page}
          totalPages={data?.totalPages || 0}
          onPageChange={setPage}
          pageSize={30}
          showPagination={true}
        />

        {/* Dialog */}
        <EquineHealthDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={selectedItem}
          onSuccess={() => {
            setIsDialogOpen(false);
            refetch();
          }}
        />

        {/* Import Dialog */}
        <ImportDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          tableType="equine_health"
          templateKey={process.env.NEXT_PUBLIC_DROMO_TEMPLATE_EQUINE || ''}
          onImportSuccess={handleImportSuccess}
        />
      </div>
    </MainLayout>
  );
}
