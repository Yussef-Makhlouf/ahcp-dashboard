"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";

import { getColumns } from "./components/columns";
import { LaboratoryDialog } from "./components/laboratory-dialog";
import { Button } from "@/components/ui/button";
import { Plus, FlaskConical, TestTube, TrendingUp, Activity, Clock, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Laboratory } from "@/types";
import { formatDate } from "@/lib/utils";
import { laboratoriesApi } from "@/lib/api/laboratories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { toast } from "sonner";
import { ImportExportManager } from "@/components/import-export";
import { ImportDialog } from "@/components/common/ImportDialog";
import { ResponsiveActions, createActions } from "@/components/ui/responsive-actions";
import { apiConfig } from "@/lib/api-config";

// تعريف حقول النموذج
const formFields = [
  {
    name: "sampleCode",
    label: "رمز العينة",
    type: "text" as const,
    required: true,
    placeholder: "LAB-001",
  },
  {
    name: "sampleType",
    label: "نوع العينة",
    type: "select" as const,
    required: true,
    options: [
      { value: "Blood", label: "دم" },
      { value: "Urine", label: "بول" },
      { value: "Feces", label: "براز" },
      { value: "Tissue", label: "نسيج" },
      { value: "Milk", label: "حليب" },
      { value: "Swab", label: "مسحة" },
    ],
  },
  {
    name: "collector",
    label: "جامع العينة",
    type: "text" as const,
    required: true,
    placeholder: "اسم جامع العينة",
  },
  {
    name: "date",
    label: "تاريخ الجمع",
    type: "date" as const,
    required: true,
  },
  {
    name: "speciesCounts.sheep",
    label: "عدد الأغنام",
    type: "number" as const,
    required: true,
  },
  {
    name: "speciesCounts.goats",
    label: "عدد الماعز",
    type: "number" as const,
    required: true,
  },
  {
    name: "speciesCounts.camel",
    label: "عدد الإبل",
    type: "number" as const,
    required: true,
  },
  {
    name: "speciesCounts.cattle",
    label: "عدد الأبقار",
    type: "number" as const,
    required: true,
  },
  {
    name: "speciesCounts.horse",
    label: "عدد الخيول",
    type: "number" as const,
    required: true,
  },
  {
    name: "positiveCases",
    label: "الحالات الإيجابية",
    type: "number" as const,
    required: true,
  },
  {
    name: "negativeCases",
    label: "الحالات السلبية",
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
    key: "sampleCode",
    title: "رمز العينة",
    width: "120px",
  },
  {
    key: "sampleType",
    title: "نوع العينة",
    render: (value: string) => {
      const typeLabels = {
        "Blood": "دم",
        "Urine": "بول",
        "Feces": "براز",
        "Tissue": "نسيج",
        "Milk": "حليب",
        "Swab": "مسحة"
      };
      return typeLabels[value as keyof typeof typeLabels] || value;
    },
    width: "100px",
  },
  {
    key: "collector",
    title: "جامع العينة",
    width: "140px",
  },
  {
    key: "client.birthDate",
    title: "تاريخ ميلاد المربي",
    render: (value: any, record: Laboratory) => {
      const birthDate = (record as any).client?.birthDate;
      return birthDate ? formatDate(birthDate) : "-";
    },
    width: "140px",
  },
  {
    key: "date",
    title: "تاريخ الجمع",
    render: (value: string) => formatDate(value),
    width: "120px",
  },
  {
    key: "totalSamples",
    title: "إجمالي العينات",
    render: (value: any, record: Laboratory) => {
      const total = Object.values(record.speciesCounts || {}).reduce((sum: number, count: any) => sum + (count || 0), 0);
      return <span className="font-medium">{total}</span>;
    },
    width: "120px",
  },
  {
    key: "positiveCases",
    title: "الحالات الإيجابية",
    render: (value: number) => (
      <Badge variant={value > 0 ? "destructive" : "default"}>
        {value}
      </Badge>
    ),
    width: "120px",
  },
  {
    key: "negativeCases",
    title: "الحالات السلبية",
    render: (value: number) => (
      <Badge variant="secondary">
        {value}
      </Badge>
    ),
    width: "120px",
  },
  {
    key: "positivityRate",
    title: "معدل الإيجابية",
    render: (value: any, record: Laboratory) => {
      const total = (record.positiveCases || 0) + (record.negativeCases || 0);
      const rate = total > 0 ? Math.round(((record.positiveCases || 0) / total) * 100) : 0;
      return (
        <span className={`font-medium ${rate > 20 ? 'text-red-600' : rate > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
          {rate}%
        </span>
      );
    },
    width: "100px",
  },
];

// فلاتر الجدول
const tableFilters = [
  {
    key: "sampleType",
    label: "نوع العينة",
    options: [
      { value: "Blood", label: "دم" },
      { value: "Urine", label: "بول" },
      { value: "Feces", label: "براز" },
      { value: "Tissue", label: "نسيج" },
      { value: "Milk", label: "حليب" },
      { value: "Swab", label: "مسحة" },
    ],
  },
];

export default function LaboratoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Laboratory | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const queryClient = useQueryClient();
  const { checkPermission } = usePermissions();

  // Fetch laboratories data using React Query with pagination
  const { data: laboratoriesData, isLoading, refetch } = useQuery({
    queryKey: ['laboratories', currentPage, pageSize],
    queryFn: () => laboratoriesApi.getList({
      page: currentPage,
      limit: pageSize,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['laboratories-stats'],
    queryFn: () => laboratoriesApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const data = laboratoriesData?.data || [];
  const totalCount = laboratoriesData?.total || 0;
  const totalPages = laboratoriesData?.totalPages || 0;


  const handleDelete = async (item: Laboratory) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      try {
        await laboratoriesApi.delete((item as any)._id || item.sampleCode);
        refetch(); // Refresh data after deletion
        // Refresh statistics as well
        queryClient.invalidateQueries({ queryKey: ['laboratories-stats'] });
        alert('تم حذف السجل بنجاح');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('فشل في حذف السجل');
      }
    }
  };

  // Handle bulk delete selected records
  const handleBulkDelete = async (selectedRows: Laboratory[]) => {
    console.log('🗑️ handleBulkDelete called with:', selectedRows.length, 'rows');
    try {
      const ids = selectedRows.map(row => (row as any)._id || row.sampleCode);
      console.log('🔍 IDs to delete:', ids);
      const result = await laboratoriesApi.bulkDelete(ids);
      console.log('✅ Bulk delete result:', result);
      queryClient.invalidateQueries({ queryKey: ['laboratories'] });
      queryClient.invalidateQueries({ queryKey: ['laboratories-stats'] });
      toast.success(`تم حذف ${result.deletedCount || ids.length} سجل بنجاح`);
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      toast.error('فشل في حذف السجلات المحددة');
    }
  };

  // Handle delete all records
  const handleDeleteAll = async () => {
    try {
      const result = await laboratoriesApi.deleteAll();
      console.log('✅ Delete all result:', result);
      queryClient.invalidateQueries({ queryKey: ['laboratories'] });
      queryClient.invalidateQueries({ queryKey: ['laboratories-stats'] });
      toast.success(`تم حذف ${result.deletedCount || 'جميع'} السجلات بنجاح`);
    } catch (error) {
      console.error('❌ Delete all failed:', error);
      toast.error('فشل في حذف جميع السجلات');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedItem) {
        await laboratoriesApi.update((selectedItem as any)._id || selectedItem.sampleCode, data);
        alert('تم تحديث السجل بنجاح');
      } else {
        await laboratoriesApi.create(data);
        alert('تم إضافة السجل بنجاح');
      }
      refetch(); // Refresh data
      // Refresh statistics as well
      queryClient.invalidateQueries({ queryKey: ['laboratories-stats'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Save failed:', error);
      alert('فشل في حفظ السجل');
    }
  };

  const handleEdit = (item: Laboratory) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleView = (item: Laboratory) => {
    // This will be handled by the DataTable's built-in view modal
    console.log("Viewing laboratory item:", item);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleImportSuccess = () => {
    // إلغاء جميع queries المتعلقة بالمختبرات
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const queryKey = query.queryKey as string[];
        return queryKey[0] === 'laboratories' || queryKey[0] === 'laboratories-stats';
      }
    });
    
    // إعادة تحميل البيانات فوراً
    if (refetch) refetch();
    
    toast.success('تم استيراد البيانات بنجاح - جاري تحديث الجدول');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">المختبرات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة سجلات الفحوصات المخبرية والعينات للحيوانات
            </p>
          </div>
          <ResponsiveActions
            primaryAction={checkPermission({ module: 'laboratories', action: 'create' }) ? 
              createActions.add(handleAdd, "إضافة عينة جديدة") : undefined
            }
            actions={[
              createActions.importDromo(() => setIsImportDialogOpen(true))
            ]}
            maxVisibleActions={2}
          />
          
          {/* ImportExportManager - Now visible for file upload */}
          <ImportExportManager
            exportEndpoint={apiConfig.endpoints.laboratories.export}
            importEndpoint={apiConfig.endpoints.laboratories.import}
            templateEndpoint={apiConfig.endpoints.laboratories.template}
            title="المختبرات"
            queryKey="laboratories"
            acceptedFormats={[".csv", ".xlsx"]}
            maxFileSize={10}
            onImportSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['laboratories'] });
            }}
            onExportSuccess={() => {
              toast.success('تم تصدير البيانات بنجاح');
            }}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['laboratories'] });
            }}
          />
        </div>

        {/* Stats Cards */}
        <div className="stats-grid grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي السجلات
              </CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                +15.2% من الشهر الماضي
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي العينات
              </CardTitle>
              <TestTube className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {data.reduce((total, record) => {
                  const counts = record.speciesCounts || {};
                  return total + (counts.sheep || 0) + (counts.goats || 0) + (counts.camel || 0) + (counts.cattle || 0) + (counts.horse || 0);
                }, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                من جميع الأنواع
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الحالات الإيجابية
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {data.reduce((total, record) => total + (record.positiveCases || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const totalPositive = data.reduce((total, record) => total + (record.positiveCases || 0), 0);
                  const totalNegative = data.reduce((total, record) => total + (record.negativeCases || 0), 0);
                  const totalCases = totalPositive + totalNegative;
                  return totalCases > 0 ? Math.round((totalPositive / totalCases) * 100) : 0;
                })()}% من الإجمالي
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                معدل الإيجابية
              </CardTitle>
              <Activity className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {(() => {
                const totalPositive = data.reduce((total, record) => total + (record.positiveCases || 0), 0);
                const totalNegative = data.reduce((total, record) => total + (record.negativeCases || 0), 0);
                const totalCases = totalPositive + totalNegative;
                const rate = totalCases > 0 ? Math.round((totalPositive / totalCases) * 100) : 0;
                
                return (
                  <div className={`text-2xl font-bold ${
                    rate > 20 ? 'text-red-600' : 
                    rate > 10 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {rate}%
                  </div>
                );
              })()}
              <p className="text-xs text-muted-foreground">
                نسبة الإيجابية العامة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete, onView: handleView })}
          data={data}
          isLoading={isLoading}
          onView={handleView}
          enableBulkDelete={true}
          onDeleteSelected={handleBulkDelete}
          onDeleteAll={handleDeleteAll}
          module="laboratories"
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          showPagination={true}
        />

        {/* Laboratory Dialog */}
        <LaboratoryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          laboratory={selectedItem || undefined}
          onSave={handleSave}
        />

        {/* Import Dialog */}
        <ImportDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          tableType="laboratory"
          templateKey={process.env.NEXT_PUBLIC_DROMO_TEMPLATE_LAB || ''}
          onImportSuccess={handleImportSuccess}
        />
      </div>
    </MainLayout>
  );
}
