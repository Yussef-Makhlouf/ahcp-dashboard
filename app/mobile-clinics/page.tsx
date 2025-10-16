"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { ImportExportManager } from "@/components/import-export/import-export-manager";
import { getColumns } from "./components/columns";
import { MobileClinicDialog } from "./components/mobile-clinic-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Truck, Heart, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MobileClinic } from "@/types";
import { formatDate } from "@/lib/utils";
import { mobileClinicsApi } from "@/lib/api/mobile-clinics";
import { useQuery } from "@tanstack/react-query";
import { usePermissions } from "@/lib/hooks/usePermissions";

// تعريف حقول النموذج
const formFields = [
  {
    name: "date",
    label: "تاريخ الزيارة",
    type: "date" as const,
    required: true,
  },
  {
    name: "client.name",
    label: "اسم المربي",
    type: "text" as const,
    required: true,
    placeholder: "أدخل اسم المربي",
  },
  {
    name: "client.nationalId",
    label: "رقم الهوية",
    type: "text" as const,
    required: true,
    placeholder: "1234567890",
  },
  {
    name: "client.phone",
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
    name: "farmLocation",
    label: "موقع المزرعة",
    type: "text" as const,
    required: true,
    placeholder: "موقع المزرعة",
  },
  {
    name: "animalCounts.sheep",
    label: "عدد الأغنام",
    type: "number" as const,
    required: true,
  },
  {
    name: "animalCounts.goats",
    label: "عدد الماعز",
    type: "number" as const,
    required: true,
  },
  {
    name: "animalCounts.camel",
    label: "عدد الإبل",
    type: "number" as const,
    required: true,
  },
  {
    name: "animalCounts.horse",
    label: "عدد الخيول",
    type: "number" as const,
    required: true,
  },
  {
    name: "animalCounts.cattle",
    label: "عدد الأبقار",
    type: "number" as const,
    required: true,
  },
  {
    name: "diagnosis",
    label: "التشخيص",
    type: "textarea" as const,
    required: true,
    placeholder: "وصف التشخيص",
  },
  {
    name: "interventionCategory",
    label: "فئة التدخل",
    type: "select" as const,
    required: true,
    options: [
      { value: "Emergency", label: "طارئ" },
      { value: "Routine", label: "روتيني" },
      { value: "Follow-up", label: "متابعة" },
    ],
  },
  {
    name: "treatment",
    label: "العلاج",
    type: "textarea" as const,
    required: true,
    placeholder: "وصف العلاج المقدم",
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
    key: "client.name",
    title: "اسم المربي",
    render: (value: any, record: MobileClinic) => record.client?.name || "-",
  },
  {
    key: "farmLocation",
    title: "موقع المزرعة",
    width: "140px",
  },
  {
    key: "supervisor",
    title: "المشرف",
    width: "120px",
  },
  {
    key: "totalAnimals",
    title: "إجمالي الحيوانات",
    render: (value: any, record: MobileClinic) => {
      // Use backend virtual field first, then calculate from animalCounts, then legacy fields
      let total = record.totalAnimals || 0;
      
      if (!total && record.animalCounts) {
        total = (record.animalCounts.sheep || 0) + 
                (record.animalCounts.goats || 0) + 
                (record.animalCounts.camel || 0) + 
                (record.animalCounts.horse || 0) + 
                (record.animalCounts.cattle || 0);
      }
      
      // Fallback to legacy fields
      if (!total) {
        total = (record.sheep || 0) + (record.goats || 0) + 
                (record.camel || 0) + (record.horse || 0) + 
                (record.cattle || 0);
      }
      
      return <span className="font-medium">{total} رأس</span>;
    },
    width: "120px",
  },
  {
    key: "interventionCategory",
    title: "فئة التدخل",
    render: (value: string) => (
      <Badge 
        variant={
          value === "Emergency" ? "destructive" : 
          value === "Routine" ? "default" : 
          "secondary"
        }
      >
        {value === "Emergency" ? "طارئ" : 
         value === "Routine" ? "روتيني" : 
         "متابعة"}
      </Badge>
    ),
    width: "120px",
  },
  {
    key: "diagnosis",
    title: "التشخيص",
    render: (value: string) => (
      <div className="max-w-xs truncate" title={value}>
        {value}
      </div>
    ),
    width: "200px",
  },
];

// فلاتر الجدول
const tableFilters = [
  {
    key: "interventionCategory",
    label: "فئة التدخل",
    options: [
      { value: "Emergency", label: "طارئ" },
      { value: "Routine", label: "روتيني" },
      { value: "Follow-up", label: "متابعة" },
    ],
  },
];

export default function MobileClinicsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MobileClinic | null>(null);
  const { checkPermission } = usePermissions();

  // Fetch mobile clinics data using React Query
  const { data: mobileClinicsData, isLoading, refetch } = useQuery({
    queryKey: ['mobile-clinics'],
    queryFn: () => mobileClinicsApi.getList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // استخدام React Query للإحصائيات
  const { data: stats } = useQuery({
    queryKey: ['mobile-clinics-stats'],
    queryFn: () => mobileClinicsApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const data = mobileClinicsData?.data || [];


  const handleExport = async (type: "csv" | "pdf") => {
    if (type === "csv") {
      try {
        const blob = await mobileClinicsApi.exportToCsv();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mobile-clinics-records-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        alert('فشل في تصدير البيانات');
      }
    }
  };

  const handleDelete = async (item: MobileClinic) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      try {
        // استخدام _id أو serialNo للحذف
        const deleteId = item._id || item.serialNo;
        await mobileClinicsApi.delete(deleteId);
        refetch(); // Refresh data after deletion
        alert('تم حذف السجل بنجاح');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('فشل في حذف السجل');
      }
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedItem) {
        // استخدام _id أو serialNo للتحديث
        const updateId = selectedItem._id || selectedItem.serialNo;
        await mobileClinicsApi.update(updateId, data);
        alert('تم تحديث السجل بنجاح');
      } else {
        await mobileClinicsApi.create(data);
        alert('تم إضافة السجل بنجاح');
      }
      refetch(); // Refresh data
      setIsDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Save failed:', error);
      alert('فشل في حفظ السجل');
    }
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: MobileClinic) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleView = (item: MobileClinic) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">العيادات المتنقلة</h1>
            <p className="text-muted-foreground mt-2">
              إدارة سجلات زيارات العيادات المتنقلة
            </p>
          </div>
          <div className="flex gap-2">
            <ImportExportManager
              exportEndpoint="/mobile-clinics/export"
              importEndpoint="/mobile-clinics/import"
              templateEndpoint="/mobile-clinics/template"
              title="العيادات المتنقلة"
              queryKey="mobile-clinics"
              acceptedFormats={[".csv", ".xlsx"]}
              maxFileSize={10}
            />
            {checkPermission({ module: 'mobile-clinics', action: 'create' }) && (
              <Button onClick={handleAdd} className="h-9 px-3 " >
                <Plus className="h-4 w-4 mr-2" />
                إضافة زيارة جديدة
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي الزيارات
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRecords || 0}</div>
              <p className="text-xs text-muted-foreground">
                +12.5% من الشهر الماضي
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الزيارات هذا الشهر
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.recordsThisMonth || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                زيارة هذا الشهر
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الحيوانات المفحوصة
              </CardTitle>
              <Heart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalAnimalsExamined || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                رأس حيوان
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الحالات الطارئة
              </CardTitle>
              <Activity className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats?.emergencyCases || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                حالة طارئة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete, onView: handleView })}
          data={data}
          isLoading={isLoading}
          onExport={handleExport}
        />

        {/* Mobile Clinic Dialog */}
        <MobileClinicDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          clinic={selectedItem || undefined}
          onSave={handleSave}
        />
      </div>
    </MainLayout>
  );
}
