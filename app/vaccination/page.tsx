"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockVaccinationData } from "@/lib/mock/vaccination-data";
import type { Vaccination } from "@/types";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { VaccinationDialog } from "./components/vaccination-dialog";
import { getColumns } from "./components/columns";

export default function VaccinationPage() {
  const [data, setData] = useState<Vaccination[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Vaccination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // محاكاة تحميل البيانات
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(mockVaccinationData);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleExport = async (type: "csv" | "pdf") => {
    if (type === "csv") {
      // Create CSV content
      const headers = ["الرقم المسلسل", "التاريخ", "اسم المربي", "رقم الهاتف", "نوع اللقاح", "الحيوانات المحصنة", "حالة القطيع", "حالة الطلب"];
      const rows = data.map(vaccination => [
        vaccination.serialNo,
        vaccination.date,
        vaccination.owner.name,
        vaccination.owner.phone,
        vaccination.vaccineType,
        (vaccination.herd.sheep.vaccinated || 0) + (vaccination.herd.goats.vaccinated || 0) + (vaccination.herd.camel.vaccinated || 0) + (vaccination.herd.cattle.vaccinated || 0),
        vaccination.herdHealth,
        vaccination.request.situation,
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
      
      // Add BOM for UTF-8
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vaccination-records-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  const handleDelete = async (item: Vaccination) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      setIsLoading(true);
      // محاكاة عملية الحذف
      setTimeout(() => {
        setData(data.filter(dataItem => dataItem.serialNo !== item.serialNo));
        setIsLoading(false);
      }, 1000);
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
            <Button variant="outline" size="sm" className="border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-700 hover:text-blue-800">
              <Upload className="ml-2 h-4 w-4" />
              استيراد
            </Button>
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
              <div className="text-2xl font-bold">{data.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                تحصينات مكتملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.filter(d => d.request.situation === "Closed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                قيد التنفيذ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {data.filter(d => d.request.situation === "Open").length}
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
                {data.reduce((sum, d) => {
                  const herd = d.herd;
                  return sum + 
                    (herd.sheep.vaccinated || 0) + 
                    (herd.goats.vaccinated || 0) + 
                    (herd.camel.vaccinated || 0) + 
                    (herd.cattle.vaccinated || 0);
                }, 0)}
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
          }}
        />
      </div>
    </MainLayout>
  );
}
