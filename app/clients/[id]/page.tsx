"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, FileText, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { formatDate, formatPhoneNumber } from '@/lib/utils';
import type { Client } from "@/types";
import { clientsApi } from '@/lib/api/clients';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [filters, setFilters] = useState({
    dateRange: { from: null as string | null, to: null as string | null },
    serviceType: 'all',
    status: 'all'
  });

  // جلب بيانات المربي
  const { data: clientResponse, isLoading, error } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientsApi.getById(clientId),
    enabled: !!clientId,
  });

  // جلب بيانات الزيارات
  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ['client-visits', clientId],
    queryFn: () => clientsApi.getClientVisits(clientId),
    enabled: !!clientId,
  });

  // معالجة بيانات المربي
  const client = clientResponse as Client;
  const visits = visitsData || {
    mobileClinic: [],
    vaccination: [],
    parasiteControl: [],
    equineHealth: [],
    laboratory: []
  };

  // دالة مساعدة للحصول على معلومات القرية بأمان
  const getVillageInfo = () => {
    // First try to get village from client.village
    let village = client?.village;
    
    // If not found, try to get from holdingCode in visits
    if (!village || (typeof village === 'string' && village === "غير محدد")) {
      const allVisits = [
        ...(visits.vaccination || []),
        ...(visits.mobileClinic || []),
        ...(visits.parasiteControl || []),
        ...(visits.equineHealth || []),
        ...(visits.laboratory || [])
      ];
      
      // Find first visit with populated holdingCode
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
      return {
        village: "غير محدد",
        code: null
      };
    }
    
    // Handle both populated village object and string village name
    if (typeof village === 'object') {
      return {
        village: (village as any).nameArabic || (village as any).nameEnglish || (village as any).name || "غير محدد",
        code: (village as any).serialNumber || null
      };
    }
    
    // Handle string village name (legacy)
    return {
      village: village || "غير محدد",
      code: null
    };
  };

  const villageInfo = getVillageInfo();

  // دالة لحساب أعداد الحيوانات من الزيارات
  const getAnimalCounts = () => {
    const animalCounts = {
      sheep: 0,
      goats: 0,
      camel: 0,
      cattle: 0,
      horse: 0
    };

    // Get animal counts from visits (vaccination, parasite control, mobile clinic)
    const allVisits = [
      ...(visits.vaccination || []),
      ...(visits.parasiteControl || []),
      ...(visits.mobileClinic || [])
    ];

    // Find the most recent visit with herd counts
    const visitWithHerdCounts = allVisits
      .filter(visit => visit.herdCounts || visit.animalCounts)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (visitWithHerdCounts) {
      const herdCounts = visitWithHerdCounts.herdCounts || visitWithHerdCounts.animalCounts;
      if (herdCounts) {
        // Handle both nested structure (herdCounts.sheep.total) and flat structure (herdCounts.sheep)
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
  const totalAnimalsFromVisits = Object.values(animalCounts).reduce((sum, count) => sum + count, 0);

  // تسجيل البيانات للتشخيص
  console.log('🔍 Client response:', clientResponse);
  console.log('🔍 Client data:', client);
  console.log('🔍 Client animals:', client?.animals);
  console.log('🔍 Visits data:', visits);
  console.log('🔍 Client name:', client?.name);
  console.log('🔍 Village info:', villageInfo);
  console.log('🔍 Animal counts from visits:', animalCounts);
  console.log('🔍 Total animals from visits:', totalAnimalsFromVisits);
  
  // Additional debugging for holdingCode
  if (visits.vaccination && visits.vaccination.length > 0) {
    console.log('🔍 First vaccination holdingCode:', visits.vaccination[0].holdingCode);
  }

  if (isLoading || visitsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>جاري تحميل بيانات المربي...</p>
            {visitsLoading && <p className="text-sm text-muted-foreground mt-2">جاري تحميل الزيارات...</p>}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || (!isLoading && !visitsLoading && !client)) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              خطأ في تحميل بيانات المربي
              {error && <span className="block text-sm mt-2">التفاصيل: {error.message}</span>}
            </p>
            <p className="text-gray-600 text-sm mb-4">معرف المربي: {clientId}</p>
            <Button onClick={() => router.back()}>العودة</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // إضافة فحص إضافي للتأكد من وجود البيانات
  if (!client || !client._id) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>جاري تحميل بيانات المربي...</p>
            <p className="text-sm text-muted-foreground mt-2">معرف: {clientId}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 rtl" dir="rtl">
        {/* Enhanced Header with Status - RTL Optimized */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6" dir="rtl">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-white/50"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
              العودة للقائمة
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="flex items-center gap-3 mb-3 justify-end">
                <h1 className="text-4xl font-bold drop-shadow-lg">{client?.name || "غير محدد"}</h1>
                <Badge 
                  variant={client?.status === "نشط" ? "secondary" : "destructive"}
                  className="text-sm px-4 py-2 font-medium border-white/30"
                >
                  {client?.status || "غير محدد"}
                </Badge>
              </div>
              <div className="flex items-center gap-6 justify-end">
                {client?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    <span className="font-medium" dir="ltr">{formatPhoneNumber(client.phone)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">{villageInfo.village}</span>
                  {villageInfo.code && (
                    <Badge variant="outline" className="text-xs border-white/30 mr-2">
                      {villageInfo.code}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-6 text-center">
              <div className="backdrop-blur-sm rounded-xl p-5 min-w-[120px] border hover:bg-white/30 transition-all duration-300">
                <div className="text-3xl font-bold mb-1">{totalAnimalsFromVisits || client?.animals?.reduce((sum, animal) => sum + (animal.animalCount || animal.animal_count || 0), 0) || 0}</div>
                <div className="text-sm font-medium">إجمالي الحيوانات</div>
              </div>
              <div className="backdrop-blur-sm rounded-xl p-5 min-w-[120px] border hover:bg-white/30 transition-all duration-300">
                <div className="text-3xl font-bold mb-1">{(visits.mobileClinic?.length || 0) + (visits.vaccination?.length || 0) + (visits.parasiteControl?.length || 0) + (visits.equineHealth?.length || 0) + (visits.laboratory?.length || 0)}</div>
                <div className="text-sm font-medium">إجمالي الزيارات</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Service Statistics Cards */}
          {[
            { 
              name: 'العيادة المتنقلة', 
              count: visits.mobileClinic?.length || 0, 
              icon: '🚑',
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50'
            },
            { 
              name: 'التطعيمات', 
              count: visits.vaccination?.length || 0, 
              icon: '💉',
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50'
            },
            { 
              name: 'مكافحة الطفيليات', 
              count: visits.parasiteControl?.length || 0, 
              icon: '🛡️',
              color: 'from-yellow-500 to-yellow-600',
              bgColor: 'bg-yellow-50'
            },
            { 
              name: 'المختبر', 
              count: visits.laboratory?.length || 0, 
              icon: '🔬',
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50'
            }
          ].map((service, index) => (
            <Card key={index} className={`${service.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between" dir="rtl">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.color} text-white text-3xl shadow-lg transform hover:rotate-6 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{service.name}</p>
                    <p className="text-3xl font-bold text-gray-800 mb-1">{service.count}</p>
                    <p className="text-xs text-black">زيارة مسجلة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="space-y-6">
            {/* Personal Information - RTL Optimized */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50" dir="rtl">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-gray-800">البيانات الشخصية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-black">الاسم</span>
                    <span className="font-medium">{client?.name || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-black">رقم الهوية</span>
                    <span className="font-mono text-sm">{client?.nationalId || client?.national_id || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-black">رقم الهاتف</span>
                    <span className="font-mono text-sm" dir="ltr">{client?.phone ? formatPhoneNumber(client.phone) : "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-black">القرية</span>
                    <div className="flex items-center gap-2">
                      <span>{villageInfo.village}</span>
                      {villageInfo.code && (
                        <Badge variant="outline" className="text-xs">{villageInfo.code}</Badge>
                      )}
                    </div>
                  </div>
                  {(client?.birthDate || client?.birth_date || client?.birthDateFromForms) && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-black">تاريخ الميلاد</span>
                      <span className="text-sm">
                        {formatDate(client?.birthDate || client?.birth_date || client?.birthDateFromForms)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Latest Activity - RTL Optimized */}
            <Card className="shadow-sm" dir="rtl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span>آخر نشاط</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const allVisits = [
                    ...(visits.mobileClinic || []),
                    ...(visits.vaccination || []),
                    ...(visits.parasiteControl || []),
                    ...(visits.equineHealth || []),
                    ...(visits.laboratory || [])
                  ];
                  
                  if (allVisits.length === 0) {
                    return (
                      <div className="text-center py-6 text-black">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">لا توجد زيارات مسجلة</p>
                      </div>
                    );
                  }
                  
                  const latestVisit = allVisits
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                  
                  return (
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-green-800">
                            {formatDate(latestVisit.date)}
                          </span>
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            آخر زيارة
                          </Badge>
                        </div>
                        {latestVisit.supervisor && (
                          <p className="text-sm text-green-700">
                            المشرف: {latestVisit.supervisor}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <div className="font-medium">{client?.createdAt ? formatDate(client.createdAt) : "غير محدد"}</div>
                          <div className="text-black">تاريخ التسجيل</div>
                        </div>
                        {client?.updatedAt && (
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <div className="font-medium">{formatDate(client.updatedAt)}</div>
                            <div className="text-black">آخر تحديث</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Enhanced Animals Display */}
          <div className="space-y-6">
            {/* Enhanced Animals Section - RTL Optimized */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50" dir="rtl">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <span className="text-2xl">🐑</span>
                  </div>
                  <span className="text-gray-800">توزيع الحيوانات</span>
                </CardTitle>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {(() => {
                        // Calculate total from client animals first
                        const clientAnimalsTotal = client?.animals?.reduce((sum, animal) => {
                          const count = animal.animalCount || animal.animal_count || 0;
                          return sum + (typeof count === 'number' ? count : 0);
                        }, 0) || 0;
                        
                        // If no client animals, use visits data
                        if (clientAnimalsTotal > 0) {
                          return clientAnimalsTotal;
                        }
                        
                        // Return visits total
                        return totalAnimalsFromVisits || 0;
                      })()}
                    </div>
                    <div className="text-xs text-black">إجمالي الرؤوس</div>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {(() => {
                      if (client?.animals && client.animals.length > 0) {
                        return `${client.animals.length} نوع مسجل`;
                      }
                      if (totalAnimalsFromVisits > 0) {
                        const typesCount = Object.values(animalCounts).filter(count => count > 0).length;
                        return `${typesCount} نوع من الزيارات`;
                      }
                      return "لا توجد حيوانات";
                    })()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {(() => {
                  // Helper function to get animal type in Arabic
                  const getAnimalTypeInArabic = (animalType: string) => {
                    const typeMap: Record<string, string> = {
                      'sheep': 'أغنام',
                      'goats': 'ماعز', 
                      'camel': 'إبل',
                      'cattle': 'أبقار',
                      'horse': 'خيول',
                      'أغنام': 'أغنام',
                      'ماعز': 'ماعز',
                      'إبل': 'إبل', 
                      'أبقار': 'أبقار',
                      'خيول': 'خيول'
                    };
                    return typeMap[animalType] || animalType || "غير محدد";
                  };

                  // Helper function to get animal icon
                  const getAnimalIcon = (animalType: string) => {
                    const iconMap: Record<string, string> = {
                      'sheep': '🐑',
                      'goats': '🐐',
                      'camel': '🐪', 
                      'cattle': '🐄',
                      'horse': '🐎',
                      'أغنام': '🐑',
                      'ماعز': '🐐',
                      'إبل': '🐪',
                      'أبقار': '🐄', 
                      'خيول': '🐎'
                    };
                    return iconMap[animalType] || '🐾';
                  };

                  // Helper function to get animal color
                  const getAnimalColor = (animalType: string) => {
                    const colorMap: Record<string, string> = {
                      'sheep': 'text-green-600',
                      'goats': 'text-blue-600',
                      'camel': 'text-yellow-600', 
                      'cattle': 'text-purple-600',
                      'horse': 'text-red-600',
                      'أغنام': 'text-green-600',
                      'ماعز': 'text-blue-600',
                      'إبل': 'text-yellow-600',
                      'أبقار': 'text-purple-600', 
                      'خيول': 'text-red-600'
                    };
                    return colorMap[animalType] || 'text-gray-600';
                  };

                  // Enhanced display for client.animals if available
                  if (client?.animals && client.animals.length > 0) {
                    const totalCount = client.animals.reduce((sum, animal) => {
                      const count = animal.animalCount || animal.animal_count || 0;
                      return sum + (typeof count === 'number' ? count : 0);
                    }, 0);
                    
                    const healthyCount = client.animals
                      .filter(animal => {
                        const healthStatus = animal.healthStatus || animal.health_status;
                        return healthStatus === "سليم";
                      })
                      .reduce((sum, animal) => {
                        const count = animal.animalCount || animal.animal_count || 0;
                        return sum + (typeof count === 'number' ? count : 0);
                      }, 0);

                    // Group animals by type for better distribution view
                    const animalsByType = client.animals.reduce((acc, animal) => {
                      const animalType = getAnimalTypeInArabic(animal.animalType || animal.animal_type || "");
                      const count = animal.animalCount || animal.animal_count || 0;
                      
                      if (!acc[animalType]) {
                        acc[animalType] = {
                          total: 0,
                          healthy: 0,
                          sick: 0,
                          icon: getAnimalIcon(animal.animalType || animal.animal_type || ""),
                          color: getAnimalColor(animal.animalType || animal.animal_type || "")
                        };
                      }
                      
                      acc[animalType].total += count;
                      if ((animal.healthStatus || animal.health_status) === "سليم") {
                        acc[animalType].healthy += count;
                      } else {
                        acc[animalType].sick += count;
                      }
                      
                      return acc;
                    }, {} as Record<string, any>);
                    
                    return (
                      <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                            <div className="text-sm text-blue-700 font-medium">إجمالي الحيوانات</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                            <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
                            <div className="text-sm text-green-700 font-medium">سليمة</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                            <div className="text-2xl font-bold text-red-600">{Math.max(0, totalCount - healthyCount)}</div>
                            <div className="text-sm text-red-700 font-medium">تحتاج رعاية</div>
                          </div>
                        </div>

                        {/* Animal Distribution by Type - Dynamic Grid */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">توزيع الحيوانات حسب النوع</h3>
                          <div className={`grid gap-4 ${
                            (() => {
                              const count = Object.keys(animalsByType).length;
                              if (count === 1) return 'grid-cols-1 max-w-xs mx-auto';
                              if (count === 2) return 'grid-cols-2 max-w-md mx-auto';
                              if (count === 3) return 'grid-cols-3 max-w-2xl mx-auto';
                              if (count === 4) return 'grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto';
                              return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
                            })()
                          }`}>
                            {Object.entries(animalsByType).map(([type, data]) => {
                              const percentage = totalCount > 0 ? ((data.total / totalCount) * 100).toFixed(1) : 0;
                              return (
                                <div key={type} className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                  <div className={`text-4xl mb-3 ${data.color}`}>
                                    {data.icon}
                                  </div>
                                  <div className="font-bold text-gray-800 text-base mb-1">{type}</div>
                                  <div className="text-2xl font-bold text-blue-600 mb-1">{data.total}</div>
                                  <div className="text-xs text-black mb-2">رأس</div>
                                  <div className="text-xs text-gray-600 mb-3">{percentage}% من المجموع</div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="font-medium">{data.healthy}</span>
                                      <span className="text-green-600">سليم</span>
                                    </div>
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="font-medium">{data.sick}</span>
                                      <span className="text-red-600">مريض</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                      <div 
                                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Detailed Animal Cards */}
                        <div className="space-y-4">
                          {client.animals.map((animal, index) => {
                            const animalCount = animal.animalCount || animal.animal_count || 0;
                            const animalType = animal.animalType || animal.animal_type || "";
                            const healthStatus = animal.healthStatus || animal.health_status || "غير محدد";
                            const percentage = totalCount > 0 ? ((animalCount / totalCount) * 100).toFixed(1) : 0;
                            
                            return (
                              <div key={index} className="p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                                      <span className="text-2xl">
                                        {getAnimalIcon(animalType)}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-xl text-gray-800">
                                        {getAnimalTypeInArabic(animalType)}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                                          {animalCount} رأس
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {percentage}% من المجموع
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge 
                                    variant={healthStatus === "سليم" ? "default" : "destructive"}
                                    className="text-sm px-3 py-1"
                                  >
                                    {healthStatus}
                                  </Badge>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mb-4">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-gray-700">{animal.breed || "غير محدد"}</span>
                                      <span className="text-black text-xs">السلالة</span>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-gray-700">{animal.age || "غير محدد"} سنة</span>
                                      <span className="text-black text-xs">العمر</span>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-gray-700">{animal.gender || "غير محدد"}</span>
                                      <span className="text-black text-xs">الجنس</span>
                                    </div>
                                  </div>
                                  {(animal.identificationNumber || animal.identification_number) && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium font-mono text-xs text-gray-700">{animal.identificationNumber || animal.identification_number}</span>
                                        <span className="text-black text-xs">رقم التعريف</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  
                  // Enhanced display for animals from visits
                  if (totalAnimalsFromVisits > 0) {
                    const animalTypes = [
                      { type: 'sheep', name: 'أغنام', count: animalCounts.sheep, icon: '🐑', color: 'text-green-600' },
                      { type: 'goats', name: 'ماعز', count: animalCounts.goats, icon: '🐐', color: 'text-blue-600' },
                      { type: 'camel', name: 'إبل', count: animalCounts.camel, icon: '🐪', color: 'text-yellow-600' },
                      { type: 'cattle', name: 'أبقار', count: animalCounts.cattle, icon: '🐄', color: 'text-purple-600' },
                      { type: 'horse', name: 'خيول', count: animalCounts.horse, icon: '🐎', color: 'text-red-600' }
                    ].filter(animal => animal.count > 0);
                    
                    return (
                      <div className="space-y-6">
                        {/* Data Source Info */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                          <div className="flex items-center gap-3 text-blue-800">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <span className="text-lg">ℹ️</span>
                            </div>
                            <div>
                              <div className="font-medium">البيانات مأخوذة من آخر زيارة مسجلة</div>
                              <div className="text-sm text-blue-600">يمكن تحديث هذه البيانات من خلال إضافة حيوانات جديدة للمربي</div>
                            </div>
                          </div>
                        </div>

                        {/* Summary Statistics */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                            <div className="text-3xl font-bold text-emerald-600">{totalAnimalsFromVisits}</div>
                            <div className="text-sm text-emerald-700 font-medium">إجمالي الحيوانات</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                            <div className="text-3xl font-bold text-indigo-600">{animalTypes.length}</div>
                            <div className="text-sm text-indigo-700 font-medium">أنواع الحيوانات</div>
                          </div>
                        </div>

                        {/* Animal Distribution by Type - Dynamic Grid for Visits Data */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">توزيع الحيوانات حسب النوع</h3>
                          <div className={`grid gap-4 ${
                            (() => {
                              const count = animalTypes.length;
                              if (count === 1) return 'grid-cols-1 max-w-xs mx-auto';
                              if (count === 2) return 'grid-cols-2 max-w-md mx-auto';
                              if (count === 3) return 'grid-cols-3 max-w-2xl mx-auto';
                              if (count === 4) return 'grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto';
                              return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
                            })()
                          }`}>
                            {animalTypes.map((animal, index) => {
                              const percentage = ((animal.count / totalAnimalsFromVisits) * 100).toFixed(1);
                              
                              return (
                                <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                  <div className={`text-4xl mb-3 ${animal.color}`}>
                                    {animal.icon}
                                  </div>
                                  <div className="font-bold text-gray-800 text-base mb-1">{animal.name}</div>
                                  <div className="text-2xl font-bold text-blue-600 mb-1">{animal.count}</div>
                                  <div className="text-xs text-black mb-2">رأس</div>
                                  <div className="text-xs text-gray-600 mb-3">{percentage}% من المجموع</div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                    <div 
                                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <div className="p-2 bg-blue-50 rounded text-xs text-blue-600">
                                    من آخر زيارة
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Enhanced empty state with better guidance
                  return (
                    <div className="text-center py-16">
                      <div className="mb-6">
                        <div className="text-8xl mb-4 opacity-20">🐑</div>
                        <div className="w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mx-auto mb-4"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-black text-xl font-medium">لا توجد حيوانات مسجلة</div>
                        <div className="text-sm text-gray-400 max-w-md mx-auto">
                          لم يتم تسجيل أي حيوانات لهذا المربي بعد. يمكن إضافة الحيوانات من خلال تسجيل زيارة جديدة أو تحديث بيانات المربي.
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                          <Button 
                            onClick={() => router.push('/mobile-clinics/new')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            تسجيل زيارة جديدة
                          </Button>
                          <Button 
                            onClick={() => router.push('/clients')}
                            variant="outline"
                            className="border-gray-300"
                          >
                            العودة لقائمة المربين
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg max-w-lg mx-auto border border-blue-200">
                        <div className="flex items-center gap-3 text-blue-800">
                          <div className="text-lg">💡</div>
                          <div className="text-sm">
                            <div className="font-medium">نصيحة:</div>
                            <div>ستظهر بيانات الحيوانات تلقائياً عند تسجيل أول زيارة للمربي</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Enhanced Animal History & Timeline */}
            {((client?.animals && client.animals.length > 0) || totalAnimalsFromVisits > 0) && (
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-right" dir="rtl">
                    <span className="text-gray-800">تاريخ الحيوانات والتطور</span>
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <span className="text-2xl">📈</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {(() => {
                    // Get animal history from all visits
                    const allVisits = [
                      ...(visits.mobileClinic || []),
                      ...(visits.vaccination || []),
                      ...(visits.parasiteControl || [])
                    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                    const animalHistory = allVisits.map(visit => {
                      const herdCounts = visit.herdCounts || visit.animalCounts || {};
                      const totalCount = Object.values(herdCounts).reduce((sum: number, counts: any) => {
                        return sum + (counts?.total || 0);
                      }, 0);
                      
                      return {
                        date: visit.date,
                        total: totalCount,
                        sheep: herdCounts.sheep?.total || 0,
                        goats: herdCounts.goats?.total || 0,
                        camel: herdCounts.camel?.total || 0,
                        cattle: herdCounts.cattle?.total || 0,
                        horse: herdCounts.horse?.total || 0,
                        serviceType: visit.serviceType || 'unknown'
                      };
                    }).filter(entry => entry.total > 0);

                    if (animalHistory.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-3 opacity-30">📊</div>
                          <div className="text-black font-medium">لا توجد بيانات تاريخية للحيوانات</div>
                          <div className="text-sm text-gray-400 mt-1">ستظهر البيانات التاريخية مع تسجيل المزيد من الزيارات</div>
                        </div>
                      );
                    }

                    const latestData = animalHistory[animalHistory.length - 1];
                    const firstData = animalHistory[0];
                    const growth = latestData.total - firstData.total;
                    const growthPercentage = firstData.total > 0 ? ((growth / firstData.total) * 100).toFixed(1) : 0;

                    return (
                      <div className="space-y-6">
                        {/* Growth Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">{animalHistory.length}</div>
                            <div className="text-sm text-blue-700 font-medium">سجلات تاريخية</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                            <div className="text-2xl font-bold text-green-600">{latestData.total}</div>
                            <div className="text-sm text-green-700 font-medium">آخر عدد مسجل</div>
                          </div>
                          <div className={`text-center p-4 bg-gradient-to-br rounded-xl border ${
                            growth >= 0 
                              ? 'from-emerald-50 to-emerald-100 border-emerald-200' 
                              : 'from-red-50 to-red-100 border-red-200'
                          }`}>
                            <div className={`text-2xl font-bold ${growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {growth >= 0 ? '+' : ''}{growth}
                            </div>
                            <div className={`text-sm font-medium ${growth >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                              التغيير الإجمالي ({growthPercentage}%)
                            </div>
                          </div>
                        </div>

                        {/* Timeline - RTL Optimized */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-lg text-gray-800">التطور التاريخي</h4>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {animalHistory.map((entry, index) => {
                              const isLatest = index === animalHistory.length - 1;
                              const prevEntry = index > 0 ? animalHistory[index - 1] : null;
                              const change = prevEntry ? entry.total - prevEntry.total : 0;
                              
                              return (
                                <div key={index} className={`p-4 rounded-lg border-r-4 ${
                                  isLatest 
                                    ? 'bg-gradient-to-l from-green-50 to-emerald-50 border-green-400' 
                                    : 'bg-gray-50 border-gray-300'
                                } hover:shadow-sm transition-all duration-200`}>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <div className="font-bold text-lg text-gray-800">{entry.total}</div>
                                      {change !== 0 && (
                                        <Badge variant={change > 0 ? "default" : "destructive"} className="text-xs">
                                          {change > 0 ? '+' : ''}{change}
                                        </Badge>
                                      )}
                                      {isLatest && (
                                        <Badge variant="secondary" className="text-xs">
                                          الأحدث
                                        </Badge>
                                      )}
                                      <div className="text-xs text-black">إجمالي الرؤوس</div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <div>
                                        <div className="font-medium text-gray-800">
                                          {formatDate(entry.date)}
                                        </div>
                                        <div className="text-xs text-black">
                                          {entry.serviceType === 'vaccination' ? 'زيارة تطعيم' :
                                           entry.serviceType === 'parasiteControl' ? 'مكافحة طفيليات' :
                                           entry.serviceType === 'mobileClinic' ? 'عيادة متنقلة' : 'زيارة'}
                                        </div>
                                      </div>
                                      <div className={`p-2 rounded-lg ${
                                        isLatest ? 'bg-green-100' : 'bg-gray-100'
                                      }`}>
                                        <span className="text-sm">
                                          {entry.serviceType === 'vaccination' ? '💉' :
                                           entry.serviceType === 'parasiteControl' ? '🛡️' :
                                           entry.serviceType === 'mobileClinic' ? '🚑' : '📋'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Animal breakdown - RTL Optimized */}
                                  <div className="mt-3 flex flex-wrap gap-2 text-xs justify-end">
                                    {entry.sheep > 0 && (
                                      <div className="text-center p-1 bg-white rounded">
                                        <div className="font-medium">{entry.sheep} 🐑</div>
                                      </div>
                                    )}
                                    {entry.goats > 0 && (
                                      <div className="text-center p-1 bg-white rounded">
                                        <div className="font-medium">{entry.goats} 🐐</div>
                                      </div>
                                    )}
                                    {entry.camel > 0 && (
                                      <div className="text-center p-1 bg-white rounded">
                                        <div className="font-medium">{entry.camel} 🐪</div>
                                      </div>
                                    )}
                                    {entry.cattle > 0 && (
                                      <div className="text-center p-1 bg-white rounded">
                                        <div className="font-medium">{entry.cattle} 🐄</div>
                                      </div>
                                    )}
                                    {entry.horse > 0 && (
                                      <div className="text-center p-1 bg-white rounded">
                                        <div className="font-medium">{entry.horse} 🐎</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-indigo-600">
                                {Math.max(...animalHistory.map(h => h.total))}
                              </div>
                              <div className="text-xs text-indigo-700">أعلى عدد</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-600">
                                {Math.min(...animalHistory.map(h => h.total))}
                              </div>
                              <div className="text-xs text-purple-700">أقل عدد</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-pink-600">
                                {(animalHistory.reduce((sum, h) => sum + h.total, 0) / animalHistory.length).toFixed(0)}
                              </div>
                              <div className="text-xs text-pink-700">المتوسط</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-orange-600">
                                {animalHistory.length > 1 ? 
                                  Math.round((animalHistory[animalHistory.length - 1].total - animalHistory[0].total) / (animalHistory.length - 1))
                                  : 0}
                              </div>
                              <div className="text-xs text-orange-700">متوسط النمو</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Recent Visits & Additional Info */}
          <div className="space-y-6">
            {/* Recent Visits */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>📋</span>
                  <span>آخر الزيارات</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const allVisits = [
                    ...(visits.mobileClinic || []).map((v: any) => ({ ...v, type: 'mobile_clinic', typeName: 'العيادة المتنقلة', icon: '🚑', color: 'bg-blue-50 border-blue-200 text-blue-800' })),
                    ...(visits.vaccination || []).map((v: any) => ({ ...v, type: 'vaccination', typeName: 'التطعيم', icon: '💉', color: 'bg-green-50 border-green-200 text-green-800' })),
                    ...(visits.parasiteControl || []).map((v: any) => ({ ...v, type: 'parasite_control', typeName: 'مكافحة الطفيليات', icon: '🛡️', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' })),
                    ...(visits.equineHealth || []).map((v: any) => ({ ...v, type: 'equine_health', typeName: 'صحة الخيول', icon: '🐎', color: 'bg-purple-50 border-purple-200 text-purple-800' })),
                    ...(visits.laboratory || []).map((v: any) => ({ ...v, type: 'laboratory', typeName: 'المختبر', icon: '🔬', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' }))
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
                  
                  if (allVisits.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4 opacity-20">📋</div>
                        <div className="text-black mb-2 font-medium">لا توجد زيارات مسجلة</div>
                        <div className="text-sm text-gray-400">
                          لم يتم تسجيل أي زيارات لهذا المربي بعد
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-3">
                      {allVisits.map((visit, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${visit.color} hover:shadow-sm transition-shadow`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{visit.icon}</span>
                              <div>
                                <div className="font-medium text-sm">{visit.typeName}</div>
                                <div className="text-xs opacity-75">
                                  {formatDate(visit.date)}
                                </div>
                              </div>
                            </div>
                            {visit.serialNo && (
                              <Badge variant="outline" className="text-xs font-mono">
                                {visit.serialNo}
                              </Badge>
                            )}
                          </div>
                          {visit.supervisor && (
                            <div className="text-xs opacity-75">
                              المشرف: {visit.supervisor}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* System Information */} 
            <Card className="shadow-sm" dir="rtl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>⚙️</span>
                  <span>معلومات النظام</span>
                </CardTitle>
              </CardHeader>
              <CardContent dir="rtl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm">{client?.nationalId || client?.national_id || "غير محدد"}</span>
                    <span className="text-sm text-black">رقم الهوية</span>
                  </div>
                  
                  {villageInfo.code && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <Badge variant="outline" className="font-mono">{villageInfo.code}</Badge>
                      <span className="text-sm text-black">رمز الحيازة</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <Badge variant={client?.status === "نشط" ? "secondary" : "destructive"}>
                      {client?.status || "غير محدد"}
                    </Badge>
                    <span className="text-sm text-black">الحالة</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-sm font-medium text-blue-800">
                        {client?.createdAt ? formatDate(client.createdAt) : "غير محدد"}
                      </div>
                      <div className="text-xs text-blue-600">تاريخ التسجيل</div>
                    </div>
                    
                    {client?.updatedAt && (
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <div className="text-sm font-medium text-green-800">
                          {formatDate(client.updatedAt)}
                        </div>
                        <div className="text-xs text-green-600">آخر تحديث</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Tabs Section */}
        <Card className="shadow-sm mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="overview" className="flex items-center gap-2">
               
                  <span>نظرة عامة</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <span>📊</span>
                  <span>التقارير المفصلة</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <span>📈</span>
                  <span>التحليلات</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* نظرة عامة */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Services Summary */}
                {(() => {
                  const serviceTypes = new Set();
                  if (visits.mobileClinic?.length > 0) serviceTypes.add('mobile_clinic');
                  if (visits.vaccination?.length > 0) serviceTypes.add('vaccination');
                  if (visits.parasiteControl?.length > 0) serviceTypes.add('parasite_control');
                  if (visits.equineHealth?.length > 0) serviceTypes.add('equine_health');
                  if (visits.laboratory?.length > 0) serviceTypes.add('laboratory');
                  
                  if (serviceTypes.size === 0) {
                    return (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="text-6xl mb-4 opacity-20">🏥</div>
                        <div className="text-black mb-2 font-medium">لا توجد خدمات مسجلة</div>
                        <div className="text-sm text-gray-400">
                          لم يتم تقديم أي خدمات لهذا المربي بعد
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-bold text-blue-800 mb-4 text-right">الخدمات المقدمة</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Array.from(serviceTypes).map((service) => {
                          const serviceInfo: Record<string, {name: string, icon: string, color: string}> = {
                            'parasite_control': {name: 'مكافحة الطفيليات', icon: '🛡️', color: 'bg-yellow-100 text-yellow-800 border-yellow-300'},
                            'vaccination': {name: 'التحصين', icon: '💉', color: 'bg-green-100 text-green-800 border-green-300'},
                            'mobile_clinic': {name: 'العيادة المتنقلة', icon: '🚑', color: 'bg-blue-100 text-blue-800 border-blue-300'},
                            'equine_health': {name: 'صحة الخيول', icon: '🐎', color: 'bg-purple-100 text-purple-800 border-purple-300'},
                            'laboratory': {name: 'المختبر', icon: '🔬', color: 'bg-indigo-100 text-indigo-800 border-indigo-300'}
                          };
                          
                          const info = serviceInfo[service as keyof typeof serviceInfo];
                          return (
                            <div key={String(service)} className={`p-3 rounded-lg border ${info.color} text-center`}>
                              <div className="text-2xl mb-1">{info.icon}</div>
                              <div className="text-sm font-medium">{info.name}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Recent Activity Timeline */}
                {(() => {
                  const allVisits = [
                    ...(visits.mobileClinic || []).map(v => ({ ...v, type: 'mobile_clinic', typeName: 'العيادة المتنقلة', icon: '🚑' })),
                    ...(visits.vaccination || []).map(v => ({ ...v, type: 'vaccination', typeName: 'التطعيم', icon: '💉' })),
                    ...(visits.parasiteControl || []).map(v => ({ ...v, type: 'parasite_control', typeName: 'مكافحة الطفيليات', icon: '🛡️' })),
                    ...(visits.equineHealth || []).map(v => ({ ...v, type: 'equine_health', typeName: 'صحة الخيول', icon: '🐎' })),
                    ...(visits.laboratory || []).map(v => ({ ...v, type: 'laboratory', typeName: 'المختبر', icon: '🔬' }))
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
                  
                  if (allVisits.length === 0) return null;
                  
                  return (
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 text-right flex items-center gap-2">
                        <span>📅</span>
                        <span>الأنشطة الأخيرة</span>
                      </h3>
                      <div className="space-y-4">
                        {allVisits.map((visit, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="text-2xl">{visit.icon}</div>
                            <div className="flex-1 text-right">
                              <div className="font-medium text-gray-800">{visit.typeName}</div>
                              <div className="text-sm text-gray-600">{formatDate(visit.date)}</div>
                              {visit.supervisor && (
                                <div className="text-xs text-black">المشرف: {visit.supervisor}</div>
                              )}
                            </div>
                            {visit.serialNo && (
                              <Badge variant="outline" className="font-mono text-xs">
                                {visit.serialNo}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </TabsContent>

              {/* التقارير المفصلة */}
              <TabsContent value="reports" className="space-y-6 mt-0">
                {/* Date Filters */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-right flex items-center gap-2">
                    <span>🔍</span>
                    <span>فلاتر التقارير</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {/* Date Range Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block text-right">من تاريخ</label>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        value={filters.dateRange.from || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, from: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block text-right">إلى تاريخ</label>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        value={filters.dateRange.to || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, to: e.target.value }
                        }))}
                      />
                    </div>
                    
                    {/* Service Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 block text-right">نوع الخدمة</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        value={filters.serviceType}
                        onChange={(e) => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
                      >
                        <option value="all">جميع الخدمات</option>
                        <option value="mobileClinic">العيادة المتنقلة</option>
                        <option value="vaccination">التطعيمات</option>
                        <option value="parasiteControl">مكافحة الطفيليات</option>
                        <option value="equineHealth">صحة الخيول</option>
                        <option value="laboratory">المختبر</option>
                      </select>
                    </div>
                    
                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => setFilters({
                          dateRange: { from: null, to: null },
                          serviceType: 'all',
                          status: 'all'
                        })}
                        className="w-full"
                      >
                        مسح الفلاتر
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Detailed Reports */}
                {(() => {
                  // Combine all visits with type information
                  const allVisits = [
                    ...(visits.mobileClinic || []).map(v => ({ 
                      ...v, 
                      serviceType: 'mobileClinic',
                      serviceName: 'العيادة المتنقلة',
                      icon: '🚑',
                      color: 'blue'
                    })),
                    ...(visits.vaccination || []).map(v => ({ 
                      ...v, 
                      serviceType: 'vaccination',
                      serviceName: 'التطعيمات',
                      icon: '💉',
                      color: 'green'
                    })),
                    ...(visits.parasiteControl || []).map(v => ({ 
                      ...v, 
                      serviceType: 'parasiteControl',
                      serviceName: 'مكافحة الطفيليات',
                      icon: '🛡️',
                      color: 'yellow'
                    })),
                    ...(visits.equineHealth || []).map(v => ({ 
                      ...v, 
                      serviceType: 'equineHealth',
                      serviceName: 'صحة الخيول',
                      icon: '🐎',
                      color: 'purple'
                    })),
                    ...(visits.laboratory || []).map(v => ({ 
                      ...v, 
                      serviceType: 'laboratory',
                      serviceName: 'المختبر',
                      icon: '🔬',
                      color: 'red'
                    }))
                  ];

                  // Apply filters
                  const filteredVisits = allVisits.filter(visit => {
                    // Date filter
                    if (filters.dateRange.from || filters.dateRange.to) {
                      const visitDate = new Date(visit.date);
                      if (filters.dateRange.from && visitDate < new Date(filters.dateRange.from)) return false;
                      if (filters.dateRange.to && visitDate > new Date(filters.dateRange.to)) return false;
                    }
                    
                    // Service type filter
                    if (filters.serviceType !== 'all' && visit.serviceType !== filters.serviceType) return false;
                    
                    return true;
                  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  if (filteredVisits.length === 0) {
                    return (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="text-6xl mb-4 opacity-20">📋</div>
                        <div className="text-black mb-2 font-medium">لا توجد زيارات تطابق المعايير المحددة</div>
                        <div className="text-sm text-gray-400">
                          جرب تعديل الفلاتر لعرض المزيد من النتائج
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{filteredVisits.length}</div>
                            <div className="text-sm text-blue-700">إجمالي الزيارات</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {new Set(filteredVisits.map(v => v.serviceType)).size}
                            </div>
                            <div className="text-sm text-green-700">أنواع الخدمات</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {new Set(filteredVisits.map(v => v.supervisor).filter(Boolean)).size}
                            </div>
                            <div className="text-sm text-purple-700">المشرفين</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">
                              {filteredVisits.length > 0 ? Math.round(filteredVisits.length * 0.5) : 0}
                            </div>
                            <div className="text-sm text-orange-700">متوسط شهري</div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Visit List */}
                      <div className="space-y-3">
                        {filteredVisits.map((visit, index) => (
                          <div key={`${visit.serviceType}-${visit._id || index}`} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            {/* Visit Header */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{visit.icon}</span>
                                <div>
                                  <h4 className="font-bold text-lg text-gray-800">{visit.serviceName}</h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>📅 {formatDate(visit.date)}</span>
                                    {visit.supervisor && <span>👨‍⚕️ {visit.supervisor}</span>}
                                    {visit.serialNo && <span>🔢 {visit.serialNo}</span>}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className={`bg-${visit.color}-50 text-${visit.color}-700 border-${visit.color}-300`}>
                                {visit.serviceName}
                              </Badge>
                            </div>

                            {/* Visit Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm" dir="rtl">
                              {/* Basic Information */}
                              <div className="space-y-2" dir="rtl">
                                <h5 className="font-medium text-gray-700 text-right">المعلومات الأساسية</h5>
                                <div className="bg-gray-50 p-3 rounded space-y-1" dir="rtl">
                                  {visit.serialNo && (
                                    <div className="flex justify-between row-reverse">
                                                                            <span className="text-black">الرقم التسلسلي:</span>
                                      <span className="font-mono text-xs">{visit.serialNo}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-black">التاريخ:</span>
                                    <span>{formatDate(visit.date)}</span>
                                  </div>
                                  {visit.supervisor && (
                                    <div className="flex justify-between flex-row-reverse">
                                      <span>{visit.supervisor}</span>
                                      <span className="text-black">المشرف:</span>
                                    </div>
                                  )}
                                  {visit.vehicleNo && (
                                    <div className="flex justify-between flex-row-reverse">
                                      <span>{visit.vehicleNo}</span>
                                      <span className="text-black">رقم المركبة:</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Service Specific Details */}
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-700 text-right">تفاصيل الخدمة</h5>
                                <div className="bg-gray-50 p-3 rounded space-y-1">
                                  {/* Vaccination specific */}
                                  {visit.serviceType === 'vaccination' && (
                                    <>
                                      {visit.vaccineType && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.vaccineType}</span>
                                          <span className="text-black">نوع اللقاح:</span>
                                        </div>
                                      )}
                                      {visit.totalVaccinated && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.totalVaccinated}</span>
                                          <span className="text-black">المطعمة:</span>
                                        </div>
                                      )}
                                      {visit.vaccinationCoverage && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.vaccinationCoverage}%</span>
                                          <span className="text-black">نسبة التغطية:</span>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {/* Laboratory specific */}
                                  {visit.serviceType === 'laboratory' && (
                                    <>
                                      {visit.sampleType && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.sampleType}</span>
                                          <span className="text-black">نوع العينة:</span>
                                        </div>
                                      )}
                                      {visit.sampleCode && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.sampleCode}</span>
                                          <span className="text-black">رمز العينة:</span>
                                        </div>
                                      )}
                                      {(visit.positiveCases !== undefined || visit.negativeCases !== undefined) && (
                                        <>
                                          <div className="flex justify-between flex-row-reverse">
                                            <span className="text-red-600">{visit.positiveCases || 0}</span>
                                            <span className="text-black">الحالات الإيجابية:</span>
                                          </div>
                                          <div className="flex justify-between flex-row-reverse">
                                            <span className="text-green-600">{visit.negativeCases || 0}</span>
                                            <span className="text-black">الحالات السلبية:</span>
                                          </div>
                                        </>
                                      )}
                                    </>
                                  )}

                                  {/* Parasite Control specific */}
                                  {visit.serviceType === 'parasiteControl' && (
                                    <>
                                      {visit.totalTreated && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.totalTreated}</span>
                                          <span className="text-black">المعالجة:</span>
                                        </div>
                                      )}
                                      {visit.treatmentEfficiency && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.treatmentEfficiency}%</span>
                                          <span className="text-black">كفاءة العلاج:</span>
                                        </div>
                                      )}
                                      {visit.herdHealthStatus && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.herdHealthStatus}</span>
                                          <span className="text-black">حالة القطيع:</span>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {/* Mobile Clinic specific */}
                                  {visit.serviceType === 'mobileClinic' && (
                                    <>
                                      {visit.diagnosis && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.diagnosis}</span>
                                          <span className="text-black">التشخيص:</span>
                                        </div>
                                      )}
                                      {visit.treatment && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.treatment}</span>
                                          <span className="text-black">العلاج:</span>
                                        </div>
                                      )}
                                      {visit.interventionCategory && (
                                        <div className="flex justify-between flex-row-reverse">
                                          <span>{visit.interventionCategory}</span>
                                          <span className="text-black">نوع التدخل:</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Animal Counts */}
                              {(visit.herdCounts || visit.totalHerdCount) && (
                                <div className="space-y-2">
                                  <h5 className="font-medium text-gray-700 text-right">أعداد الحيوانات</h5>
                                  <div className="bg-gray-50 p-3 rounded space-y-1">
                                    {visit.totalHerdCount && (
                                      <div className="flex justify-between font-medium flex-row-reverse">
                                        <span className="text-blue-600">{visit.totalHerdCount}</span>
                                        <span className="text-black">الإجمالي:</span>
                                      </div>
                                    )}
                                    {visit.herdCounts && (
                                      <>
                                        {visit.herdCounts.sheep?.total > 0 && (
                                          <div className="flex justify-between flex-row-reverse">
                                            <span>{visit.herdCounts.sheep.total}</span>
                                            <span className="text-black">🐑 أغنام:</span>
                                          </div>
                                        )}
                                        {visit.herdCounts.goats?.total > 0 && (
                                          <div className="flex justify-between flex-row-reverse">
                                            <span>{visit.herdCounts.goats.total}</span>
                                            <span className="text-black">🐐 ماعز:</span>
                                          </div>
                                        )}
                                        {visit.herdCounts.camel?.total > 0 && (
                                          <div className="flex justify-between">
                                            <span>{visit.herdCounts.camel.total}</span>
                                            <span className="text-black">🐪 إبل:</span>
                                          </div>
                                        )}
                                        {visit.herdCounts.cattle?.total > 0 && (
                                          <div className="flex justify-between">
                                            <span>{visit.herdCounts.cattle.total}</span>
                                            <span className="text-black">🐄 أبقار:</span>
                                          </div>
                                        )}
                                        {visit.herdCounts.horse?.total > 0 && (
                                          <div className="flex justify-between">
                                            <span>{visit.herdCounts.horse.total}</span>
                                            <span className="text-black">🐎 خيول:</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Additional Information */}
                              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <h5 className="font-medium text-gray-700 text-right">معلومات إضافية</h5>
                                <div className="bg-gray-50 p-3 rounded">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {visit.farmLocation && (
                                      <div className="flex justify-between">
                                        <span>{visit.farmLocation}</span>
                                        <span className="text-black">موقع المزرعة:</span>
                                      </div>
                                    )}
                                    {visit.coordinates && (
                                      <div className="md:col-span-2 flex flex-col">
                                        <span className="text-black">الإحداثيات:</span>
                                        <span className="text-black">{visit.coordinates.latitude?.toFixed(4)}, {visit.coordinates.longitude?.toFixed(4)}</span>
                                      </div>
                                    )}
                                    {visit.remarks && (
                                      <div className="md:col-span-2 flex flex-col">
                                        <span className="text-black">الملاحظات:</span>
                                        <span className="text-black">{visit.remarks}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </TabsContent>

              {/* التحليلات المحسنة */}
              <TabsContent value="analytics" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* توزيع الخدمات المحسن */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 text-right flex items-center gap-2">
                      <span>📊</span>
                      <span>توزيع الخدمات</span>
                    </h3>
                    <div className="space-y-4">
                      {[
                        { name: 'العيادة المتنقلة', count: visits.mobileClinic?.length || 0, color: 'bg-blue-500', icon: '🚑' },
                        { name: 'التطعيمات', count: visits.vaccination?.length || 0, color: 'bg-green-500', icon: '💉' },
                        { name: 'مكافحة الطفيليات', count: visits.parasiteControl?.length || 0, color: 'bg-yellow-500', icon: '🛡️' },
                        { name: 'صحة الخيول', count: visits.equineHealth?.length || 0, color: 'bg-purple-500', icon: '🐎' },
                        { name: 'المختبر', count: visits.laboratory?.length || 0, color: 'bg-red-500', icon: '🔬' }
                      ].map((service) => {
                        const total = (visits.mobileClinic?.length || 0) + 
                                     (visits.vaccination?.length || 0) + 
                                     (visits.parasiteControl?.length || 0) + 
                                     (visits.equineHealth?.length || 0) + 
                                     (visits.laboratory?.length || 0);
                        const percentage = total > 0 ? Math.round((service.count / total) * 100) : 0;
                        
                        return (
                          <div key={service.name} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{service.icon}</span>
                                <span className="text-sm font-medium">{service.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold">{service.count}</div>
                                <div className="text-xs text-black">{percentage}%</div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`${service.color} h-3 rounded-full transition-all duration-500 shadow-sm`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* توزيع الحيوانات المحسن */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 text-right flex items-center gap-2">
                      <span>🐑</span>
                      <span>توزيع الحيوانات</span>
                    </h3>
                    {(() => {
                      // Use animals from visits if client.animals is empty
                      const animalsToShow = client?.animals && client.animals.length > 0 
                        ? client.animals 
                        : totalAnimalsFromVisits > 0 
                          ? [
                              { animalType: 'أغنام', animalCount: animalCounts.sheep, icon: '🐑' },
                              { animalType: 'ماعز', animalCount: animalCounts.goats, icon: '🐐' },
                              { animalType: 'إبل', animalCount: animalCounts.camel, icon: '🐪' },
                              { animalType: 'أبقار', animalCount: animalCounts.cattle, icon: '🐄' },
                              { animalType: 'خيول', animalCount: animalCounts.horse, icon: '🐎' }
                            ].filter(animal => animal.animalCount > 0)
                          : [];

                      if (animalsToShow.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4 opacity-20">🐑</div>
                            <div className="text-black mb-2 font-medium">لا توجد حيوانات مسجلة</div>
                          </div>
                        );
                      }

                      const totalAnimalsCount = animalsToShow.reduce((sum, animal) => sum + (animal.animalCount || 0), 0);

                      return (
                        <div className="space-y-4">
                          {animalsToShow.map((animal, index) => {
                            const percentage = totalAnimalsCount > 0 ? Math.round(((animal.animalCount || 0) / totalAnimalsCount) * 100) : 0;
                            
                            return (
                              <div key={index} className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{(animal as any).icon || '🐑'}</span>
                                    <span className="text-sm font-medium">{animal.animalType}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-bold">{animal.animalCount}</div>
                                    <div className="text-xs text-black">{percentage}%</div>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div 
                                    className="bg-indigo-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                          {!(client?.animals && client.animals.length > 0) && totalAnimalsFromVisits > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                              <span className="text-xs text-blue-700">البيانات من آخر زيارة مسجلة</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* النشاط الشهري المحسن */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 text-right flex items-center gap-2">
                    <span>📈</span>
                    <span>النشاط خلال آخر 12 شهر</span>
                  </h3>
                  {(() => {
                    const allVisits = [
                      ...(visits.mobileClinic || []),
                      ...(visits.vaccination || []),
                      ...(visits.parasiteControl || []),
                      ...(visits.equineHealth || []),
                      ...(visits.laboratory || [])
                    ];
                    
                    if (allVisits.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4 opacity-20">📈</div>
                          <div className="text-black mb-2 font-medium">لا توجد زيارات لعرضها</div>
                        </div>
                      );
                    }
                    
                    // تجميع الزيارات حسب الشهر
                    const monthlyData: Record<string, number> = {};
                    const last12Months = [];
                    
                    for (let i = 11; i >= 0; i--) {
                      const date = new Date();
                      date.setMonth(date.getMonth() - i);
                      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                      const monthName = date.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });
                      last12Months.push({ key: monthKey, name: monthName });
                      monthlyData[monthKey] = 0;
                    }
                    
                    allVisits.forEach(visit => {
                      const visitDate = new Date(visit.date);
                      const monthKey = `${visitDate.getFullYear()}-${String(visitDate.getMonth() + 1).padStart(2, '0')}`;
                      if (monthlyData.hasOwnProperty(monthKey)) {
                        monthlyData[monthKey]++;
                      }
                    });
                    
                    const maxVisits = Math.max(...Object.values(monthlyData));
                    
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-2">
                          {last12Months.map((month) => {
                            const count = monthlyData[month.key];
                            const height = maxVisits > 0 ? Math.max((count / maxVisits) * 120, 8) : 8;
                            
                            return (
                              <div key={month.key} className="flex flex-col items-center space-y-2">
                                <div className="flex flex-col items-center justify-end h-32">
                                  <div className="text-xs font-medium text-gray-700 mb-1">{count}</div>
                                  <div 
                                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer shadow-sm"
                                    style={{ height: `${height}px`, width: '24px' }}
                                    title={`${month.name}: ${count} زيارة`}
                                  ></div>
                                </div>
                                <div className="text-xs text-center text-gray-600 w-16 leading-tight">
                                  {month.name.split(' ')[0]}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{allVisits.length}</div>
                            <div className="text-sm text-blue-700">إجمالي الزيارات</div>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {Math.round(allVisits.length / 12 * 10) / 10}
                            </div>
                            <div className="text-sm text-green-700">متوسط شهري</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </MainLayout>
  );
}
