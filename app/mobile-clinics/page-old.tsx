"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Upload, Truck, Stethoscope, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MobileClinic } from "@/types";
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
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import { MobileClinicDialog } from "./components/mobile-clinic-dialog";

// Mock data for mobile clinics
const mockMobileClinicData: MobileClinic[] = [
  {
    serialNo: 1,
    date: "2025-09-07",
    owner: {
      name: "سامي أحمد",
      id: "MC1",
      birthDate: "1979-04-10",
      phone: "+201011112222"
    },
    location: { e: 30.1111, n: 31.2222 },
    supervisor: "د. محمد علي",
    vehicleNo: "MC1",
    // New fields from database schema
    farmLocation: "مزرعة الشمال",
    sheep: 20,
    goats: 15,
    camel: 2,
    horse: 1,
    cattle: 5,
    diagnosis: "التهاب رئوي",
    interventionCategory: "علاج",
    treatment: "مضادات حيوية",
    request: {
      date: "2025-09-07",
      situation: "Closed",
      fulfillingDate: "2025-09-07"
    },
    category: "عيادة متنقلة",
    remarks: "تم العلاج بنجاح"
  },
  {
    serialNo: 2,
    date: "2025-09-08",
    owner: {
      name: "منى حسن",
      id: "MC2",
      birthDate: "1985-08-15",
      phone: "01098887777"
    },
    location: { e: 30.2222, n: 31.3333 },
    supervisor: "د. سارة محمود",
    vehicleNo: "MC2",
    // New fields from database schema
    farmLocation: "مزرعة الجنوب",
    sheep: 30,
    goats: 25,
    camel: 0,
    horse: 3,
    cattle: 10,
    diagnosis: "طفيليات معوية",
    interventionCategory: "وقاية",
    treatment: "مضادات الطفيليات",
    request: {
      date: "2025-09-08",
      situation: "Closed",
      fulfillingDate: "2025-09-08"
    },
    category: "عيادة متنقلة",
    remarks: ""
  },
  {
    serialNo: 3,
    date: "2025-09-09",
    owner: {
      name: "عبدالله محمد",
      id: "MC3",
      birthDate: "1990-12-20",
      phone: "+201555666777"
    },
    location: { e: null, n: null },
    supervisor: "د. محمد علي",
    vehicleNo: "MC1",
    // New fields from database schema
    farmLocation: "مزرعة الشرق",
    sheep: 15,
    goats: 10,
    camel: 1,
    horse: 0,
    cattle: 3,
    diagnosis: "جروح وإصابات",
    interventionCategory: "علاج طارئ",
    treatment: "تنظيف وخياطة الجروح",
    request: {
      date: "2025-09-09",
      situation: "Open"
    },
    category: "عيادة متنقلة",
    remarks: "حالة طارئة"
  }
];

export default function MobileClinicsPage() {
  const [data, setData] = useState<MobileClinic[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<MobileClinic | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // محاكاة تحميل البيانات
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(mockMobileClinicData);
      setIsLoading(false);
    }, 1500);
  }, []);

  const columns: ColumnDef<MobileClinic>[] = [
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
      accessorKey: "farmLocation",
      header: "موقع المزرعة",
    },
    {
      accessorKey: "diagnosis",
      header: "التشخيص",
      cell: ({ row }) => {
        const diagnosis = row.getValue("diagnosis") as string;
        const diagnosisColors: Record<string, string> = {
          "التهاب رئوي": "bg-red-500 text-white border-red-600",
          "طفيليات معوية": "bg-yellow-500 text-white border-yellow-600",
          "جروح وإصابات": "bg-orange-500 text-white border-orange-600",
          "حمى": "bg-purple-500 text-white border-purple-600",
          "إسهال": "bg-blue-500 text-white border-blue-600",
        };
        return (
          <Badge className={diagnosisColors[diagnosis] || "bg-gray-500 text-white border-gray-600"}>
            {diagnosis}
          </Badge>
        );
      },
    },
    {
      accessorKey: "interventionCategory",
      header: "نوع التدخل",
      cell: ({ row }) => {
        const category = row.getValue("interventionCategory") as string;
        const categoryColors: Record<string, string> = {
          "علاج": "bg-blue-500 text-white border-blue-600",
          "وقاية": "bg-green-500 text-white border-green-600",
          "علاج طارئ": "bg-red-500 text-white border-red-600",
          "فحص": "bg-purple-500 text-white border-purple-600",
          "جراحة": "bg-orange-500 text-white border-orange-600",
        };
        return (
          <Badge className={categoryColors[category] || "bg-gray-500 text-white border-gray-600"}>
            {category}
          </Badge>
        );
      },
    },
    {
      id: "animals",
      header: "الحيوانات المعالجة",
      cell: ({ row }) => {
        const r = row.original;
        const total = r.sheep + r.goats + r.camel + r.horse + r.cattle;
        return (
          <div className="text-sm">
            <span className="font-medium">{total}</span>
            <span className="text-muted-foreground"> حيوان</span>
          </div>
        );
      },
    },
    {
      accessorKey: "request.situation",
      header: "حالة الطلب",
      cell: ({ row }) => {
        const situation = row.original.request.situation;
        const statusColors: Record<string, string> = {
          Closed: "bg-green-500 text-white border-green-600",
          Open: "bg-red-500 text-white border-red-600",
          Pending: "bg-yellow-500 text-white border-yellow-600",
        };
        const labels: Record<string, string> = {
          Closed: "مغلق",
          Open: "مفتوح",
          Pending: "معلق",
        };
        return (
          <Badge className={statusColors[situation] || "bg-gray-500 text-white border-gray-600"}>
            {labels[situation] || situation}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
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
                setSelectedClinic(row.original);
                setIsDialogOpen(true);
              }}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedClinic(row.original);
                setIsDialogOpen(true);
              }}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
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
    console.log("Exporting as", type);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">العيادات المتنقلة</h1>
            <p className="text-muted-foreground mt-2">
              إدارة سجلات العيادات البيطرية المتنقلة
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-teal-300 hover:bg-teal-50 hover:border-teal-400 text-teal-700 hover:text-teal-800">
              <Upload className="ml-2 h-4 w-4" />
              استيراد
            </Button>
            <Button 
              onClick={() => {
                setSelectedClinic(undefined);
                setIsDialogOpen(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة زيارة جديدة
            </Button>
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
              <div className="text-2xl font-bold">{data.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الحالات المعالجة
              </CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
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
                حالات طارئة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {data.filter(d => d.interventionCategory.includes("طارئ")).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الحيوانات المعالجة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {data.reduce((sum, d) => 
                  sum + d.sheep + d.goats + d.camel + d.horse + d.cattle, 0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          onExport={handleExport}
        />

        {/* Mobile Clinic Dialog */}
        <MobileClinicDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          clinic={selectedClinic}
          onSave={(clinicData) => {
            if (selectedClinic) {
              // Update existing clinic
              setData(data.map(c => c.serialNo === selectedClinic.serialNo ? clinicData : c));
            } else {
              // Add new clinic
              setData([...data, clinicData]);
            }
            setSelectedClinic(undefined);
          }}
        />
      </div>
    </MainLayout>
  );
}
