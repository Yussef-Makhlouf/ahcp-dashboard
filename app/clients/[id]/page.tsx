"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, FileText, Calendar, MapPin, Phone, Mail, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "@/lib/api/clients";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import type { Client } from "@/types";
import { AdvancedFilters, FilterState } from "./components/advanced-filters";
import { DetailedReports } from "./components/detailed-reports";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: null, to: null },
    services: [],
    animalTypes: [],
    healthStatus: [],
    villages: [],
    visitCountRange: { min: null, max: null }
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
    if (client?.holdingCode && typeof client.holdingCode === 'object' && client.holdingCode !== null) {
      return {
        village: client.holdingCode.village || client?.village || "غير محدد",
        code: client.holdingCode.code || null
      };
    }
    return {
      village: client?.village || "غير محدد",
      code: null
    };
  };

  const villageInfo = getVillageInfo();

  // تسجيل البيانات للتشخيص
  console.log('🔍 Client response:', clientResponse);
  console.log('🔍 Client data:', client);
  console.log('🔍 Visits data:', visits);
  console.log('🔍 Client name:', client?.name);
  console.log('🔍 Village info:', villageInfo);

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-right">{client?.name || "غير محدد"}</h1>
              <p className="text-muted-foreground text-right">تفاصيل المربي</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 ml-2" />
              تقرير مفصل
            </Button>
            <Button size="sm">
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
          </div>
        </div>

        {/* معلومات أساسية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* البيانات الشخصية */}
          <Card className="text-right">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-end text-right">
                <span>البيانات الشخصية</span>
                <User className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              <div className="text-right">
                <label className="text-sm font-medium text-muted-foreground block mb-1">الاسم</label>
                <p className="font-medium text-right">{client?.name || "غير محدد"}</p>
              </div>
              <div className="text-right">
                <label className="text-sm font-medium text-muted-foreground block mb-1">رقم الهوية</label>
                <p className="font-mono text-right">{client?.nationalId || client?.national_id || "غير محدد"}</p>
              </div>
              <div className="text-right">
                <label className="text-sm font-medium text-muted-foreground block mb-1">رقم الهاتف</label>
                <div className="flex items-center gap-2 justify-end">
                  <span dir="ltr" className="font-mono">{client?.phone ? formatPhoneNumber(client.phone) : "غير محدد"}</span>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              {client?.email && (
                <div className="text-right">
                  <label className="text-sm font-medium text-muted-foreground block mb-1">البريد الإلكتروني</label>
                  <div className="flex items-center gap-2 justify-end">
                    <span>{client?.email}</span>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}
              <div className="text-right">
                <label className="text-sm font-medium text-muted-foreground block mb-1">القرية</label>
                <div className="flex items-center gap-2 justify-end">
                  <span>
                    {villageInfo.village}
                    {villageInfo.code && (
                      <span className="text-xs text-muted-foreground mr-2">(رمز: {villageInfo.code})</span>
                    )}
                  </span>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="text-right">
                <label className="text-sm font-medium text-muted-foreground block mb-1">تاريخ الميلاد</label>
                <div className="flex items-center gap-2 justify-end">
                  <span>
                    {client?.birthDate || client?.birth_date || client?.birthDateFromForms 
                      ? formatDate(client?.birthDate || client?.birth_date || client?.birthDateFromForms) 
                      : "غير محدد"}
                  </span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="text-right">
                <label className="text-sm font-medium text-muted-foreground block mb-1">الحالة</label>
                <div className="flex justify-end">
                  <Badge variant={client?.status === "نشط" ? "default" : "secondary"}>
                    {client?.status || "غير محدد"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات سريعة */}
          <Card className="text-right">
            <CardHeader>
              <CardTitle className="text-right">إحصائيات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              {/* إحصائيات رئيسية */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {client?.animals?.reduce((sum, animal) => sum + (animal.animalCount || 0), 0) || 0}
                  </div>
                  <div className="text-xs text-blue-700">إجمالي الحيوانات</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(visits.mobileClinic?.length || 0) + 
                     (visits.vaccination?.length || 0) + 
                     (visits.parasiteControl?.length || 0) + 
                     (visits.equineHealth?.length || 0) + 
                     (visits.laboratory?.length || 0)}
                  </div>
                  <div className="text-xs text-green-700">إجمالي الزيارات</div>
                </div>
              </div>
              
              <Separator />
              
              {/* تفصيل الخدمات */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-right">تفصيل الخدمات:</h4>
                {[
                  { name: 'العيادة المتنقلة', count: visits.mobileClinic?.length || 0, color: 'text-blue-600' },
                  { name: 'التطعيمات', count: visits.vaccination?.length || 0, color: 'text-green-600' },
                  { name: 'المختبر', count: visits.laboratory?.length || 0, color: 'text-purple-600' },
                  { name: 'مكافحة الطفيليات', count: visits.parasiteControl?.length || 0, color: 'text-yellow-600' },
                  { name: 'صحة الخيول', count: visits.equineHealth?.length || 0, color: 'text-red-600' }
                ].map((service, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-xs text-muted-foreground">{service.name}</span>
                    <span className={`font-medium ${service.color}`}>{service.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* آخر نشاط */}
          <Card className="text-right">
            <CardHeader>
              <CardTitle className="text-right">آخر نشاط</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              {/* آخر نشاط */}
              <div className="space-y-3">
                <div className="text-right">
                  <label className="text-sm font-medium text-muted-foreground block mb-1">آخر خدمة</label>
                  <div className="bg-gray-50 p-2 rounded text-right">
                    {(() => {
                      const allVisits = [
                        ...(visits.mobileClinic || []),
                        ...(visits.vaccination || []),
                        ...(visits.parasiteControl || []),
                        ...(visits.equineHealth || []),
                        ...(visits.laboratory || [])
                      ];
                      
                      if (allVisits.length === 0) {
                        return <span className="text-gray-500 text-sm">لا توجد خدمات</span>;
                      }
                      
                      const latestVisit = allVisits
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                      
                      return (
                        <div>
                          <p className="font-medium text-sm">{formatDate(latestVisit.date)}</p>
                          {latestVisit.supervisor && (
                            <p className="text-xs text-muted-foreground">المشرف: {latestVisit.supervisor}</p>
                          )}
                        </div>
                      );
                    })()} 
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-right">
                    <span className="text-muted-foreground">تاريخ التسجيل:</span>
                    <p className="font-medium">{client?.createdAt ? formatDate(client.createdAt) : "غير محدد"}</p>
                  </div>
                  {client?.updatedAt && (
                    <div className="text-right">
                      <span className="text-muted-foreground">آخر تحديث:</span>
                      <p className="font-medium">{formatDate(client.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* معلومات شاملة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الحيوانات */}
          {client?.animals && client.animals.length > 0 && (
            <Card className="text-right">
              <CardHeader>
                <CardTitle className="text-right flex items-center justify-between">
                  <span>الحيوانات المسجلة</span>
                  <Badge variant="secondary">{client.animals.length} نوع</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-right">
                <div className="space-y-3">
                  {client.animals.map((animal, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2 text-right bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{animal.animalCount}</Badge>
                          <Badge 
                            variant={animal.healthStatus === "سليم" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {animal.healthStatus}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{animal.animalType}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-right">
                        <div><span className="text-muted-foreground">السلالة:</span> {animal.breed}</div>
                        <div><span className="text-muted-foreground">العمر:</span> {animal.age} سنة</div>
                        <div><span className="text-muted-foreground">الجنس:</span> {animal.gender}</div>
                        {animal.identificationNumber && (
                          <div><span className="text-muted-foreground">رقم التعريف:</span> {animal.identificationNumber}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* معلومات إضافية */}
          <Card className="text-right">
            <CardHeader>
              <CardTitle className="text-right">معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-right">
              {/* معلومات الاتصال */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">معلومات الاتصال:</h4>
                <div className="bg-blue-50 p-3 rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>الهاتف:</span>
                    <span className="font-mono">{client?.phone ? formatPhoneNumber(client.phone) : "غير محدد"}</span>
                  </div>
                  {client?.email && (
                    <div className="flex justify-between">
                      <span>البريد:</span>
                      <span className="font-mono text-xs">{client.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>القرية:</span>
                    <span>{villageInfo.village}</span>
                  </div>
                </div>
              </div>

              {/* إحصائيات الحيوانات */}
              {client?.animals && client.animals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">إحصائيات الحيوانات:</h4>
                  <div className="bg-green-50 p-3 rounded-lg space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>أنواع الحيوانات:</span>
                      <span className="font-medium">{client.animals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي العدد:</span>
                      <span className="font-medium">{client.animals.reduce((sum, animal) => sum + (animal.animalCount || 0), 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الحيوانات السليمة:</span>
                      <span className="font-medium text-green-600">
                        {client.animals.filter(animal => animal.healthStatus === "سليم").reduce((sum, animal) => sum + (animal.animalCount || 0), 0)}
                      </span>
                    </div>
                    {client.animals.some(animal => animal.healthStatus !== "سليم") && (
                      <div className="flex justify-between">
                        <span>تحتاج رعاية:</span>
                        <span className="font-medium text-red-600">
                          {client.animals.filter(animal => animal.healthStatus !== "سليم").reduce((sum, animal) => sum + (animal.animalCount || 0), 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* معلومات النظام */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">معلومات النظام:</h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>رقم الهوية:</span>
                    <span className="font-mono">{client?.nationalId || client?.national_id || "غير محدد"}</span>
                  </div>
                  {villageInfo.code && (
                    <div className="flex justify-between">
                      <span>رمز الحيازة:</span>
                      <span className="font-mono">{villageInfo.code}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>الحالة:</span>
                    <Badge variant={client?.status === "نشط" ? "default" : "secondary"} className="text-xs">
                      {client?.status || "غير محدد"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs defaultValue="overview" className="w-full text-right">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="reports">التقارير المفصلة</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-6 text-right">
            {/* الخدمات المستلمة */}
            {(() => {
              const serviceTypes = new Set();
              if (visits.mobileClinic?.length > 0) serviceTypes.add('mobile_clinic');
              if (visits.vaccination?.length > 0) serviceTypes.add('vaccination');
              if (visits.parasiteControl?.length > 0) serviceTypes.add('parasite_control');
              if (visits.equineHealth?.length > 0) serviceTypes.add('equine_health');
              if (visits.laboratory?.length > 0) serviceTypes.add('laboratory');
              
              if (serviceTypes.size === 0) return null;
              
              return (
                <Card className="text-right">
                  <CardHeader>
                    <CardTitle className="text-right">الخدمات المستلمة</CardTitle>
                  </CardHeader>
                  <CardContent className="text-right">
                    <div className="flex flex-wrap gap-2 justify-end">
                      {Array.from(serviceTypes).map((service) => {
                        const serviceNames: Record<string, string> = {
                          'parasite_control': 'مكافحة الطفيليات',
                          'vaccination': 'التحصين',
                          'mobile_clinic': 'العيادة المتنقلة',
                          'equine_health': 'صحة الخيول',
                          'laboratory': 'المختبر'
                        };
                        
                        return (
                          <Badge key={service} variant="secondary">
                            {serviceNames[service as keyof typeof serviceNames] || service}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
            
            {/* آخر الزيارات */}
            {(() => {
              const allVisits = [
                ...(visits.mobileClinic || []).map(v => ({ ...v, type: 'mobile_clinic', typeName: 'العيادة المتنقلة' })),
                ...(visits.vaccination || []).map(v => ({ ...v, type: 'vaccination', typeName: 'التطعيم' })),
                ...(visits.parasiteControl || []).map(v => ({ ...v, type: 'parasite_control', typeName: 'مكافحة الطفيليات' })),
                ...(visits.equineHealth || []).map(v => ({ ...v, type: 'equine_health', typeName: 'صحة الخيول' })),
                ...(visits.laboratory || []).map(v => ({ ...v, type: 'laboratory', typeName: 'المختبر' }))
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
              
              if (allVisits.length === 0) return null;
              
              return (
                <Card className="text-right">
                  <CardHeader>
                    <CardTitle className="text-right">آخر الزيارات</CardTitle>
                  </CardHeader>
                  <CardContent className="text-right">
                    <div className="space-y-3">
                      {allVisits.map((visit, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg text-right">
                          <div className="text-sm text-muted-foreground">
                            {visit.serialNo && `رقم: ${visit.serialNo}`}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-medium text-right">{formatDate(visit.date)}</p>
                              {visit.supervisor && (
                                <p className="text-sm text-muted-foreground text-right">المشرف: {visit.supervisor}</p>
                              )}
                            </div>
                            <Badge variant="outline">{visit.typeName}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </TabsContent>

          {/* التقارير المفصلة */}
          <TabsContent value="reports" className="space-y-6 text-right">
            <AdvancedFilters 
              onFiltersChange={setFilters}
              initialFilters={filters}
            />
            <DetailedReports 
              clientId={clientId}
              visits={[
                ...((visits.mobileClinic || []).map(v => ({ ...v, type: 'mobile_clinic' }))),
                ...((visits.vaccination || []).map(v => ({ ...v, type: 'vaccination' }))),
                ...((visits.parasiteControl || []).map(v => ({ ...v, type: 'parasite_control' }))),
                ...((visits.equineHealth || []).map(v => ({ ...v, type: 'equine_health' }))),
                ...((visits.laboratory || []).map(v => ({ ...v, type: 'laboratory' })))
              ]}
              filters={filters}
            />
          </TabsContent>

          {/* التحليلات */}
          <TabsContent value="analytics" className="space-y-6 text-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* توزيع الخدمات */}
              <Card className="text-right">
                <CardHeader>
                  <CardTitle className="text-right">توزيع الخدمات</CardTitle>
                </CardHeader>
                <CardContent className="text-right">
                  <div className="space-y-4">
                    {[
                      { name: 'العيادة المتنقلة', count: visits.mobileClinic?.length || 0, color: 'bg-blue-500' },
                      { name: 'التطعيمات', count: visits.vaccination?.length || 0, color: 'bg-green-500' },
                      { name: 'مكافحة الطفيليات', count: visits.parasiteControl?.length || 0, color: 'bg-yellow-500' },
                      { name: 'صحة الخيول', count: visits.equineHealth?.length || 0, color: 'bg-purple-500' },
                      { name: 'المختبر', count: visits.laboratory?.length || 0, color: 'bg-red-500' }
                    ].map((service) => {
                      const total = (visits.mobileClinic?.length || 0) + 
                                   (visits.vaccination?.length || 0) + 
                                   (visits.parasiteControl?.length || 0) + 
                                   (visits.equineHealth?.length || 0) + 
                                   (visits.laboratory?.length || 0);
                      const percentage = total > 0 ? Math.round((service.count / total) * 100) : 0;
                      
                      return (
                        <div key={service.name} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span>{service.count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${service.color} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* توزيع الحيوانات */}
              <Card className="text-right">
                <CardHeader>
                  <CardTitle className="text-right">توزيع الحيوانات</CardTitle>
                </CardHeader>
                <CardContent className="text-right">
                  {client?.animals && client.animals.length > 0 ? (
                    <div className="space-y-4">
                      {client.animals.map((animal, index) => {
                        const totalAnimals = client.animals?.reduce((sum, a) => sum + (a.animalCount || 0), 0) || 0;
                        const percentage = totalAnimals > 0 ? Math.round((animal.animalCount / totalAnimals) * 100) : 0;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{animal.animalCount} ({percentage}%)</span>
                              <span>{animal.animalType}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">لا توجد حيوانات مسجلة</p>
                  )}
                </CardContent>
              </Card>

              {/* النشاط الشهري */}
              <Card className="md:col-span-2 text-right">
                <CardHeader>
                  <CardTitle className="text-right">النشاط خلال آخر 12 شهر</CardTitle>
                </CardHeader>
                <CardContent className="text-right">
                  {(() => {
                    const allVisits = [
                      ...(visits.mobileClinic || []),
                      ...(visits.vaccination || []),
                      ...(visits.parasiteControl || []),
                      ...(visits.equineHealth || []),
                      ...(visits.laboratory || [])
                    ];
                    
                    if (allVisits.length === 0) {
                      return <p className="text-muted-foreground text-center py-8">لا توجد زيارات لعرضها</p>;
                    }
                    
                    // تجميع الزيارات حسب الشهر
                    const monthlyData = {};
                    const last12Months = [];
                    
                    for (let i = 11; i >= 0; i--) {
                      const date = new Date();
                      date.setMonth(date.getMonth() - i);
                      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                      const monthName = date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
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
                            const height = maxVisits > 0 ? Math.max((count / maxVisits) * 100, 5) : 5;
                            
                            return (
                              <div key={month.key} className="text-center">
                                <div className="flex flex-col items-center justify-end h-32 mb-2">
                                  <div 
                                    className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300"
                                    style={{ height: `${height}%` }}
                                    title={`${month.name}: ${count} زيارة`}
                                  ></div>
                                </div>
                                <div className="text-xs text-muted-foreground transform -rotate-45 origin-center">
                                  {month.name.split(' ')[0]}
                                </div>
                                <div className="text-xs font-medium mt-1">{count}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
