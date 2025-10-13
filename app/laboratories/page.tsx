"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";

import { getColumns } from "./components/columns";
import { LaboratoryDialog } from "./components/laboratory-dialog";
import { Button } from "@/components/ui/button";
import { Plus, FlaskConical, TestTube, TrendingUp, Activity, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Laboratory } from "@/types";
import { formatDate } from "@/lib/utils";
import { laboratoriesApi } from "@/lib/api/laboratories";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { toast } from "sonner";
import { apiConfig } from "@/lib/api-config";
import { ImportExportManager } from "@/components/import-export";

// تعريف حقول النموذج
const formFields = [
  {
    name: "sampleCode",
    label: "رمز العينة",
    type: "text" as const,
    required: true,
    placeholder: "LAB-001",
  },
  {
    name: "sampleType",
    label: "نوع العينة",
    type: "select" as const,
    required: true,
    options: [
      { value: "Blood", label: "دم" },
      { value: "Urine", label: "بول" },
      { value: "Feces", label: "براز" },
      { value: "Tissue", label: "نسيج" },
      { value: "Milk", label: "حليب" },
      { value: "Swab", label: "مسحة" },
    ],
  },
  {
    name: "collector",
    label: "جامع العينة",
    type: "text" as const,
    required: true,
    placeholder: "اسم جامع العينة",
  },
  {
    name: "date",
    label: "تاريخ الجمع",
    type: "date" as const,
    required: true,
  },
  {
    name: "speciesCounts.sheep",
    label: "عدد الأغنام",
    type: "number" as const,
    required: true,
  },
  {
    name: "speciesCounts.goats",
    label: "عدد الماعز",
    type: "number" as const,
    required: true,
  },
  {
    name: "speciesCounts.camel",
    label: "عدد الإبل",
    type: "number" as const,
    required: true,
  },
  {
    name: "speciesCounts.cattle",
    label: "عدد الأبقار",
    type: "number" as const,
    required: true,
  },
  {
    name: "speciesCounts.horse",
    label: "عدد الخيول",
    type: "number" as const,
    required: true,
  },
  {
    name: "positiveCases",
    label: "الحالات الإيجابية",
    type: "number" as const,
    required: true,
  },
  {
    name: "negativeCases",
    label: "الحالات السلبية",
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
    key: "sampleCode",
    title: "رمز العينة",
    width: "120px",
  },
  {
    key: "sampleType",
    title: "نوع العينة",
    render: (value: string) => {
      const typeLabels = {
        "Blood": "دم",
        "Urine": "بول",
        "Feces": "براز",
        "Tissue": "نسيج",
        "Milk": "حليب",
        "Swab": "مسحة"
      };
      return typeLabels[value as keyof typeof typeLabels] || value;
    },
    width: "100px",
  },
  {
    key: "collector",
    title: "جامع العينة",
    width: "140px",
  },
  {
    key: "date",
    title: "تاريخ الجمع",
    render: (value: string) => formatDate(value),
    width: "120px",
  },
  {
    key: "totalSamples",
    title: "إجمالي العينات",
    render: (value: any, record: Laboratory) => {
      const total = Object.values(record.speciesCounts || {}).reduce((sum: number, count: any) => sum + (count || 0), 0);
      return <span className="font-medium">{total}</span>;
    },
    width: "120px",
  },
  {
    key: "positiveCases",
    title: "الحالات الإيجابية",
    render: (value: number) => (
      <Badge variant={value > 0 ? "destructive" : "default"}>
        {value}
      </Badge>
    ),
    width: "120px",
  },
  {
    key: "negativeCases",
    title: "الحالات السلبية",
    render: (value: number) => (
      <Badge variant="secondary">
        {value}
      </Badge>
    ),
    width: "120px",
  },
  {
    key: "positivityRate",
    title: "معدل الإيجابية",
    render: (value: any, record: Laboratory) => {
      const total = (record.positiveCases || 0) + (record.negativeCases || 0);
      const rate = total > 0 ? Math.round(((record.positiveCases || 0) / total) * 100) : 0;
      return (
        <span className={`font-medium ${rate > 20 ? 'text-red-600' : rate > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
          {rate}%
        </span>
      );
    },
    width: "100px",
  },
];

// فلاتر الجدول
const tableFilters = [
  {
    key: "sampleType",
    label: "نوع العينة",
    options: [
      { value: "Blood", label: "دم" },
      { value: "Urine", label: "بول" },
      { value: "Feces", label: "براز" },
      { value: "Tissue", label: "نسيج" },
      { value: "Milk", label: "حليب" },
      { value: "Swab", label: "مسحة" },
    ],
  },
];

export default function LaboratoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Laboratory | null>(null);
  const queryClient = useQueryClient();
  const { checkPermission } = usePermissions();

  // Fetch laboratories data using React Query
  const { data: laboratoriesData, isLoading, refetch } = useQuery({
    queryKey: ['laboratories'],
    queryFn: () => laboratoriesApi.getList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['laboratories-stats'],
    queryFn: () => laboratoriesApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const data = laboratoriesData?.data || [];


  const handleDelete = async (item: Laboratory) => {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      try {
        await laboratoriesApi.delete((item as any)._id || item.sampleCode);
        refetch(); // Refresh data after deletion
        // Refresh statistics as well
        queryClient.invalidateQueries({ queryKey: ['laboratories-stats'] });
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
        await laboratoriesApi.update((selectedItem as any)._id || selectedItem.sampleCode, data);
        alert('تم تحديث السجل بنجاح');
      } else {
        await laboratoriesApi.create(data);
        alert('تم إضافة السجل بنجاح');
      }
      refetch(); // Refresh data
      // Refresh statistics as well
      queryClient.invalidateQueries({ queryKey: ['laboratories-stats'] });
      setIsDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Save failed:', error);
      alert('فشل في حفظ السجل');
    }
  };

  const handleEdit = (item: Laboratory) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleView = (item: Laboratory) => {
    // This will be handled by the DataTable's built-in view modal
    console.log("Viewing laboratory item:", item);
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
            <h1 className="text-3xl font-bold">المختبرات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة سجلات الفحوصات المخبرية والعينات
            </p>
          </div>
          <div className="flex gap-2">
            <ImportExportManager
              exportEndpoint={apiConfig.endpoints.laboratories.export}
              importEndpoint={apiConfig.endpoints.laboratories.import}
              templateEndpoint={apiConfig.endpoints.laboratories.template}
              title="المختبرات"
              queryKey="laboratories"
              acceptedFormats={[".csv", ".xlsx"]}
              maxFileSize={10}
              onImportSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['laboratories'] });
              }}
              onExportSuccess={() => {
                toast.success('تم تصدير البيانات بنجاح');
              }}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ['laboratories'] });
              }}
            />
            {checkPermission({ module: 'laboratories', action: 'create' }) && (
              <Button onClick={handleAdd} size="sm" className="h-9 px-3">
                <Plus className="h-4 w-4 mr-2" />
                إضافة عينة جديدة
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي السجلات
              </CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                <div className="text-2xl font-bold">{data.length || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                جميع سجلات المختبر
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي العينات
              </CardTitle>
              <TestTube className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold animate-pulse bg-blue-200 h-8 w-16 rounded"></div>
              ) : (
                <div className="text-2xl font-bold text-blue-600">
                  {data.reduce((total, record) => {
                    const counts = record.speciesCounts || {};
                    return total + (counts.sheep || 0) + (counts.goats || 0) + (counts.camel || 0) + (counts.cattle || 0) + (counts.horse || 0);
                  }, 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                من جميع الأنواع
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الحالات الإيجابية
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold animate-pulse bg-red-200 h-8 w-16 rounded"></div>
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  {data.reduce((total, record) => total + (record.positiveCases || 0), 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                حالة إيجابية
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الحالات السلبية
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold animate-pulse bg-green-200 h-8 w-16 rounded"></div>
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  {data.reduce((total, record) => total + (record.negativeCases || 0), 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                حالة سلبية
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                معدل الإيجابية
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold animate-pulse bg-orange-200 h-8 w-16 rounded"></div>
              ) : (
                (() => {
                  const totalPositive = data.reduce((total, record) => total + (record.positiveCases || 0), 0);
                  const totalNegative = data.reduce((total, record) => total + (record.negativeCases || 0), 0);
                  const totalCases = totalPositive + totalNegative;
                  const rate = totalCases > 0 ? Math.round((totalPositive / totalCases) * 100) : 0;
                  
                  return (
                    <div className={`text-2xl font-bold ${
                      rate > 20 ? 'text-red-600' : 
                      rate > 10 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {rate}%
                    </div>
                  );
                })()
              )}
              <p className="text-xs text-muted-foreground">
                نسبة الإيجابية
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                العينات هذا الشهر
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold animate-pulse bg-purple-200 h-8 w-16 rounded"></div>
              ) : (
                <div className="text-2xl font-bold text-purple-600">
                  {(() => {
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    return data.filter(record => {
                      const recordDate = new Date(record.date);
                      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
                    }).length;
                  })()}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                سجل هذا الشهر
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete, onView: handleView })}
          data={data}
          isLoading={isLoading}
          onView={handleView}
        />

        {/* Laboratory Dialog */}
        <LaboratoryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          laboratory={selectedItem || undefined}
          onSave={handleSave}
        />
      </div>
    </MainLayout>
  );
}
