"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Upload, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { equineHealthApi } from "@/lib/api/equine-health";
import { EquineHealthDialog } from "./components/equine-health-dialog";
import { getColumns } from "./components/columns";
import { usePermissions } from "@/lib/hooks/usePermissions";
import type { EquineHealth } from "@/types";

export default function EquineHealthPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquineHealth | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { checkPermission } = usePermissions();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["equineHealth", page, search],
    queryFn: () =>
      equineHealthApi.getList({
        page,
        limit: 20,
        search,
      }),
  });

  const handleExport = async (type: "csv" | "pdf") => {
    if (type === "csv") {
      const blob = await equineHealthApi.exportToCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `equine-health-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

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

  // Calculate statistics
  const totalRecords = data?.total || 0;
  const totalHorses = data?.data?.reduce((sum, item) => sum + (item.horseCount || 0), 0) || 0;
  const emergencyCases = data?.data?.filter(item => item.interventionCategory === "Emergency").length || 0;
  const routineCases = data?.data?.filter(item => item.interventionCategory === "Routine").length || 0;
  const preventiveCases = data?.data?.filter(item => item.interventionCategory === "Preventive").length || 0;
  const followUpRequired = data?.data?.filter(item => item.followUpRequired).length || 0;
  const closedRequests = data?.data?.filter(item => item.request?.situation === "Closed").length || 0;
  const surgicalOps = data?.data?.filter(item => item.interventionCategory === "Performance").length || 0;

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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-purple-300 hover:bg-purple-50 hover:border-purple-400 text-purple-700 hover:text-purple-800">
              <Upload className="ml-2 h-4 w-4" />
              استيراد
            </Button>
            {checkPermission({ module: 'equine-health', action: 'create' }) && (
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setIsDialogOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة سجل جديد
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
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
              <div className="rounded-lg bg-red-100 p-2">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">حالات الطوارئ</p>
                <p className="text-2xl font-bold">{emergencyCases}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <Heart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الفحوصات الروتينية</p>
                <p className="text-2xl font-bold">{routineCases}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-green-100 p-2">
                <Heart className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الفحوصات الوقائية</p>
                <p className="text-2xl font-bold">{preventiveCases}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Heart className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تتطلب متابعة</p>
                <p className="text-2xl font-bold">{followUpRequired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">الطلبات المغلقة</p>
            <p className="text-2xl font-bold text-green-600">{closedRequests}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">متوسط عدد الخيول لكل سجل</p>
            <p className="text-2xl font-bold">{totalRecords > 0 ? (totalHorses / totalRecords).toFixed(1) : 0}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">نسبة العمليات الجراحية</p>
            <p className="text-2xl font-bold">{totalRecords > 0 ? ((surgicalOps / totalRecords) * 100).toFixed(1) + '%' : '0%'}</p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete })}
          data={data?.data || []}
          isLoading={isLoading}
          onExport={handleExport}
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
      </div>
    </MainLayout>
  );
}
