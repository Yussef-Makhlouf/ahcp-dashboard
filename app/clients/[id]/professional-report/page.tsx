"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Printer, FileText, Calendar, TrendingUp, Activity, MapPin, Phone, User, Shield, Clock, AlertTriangle, CheckCircle, BarChart3, PieChart, Download } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { formatDate } from '@/lib/utils';
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

  const getVillageInfo = () => {
    let village = client?.village;
    
    if (!village || (typeof village === 'string' && village === "غير محدد")) {
      const allVisits = [
        ...(visits.vaccination || []),
        ...(visits.mobileClinic || []),
        ...(visits.parasiteControl || []),
        ...(visits.equineHealth || []),
        ...(visits.laboratory || [])
      ];
      
      const visitWithHoldingCode = allVisits.find(visit => 
        visit.holdingCode && typeof visit.holdingCode === 'object'
      );
      
      if (visitWithHoldingCode && visitWithHoldingCode.holdingCode) {
        const holdingCode = visitWithHoldingCode.holdingCode as any;
        return {
          village: holdingCode.village || "غير محدد",
          code: holdingCode.code || null
        };
      }
    }
    
    if (!village) {
      return { village: "غير محدد", code: null };
    }
    
    if (typeof village === 'object') {
      return {
        village: (village as any).nameArabic || (village as any).nameEnglish || (village as any).name || "غير محدد",
        code: (village as any).serialNumber || null
      };
    }
    
    return { village: village || "غير محدد", code: null };
  };

  const villageInfo = getVillageInfo();

  const getAnimalCounts = () => {
    const animalCounts = {
      sheep: 0,
      goats: 0,
      camel: 0,
      cattle: 0,
      horse: 0
    };

    const allVisits = [
      ...(visits.vaccination || []),
      ...(visits.parasiteControl || []),
      ...(visits.mobileClinic || [])
    ];

    const visitWithHerdCounts = allVisits
      .filter(visit => visit.herdCounts || visit.animalCounts)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (visitWithHerdCounts) {
      const herdCounts = visitWithHerdCounts.herdCounts || visitWithHerdCounts.animalCounts;
      if (herdCounts) {
        animalCounts.sheep = herdCounts.sheep?.total || herdCounts.sheep || 0;
        animalCounts.goats = herdCounts.goats?.total || herdCounts.goats || 0;
        animalCounts.camel = herdCounts.camel?.total || herdCounts.camel || 0;
        animalCounts.cattle = herdCounts.cattle?.total || herdCounts.cattle || 0;
        animalCounts.horse = herdCounts.horse?.total || herdCounts.horse || 0;
      }
    }

    return animalCounts;
  };

  const animalCounts = getAnimalCounts();
  const totalAnimals = Object.values(animalCounts).reduce((sum, count) => sum + count, 0);

  const getAllVisitsFlat = () => {
    const allVisits: any[] = [];
    
    (visits.vaccination || []).forEach(v => allVisits.push({ ...v, serviceType: 'تطعيم', _type: 'vaccination' }));
    (visits.mobileClinic || []).forEach(v => allVisits.push({ ...v, serviceType: 'عيادة متنقلة', _type: 'mobileClinic' }));
    (visits.parasiteControl || []).forEach(v => allVisits.push({ ...v, serviceType: 'مكافحة طفيليات', _type: 'parasiteControl' }));
    (visits.equineHealth || []).forEach(v => allVisits.push({ ...v, serviceType: 'صحة الخيول', _type: 'equineHealth' }));
    (visits.laboratory || []).forEach(v => allVisits.push({ ...v, serviceType: 'مختبر', _type: 'laboratory' }));
    
    return allVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredVisits = () => {
    let filtered = getAllVisitsFlat();
    
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(v => v._type === serviceFilter);
    }
    
    if (dateFilter.from) {
      filtered = filtered.filter(v => new Date(v.date) >= new Date(dateFilter.from));
    }
    
    if (dateFilter.to) {
      filtered = filtered.filter(v => new Date(v.date) <= new Date(dateFilter.to));
    }
    
    return filtered;
  };

  if (isLoading || visitsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto mb-4"></div>
            <p>جاري تحميل التقرير...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!client) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">لم يتم العثور على بيانات المربي</p>
            <Button onClick={() => router.back()}>العودة</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const latestVisit = getAllVisitsFlat()[0];

  // Calculate enhanced analytics
  const getAnalytics = () => {
    const allVisits = getAllVisitsFlat();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    const recentVisits = allVisits.filter(v => new Date(v.date) >= thirtyDaysAgo);
    const sixMonthVisits = allVisits.filter(v => new Date(v.date) >= sixMonthsAgo);
    const yearVisits = allVisits.filter(v => new Date(v.date) >= oneYearAgo);
    
    // Calculate quarterly trends
    const quarters = [];
    for (let i = 0; i < 4; i++) {
      const quarterStart = new Date(now.getTime() - (i + 1) * 90 * 24 * 60 * 60 * 1000);
      const quarterEnd = new Date(now.getTime() - i * 90 * 24 * 60 * 60 * 1000);
      const quarterVisits = allVisits.filter(v => {
        const visitDate = new Date(v.date);
        return visitDate >= quarterStart && visitDate < quarterEnd;
      });
      quarters.unshift({
        period: `Q${4-i}`,
        visits: quarterVisits.length,
        services: [...new Set(quarterVisits.map(v => v._type))].length
      });
    }
    
    const serviceFrequency = {
      vaccination: visits.vaccination?.length || 0,
      mobileClinic: visits.mobileClinic?.length || 0,
      parasiteControl: visits.parasiteControl?.length || 0,
      laboratory: visits.laboratory?.length || 0,
      equineHealth: visits.equineHealth?.length || 0
    };
    
    // Calculate service trends
    const serviceGrowth = Object.keys(serviceFrequency).reduce((acc, service) => {
      const recentCount = allVisits.filter(v => v._type === service && new Date(v.date) >= thirtyDaysAgo).length;
      const previousCount = allVisits.filter(v => {
        const date = new Date(v.date);
        return v._type === service && date >= new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) && date < thirtyDaysAgo;
      }).length;
      
      acc[service] = {
        current: recentCount,
        previous: previousCount,
        trend: recentCount > previousCount ? 'up' : recentCount < previousCount ? 'down' : 'stable'
      };
      return acc;
    }, {} as Record<string, any>);
    
    const avgVisitsPerMonth = sixMonthVisits.length / 6;
    const lastVisitDays = latestVisit ? Math.floor((now.getTime() - new Date(latestVisit.date).getTime()) / (24 * 60 * 60 * 1000)) : null;
    
    // Calculate compliance score
    const complianceScore = (() => {
      let score = 0;
      if (avgVisitsPerMonth >= 2) score += 30;
      else if (avgVisitsPerMonth >= 1) score += 20;
      else if (avgVisitsPerMonth >= 0.5) score += 10;
      
      if (lastVisitDays && lastVisitDays <= 30) score += 25;
      else if (lastVisitDays && lastVisitDays <= 60) score += 15;
      else if (lastVisitDays && lastVisitDays <= 90) score += 5;
      
      if (serviceFrequency.vaccination >= 2) score += 20;
      else if (serviceFrequency.vaccination >= 1) score += 10;
      
      if (Object.values(serviceFrequency).filter(count => count > 0).length >= 3) score += 15;
      else if (Object.values(serviceFrequency).filter(count => count > 0).length >= 2) score += 10;
      
      if (totalAnimals > 0) score += 10;
      
      return Math.min(score, 100);
    })();
    
    return {
      totalVisits: allVisits.length,
      recentVisits: recentVisits.length,
      avgVisitsPerMonth: Math.round(avgVisitsPerMonth * 10) / 10,
      lastVisitDays,
      serviceFrequency,
      serviceGrowth,
      quarters,
      yearVisits: yearVisits.length,
      complianceScore,
      mostUsedService: Object.entries(serviceFrequency).reduce((a, b) => serviceFrequency[a[0]] > serviceFrequency[b[0]] ? a : b)[0]
    };
  };

  const analytics = getAnalytics();

  const getHealthStatus = () => {
    const daysSinceLastVisit = analytics.lastVisitDays;
    if (!daysSinceLastVisit) return { status: 'unknown', color: 'gray', text: 'غير محدد' };
    if (daysSinceLastVisit <= 30) return { status: 'active', color: 'green', text: 'نشط' };
    if (daysSinceLastVisit <= 90) return { status: 'moderate', color: 'yellow', text: 'متوسط النشاط' };
    return { status: 'inactive', color: 'red', text: 'غير نشط' };
  };

  const healthStatus = getHealthStatus();

  return (
    <MainLayout>
      <div className="space-y-6 rtl" dir="rtl">
        {/* Enhanced Report Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.back()} className="hover:bg-white">
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                العودة
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="hover:bg-white">
                <Printer className="h-4 w-4 ml-2" />
                طباعة
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAnalytics(!showAnalytics)} className="hover:bg-white">
                <BarChart3 className="h-4 w-4 ml-2" />
                {showAnalytics ? 'إخفاء التحليلات' : 'عرض التحليلات'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`/clients/${clientId}/professional-report?export=pdf`, '_blank')} className="hover:bg-white">
                <Download className="h-4 w-4 ml-2" />
                تصدير PDF
              </Button>
            </div>
            <div className="text-left" dir="ltr">
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                تاريخ التقرير
              </div>
              <div className="font-mono text-sm font-semibold">{formatDate(new Date().toISOString())}</div>
            </div>
          </div>
          
          <div className="text-center border-2 border-blue-300 bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">تقرير معلومات المربي الشامل</h1>
            </div>
            <p className="text-gray-600 mb-4">نظام إدارة رعاية الحيوان - قسم خدمات المربين</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">{client?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>{villageInfo.village}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <Badge className={`bg-${healthStatus.color}-100 text-${healthStatus.color}-800 border-${healthStatus.color}-300`}>
                  {healthStatus.text}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الحيوانات</p>
                  <p className="text-2xl font-bold text-blue-600">{totalAnimals}</p>
                  <p className="text-xs text-gray-500">رأس مسجل</p>
                </div>
                <PieChart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الزيارات</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.totalVisits}</p>
                  <p className="text-xs text-gray-500">{analytics.yearVisits} في السنة الأخيرة</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط شهري</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.avgVisitsPerMonth}</p>
                  <p className="text-xs text-gray-500">زيارة/شهر</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">آخر زيارة</p>
                  <p className="text-lg font-bold text-orange-600">
                    {analytics.lastVisitDays ? `${analytics.lastVisitDays} يوم` : 'لا توجد'}
                  </p>
                  <p className="text-xs text-gray-500">{analytics.recentVisits} في آخر 30 يوم</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">درجة الالتزام</p>
                  <p className="text-2xl font-bold text-indigo-600">{analytics.complianceScore}%</p>
                  <p className="text-xs text-gray-500">
                    {analytics.complianceScore >= 80 ? 'ممتاز' : 
                     analytics.complianceScore >= 60 ? 'جيد' : 
                     analytics.complianceScore >= 40 ? 'متوسط' : 'يحتاج تحسين'}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quarterly Trends */}
        <Card className="shadow-lg border-l-4 border-l-teal-500">
          <CardHeader className="bg-teal-50">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              الاتجاهات الفصلية والمقارنات الزمنية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">أداء الأرباع الأخيرة</h4>
                <div className="space-y-3">
                  {analytics.quarters.map((quarter, index) => {
                    const maxVisits = Math.max(...analytics.quarters.map(q => q.visits));
                    const percentage = maxVisits > 0 ? (quarter.visits / maxVisits) * 100 : 0;
                    return (
                      <div key={quarter.period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm w-8">{quarter.period}</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-teal-600">{quarter.visits} زيارة</div>
                          <div className="text-xs text-gray-600">{quarter.services} خدمة مختلفة</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">اتجاهات الخدمات</h4>
                <div className="space-y-3">
                  {Object.entries(analytics.serviceGrowth).map(([service, data]) => {
                    const serviceNames = {
                      vaccination: 'التطعيمات',
                      mobileClinic: 'العيادة المتنقلة',
                      parasiteControl: 'مكافحة الطفيليات',
                      laboratory: 'المختبر',
                      equineHealth: 'صحة الخيول'
                    };
                    
                    return (
                      <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{serviceNames[service as keyof typeof serviceNames]}</span>
                          {data.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {data.trend === 'down' && <ArrowLeft className="h-4 w-4 text-red-500 rotate-45" />}
                          {data.trend === 'stable' && <div className="w-4 h-0.5 bg-gray-400"></div>}
                        </div>
                        <div className="text-right text-xs">
                          <div>الحالي: {data.current}</div>
                          <div className="text-gray-500">السابق: {data.previous}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        {showAnalytics && (
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                تحليلات متقدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-800">توزيع الخدمات</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.serviceFrequency).map(([service, count]) => {
                      const serviceNames = {
                        vaccination: 'التطعيمات',
                        mobileClinic: 'العيادة المتنقلة',
                        parasiteControl: 'مكافحة الطفيليات',
                        laboratory: 'المختبر',
                        equineHealth: 'صحة الخيول'
                      };
                      const percentage = analytics.totalVisits > 0 ? ((count / analytics.totalVisits) * 100).toFixed(1) : 0;
                      return (
                        <div key={service} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{serviceNames[service as keyof typeof serviceNames]}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-mono">{count} ({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-gray-800">مؤشرات الأداء المتقدمة</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">درجة الالتزام العامة</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              analytics.complianceScore >= 80 ? 'bg-green-500' :
                              analytics.complianceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${analytics.complianceScore}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-sm">{analytics.complianceScore}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">الخدمة الأكثر استخداماً</span>
                      <Badge variant="outline">
                        {{
                          vaccination: 'التطعيمات',
                          mobileClinic: 'العيادة المتنقلة',
                          parasiteControl: 'مكافحة الطفيليات',
                          laboratory: 'المختبر',
                          equineHealth: 'صحة الخيول'
                        }[analytics.mostUsedService as keyof typeof analytics.serviceFrequency]}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">النشاط الحديث (30 يوم)</span>
                      <div className="text-right">
                        <div className="font-semibold">{analytics.recentVisits} زيارة</div>
                        <div className="text-xs text-gray-500">
                          {analytics.recentVisits > analytics.avgVisitsPerMonth ? 'أعلى من المتوسط' :
                           analytics.recentVisits === Math.round(analytics.avgVisitsPerMonth) ? 'ضمن المتوسط' : 'أقل من المتوسط'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">تنوع الخدمات</span>
                      <div className="text-right">
                        <div className="font-semibold">{Object.values(analytics.serviceFrequency).filter(count => count > 0).length}/5</div>
                        <div className="text-xs text-gray-500">خدمة مستخدمة</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">حالة النشاط</span>
                      <div className="flex items-center gap-2">
                        {healthStatus.status === 'active' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {healthStatus.status === 'moderate' && <Clock className="h-4 w-4 text-yellow-500" />}
                        {healthStatus.status === 'inactive' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        <span className={`text-${healthStatus.color}-600 font-semibold`}>{healthStatus.text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Breeder Identification & Contact */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              1. البيانات التعريفية ومعلومات الاتصال
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 bg-gray-50 font-semibold w-1/3">اسم المربي</td>
                  <td className="py-3 px-4">{client.name || "غير محدد"}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 bg-gray-50 font-semibold">رقم الهوية الوطنية</td>
                  <td className="py-3 px-4 font-mono" dir="ltr">{client.nationalId || "غير محدد"}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 bg-gray-50 font-semibold">رقم الهاتف</td>
                  <td className="py-3 px-4 font-mono" dir="ltr">{client.phone || "غير محدد"}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 bg-gray-50 font-semibold">تاريخ الميلاد</td>
                  <td className="py-3 px-4">{client.birthDate ? formatDate(client.birthDate) : "غير محدد"}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 bg-gray-50 font-semibold">الحالة</td>
                  <td className="py-3 px-4">
                    <Badge variant={client.status === "نشط" ? "default" : "secondary"}>
                      {client.status || "غير محدد"}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Location & Holding Details */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-green-600" />
              2. الموقع ومعلومات رمز الحياة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 bg-gray-50 font-semibold w-1/3">القرية</td>
                  <td className="py-3 px-4">{villageInfo.village}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 bg-gray-50 font-semibold">رمز الحياة (Holding Code)</td>
                  <td className="py-3 px-4 font-mono" dir="ltr">{villageInfo.code || "غير محدد"}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-semibold">العنوان التفصيلي</td>
                  <td className="py-3 px-4">{client.detailedAddress || "غير محدد"}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Animal Inventory */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-purple-600" />
              3. جرد الحيوانات والثروة الحيوانية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalAnimals}</div>
                  <div className="text-sm text-blue-700 font-medium">إجمالي الرؤوس</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {totalAnimals > 0 ? `محدث في ${latestVisit ? formatDate(latestVisit.date) : 'غير محدد'}` : 'لا توجد بيانات'}
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(() => {
                      const healthyTypes = Object.entries(animalCounts).filter(([_, count]) => count > 0).length;
                      return healthyTypes;
                    })()}
                  </div>
                  <div className="text-sm text-green-700 font-medium">أنواع الحيوانات</div>
                  <div className="text-xs text-gray-600 mt-1">نوع مختلف مسجل</div>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {totalAnimals > 0 ? Math.round(totalAnimals / Math.max(Object.entries(animalCounts).filter(([_, count]) => count > 0).length, 1)) : 0}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">متوسط القطيع</div>
                  <div className="text-xs text-gray-600 mt-1">رأس لكل نوع</div>
                </div>
              </div>
            </div>

            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-3 px-4 text-right font-semibold">نوع الحيوان</th>
                  <th className="py-3 px-4 text-center font-semibold">العدد</th>
                  <th className="py-3 px-4 text-center font-semibold">النسبة</th>
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
                  
                  return (
                    <tr key={type} className="border-b">
                      <td className="py-3 px-4">{arabicType}</td>
                      <td className="py-3 px-4 text-center font-mono">{count}</td>
                      <td className="py-3 px-4 text-center font-mono">{percentage}%</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-4">المجموع</td>
                  <td className="py-3 px-4 text-center font-mono">{totalAnimals}</td>
                  <td className="py-3 px-4 text-center font-mono">100%</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Visit History & Service Summary */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-green-600" />
              4. ملخص الخدمات والزيارات البيطرية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <table className="w-full text-sm border mb-4">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-3 px-4 text-right font-semibold">نوع الخدمة</th>
                  <th className="py-3 px-4 text-center font-semibold">عدد الزيارات</th>
                  <th className="py-3 px-4 text-right font-semibold">آخر زيارة</th>
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
                  
                  return (
                    <tr key={service.type} className="border-b">
                      <td className="py-3 px-4">{service.name}</td>
                      <td className="py-3 px-4 text-center font-mono">{service.visits.length}</td>
                      <td className="py-3 px-4">
                        {latestServiceVisit ? formatDate(latestServiceVisit.date) : "لا توجد زيارات"}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-4">إجمالي الزيارات</td>
                  <td className="py-3 px-4 text-center font-mono">
                    {getAllVisitsFlat().length}
                  </td>
                  <td className="py-3 px-4">
                    {latestVisit ? formatDate(latestVisit.date) : "لا توجد زيارات"}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-xs text-gray-600 p-3 bg-gray-50 border">
              <div><strong>آخر تفاعل:</strong> {latestVisit ? `${formatDate(latestVisit.date)} - ${latestVisit.serviceType}` : 'لا توجد بيانات'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Visit Records */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-orange-600" />
              5. سجلات الزيارات التفصيلية والتدخلات البيطرية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 border">
              <div>
                <label className="text-sm font-semibold mb-2 block">تصفية حسب الخدمة</label>
                <select 
                  className="w-full p-2 border text-sm"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                >
                  <option value="all">جميع الخدمات</option>
                  <option value="vaccination">تطعيم</option>
                  <option value="mobileClinic">عيادة متنقلة</option>
                  <option value="parasiteControl">مكافحة طفيليات</option>
                  <option value="equineHealth">صحة الخيول</option>
                  <option value="laboratory">مختبر</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">من تاريخ</label>
                <input 
                  type="date" 
                  className="w-full p-2 border text-sm"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">إلى تاريخ</label>
                <input 
                  type="date" 
                  className="w-full p-2 border text-sm"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                />
              </div>
            </div>

            {/* Visits Table */}
            <div className="border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-right font-semibold">#</th>
                    <th className="py-3 px-4 text-right font-semibold">التاريخ</th>
                    <th className="py-3 px-4 text-right font-semibold">نوع الخدمة</th>
                    <th className="py-3 px-4 text-right font-semibold">المشرف</th>
                    <th className="py-3 px-4 text-right font-semibold">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisits().length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        لا توجد زيارات مسجلة
                      </td>
                    </tr>
                  ) : (
                    filteredVisits().map((visit, index) => (
                      <tr key={`${visit._type}-${visit._id || index}`} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono">{index + 1}</td>
                        <td className="py-3 px-4">{formatDate(visit.date)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{visit.serviceType}</Badge>
                        </td>
                        <td className="py-3 px-4">{visit.supervisor || visit.collector || "غير محدد"}</td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          {visit.notes || visit.diagnosis || "لا توجد ملاحظات"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-xs text-gray-600 p-3 bg-gray-50 border">
              <strong>إجمالي الزيارات المعروضة:</strong> {filteredVisits().length} من أصل {getAllVisitsFlat().length}
            </div>
          </CardContent>
        </Card>

        {/* Health & Risk Assessment */}
        <Card className="shadow-lg border-l-4 border-l-yellow-500">
          <CardHeader className="border-b bg-yellow-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-yellow-600" />
              6. تقييم المخاطر والحالة الصحية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  تقييم المخاطر
                </h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">مستوى النشاط</span>
                      <Badge className={`
                        ${healthStatus.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        ${healthStatus.status === 'moderate' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${healthStatus.status === 'inactive' ? 'bg-red-100 text-red-800' : ''}
                        ${healthStatus.status === 'unknown' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {healthStatus.text}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {analytics.lastVisitDays 
                        ? `آخر زيارة قبل ${analytics.lastVisitDays} يوم`
                        : 'لا توجد زيارات مسجلة'
                      }
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">كثافة الزيارات</span>
                      <span className="font-semibold text-blue-600">{analytics.avgVisitsPerMonth} / شهر</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          analytics.avgVisitsPerMonth >= 2 ? 'bg-green-500' :
                          analytics.avgVisitsPerMonth >= 1 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((analytics.avgVisitsPerMonth / 3) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {
                        analytics.avgVisitsPerMonth >= 2 ? 'معدل ممتاز' :
                        analytics.avgVisitsPerMonth >= 1 ? 'معدل جيد' : 'يحتاج متابعة'
                      }
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">حجم القطيع</span>
                      <span className="font-semibold text-purple-600">{totalAnimals} رأس</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {
                        totalAnimals >= 500 ? 'قطيع كبير - يحتاج متابعة مكثفة' :
                        totalAnimals >= 100 ? 'قطيع متوسط - متابعة منتظمة' :
                        totalAnimals > 0 ? 'قطيع صغير - متابعة أساسية' :
                        'لا توجد بيانات حيوانات'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  توصيات وإرشادات
                </h4>
                <div className="space-y-3">
                  {analytics.lastVisitDays && analytics.lastVisitDays > 90 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-800">تنبيه هام</span>
                      </div>
                      <p className="text-xs text-red-700">لم يتم تسجيل زيارات لفترة طويلة. ينصح بجدولة زيارة قريبة.</p>
                    </div>
                  )}
                  
                  {analytics.avgVisitsPerMonth < 1 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-800">تحسين مطلوب</span>
                      </div>
                      <p className="text-xs text-yellow-700">معدل الزيارات منخفض. ينصح بزيادة وتيرة المتابعة.</p>
                    </div>
                  )}
                  
                  {totalAnimals > 200 && analytics.serviceFrequency.vaccination < 2 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-800">تطعيمات مطلوبة</span>
                      </div>
                      <p className="text-xs text-blue-700">قطيع كبير يحتاج برنامج تطعيم منتظم.</p>
                    </div>
                  )}
                  
                  {analytics.totalVisits > 0 && analytics.recentVisits === 0 && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-800">متابعة دورية</span>
                      </div>
                      <p className="text-xs text-purple-700">لا توجد زيارات حديثة. ينصح بزيارة متابعة.</p>
                    </div>
                  )}
                  
                  {analytics.totalVisits > 5 && analytics.avgVisitsPerMonth >= 2 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-800">أداء ممتاز</span>
                      </div>
                      <p className="text-xs text-green-700">مربي ملتزم ببرنامج الرعاية البيطرية.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Benchmarks */}
        <Card className="shadow-lg border-l-4 border-l-indigo-500">
          <CardHeader className="border-b bg-indigo-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              6. مقارنة الأداء والمعايير المرجعية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">مقارنة مع المعايير المثلى</h4>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">معدل الزيارات الشهرية</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{analytics.avgVisitsPerMonth}</span>
                        <span className="text-xs text-gray-500">/ 2.0 (مثالي)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          analytics.avgVisitsPerMonth >= 2 ? 'bg-green-500' :
                          analytics.avgVisitsPerMonth >= 1.5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((analytics.avgVisitsPerMonth / 2) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">تنوع الخدمات</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{Object.values(analytics.serviceFrequency).filter(count => count > 0).length}</span>
                        <span className="text-xs text-gray-500">/ 5 (كامل)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(Object.values(analytics.serviceFrequency).filter(count => count > 0).length / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">الانتظام في الزيارات</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {analytics.lastVisitDays ? (analytics.lastVisitDays <= 30 ? '100%' : analytics.lastVisitDays <= 60 ? '75%' : analytics.lastVisitDays <= 90 ? '50%' : '25%') : '0%'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          !analytics.lastVisitDays ? 'bg-gray-400' :
                          analytics.lastVisitDays <= 30 ? 'bg-green-500' :
                          analytics.lastVisitDays <= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${!analytics.lastVisitDays ? 0 :
                            analytics.lastVisitDays <= 30 ? 100 :
                            analytics.lastVisitDays <= 60 ? 75 :
                            analytics.lastVisitDays <= 90 ? 50 : 25}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">تصنيف المربي</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">{analytics.complianceScore}%</div>
                    <div className="text-lg font-semibold text-gray-800 mb-1">
                      {analytics.complianceScore >= 90 ? 'مربي متميز' :
                       analytics.complianceScore >= 80 ? 'مربي ممتاز' :
                       analytics.complianceScore >= 70 ? 'مربي جيد جداً' :
                       analytics.complianceScore >= 60 ? 'مربي جيد' :
                       analytics.complianceScore >= 50 ? 'مربي مقبول' : 'يحتاج تحسين'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {analytics.complianceScore >= 80 ? 'يلتزم بمعايير الرعاية البيطرية' :
                       analytics.complianceScore >= 60 ? 'أداء جيد مع إمكانية للتحسين' :
                       'يحتاج متابعة أكثر وتحسين الالتزام'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">
                        {analytics.quarters.filter(q => q.visits > 0).length}
                      </div>
                      <div className="text-xs text-green-700">أرباع نشطة</div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round((analytics.yearVisits / Math.max(analytics.totalVisits, 1)) * 100)}%
                      </div>
                      <div className="text-xs text-blue-700">نشاط السنة الأخيرة</div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-semibold text-gray-800 mb-2">نقاط القوة:</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {analytics.complianceScore >= 80 && <div>• التزام ممتاز بالمواعيد</div>}
                      {Object.values(analytics.serviceFrequency).filter(count => count > 0).length >= 4 && <div>• تنوع جيد في الخدمات</div>}
                      {analytics.avgVisitsPerMonth >= 2 && <div>• معدل زيارات مثالي</div>}
                      {totalAnimals >= 100 && <div>• إدارة قطيع كبير</div>}
                      {analytics.recentVisits > 0 && <div>• نشاط حديث مستمر</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Metadata */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-gray-600" />
              7. البيانات الوصفية ومعلومات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">معلومات النظام</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-3 bg-gray-50 font-semibold w-1/2">معرف النظام</td>
                      <td className="py-2 px-3 font-mono text-xs" dir="ltr">{client._id?.slice(-12) || "غير محدد"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 bg-gray-50 font-semibold">تاريخ التسجيل</td>
                      <td className="py-2 px-3">{client.createdAt ? formatDate(client.createdAt) : "غير محدد"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 bg-gray-50 font-semibold">آخر تحديث</td>
                      <td className="py-2 px-3">{client.updatedAt ? formatDate(client.updatedAt) : "غير محدد"}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 bg-gray-50 font-semibold">المستخدم المنشئ</td>
                      <td className="py-2 px-3 text-xs">
                        {client.createdBy?.name || "غير محدد"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">إحصائيات التقرير</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">إجمالي البيانات المعروضة</span>
                      <span className="font-semibold">{7} أقسام</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">مدة التغطية</span>
                      <span className="font-semibold">
                        {analytics.totalVisits > 0 ? 
                          `${Math.round((new Date().getTime() - new Date(getAllVisitsFlat()[getAllVisitsFlat().length - 1]?.date || new Date()).getTime()) / (24 * 60 * 60 * 1000))} يوم` :
                          'لا توجد بيانات'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">مستوى اكتمال البيانات</span>
                      <span className="font-semibold">
                        {(() => {
                          let completeness = 0;
                          if (client.name) completeness += 20;
                          if (client.nationalId) completeness += 20;
                          if (client.phone) completeness += 20;
                          if (totalAnimals > 0) completeness += 20;
                          if (analytics.totalVisits > 0) completeness += 20;
                          return completeness;
                        })()}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs text-blue-700">
                      <div className="font-semibold mb-1">ملاحظة مهمة:</div>
                      <div>جميع البيانات في هذا التقرير محدثة حتى تاريخ {formatDate(new Date().toISOString())} وتعكس الحالة الفعلية للمربي في النظام.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Report Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-300 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">نهاية التقرير الشامل</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
            <div className="p-3 bg-white rounded-lg border">
              <div className="font-semibold text-gray-700">معلومات التقرير</div>
              <div className="text-xs text-gray-600 mt-1">
                <div>تاريخ الإنشاء: {formatDate(new Date().toISOString())}</div>
                <div className="font-mono">معرف التقرير: {client._id?.slice(-8)}</div>
              </div>
            </div>
            
            <div className="p-3 bg-white rounded-lg border">
              <div className="font-semibold text-gray-700">ملخص البيانات</div>
              <div className="text-xs text-gray-600 mt-1">
                <div>{totalAnimals} حيوان مسجل</div>
                <div>{analytics.totalVisits} زيارة بيطرية</div>
              </div>
            </div>
            
            <div className="p-3 bg-white rounded-lg border">
              <div className="font-semibold text-gray-700">حالة المربي</div>
              <div className="text-xs text-gray-600 mt-1">
                <Badge className={`
                  ${healthStatus.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  ${healthStatus.status === 'moderate' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${healthStatus.status === 'inactive' ? 'bg-red-100 text-red-800' : ''}
                  ${healthStatus.status === 'unknown' ? 'bg-gray-100 text-gray-800' : ''}
                `}>
                  {healthStatus.text}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-gray-600 mb-2">تم إنشاء هذا التقرير تلقائياً بواسطة نظام إدارة رعاية الحيوان</p>
            <p className="text-xs text-gray-500">جميع البيانات محدثة حتى تاريخ إنشاء هذا التقرير</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
