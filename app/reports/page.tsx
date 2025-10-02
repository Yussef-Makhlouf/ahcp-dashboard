"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Activity,
  FileBarChart,
  Printer,
  Filter,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/lib/use-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Mock data for reports
const monthlyData = [
  { month: "يناير", vaccinations: 450, parasiteControl: 320, clinics: 180, labs: 120 },
  { month: "فبراير", vaccinations: 520, parasiteControl: 380, clinics: 220, labs: 150 },
  { month: "مارس", vaccinations: 610, parasiteControl: 420, clinics: 280, labs: 180 },
  { month: "أبريل", vaccinations: 580, parasiteControl: 400, clinics: 260, labs: 170 },
  { month: "مايو", vaccinations: 700, parasiteControl: 480, clinics: 320, labs: 210 },
  { month: "يونيو", vaccinations: 650, parasiteControl: 450, clinics: 300, labs: 190 },
];

const animalHealthData = [
  { status: "سليم", count: 850, percentage: 68 },
  { status: "تحت العلاج", count: 250, percentage: 20 },
  { status: "حرج", count: 50, percentage: 4 },
  { status: "تم الشفاء", count: 100, percentage: 8 },
];

const villagePerformance = [
  { village: "قرية النور", score: 92, activities: 145 },
  { village: "قرية السلام", score: 88, activities: 132 },
  { village: "قرية الأمل", score: 85, activities: 128 },
  { village: "قرية الخير", score: 90, activities: 138 },
  { village: "قرية الفردوس", score: 87, activities: 125 },
];

const diseaseDistribution = [
  { name: "التهابات تنفسية", value: 280, color: "#EF4444" },
  { name: "طفيليات معوية", value: 220, color: "#F59E0B" },
  { name: "أمراض جلدية", value: 150, color: "#10B981" },
  { name: "التهاب الضرع", value: 120, color: "#3B82F6" },
  { name: "أخرى", value: 80, color: "#8B5CF6" },
];

const reportTypes = [
  {
    id: "monthly",
    title: "التقرير الشهري",
    description: "ملخص شامل لجميع الأنشطة خلال الشهر",
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "vaccination",
    title: "تقرير التحصينات",
    description: "تفاصيل جميع عمليات التحصين والتطعيم",
    icon: Activity,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "parasite",
    title: "تقرير مكافحة الطفيليات",
    description: "إحصائيات مكافحة الطفيليات والوقاية",
    icon: FileBarChart,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "laboratory",
    title: "تقرير المختبرات",
    description: "نتائج الفحوصات المخبرية والتحاليل",
    icon: FileText,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "clients",
    title: "تقرير المربيين",
    description: "بيانات المربيين وحيواناتهم",
    icon: Users,
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: "performance",
    title: "تقرير الأداء",
    description: "مؤشرات الأداء الرئيسية KPIs",
    icon: TrendingUp,
    color: "bg-indigo-100 text-indigo-600",
  },
];

export default function ReportsPage() {
  const { t } = useTranslation();
  const [selectedReportType, setSelectedReportType] = useState("monthly");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedVillage, setSelectedVillage] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: new Date(2025, 8, 1),
    to: new Date(2025, 8, 30),
  });

  const handleGenerateReport = (type: string) => {
    console.log("Generating report:", type);
    // Here you would generate the actual report
  };

  const handleExportReport = (format: "pdf" | "excel" | "csv") => {
    console.log("Exporting report as:", format);
    // Here you would export the report
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('reports.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="ml-2 h-4 w-4" />
              {t('common.filter')}
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="ml-2 h-4 w-4" />
              {t('reports.print')}
            </Button>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card 
                key={report.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedReportType === report.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedReportType(report.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${report.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg mt-3">{report.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {report.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateReport(report.id);
                    }}
                  >
                    إنشاء التقرير
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle>خيارات التقرير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">الفترة الزمنية</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">يومي</SelectItem>
                    <SelectItem value="week">أسبوعي</SelectItem>
                    <SelectItem value="month">شهري</SelectItem>
                    <SelectItem value="quarter">ربع سنوي</SelectItem>
                    <SelectItem value="year">سنوي</SelectItem>
                    <SelectItem value="custom">مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">القرية</label>
                <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع القرى</SelectItem>
                    <SelectItem value="village1">قرية النور</SelectItem>
                    <SelectItem value="village2">قرية السلام</SelectItem>
                    <SelectItem value="village3">قرية الأمل</SelectItem>
                    <SelectItem value="village4">قرية الخير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تصدير التقرير</label>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExportReport("pdf")}
                  >
                    <Download className="ml-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExportReport("excel")}
                  >
                    <Download className="ml-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExportReport("csv")}
                  >
                    <Download className="ml-2 h-4 w-4" />
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="details">التفاصيل</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="comparison">المقارنات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    إجمالي الأنشطة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,847</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-600">+12.5%</span> من الشهر الماضي
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    الحيوانات المعالجة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3,256</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-600">+8.2%</span> من الشهر الماضي
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    معدل النجاح
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.5%</div>
                  <Progress value={94.5} className="mt-2 h-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    التغطية الجغرافية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    قرية مغطاة
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>الأنشطة الشهرية</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="vaccinations" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="تحصينات" />
                      <Area type="monotone" dataKey="parasiteControl" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="مكافحة طفيليات" />
                      <Area type="monotone" dataKey="clinics" stackId="1" stroke="#10B981" fill="#10B981" name="عيادات" />
                      <Area type="monotone" dataKey="labs" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" name="مختبرات" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع الأمراض</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={diseaseDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {diseaseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الأنشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {villagePerformance.map((village) => (
                    <div key={village.village} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{village.village}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{village.activities} نشاط</Badge>
                          <span className="text-sm font-medium">{village.score}%</span>
                        </div>
                      </div>
                      <Progress value={village.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الحالة الصحية للقطيع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {animalHealthData.map((status) => (
                    <div key={status.status} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${
                          status.status === "سليم" ? "bg-green-500" :
                          status.status === "تحت العلاج" ? "bg-yellow-500" :
                          status.status === "حرج" ? "bg-red-500" :
                          "bg-blue-500"
                        }`} />
                        <span className="font-medium">{status.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{status.count}</span>
                        <Badge variant="secondary">{status.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Alert>
              <AlertDescription>
                التحليلات المتقدمة تساعد في اتخاذ قرارات أفضل بناءً على البيانات التاريخية والاتجاهات الحالية.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>معدل النمو الشهري</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="vaccinations" stroke="#3B82F6" name="تحصينات" strokeWidth={2} />
                      <Line type="monotone" dataKey="parasiteControl" stroke="#F59E0B" name="مكافحة طفيليات" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أداء القرى</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={villagePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="village" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#3B82F6" name="معدل الأداء %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>مقارنة الأداء السنوي</CardTitle>
                <CardDescription>
                  مقارنة الأداء بين السنة الحالية والسنة الماضية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">2024</p>
                      <p className="text-2xl font-bold">18,456</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">التغيير</p>
                      <p className="text-2xl font-bold text-green-600">+22.5%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">2025</p>
                      <p className="text-2xl font-bold">22,603</p>
                    </div>
                  </div>
                  <Separator />
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { category: "تحصينات", year2024: 4500, year2025: 5200 },
                      { category: "مكافحة طفيليات", year2024: 3800, year2025: 4600 },
                      { category: "عيادات", year2024: 2200, year2025: 2800 },
                      { category: "مختبرات", year2024: 1500, year2025: 1900 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="year2024" fill="#94A3B8" name="2024" />
                      <Bar dataKey="year2025" fill="#3B82F6" name="2025" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
