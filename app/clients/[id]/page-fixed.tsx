"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Printer, FileText, Calendar, Activity, MapPin, Phone, User, Shield,
  AlertTriangle, CheckCircle, BarChart3, Syringe, Bug, Stethoscope, TestTube, 
  Target, Award, Building2, Hash
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { VisitDetails } from './components/visit-details';
import { VisitStatistics } from './components/visit-statistics';
import type { Client } from "@/types";
import { clientsApi } from '@/lib/api/clients';

export default function ClientProfessionalReport() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [serviceFilter, setServiceFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(true);

  const { data: clientResponse, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientsApi.getById(clientId),
    enabled: !!clientId,
  });

  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ['client-visits', clientId],
    queryFn: () => clientsApi.getClientVisits(clientId),
    enabled: !!clientId,
  });

  const client = clientResponse as Client;
  const visits = visitsData || {
    mobileClinic: [],
    vaccination: [],
    parasiteControl: [],
    equineHealth: [],
    laboratory: []
  };

  // دالة تنسيق التاريخ بالتقويم الميلادي
  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        calendar: 'gregory'
      });
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  if (isLoading || visitsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-lg">جاري تحميل بيانات المربي...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!client) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">المربي غير موجود</h2>
          <p className="mt-2 text-gray-600">لم يتم العثور على بيانات هذا المربي</p>
          <Button onClick={() => router.back()} className="mt-4">
            العودة
          </Button>
        </div>
      </MainLayout>
    );
  }

  // حساب البيانات الأساسية
  const totalAnimals = (client.animals || []).reduce((sum, animal) => sum + (animal.count || 0), 0);
  const animalCounts = (client.animals || []).reduce((acc, animal) => {
    acc[animal.type] = (acc[animal.type] || 0) + (animal.count || 0);
    return acc;
  }, {} as Record<string, number>);

  const getAllVisitsFlat = () => {
    return [
      ...(visits.vaccination || []),
      ...(visits.mobileClinic || []),
      ...(visits.parasiteControl || []),
      ...(visits.equineHealth || []),
      ...(visits.laboratory || [])
    ];
  };

  const allVisits = getAllVisitsFlat();
  const latestVisit = allVisits.length > 0 
    ? allVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const analytics = {
    totalVisits: allVisits.length,
    lastVisitDate: latestVisit?.date,
    firstVisitDate: allVisits.length > 0 
      ? allVisits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.date
      : null,
    avgVisitsPerMonth: allVisits.length > 0 ? Math.round(allVisits.length / 12) : 0
  };

  const getVillageInfo = () => {
    let village = client?.village;
    
    if (!village || (typeof village === 'string' && village === "غير محدد")) {
      const visitWithHoldingCode = allVisits.find(visit => 
        visit.holdingCode && typeof visit.holdingCode === 'object'
      );
      
      if (visitWithHoldingCode && typeof visitWithHoldingCode.holdingCode === 'object') {
        village = visitWithHoldingCode.holdingCode.village || "غير محدد";
      } else {
        village = "غير محدد";
      }
    }
    
    return {
      village: typeof village === 'string' ? village : village?.name || "غير محدد",
      code: "غير محدد"
    };
  };

  const villageInfo = getVillageInfo();

  return (
    <MainLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="text-center border-2 border-primary bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">تقرير معلومات المربي الشامل</h1>
          </div>
          <p className="text-muted-foreground mb-4">نظام إدارة رعاية الحيوان - قسم خدمات المربين</p>
          
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>اسم المربي</span>
              </div>
              <div className="text-xl font-bold text-primary">{client.name || "غير محدد"}</div>
              <div className="text-xs text-muted-foreground mt-1">رقم الهوية: {client.nationalId || "غير محدد"}</div>
            </div>
            
            <div className="text-left">
              <div className="text-sm text-muted-foreground flex items-center gap-2 justify-end">
                <Calendar className="h-4 w-4" />
                <span>تاريخ التقرير</span>
              </div>
              <div className="font-mono text-sm font-semibold text-right">{formatDate(new Date().toISOString())}</div>
              <div className="text-xs text-muted-foreground mt-1 text-right">رقم التقرير: {client._id?.slice(-8)}</div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap gap-2 print:hidden mt-4">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="hover:bg-white">
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              العودة
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="hover:bg-white">
              <Printer className="h-4 w-4 ml-2" />
              طباعة التقرير
            </Button>
          </div>
        </div>

        {/* Section 1: Comprehensive Breeder Profile */}
        <Card className="shadow-lg border-r-4 border-r-primary" dir="rtl">
          <CardHeader className="border-b bg-gradient-to-l from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-xl text-right">
              <User className="h-6 w-6 text-primary" />
              القسم الأول: الملف الشامل للمربي
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2 text-right">البيانات الشخصية، الموقع، والثروة الحيوانية</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-right">
                  <User className="h-5 w-5 text-primary" />
                  البيانات الشخصية
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border" dir="rtl">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4 bg-muted font-semibold w-1/2">اسم المربي</td>
                        <td className="py-3 px-4">{client.name || "غير محدد"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 bg-muted font-semibold">رقم الهوية الوطنية</td>
                        <td className="py-3 px-4 font-mono" dir="ltr">{client.nationalId || "غير محدد"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 bg-muted font-semibold">رقم الهاتف</td>
                        <td className="py-3 px-4 font-mono" dir="ltr">{client.phone || "غير محدد"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 bg-muted font-semibold">تاريخ الميلاد</td>
                        <td className="py-3 px-4">{client.birthDate ? formatDate(client.birthDate) : "غير محدد"}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 bg-muted font-semibold">حالة العميل</td>
                        <td className="py-3 px-4">
                          <Badge variant={client.status === "نشط" ? "default" : "secondary"}>
                            {client.status || "غير محدد"}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Location & Holding Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-right">
                  <MapPin className="h-5 w-5 text-primary" />
                  الموقع ورمز الحياة
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border" dir="rtl">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4 bg-muted font-semibold w-1/2">القرية</td>
                        <td className="py-3 px-4">{villageInfo.village}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 bg-muted font-semibold">رمز الحياة</td>
                        <td className="py-3 px-4 font-mono" dir="ltr">{villageInfo.code || "غير محدد"}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 bg-muted font-semibold">حالة النشاط</td>
                        <td className="py-3 px-4">
                          <Badge variant={analytics.totalVisits > 0 ? "default" : "secondary"}>
                            {analytics.totalVisits > 0 ? "نشط" : "غير نشط"}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 bg-muted font-semibold">آخر زيارة</td>
                        <td className="py-3 px-4">{latestVisit ? formatDate(latestVisit.date) : "لا توجد زيارات"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Animal Inventory */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-right">
                <Target className="h-5 w-5 text-primary" />
                جرد الثروة الحيوانية
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border" dir="rtl">
                  <thead>
                    <tr className="bg-muted border-b">
                      <th className="py-3 px-4 text-right font-semibold">نوع الحيوان</th>
                      <th className="py-3 px-4 text-center font-semibold">العدد</th>
                      <th className="py-3 px-4 text-center font-semibold">النسبة</th>
                      <th className="py-3 px-4 text-center font-semibold">التقييم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(animalCounts).map(([type, count]) => {
                      const arabicType = {
                        sheep: 'أغنام',
                        goats: 'ماعز',
                        camel: 'إبل',
                        cattle: 'أبقار',
                        horse: 'خيول'
                      }[type] || type;
                      
                      const percentage = totalAnimals > 0 ? ((count / totalAnimals) * 100).toFixed(1) : 0;
                      const assessment = count > 100 ? 'قطيع كبير' : count > 50 ? 'قطيع متوسط' : count > 0 ? 'قطيع صغير' : 'لا يوجد';
                      
                      return (
                        <tr key={type} className="border-b">
                          <td className="py-3 px-4">{arabicType}</td>
                          <td className="py-3 px-4 text-center font-mono">{count}</td>
                          <td className="py-3 px-4 text-center font-mono">{percentage}%</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={count > 100 ? "default" : count > 50 ? "secondary" : count > 0 ? "outline" : "destructive"}>
                              {assessment}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-muted font-bold">
                      <td className="py-3 px-4">المجموع</td>
                      <td className="py-3 px-4 text-center font-mono">{totalAnimals}</td>
                      <td className="py-3 px-4 text-center font-mono">100%</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={totalAnimals > 500 ? "default" : totalAnimals > 200 ? "secondary" : "outline"}>
                          {totalAnimals > 500 ? 'مزرعة كبيرة' : totalAnimals > 200 ? 'مزرعة متوسطة' : totalAnimals > 0 ? 'مزرعة صغيرة' : 'لا توجد بيانات'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Medical Analysis & Services */}
        <Card className="shadow-lg border-r-4 border-r-primary" dir="rtl">
          <CardHeader className="border-b bg-gradient-to-l from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-xl text-right">
              <Stethoscope className="h-6 w-6 text-primary" />
              القسم الثاني: التحليل الطبي الشامل والخدمات البيطرية
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2 text-right">الخدمات المقدمة والتحليلات الطبية</p>
          </CardHeader>
          <CardContent className="p-6">
            {/* Services Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-right">
                <Activity className="h-5 w-5 text-primary" />
                ملخص الخدمات البيطرية
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border" dir="rtl">
                  <thead>
                    <tr className="bg-muted border-b">
                      <th className="py-3 px-4 text-right font-semibold">نوع الخدمة</th>
                      <th className="py-3 px-4 text-center font-semibold">عدد الزيارات</th>
                      <th className="py-3 px-4 text-center font-semibold">آخر زيارة</th>
                      <th className="py-3 px-4 text-center font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'التطعيمات', visits: visits.vaccination || [], type: 'vaccination' },
                      { name: 'العيادة المتنقلة', visits: visits.mobileClinic || [], type: 'mobileClinic' },
                      { name: 'مكافحة الطفيليات', visits: visits.parasiteControl || [], type: 'parasiteControl' },
                      { name: 'صحة الخيول', visits: visits.equineHealth || [], type: 'equineHealth' },
                      { name: 'المختبر', visits: visits.laboratory || [], type: 'laboratory' }
                    ].map((service) => {
                      const latestServiceVisit = service.visits.length > 0
                        ? service.visits.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                        : null;
                      
                      const status = service.visits.length > 0 ? 'نشط' : 'لا توجد خدمات';
                      
                      return (
                        <tr key={service.type} className="border-b">
                          <td className="py-3 px-4">{service.name}</td>
                          <td className="py-3 px-4 text-center font-mono">{service.visits.length}</td>
                          <td className="py-3 px-4 text-center">
                            {latestServiceVisit ? formatDate(latestServiceVisit.date) : "لا توجد زيارات"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={status === 'نشط' ? "default" : "outline"}>
                              {status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-muted font-bold">
                      <td className="py-3 px-4">إجمالي الزيارات</td>
                      <td className="py-3 px-4 text-center font-mono">{getAllVisitsFlat().length}</td>
                      <td className="py-3 px-4 text-center">
                        {latestVisit ? formatDate(latestVisit.date) : "لا توجد زيارات"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={analytics.totalVisits > 10 ? "default" : analytics.totalVisits > 5 ? "secondary" : "outline"}>
                          {analytics.totalVisits > 10 ? 'عميل نشط' : analytics.totalVisits > 5 ? 'عميل منتظم' : 'عميل جديد'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Detailed Records */}
        <Card className="shadow-lg border-r-4 border-r-primary" dir="rtl">
          <CardHeader className="border-b bg-gradient-to-l from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-xl text-right">
              <FileText className="h-6 w-6 text-primary" />
              القسم الثالث: السجلات التفصيلية والبيانات الوصفية
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2 text-right">سجلات الزيارات المفصلة ومعلومات النظام</p>
          </CardHeader>
          <CardContent className="p-6">
            {showDetailedReport ? (
              <Tabs defaultValue="records" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="records">سجلات الزيارات</TabsTrigger>
                  <TabsTrigger value="statistics">الإحصائيات</TabsTrigger>
                  <TabsTrigger value="metadata">البيانات الوصفية</TabsTrigger>
                </TabsList>
                
                <TabsContent value="records" className="mt-6">
                  <VisitDetails visits={visits} formatDate={formatDate} />
                </TabsContent>
                
                <TabsContent value="statistics" className="mt-6">
                  <VisitStatistics visits={visits} />
                </TabsContent>

                <TabsContent value="metadata" className="mt-6">
                  <div className="space-y-6">
                    {/* System Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-right">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        معلومات النظام
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border" dir="rtl">
                          <tbody>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-muted font-semibold w-1/3">معرف النظام</td>
                              <td className="py-3 px-4 font-mono text-xs" dir="ltr">{client._id || "غير محدد"}</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-muted font-semibold">تاريخ التسجيل</td>
                              <td className="py-3 px-4">{client.createdAt ? formatDate(client.createdAt) : "غير محدد"}</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 px-4 bg-muted font-semibold">آخر تحديث</td>
                              <td className="py-3 px-4">{client.updatedAt ? formatDate(client.updatedAt) : "غير محدد"}</td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4 bg-muted font-semibold">إجمالي الزيارات</td>
                              <td className="py-3 px-4 font-mono">{getAllVisitsFlat().length}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Report Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-right">
                        <FileText className="h-5 w-5 text-primary" />
                        معلومات التقرير
                      </h3>
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>تاريخ إنشاء التقرير:</strong>
                            <div className="mt-1">{formatDate(new Date().toISOString())}</div>
                          </div>
                          <div>
                            <strong>معرف التقرير:</strong>
                            <div className="mt-1 font-mono">{client._id?.slice(-8)}</div>
                          </div>
                          <div>
                            <strong>نوع التقرير:</strong>
                            <div className="mt-1">تقرير شامل</div>
                          </div>
                          <div>
                            <strong>البيانات المشمولة:</strong>
                            <div className="mt-1">
                              {getAllVisitsFlat().length} زيارة • {totalAnimals} رأس حيوان
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">التقرير المختصر</p>
                <Button onClick={() => setShowDetailedReport(true)}>
                  عرض التقرير المفصل
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Footer */}
        <Card className="shadow-lg border-r-4 border-r-primary" dir="rtl">
          <CardHeader className="border-b bg-gradient-to-l from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-xl text-right">
              <Shield className="h-6 w-6 text-primary" />
              خاتمة التقرير والتوقيعات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>تم إنشاء هذا التقرير تلقائياً بواسطة نظام إدارة رعاية الحيوان</strong>
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                جميع البيانات محدثة حتى تاريخ إنشاء هذا التقرير
              </p>
              <div className="text-xs text-muted-foreground font-mono">
                Report ID: {client._id?.slice(-8)} | Generated: {new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
