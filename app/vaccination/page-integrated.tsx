"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ApiDataTable } from "@/components/data-table/api-data-table";
import { ApiForm } from "@/components/forms/api-form";

import { Button } from "@/components/ui/button";
import { Plus, Syringe, Shield, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vaccination } from "@/types";
import { formatDate } from "@/lib/utils";
import { vaccinationApi } from "@/lib/api/vaccination";
import { useQuery } from "@tanstack/react-query";

// تعريف حقول النموذج
const formFields = [
  {
    name: "date",
    label: "تاريخ التحصين",
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
    name: "farmLocation",
    label: "موقع المزرعة",
    type: "text" as const,
    required: true,
    placeholder: "موقع المزرعة",
  },
  {
    name: "team",
    label: "الفريق",
    type: "text" as const,
    required: true,
    placeholder: "اسم الفريق",
  },
  {
    name: "vaccineType",
    label: "نوع اللقاح",
    type: "text" as const,
    required: true,
    placeholder: "نوع اللقاح المستخدم",
  },
  {
    name: "vaccineCategory",
    label: "فئة اللقاح",
    type: "select" as const,
    required: true,
    options: [
      { value: "Preventive", label: "وقائي" },
      { value: "Emergency", label: "طارئ" },
    ],
  },
  {
    name: "herdHealth",
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
    name: "animalsHandling",
    label: "سهولة التعامل مع الحيوانات",
    type: "select" as const,
    required: true,
    options: [
      { value: "Easy", label: "سهل" },
      { value: "Difficult", label: "صعب" },
    ],
  },
  {
    name: "labours",
    label: "توفر العمالة",
    type: "select" as const,
    required: true,
    options: [
      { value: "Available", label: "متوفرة" },
      { value: "Not Available", label: "غير متوفرة" },
    ],
  },
  {
    name: "reachableLocation",
    label: "سهولة الوصول للموقع",
    type: "select" as const,
    required: true,
    options: [
      { value: "Easy", label: "سهل الوصول" },
      { value: "Hard to reach", label: "صعب الوصول" },
    ],
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
    render: (value: any, record: Vaccination) => record.owner?.name || "-",
  },
  {
    key: "vaccineType",
    title: "نوع اللقاح",
    width: "140px",
  },
  {
    key: "vaccineCategory",
    title: "فئة اللقاح",
    render: (value: string) => (
      <Badge variant={value === "Preventive" ? "default" : "secondary"}>
        {value === "Preventive" ? "وقائي" : "طارئ"}
      </Badge>
    ),
    width: "100px",
  },
  {
    key: "herdHealth",
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
    key: "team",
    title: "الفريق",
    width: "120px",
  },
  {
    key: "supervisor",
    title: "المشرف",
    width: "120px",
  },
];

// فلاتر الجدول
const tableFilters = [
  {
    key: "vaccineCategory",
    label: "فئة اللقاح",
    options: [
      { value: "Preventive", label: "وقائي" },
      { value: "Emergency", label: "طارئ" },
    ],
  },
  {
    key: "herdHealth",
    label: "حالة القطيع",
    options: [
      { value: "Healthy", label: "سليم" },
      { value: "Sick", label: "مريض" },
      { value: "Under Treatment", label: "تحت العلاج" },
    ],
  },
];

export default function VaccinationPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Vaccination | null>(null);

  // استخدام React Query للإحصائيات
  const { data: stats } = useQuery({
    queryKey: ['vaccination-stats'],
    queryFn: () => vaccinationApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleAdd = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record: Vaccination) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleView = (record: Vaccination) => {
    console.log("View record:", record);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">التحصينات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة سجلات التحصينات والتطعيمات
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
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
              <Syringe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRecords || 0}</div>
              <p className="text-xs text-muted-foreground">
                +15.2% من الشهر الماضي
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                التحصينات الوقائية
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
                التحصينات الطارئة
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
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
                الحيوانات المحصنة
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalAnimalsVaccinated || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                إجمالي الحيوانات المحصنة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <ApiDataTable
          fetchData={vaccinationApi.getList}
          deleteItem={vaccinationApi.delete}
          exportData={vaccinationApi.exportToCsv}
          columns={tableColumns}
          title="سجلات التحصينات"
          queryKey="vaccination"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          searchPlaceholder="البحث في سجلات التحصين..."
          enableExport={true}
          enableDelete={true}
          filters={tableFilters}
        />

        {/* Form Dialog */}
        <ApiForm
          createItem={vaccinationApi.create}
          updateItem={vaccinationApi.update}
          fields={formFields}
          title="سجل التحصين"
          queryKey="vaccination"
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          editData={editingRecord}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingRecord(null);
          }}
        />
      </div>
    </MainLayout>
  );
}
