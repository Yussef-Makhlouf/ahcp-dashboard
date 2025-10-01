"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockVaccinationData } from "@/lib/mock/vaccination-data";
import type { Vaccination } from "@/types";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { VaccinationDialog } from "./components/vaccination-dialog";

export default function VaccinationPage() {
  const [data, setData] = useState(mockVaccinationData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Vaccination | null>(null);

  const columns: ColumnDef<Vaccination>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "serialNo",
      header: "الرقم المسلسل",
    },
    {
      accessorKey: "date",
      header: "التاريخ",
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      accessorKey: "owner.name",
      header: "اسم المربي",
    },
    {
      accessorKey: "owner.phone",
      header: "رقم الهاتف",
      cell: ({ row }) => {
        const phone = row.original.owner.phone;
        return <span dir="ltr">{formatPhoneNumber(phone)}</span>;
      },
    },
    {
      accessorKey: "vaccineType",
      header: "نوع اللقاح",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("vaccineType")}</Badge>
      ),
    },
    {
      id: "vaccinated",
      header: "الحيوانات المحصنة",
      cell: ({ row }) => {
        const herd = row.original.herd;
        const total = 
          (herd.sheep.vaccinated || 0) + 
          (herd.goats.vaccinated || 0) + 
          (herd.camel.vaccinated || 0) + 
          (herd.cattle.vaccinated || 0);
        return (
          <div className="text-sm">
            <span className="font-medium text-green-600">{total}</span>
            <span className="text-muted-foreground"> حيوان</span>
          </div>
        );
      },
    },
    {
      accessorKey: "herdHealth",
      header: "صحة القطيع",
      cell: ({ row }) => {
        const status = row.getValue("herdHealth") as string;
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          Healthy: "default",
          Sick: "destructive",
          "Under Treatment": "secondary",
        };
        const labels: Record<string, string> = {
          Healthy: "صحي",
          Sick: "مريض",
          "Under Treatment": "تحت العلاج",
        };
        return (
          <Badge variant={variants[status] || "default"}>
            {labels[status] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "request.situation",
      header: "حالة الطلب",
      cell: ({ row }) => {
        const situation = row.original.request.situation;
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          Closed: "default",
          Open: "destructive",
          Pending: "secondary",
        };
        const labels: Record<string, string> = {
          Closed: "مغلق",
          Open: "مفتوح",
          Pending: "معلق",
        };
        return (
          <Badge variant={variants[situation] || "default"}>
            {labels[situation] || situation}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setSelectedItem(item);
                setIsDialogOpen(true);
              }}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(item.serialNo)}
                className="text-red-600"
              >
                <Trash className="ml-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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

  const handleDelete = async (serialNo: number) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      setData(data.filter(item => item.serialNo !== serialNo));
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
          columns={columns}
          data={data}
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
