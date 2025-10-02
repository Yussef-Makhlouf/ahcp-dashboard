"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, FlaskConical, TestTube, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Laboratory } from "@/types";
import { formatDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Eye, Printer } from "lucide-react";
import { LaboratoryDialog } from "./components/laboratory-dialog";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Mock data for laboratories
const mockLaboratoryData: Laboratory[] = [
  {
    sampleCode: "LAB001",
    sampleType: "دم",
    collector: "د. محمد علي",
    date: "2025-09-07",
    speciesCounts: {
      sheep: 10,
      goats: 5,
      camel: 2,
      cattle: 3,
      horse: 1,
    },
    positiveCases: 3,
    negativeCases: 18,
    remarks: "فحص روتيني للأمراض المعدية",
  },
  {
    sampleCode: "LAB002",
    sampleType: "براز",
    collector: "د. سارة محمود",
    date: "2025-09-08",
    speciesCounts: {
      sheep: 15,
      goats: 8,
      camel: 0,
      cattle: 5,
      horse: 0,
    },
    positiveCases: 7,
    negativeCases: 21,
    remarks: "فحص طفيليات معوية",
  },
  {
    sampleCode: "LAB003",
    sampleType: "بول",
    collector: "د. أحمد حسن",
    date: "2025-09-09",
    speciesCounts: {
      sheep: 8,
      goats: 6,
      camel: 1,
      cattle: 4,
      horse: 2,
    },
    positiveCases: 2,
    negativeCases: 19,
    remarks: "فحص وظائف الكلى",
  },
  {
    sampleCode: "LAB004",
    sampleType: "مسحة",
    collector: "د. فاطمة عبدالله",
    date: "2025-09-10",
    speciesCounts: {
      sheep: 12,
      goats: 7,
      camel: 3,
      cattle: 6,
      horse: 0,
    },
    positiveCases: 5,
    negativeCases: 23,
    remarks: "فحص بكتيري",
  },
  {
    sampleCode: "LAB005",
    sampleType: "أنسجة",
    collector: "د. خالد إبراهيم",
    date: "2025-09-11",
    speciesCounts: {
      sheep: 5,
      goats: 3,
      camel: 0,
      cattle: 2,
      horse: 1,
    },
    positiveCases: 4,
    negativeCases: 7,
    remarks: "فحص الأورام",
  },
];

// Chart data
const monthlyTestsData = [
  { month: "يناير", tests: 45, positive: 12, negative: 33 },
  { month: "فبراير", tests: 52, positive: 15, negative: 37 },
  { month: "مارس", tests: 61, positive: 18, negative: 43 },
  { month: "أبريل", tests: 58, positive: 14, negative: 44 },
  { month: "مايو", tests: 70, positive: 22, negative: 48 },
  { month: "يونيو", tests: 65, positive: 19, negative: 46 },
];

const sampleTypesData = [
  { type: "دم", count: 120 },
  { type: "براز", count: 85 },
  { type: "بول", count: 65 },
  { type: "مسحة", count: 95 },
  { type: "أنسجة", count: 35 },
];

export default function LaboratoriesPage() {
  const [data, setData] = useState<Laboratory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Laboratory | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // محاكاة تحميل البيانات
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(mockLaboratoryData);
      setIsLoading(false);
    }, 1500);
  }, []);

  const columns: ColumnDef<Laboratory>[] = [
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
      accessorKey: "sampleCode",
      header: "رمز العينة",
      cell: ({ row }) => (
        <div className="font-mono font-medium">{row.getValue("sampleCode")}</div>
      ),
    },
    {
      accessorKey: "sampleType",
      header: "نوع العينة",
      cell: ({ row }) => {
        const sampleType = row.getValue("sampleType") as string;
        const typeColors: Record<string, string> = {
          "دم": "bg-red-500 text-white border-red-600",
          "براز": "bg-yellow-500 text-white border-yellow-600",
          "بول": "bg-blue-500 text-white border-blue-600",
          "مسحة": "bg-purple-500 text-white border-purple-600",
          "أنسجة": "bg-green-500 text-white border-green-600",
        };
        return (
          <Badge className={typeColors[sampleType] || "bg-gray-500 text-white border-gray-600"}>
            {sampleType}
          </Badge>
        );
      },
    },
    {
      accessorKey: "collector",
      header: "جامع العينة",
    },
    {
      accessorKey: "date",
      header: "التاريخ",
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      id: "totalSamples",
      header: "إجمالي العينات",
      cell: ({ row }) => {
        const counts = row.original.speciesCounts;
        const total = counts.sheep + counts.goats + counts.camel + counts.cattle + counts.horse;
        return (
          <div className="text-sm">
            <span className="font-medium">{total}</span>
            <span className="text-muted-foreground"> عينة</span>
          </div>
        );
      },
    },
    {
      id: "results",
      header: "النتائج",
      cell: ({ row }) => {
        const positive = row.original.positiveCases;
        const negative = row.original.negativeCases;
        const total = positive + negative;
        const positivePercentage = total > 0 ? (positive / total) * 100 : 0;
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white border-red-600 text-xs">
                إيجابي: {positive}
              </Badge>
              <Badge className="bg-green-500 text-white border-green-600 text-xs">
                سلبي: {negative}
              </Badge>
            </div>
            <Progress value={positivePercentage} className="h-2" />
          </div>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "ملاحظات",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("remarks")}>
          {row.getValue("remarks")}
        </div>
      ),
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
                setSelectedLab(row.original);
                setIsDialogOpen(true);
              }}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedLab(row.original);
                setIsDialogOpen(true);
              }}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="ml-2 h-4 w-4" />
                طباعة التقرير
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
    if (type === "csv") {
      // Create CSV content
      const headers = ["رمز العينة", "نوع العينة", "جامع العينة", "التاريخ", "إيجابي", "سلبي"];
      const rows = data.map(lab => [
        lab.sampleCode,
        lab.sampleType,
        lab.collector,
        lab.date,
        lab.positiveCases,
        lab.negativeCases,
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
      a.download = `laboratory-results-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  const handleSaveLab = (labData: any) => {
    if (selectedLab) {
      // Update existing lab
      setData(data.map(l => l.sampleCode === selectedLab.sampleCode ? labData : l));
    } else {
      // Add new lab
      setData([...data, labData]);
    }
    setSelectedLab(undefined);
  };

  // Calculate statistics
  const totalTests = data.reduce((sum, lab) => {
    const counts = lab.speciesCounts;
    return sum + counts.sheep + counts.goats + counts.camel + counts.cattle + counts.horse;
  }, 0);

  const totalPositive = data.reduce((sum, lab) => sum + lab.positiveCases, 0);
  const totalNegative = data.reduce((sum, lab) => sum + lab.negativeCases, 0);
  const positiveRate = totalTests > 0 ? ((totalPositive / (totalPositive + totalNegative)) * 100).toFixed(1) : "0";

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">المختبرات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة نتائج الفحوصات المخبرية والتحاليل
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400 text-indigo-700 hover:text-indigo-800">
              <Upload className="ml-2 h-4 w-4" />
              استيراد نتائج
            </Button>
            <Button 
              onClick={() => {
                setSelectedLab(undefined);
                setIsDialogOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة فحص جديد
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي الفحوصات
              </CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTests}</div>
              <p className="text-xs text-muted-foreground mt-1">
                فحص هذا الشهر
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                النتائج الإيجابية
              </CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalPositive}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {positiveRate}% من الإجمالي
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                النتائج السلبية
              </CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalNegative}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {100 - parseFloat(positiveRate)}% من الإجمالي
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                عينات اليوم
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="inline h-3 w-3 ml-1 text-green-600" />
                +20% من الأمس
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Tests Chart */}
          <Card>
            <CardHeader>
              <CardTitle>الفحوصات الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTestsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tests" stroke="#3B82F6" name="إجمالي الفحوصات" />
                  <Line type="monotone" dataKey="positive" stroke="#EF4444" name="إيجابي" />
                  <Line type="monotone" dataKey="negative" stroke="#10B981" name="سلبي" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sample Types Chart */}
          <Card>
            <CardHeader>
              <CardTitle>أنواع العينات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sampleTypesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" name="عدد العينات" />
                </BarChart>
              </ResponsiveContainer>
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

        {/* Laboratory Dialog */}
        <LaboratoryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          laboratory={selectedLab}
          onSave={handleSaveLab}
        />
      </div>
    </MainLayout>
  );
}
