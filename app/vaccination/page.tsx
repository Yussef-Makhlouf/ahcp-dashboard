"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Syringe, Shield, TrendingUp, Activity, Clock, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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


export default function VaccinationPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Vaccination | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const queryClient = useQueryClient();
  const { checkPermission } = usePermissions();

  // Fetch vaccination data using React Query with pagination
  const { data: vaccinationData, isLoading, refetch } = useQuery({
    queryKey: ['vaccination', currentPage, pageSize],
    queryFn: () => vaccinationApi.getList({
      page: currentPage,
      limit: pageSize,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['vaccination-stats'],
    queryFn: () => vaccinationApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const data = vaccinationData?.data || [];
  const totalCount = vaccinationData?.total || 0;
  const totalPages = vaccinationData?.totalPages || 0;



  const handleDelete = async (item: Vaccination) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      try {
        // Use _id for deletion, fallback to serialNo if _id is not available
        const deleteId = item._id || item.id || item.serialNo;
        await vaccinationApi.delete(deleteId);
        queryClient.invalidateQueries({ queryKey: ['vaccination'] });
        queryClient.invalidateQueries({ queryKey: ['vaccination-stats'] });
        toast.success('تم حذف السجل بنجاح');
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error('فشل في حذف السجل');
      }
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

        {/* Stats Cards */}
        <div className="stats-grid grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي السجلات
              </CardTitle>
              <Syringe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRecords || 0}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% من الشهر الماضي
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                التطعيمات الوقائية
              </CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.preventiveVaccinations || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalRecords ? Math.round((stats.preventiveVaccinations / stats.totalRecords) * 100) : 0}% من الإجمالي
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                تطعيمات الطوارئ
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.emergencyVaccinations || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalRecords ? Math.round((stats.emergencyVaccinations / stats.totalRecords) * 100) : 0}% من الإجمالي
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الحيوانات المطعمة
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalAnimalsVaccinated || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                حيوان مطعم
              </p>
            </CardContent>
          </Card>
        </div>


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
