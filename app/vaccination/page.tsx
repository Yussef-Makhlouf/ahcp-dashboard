"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vaccination } from "@/types";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { VaccinationDialog } from "./components/vaccination-dialog";
import { getColumns } from "./components/columns";
import { vaccinationApi } from "@/lib/api/vaccination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImportExportManager } from "@/components/import-export/import-export-manager";

export default function VaccinationPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Vaccination | null>(null);
  const queryClient = useQueryClient();

  // Fetch vaccination data using React Query
  const { data: vaccinationData, isLoading } = useQuery({
    queryKey: ['vaccination'],
    queryFn: () => vaccinationApi.getList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['vaccination-stats'],
    queryFn: () => vaccinationApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const data = vaccinationData?.data || [];

  const handleExport = async (type: "csv" | "pdf") => {
    if (type === "csv") {
      try {
        const blob = await vaccinationApi.exportToCsv();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vaccination-records-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        alert('فشل في تصدير البيانات');
      }
    }
  };

  const handleDelete = async (item: Vaccination) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      try {
        await vaccinationApi.delete(item.serialNo);
        queryClient.invalidateQueries({ queryKey: ['vaccination'] });
        queryClient.invalidateQueries({ queryKey: ['vaccination-stats'] });
      } catch (error) {
        console.error('Delete failed:', error);
        alert('فشل في حذف السجل');
      }
    }
  };

  const handleEdit = (item: Vaccination) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">التحصينات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة سجلات التحصينات واللقاحات
            </p>
          </div>
          <div className="flex gap-2">
            <ImportExportManager
              exportEndpoint="/vaccination/export"
              importEndpoint="/vaccination/import"
              templateEndpoint="/vaccination/template"
              title="التحصينات"
              queryKey="vaccination"
              acceptedFormats={[".csv", ".xlsx"]}
              maxFileSize={10}
            />
            <Button 
              onClick={() => {
                setSelectedItem(null);
                setIsDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة تحصين جديد
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي التحصينات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRecords || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                تحصينات وقائية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.preventiveVaccinations || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                تحصينات طوارئ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.emergencyVaccinations || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الحيوانات المحصنة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalAnimalsVaccinated || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete })}
          data={data}
          isLoading={isLoading}
          onExport={handleExport}
        />

        {/* Vaccination Dialog */}
        <VaccinationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={selectedItem}
          onSuccess={() => {
            setIsDialogOpen(false);
            setSelectedItem(null);
            queryClient.invalidateQueries({ queryKey: ['vaccination'] });
            queryClient.invalidateQueries({ queryKey: ['vaccination-stats'] });
          }}
        />
      </div>
    </MainLayout>
  );
}
