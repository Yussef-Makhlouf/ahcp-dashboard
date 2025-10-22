'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils/date-utils';
import { api } from '@/lib/api/base-api';

interface Client {
  _id: string;
  name: string;
  nationalId: string;
  phone?: string;
  birthDate?: string;
  village?: string;
  detailedAddress?: string;
  status: string;
  animals?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface Visits {
  mobileClinic?: any[];
  vaccination?: any[];
  parasiteControl?: any[];
  equineHealth?: any[];
  laboratory?: any[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [visits, setVisits] = useState<Visits>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate total animals from visits
  const totalAnimalsFromVisits = useMemo(() => {
    let total = 0;
    
    // Add from mobile clinic visits
    visits.mobileClinic?.forEach(visit => {
      total += (visit.sheepCount || 0) + (visit.goatsCount || 0) + 
               (visit.camelCount || 0) + (visit.cattleCount || 0) + (visit.horseCount || 0);
    });
    
    // Add from other visit types if they have animal counts
    visits.vaccination?.forEach(visit => {
      total += visit.totalHerdCount || 0;
    });
    
    visits.parasiteControl?.forEach(visit => {
      total += visit.totalHerdCount || 0;
    });
    
    return total;
  }, [visits]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        
        // Fetch client details
        const clientResponse = await api.get(`/clients/${clientId}`);
        setClient(clientResponse.data);
        
        // Fetch visits for this client
        const visitsResponse = await api.get(`/clients/${clientId}/visits`);
        setVisits(visitsResponse.data || {});
        
      } catch (err: any) {
        console.error('Error fetching client data:', err);
        setError(err.message || 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات المربي...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !client) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-gray-600">{error || 'لم يتم العثور على المربي'}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 mb-8">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{client.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>🆔 {client.nationalId}</span>
                {client.phone && <span>📞 {client.phone}</span>}
                {client.village && <span>📍 {client.village}</span>}
              </div>
            </div>
            <div className="text-left">
              <Badge variant={client.status === "نشط" ? "secondary" : "destructive"} className="text-lg px-4 py-2">
                {client.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* First Column - Client Info */}
          <div className="space-y-6 order-1">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-right" dir="rtl">
                  <span className="text-gray-800">معلومات المربي</span>
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <span className="text-2xl">👤</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm">{client.nationalId}</span>
                    <span className="text-sm text-gray-500">رقم الهوية</span>
                  </div>
                  
                  {client.phone && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-mono text-sm">{client.phone}</span>
                      <span className="text-sm text-gray-500">رقم الهاتف</span>
                    </div>
                  )}
                  
                  {client.village && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">{client.village}</span>
                      <span className="text-sm text-gray-500">القرية</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <Badge variant={client.status === "نشط" ? "secondary" : "destructive"}>
                      {client.status}
                    </Badge>
                    <span className="text-sm text-gray-500">الحالة</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-sm font-medium text-blue-800">
                        {client.createdAt ? formatDate(client.createdAt) : "غير محدد"}
                      </div>
                      <div className="text-xs text-blue-600">تاريخ التسجيل</div>
                    </div>
                    
                    {client.updatedAt && (
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

          {/* Second Column - Animals */}
          <div className="space-y-6 order-2">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-right" dir="rtl">
                  <span className="text-gray-800">إجمالي الحيوانات</span>
                  <div className="p-2 bg-green-100 rounded-xl">
                    <span className="text-2xl">🐑</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Total Animals Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {totalAnimalsFromVisits || client?.animals?.reduce((sum, animal) => sum + (animal.animalCount || 0), 0) || 0}
                    </div>
                    <div className="text-lg font-medium text-blue-700">إجمالي الحيوانات المسجلة</div>
                    <div className="text-sm text-blue-600 mt-1">
                      {client?.animals && client.animals.length > 0
                        ? "من بيانات المربي"
                        : totalAnimalsFromVisits > 0
                          ? "من آخر زيارة مسجلة"
                          : "لا توجد بيانات"}
                    </div>
                  </div>
                </div>

                {/* Animals Distribution */}
                <div className="space-y-4" dir="rtl">
                  <h3 className="text-lg font-bold text-gray-800 text-right flex items-center gap-2">
                    <span>📊</span>
                    <span>توزيع الحيوانات بالتفصيل</span>
                  </h3>

                  {(() => {
                    // Show animals from client data if available
                    if (client?.animals && client.animals.length > 0) {
                      const totalCount = client.animals.reduce((sum, animal) => sum + (animal.animalCount || 0), 0);

                      return (
                        <div className="space-y-4">
                          {client.animals.map((animal, index) => {
                            const percentage = totalCount > 0 ? Math.round(((animal.animalCount || 0) / totalCount) * 100) : 0;

                            return (
                              <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                                      <span className="text-2xl">🐑</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-lg text-gray-800">{animal.animalType || "غير محدد"}</div>
                                      <div className="text-sm text-gray-500">نوع الحيوان</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-3xl font-bold text-gray-800">{animal.animalCount || 0}</div>
                                    <div className="text-sm text-gray-500">{percentage}%</div>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                  <div
                                    className="bg-green-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>

                                {/* Animal Details */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <div className="font-medium text-gray-700">
                                      {animal.healthStatus || animal.health_status || "غير محدد"}
                                    </div>
                                    <div className="text-gray-500 text-xs">الحالة الصحية</div>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <div className="font-medium text-gray-700">
                                      {animal.breed || "غير محدد"}
                                    </div>
                                    <div className="text-gray-500 text-xs">السلالة</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    // Show data from visits if no client animals
                    if (totalAnimalsFromVisits > 0) {
                      return (
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-2">{totalAnimalsFromVisits}</div>
                            <div className="text-gray-600">إجمالي الحيوانات من الزيارات</div>
                            <div className="text-sm text-gray-500 mt-2">
                              البيانات مستخرجة من آخر الزيارات المسجلة
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // No animals found
                    return (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4 opacity-20">🐑</div>
                        <div className="text-gray-500 mb-2 font-medium">لا توجد حيوانات مسجلة</div>
                        <div className="text-sm text-gray-400">
                          سيتم عرض البيانات عند إضافة حيوانات أو تسجيل زيارات
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Third Column - Recent Activity */}
          <div className="space-y-6 order-3 xl:order-1">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-right" dir="rtl">
                  <span className="text-gray-800">النشاط الأخير</span>
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <span className="text-2xl">📈</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {(() => {
                  const allVisits = [
                    ...(visits.mobileClinic || []).map(v => ({ ...v, type: 'mobile_clinic', typeName: 'العيادة المتنقلة', icon: '🚑', color: 'bg-blue-100 text-blue-800 border-blue-300' })),
                    ...(visits.vaccination || []).map(v => ({ ...v, type: 'vaccination', typeName: 'التطعيم', icon: '💉', color: 'bg-green-100 text-green-800 border-green-300' })),
                    ...(visits.parasiteControl || []).map(v => ({ ...v, type: 'parasite_control', typeName: 'مكافحة الطفيليات', icon: '🛡️', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' })),
                    ...(visits.equineHealth || []).map(v => ({ ...v, type: 'equine_health', typeName: 'صحة الخيول', icon: '🐎', color: 'bg-purple-100 text-purple-800 border-purple-300' })),
                    ...(visits.laboratory || []).map(v => ({ ...v, type: 'laboratory', typeName: 'المختبر', icon: '🔬', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' }))
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

                  if (allVisits.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4 opacity-20">📈</div>
                        <div className="text-gray-500 mb-2 font-medium">لا توجد زيارات مسجلة</div>
                        <div className="text-sm text-gray-400">
                          سيتم عرض النشاط عند تسجيل زيارات جديدة
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4" dir="rtl">
                      <h3 className="text-lg font-bold text-gray-800 text-right flex items-center gap-2">
                        <span>📅</span>
                        <span>آخر الزيارات المسجلة</span>
                      </h3>
                      
                      <div className="space-y-3">
                        {allVisits.map((visit, index) => (
                          <div key={index} className={`p-4 rounded-xl border ${visit.color} hover:shadow-md transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{visit.icon}</span>
                                <div className="text-right">
                                  <div className="font-medium text-gray-800">{visit.typeName}</div>
                                  <div className="text-xs text-gray-600">{formatDate(visit.date)}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                {visit.supervisor && (
                                  <div className="text-xs text-gray-600">👨‍⚕️ {visit.supervisor}</div>
                                )}
                                {visit.serialNo && (
                                  <div className="text-xs text-gray-500">#{visit.serialNo}</div>
                                )}
                              </div>
                            </div>
                            
                            {/* Visit Summary */}
                            <div className="text-xs text-gray-600 text-right">
                              {visit.totalHerdCount && (
                                <span>🐑 {visit.totalHerdCount} حيوان</span>
                              )}
                              {visit.totalVaccinated && (
                                <span className="mr-3">💉 {visit.totalVaccinated} مطعم</span>
                              )}
                              {visit.totalTreated && (
                                <span className="mr-3">💊 {visit.totalTreated} معالج</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Summary Stats */}
                      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-3 text-right">ملخص النشاط</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-600">{allVisits.length}</div>
                            <div className="text-gray-600">زيارة حديثة</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {new Set(allVisits.map(v => v.type)).size}
                            </div>
                            <div className="text-gray-600">نوع خدمة</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
                  <span>🏠</span>
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
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-right flex items-center gap-2">
                    <span>📋</span>
                    <span>ملخص عام</span>
                  </h3>
                  <p className="text-gray-600 text-center py-8">قريباً - سيتم إضافة الملخص العام</p>
                </div>
              </TabsContent>

              {/* التقارير المفصلة */}
              <TabsContent value="reports" className="space-y-6 mt-0">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-right flex items-center gap-2">
                    <span>🔍</span>
                    <span>فلاتر التقارير</span>
                  </h3>
                  <p className="text-gray-600 text-center py-8">قريباً - سيتم إضافة التقارير المفصلة</p>
                </div>
              </TabsContent>

              {/* التحليلات */}
              <TabsContent value="analytics" className="space-y-6 mt-0">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-right flex items-center gap-2">
                    <span>📈</span>
                    <span>التحليلات</span>
                  </h3>
                  <p className="text-gray-600 text-center py-8">قريباً - سيتم إضافة التحليلات</p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </MainLayout>
  );
}
