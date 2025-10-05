// "use client";

// import { useState } from "react";
// import { MainLayout } from "@/components/layout/main-layout";
// import { DataTable } from "@/components/data-table/data-table";
// import { Button } from "@/components/ui/button";
// import { Plus, FileDown, Upload } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { parasiteControlApi } from "@/lib/api/parasite-control";
// import { ParasiteControlDialog } from "./components/parasite-control-dialog";
// import { columns } from "./components/columns";
// import type { ParasiteControl } from "@/types";

// export default function ParasiteControlPage() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<ParasiteControl | null>(null);
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");

//   const { data, isLoading, error, refetch } = useQuery({
//     queryKey: ["parasiteControl", page, search],
//     queryFn: () =>
//       parasiteControlApi.getList({
//         page,
//         limit: 20,
//         search,
//       }),
//     retry: 2,
//     retryDelay: 1000,
//   });

//   const handleExport = async (type: "csv" | "pdf") => {
//     try {
//     if (type === "csv") {
//       const blob = await parasiteControlApi.exportToCsv();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `parasite-control-${new Date().toISOString().split("T")[0]}.csv`;
//       a.click();
//         window.URL.revokeObjectURL(url);
//       }
//     } catch (error) {
//       console.error("Error exporting data:", error);
//       alert("فشل في تصدير البيانات. يرجى المحاولة مرة أخرى.");
//     }
//   };

//   const handleEdit = (item: ParasiteControl) => {
//     setSelectedItem(item);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (id: string | number) => {
//     if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
//       try {
//       await parasiteControlApi.delete(id);
//       refetch();
//       } catch (error) {
//         console.error("Error deleting record:", error);
//         alert("فشل في حذف السجل. يرجى المحاولة مرة أخرى.");
//       }
//     }
//   };

//   // Handle error state
//   if (error) {
//     return (
//       <MainLayout>
//         <div className="space-y-6">
//           <div className="flex flex-col items-center justify-center py-12">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ في جلب البيانات</h2>
//               <p className="text-gray-600 mb-6">
//                 {error instanceof Error ? error.message : 'حدث خطأ غير متوقع'}
//               </p>
//               <Button 
//                 onClick={() => refetch()}
//                 className="bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 إعادة المحاولة
//               </Button>
//             </div>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       <div className="space-y-6">
        
//         {/* Header */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold">مكافحة الطفيليات</h1>
//             <p className="text-muted-foreground mt-2">
//               إدارة سجلات مكافحة الطفيليات والرش
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <Button variant="outline" size="sm" className="border-orange-300 hover:bg-orange-50 hover:border-orange-400 text-orange-700 hover:text-orange-800">
//               <Upload className="ml-2 h-4 w-4" />
//               استيراد
//             </Button>
//             <Button
//               onClick={() => {
//                 setSelectedItem(null);
//                 setIsDialogOpen(true);
//               }}
//               className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
//             >
//               <Plus className="ml-2 h-4 w-4" />
//               إضافة سجل جديد
//             </Button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid gap-4 md:grid-cols-4">
//           <div className="rounded-xl border bg-card p-4">
//             <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
//             <p className="text-2xl font-bold">{data?.total || 0}</p>
//           </div>
//           <div className="rounded-xl border bg-card p-4">
//             <p className="text-sm text-muted-foreground">تم الرش</p>
//             <p className="text-2xl font-bold text-green-600">
//               {data?.data.filter((d) => d.insecticide.status === "Sprayed").length || 0}
//             </p>
//           </div>
//           <div className="rounded-xl border bg-card p-4">
//             <p className="text-sm text-muted-foreground">لم يتم الرش</p>
//             <p className="text-2xl font-bold text-red-600">
//               {data?.data.filter((d) => d.insecticide.status === "Not Sprayed").length || 0}
//             </p>
//           </div>
//           <div className="rounded-xl border bg-card p-4">
//             <p className="text-sm text-muted-foreground">الطلبات المفتوحة</p>
//             <p className="text-2xl font-bold text-yellow-600">
//               {data?.data.filter((d) => d.request.situation === "Open").length || 0}
//             </p>
//           </div>
//         </div>

//         {/* Data Table */}
//         <DataTable
//           columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
//           data={data?.data || []}
//           isLoading={isLoading}
//           onExport={handleExport}
//         />

//         {/* Dialog */}
//         <ParasiteControlDialog
//           open={isDialogOpen}
//           onOpenChange={setIsDialogOpen}
//           item={selectedItem}
//           onSuccess={() => {
//             setIsDialogOpen(false);
//             refetch();
//           }}
//         />
//       </div>
//     </MainLayout>
//   );
// }
"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { ImportExportManager } from "@/components/import-export/import-export-manager";
import { getColumns } from "./components/columns";
import { ParasiteControlDialog } from "./components/parasite-control-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Bug, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParasiteControl } from "@/types";
import { formatDate } from "@/lib/utils";
import { parasiteControlApi } from "@/lib/api/parasite-control";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ParasiteControl | null>(null);

  // Fetch parasite control data using React Query
  const { data: parasiteControlData, isLoading, refetch } = useQuery({
    queryKey: ['parasite-control'],
    queryFn: () => parasiteControlApi.getList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['parasite-control-stats'],
    queryFn: () => parasiteControlApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const data = parasiteControlData?.data || [];

  const handleExport = async (type: "csv" | "pdf") => {
    if (type === "csv") {
      try {
        const blob = await parasiteControlApi.exportToCsv();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `parasite-control-records-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        alert('فشل في تصدير البيانات');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      try {
        await parasiteControlApi.delete(id);
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
        await parasiteControlApi.update(selectedItem.serialNo, data);
        alert('تم تحديث السجل بنجاح');
      } else {
        await parasiteControlApi.create(data);
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

  const handleEdit = (item: ParasiteControl) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleView = (item: ParasiteControl) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
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
            <ImportExportManager
              exportEndpoint="/parasite-control/export"
              importEndpoint="/parasite-control/import"
              templateEndpoint="/parasite-control/template"
              title="مكافحة الطفيليات"
              queryKey="parasite-control"
              acceptedFormats={[".csv", ".xlsx"]}
              maxFileSize={10}
            />
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة سجل جديد
            </Button>
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
        <DataTable
          columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete, onView: handleView })}
          data={data}
          isLoading={isLoading}
          onExport={handleExport}
        />

        {/* Parasite Control Dialog */}
        <ParasiteControlDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={selectedItem}
          onSuccess={() => {
            refetch();
            setIsDialogOpen(false);
            setSelectedItem(null);
          }}
        />
      </div>
    </MainLayout>
  );
}
