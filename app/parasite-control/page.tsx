"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parasiteControlApi } from "@/lib/api/parasite-control";
import { ParasiteControlDialog } from "./components/parasite-control-dialog";
import { columns } from "./components/columns";
import type { ParasiteControl } from "@/types";

export default function ParasiteControlPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ParasiteControl | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["parasiteControl", page, search],
    queryFn: () =>
      parasiteControlApi.getList({
        page,
        limit: 20,
        search,
      }),
  });

  const handleExport = async (type: "csv" | "pdf") => {
    if (type === "csv") {
      const blob = await parasiteControlApi.exportToCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parasite-control-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  const handleEdit = (item: ParasiteControl) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      await parasiteControlApi.delete(id);
      refetch();
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">مكافحة الطفيليات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة سجلات مكافحة الطفيليات والرش
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-orange-300 hover:bg-orange-50 hover:border-orange-400 text-orange-700 hover:text-orange-800">
              <Upload className="ml-2 h-4 w-4" />
              استيراد
            </Button>
            <Button
              onClick={() => {
                setSelectedItem(null);
                setIsDialogOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة سجل جديد
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
            <p className="text-2xl font-bold">{data?.total || 0}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">تم الرش</p>
            <p className="text-2xl font-bold text-green-600">
              {data?.data.filter((d) => d.insecticide.status === "Sprayed").length || 0}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">لم يتم الرش</p>
            <p className="text-2xl font-bold text-red-600">
              {data?.data.filter((d) => d.insecticide.status === "Not Sprayed").length || 0}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">الطلبات المفتوحة</p>
            <p className="text-2xl font-bold text-yellow-600">
              {data?.data.filter((d) => d.request.situation === "Open").length || 0}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
          data={data?.data || []}
          isLoading={isLoading}
          onExport={handleExport}
        />

        {/* Dialog */}
        <ParasiteControlDialog
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
