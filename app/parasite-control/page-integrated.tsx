"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ApiDataTable } from "@/components/data-table/api-data-table";
import { ApiForm } from "@/components/forms/api-form";

import { Button } from "@/components/ui/button";
import { Plus, Bug, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParasiteControl } from "@/types";
import { formatDate } from "@/lib/utils";
import { parasiteControlApi } from "@/lib/api/parasite-control";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { ProtectedButton } from "@/components/ui/protected-button";

// تعريف حقول النموذج
const formFields = [
  {
    name: "date",
    label: "تاريخ المكافحة",
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
    name: "owner.birthDate",
    label: "تاريخ ميلاد المربي",
    type: "date" as const,
    required: false,
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
    name: "herdLocation",
    label: "موقع القطيع",
    type: "text" as const,
    required: true,
    placeholder: "موقع المزرعة",
  },
  {
    name: "herdHealthStatus",
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
    name: "complying",
    label: "الامتثال للتعليمات",
    type: "select" as const,
    required: true,
    options: [
      { value: "Comply", label: "ملتزم" },
      { value: "Not Comply", label: "غير ملتزم" },
    ],
  },
  {
    name: "insecticide.type",
    label: "نوع المبيد",
    type: "text" as const,
    required: true,
    placeholder: "نوع المبيد المستخدم",
  },
  {
    name: "insecticide.volume_ml",
    label: "كمية المبيد (مل)",
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
    render: (value: any, record: ParasiteControl) => record.owner?.name || "-",
  },
  {
    key: "owner.birthDate",
    title: "تاريخ ميلاد المربي",
    render: (value: any, record: ParasiteControl) => {
      const birthDate = record.owner?.birthDate;
      if (!birthDate) return "-";
      const date = new Date(birthDate);
      return date.toLocaleDateString("en-GB", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    width: "140px",
  },
  {
    key: "owner.phone",
    title: "رقم الهاتف",
    render: (value: any, record: ParasiteControl) => record.owner?.phone || "-",
    width: "140px",
  },
  {
    key: "supervisor",
    title: "المشرف",
    width: "120px",
  },
  {
    key: "herdHealthStatus",
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
    key: "complying",
    title: "الامتثال",
    render: (value: string) => (
      <Badge variant={value === "Comply" ? "default" : "destructive"}>
        {value === "Comply" ? "ملتزم" : "غير ملتزم"}
      </Badge>
    ),
    width: "100px",
  },
  {
    key: "insecticide.type",
    title: "نوع المبيد",
    render: (value: any, record: ParasiteControl) => record.insecticide?.type || "-",
    width: "140px",
  },
];

// فلاتر الجدول
const tableFilters = [
  {
    key: "herdHealthStatus",
    label: "حالة القطيع",
    options: [
      { value: "Healthy", label: "سليم" },
      { value: "Sick", label: "مريض" },
      { value: "Under Treatment", label: "تحت العلاج" },
    ],
  },
  {
    key: "complying",
    label: "الامتثال",
    options: [
      { value: "Comply", label: "ملتزم" },
      { value: "Not Comply", label: "غير ملتزم" },
    ],
  },
];

export default function ParasiteControlPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ParasiteControl | null>(null);
  const { checkPermission, checkPermissionWithToast } = usePermissions();

  // استخدام React Query للإحصائيات
  const { data: stats } = useQuery({
    queryKey: ['parasite-control-stats'],
    queryFn: () => parasiteControlApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleAdd = () => {
    if (checkPermissionWithToast({ module: 'parasite-control', action: 'create' })) {
      setEditingRecord(null);
      setIsFormOpen(true);
    }
  };

  const handleEdit = (record: ParasiteControl) => {
    if (checkPermissionWithToast({ module: 'parasite-control', action: 'edit' })) {
      setEditingRecord(record);
      setIsFormOpen(true);
    }
  };

  const handleView = (record: ParasiteControl) => {
    // يمكن إضافة modal للعرض التفصيلي
    console.log("View record:", record);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">مكافحة الطفيليات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة سجلات مكافحة الطفيليات للحيوانات
            </p>
          </div>
          <div className="flex gap-2">
            {checkPermission({ module: 'parasite-control', action: 'create' }) && (
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة سجل جديد
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي السجلات
              </CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
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
                القطعان السليمة
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.healthyRecords || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalRecords ? Math.round((stats.healthyRecords / stats.totalRecords) * 100) : 0}% من الإجمالي
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                القطعان المريضة
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats?.sickRecords || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalRecords ? Math.round((stats.sickRecords / stats.totalRecords) * 100) : 0}% من الإجمالي
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                معدل الامتثال
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalRecords ? Math.round((stats.complyRecords / stats.totalRecords) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.complyRecords || 0} من {stats?.totalRecords || 0} سجل
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <ApiDataTable
          fetchData={parasiteControlApi.getList}
          deleteItem={parasiteControlApi.delete}
          exportData={parasiteControlApi.exportToCsv}
          columns={tableColumns}
          title="سجلات مكافحة الطفيليات"
          queryKey="parasite-control"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          searchPlaceholder="البحث في السجلات..."
          enableExport={true}
          enableDelete={true}
          filters={tableFilters}
        />

        {/* Form Dialog */}
        <ApiForm
          createItem={parasiteControlApi.create}
          updateItem={parasiteControlApi.update}
          fields={formFields}
          title="سجل مكافحة الطفيليات"
          queryKey="parasite-control"
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
