"use client";

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Printer, 
  Calendar as CalendarIcon,
  User,
  FileText,
  Activity
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import type { 
  Client, 
  MobileClinic, 
  Vaccination, 
  ParasiteControl, 
  EquineHealth, 
  Laboratory 
} from "@/types";
import { clientsApi } from '@/lib/api/clients';

/**
 * صفحة تقرير شامل لتفاصيل المربي
 * 
 * تعرض هذه الصفحة:
 * - المعلومات الشخصية للمربي
 * - جرد الثروة الحيوانية
 * - سجل تفصيلي لجميع الزيارات من كافة الأقسام
 * - فلتر التاريخ (من - إلى)
 */
export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  // Date filters
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Fetch client data
  const { data: clientResponse, isLoading: clientLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientsApi.getById(clientId),
    enabled: !!clientId,
  });

  // Fetch visits data
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

  // Format date helper
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  // Get village info
  const getVillageInfo = () => {
    let village = client?.village;
    
    if (!village || village === "غير محدد") {
      // Try to get village from visits
      const allVisitsArray = [
        ...(visits.mobileClinic || []),
        ...(visits.vaccination || []),
        ...(visits.parasiteControl || []),
        ...(visits.equineHealth || []),
        ...(visits.laboratory || [])
      ];
      
      for (const visit of allVisitsArray) {
        const holdingCode = (visit as any).holdingCode;
        if (holdingCode && typeof holdingCode === 'object' && holdingCode.village) {
          return getStringValue(holdingCode.village);
        }
        if ((visit as any).client?.village) {
          return getStringValue((visit as any).client.village);
        }
      }
    }
    
    return getStringValue(village);
  };

  // Flatten all visits into single array with type information
  const allVisits = useMemo(() => {
    const visitsList: Array<any> = [];
    
    // Mobile Clinic visits
    (visits.mobileClinic || []).forEach((v: MobileClinic) => {
      visitsList.push({
        ...v,
        serviceType: 'mobileClinic',
        serviceName: 'العيادة المتنقلة',
        departmentColor: 'bg-blue-100 text-blue-800',
      });
    });
    
    // Vaccination visits
    (visits.vaccination || []).forEach((v: Vaccination) => {
      visitsList.push({
        ...v,
        serviceType: 'vaccination',
        serviceName: 'التطعيمات',
        departmentColor: 'bg-green-100 text-green-800',
      });
    });
    
    // Parasite Control visits
    (visits.parasiteControl || []).forEach((v: ParasiteControl) => {
      visitsList.push({
        ...v,
        serviceType: 'parasiteControl',
        serviceName: 'مكافحة الطفيليات',
        departmentColor: 'bg-purple-100 text-purple-800',
      });
    });
    
    // Equine Health visits
    (visits.equineHealth || []).forEach((v: EquineHealth) => {
      visitsList.push({
        ...v,
        serviceType: 'equineHealth',
        serviceName: 'صحة الخيول',
        departmentColor: 'bg-yellow-100 text-yellow-800',
      });
    });
    
    // Laboratory visits
    (visits.laboratory || []).forEach((v: Laboratory) => {
      visitsList.push({
        ...v,
        serviceType: 'laboratory',
        serviceName: 'المختبر',
        departmentColor: 'bg-red-100 text-red-800',
      });
    });
    
    // Sort by date descending
    return visitsList.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [visits]);

  // Filter visits by date range
  const filteredVisits = useMemo(() => {
    if (!dateFrom && !dateTo) return allVisits;
    
    return allVisits.filter(visit => {
      const visitDate = new Date(visit.date);
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (visitDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (visitDate > toDate) return false;
      }
      return true;
    });
  }, [allVisits, dateFrom, dateTo]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalAnimals = (client?.animals || []).reduce(
      (sum, animal) => sum + (animal.animalCount || 0), 
      0
    );
    
    // Count animals by type
    const animalTypes: Record<string, number> = {};
    (client?.animals || []).forEach(animal => {
      const type = animal.animalType || 'غير محدد';
      animalTypes[type] = (animalTypes[type] || 0) + (animal.animalCount || 0);
    });
    
    // Count visits by department
    const departmentCounts = {
      mobileClinic: visits.mobileClinic?.length || 0,
      vaccination: visits.vaccination?.length || 0,
      parasiteControl: visits.parasiteControl?.length || 0,
      equineHealth: visits.equineHealth?.length || 0,
      laboratory: visits.laboratory?.length || 0,
    };
    
    return {
      totalAnimals,
      animalTypes,
      departmentCounts,
      totalVisits: allVisits.length,
    };
  }, [client, visits, allVisits]);

  // Loading state
  if (clientLoading || visitsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">جاري تحميل بيانات المربي...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Not found state
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

  // Clear filters
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6 max-w-[1600px] mx-auto" dir="rtl">
        {/* Header Section */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.back()}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                  العودة
                </Button>
                <div>
                  <CardTitle className="text-2xl mb-1">تقرير تفاصيل المربي</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    عرض شامل ومفصل لجميع المعلومات والزيارات
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.print()}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                طباعة التقرير
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Client Personal Information */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              المعلومات الشخصية للمربي
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-gray-100 font-semibold w-1/4">اسم المربي</td>
                    <td className="py-3 px-4">{client.name || "غير محدد"}</td>
                    <td className="py-3 px-4 bg-gray-100 font-semibold w-1/4">رقم الهوية الوطنية</td>
                    <td className="py-3 px-4 font-mono" dir="ltr">{client.nationalId || "غير محدد"}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-gray-100 font-semibold">رقم الهاتف</td>
                    <td className="py-3 px-4 font-mono" dir="ltr">{client.phone || "غير محدد"}</td>
                    <td className="py-3 px-4 bg-gray-100 font-semibold">تاريخ الميلاد</td>
                    <td className="py-3 px-4">{formatDate(client.birthDate)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-gray-100 font-semibold">القرية</td>
                    <td className="py-3 px-4">{getVillageInfo()}</td>
                    <td className="py-3 px-4 bg-gray-100 font-semibold">العنوان التفصيلي</td>
                    <td className="py-3 px-4">{client.detailedAddress || "غير محدد"}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 bg-gray-100 font-semibold">حالة المربي</td>
                    <td className="py-3 px-4">
                      <Badge variant={client.status === "نشط" ? "default" : "secondary"}>
                        {client.status || "غير محدد"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 bg-gray-100 font-semibold">البريد الإلكتروني</td>
                    <td className="py-3 px-4">{client.email || "غير محدد"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Animal Inventory */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              جرد الثروة الحيوانية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-right font-semibold border-b">#</th>
                    <th className="py-3 px-4 text-right font-semibold border-b">نوع الحيوان</th>
                    <th className="py-3 px-4 text-right font-semibold border-b">السلالة</th>
                    <th className="py-3 px-4 text-right font-semibold border-b">العدد</th>
                    <th className="py-3 px-4 text-right font-semibold border-b">العمر</th>
                    <th className="py-3 px-4 text-right font-semibold border-b">الجنس</th>
                    <th className="py-3 px-4 text-right font-semibold border-b">الحالة الصحية</th>
                    <th className="py-3 px-4 text-right font-semibold border-b">رقم التعريف</th>
                  </tr>
                </thead>
                <tbody>
                  {client.animals && client.animals.length > 0 ? (
                    client.animals.map((animal, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{animal.animalType || "غير محدد"}</td>
                        <td className="py-3 px-4">{animal.breed || "غير محدد"}</td>
                        <td className="py-3 px-4 font-mono">{animal.animalCount || 0}</td>
                        <td className="py-3 px-4">{animal.age || "غير محدد"}</td>
                        <td className="py-3 px-4">{animal.gender || "غير محدد"}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              animal.healthStatus === "سليم" ? "default" :
                              animal.healthStatus === "مريض" ? "destructive" : "secondary"
                            }
                          >
                            {animal.healthStatus || "غير محدد"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono">{animal.identificationNumber || "غير محدد"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-gray-500">
                        لا توجد حيوانات مسجلة
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 font-bold text-right">الإجمالي</td>
                    <td className="py-3 px-4 font-bold font-mono">{statistics.totalAnimals}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">إجمالي الزيارات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalVisits}</div>
              <p className="text-xs text-muted-foreground mt-1">زيارة من جميع الأقسام</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">إجمالي الحيوانات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalAnimals}</div>
              <p className="text-xs text-muted-foreground mt-1">حيوان مسجل</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">عدد الأقسام المستفيدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(statistics.departmentCounts).filter(count => count > 0).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">قسم</p>
            </CardContent>
          </Card>
        </div>

        {/* Date Filter Section */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              فلترة الزيارات حسب التاريخ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="dateFrom" className="mb-2 block">من تاريخ</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="dateTo" className="mb-2 block">إلى تاريخ</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full"
                />
              </div>

              {(dateFrom || dateTo) && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="min-w-[120px]"
                >
                  مسح الفلتر
                </Button>
              )}

              <div className="text-sm text-muted-foreground px-2">
                عرض {filteredVisits.length} من {allVisits.length} زيارة
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visits History Table */}
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              سجل الزيارات التفصيلي
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredVisits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" dir="rtl">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-right font-semibold border-b">#</th>
                      <th className="py-3 px-4 text-right font-semibold border-b">التاريخ</th>
                      <th className="py-3 px-4 text-right font-semibold border-b">القسم</th>
                      <th className="py-3 px-4 text-right font-semibold border-b">الرقم التسلسلي</th>
                      <th className="py-3 px-4 text-right font-semibold border-b">المشرف</th>
                      <th className="py-3 px-4 text-right font-semibold border-b">رقم المركبة</th>
                      <th className="py-3 px-4 text-right font-semibold border-b">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisits.map((visit, index) => (
                      <VisitRow key={`${visit.serviceType}-${visit._id}`} visit={visit} index={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                لا توجد زيارات مسجلة {(dateFrom || dateTo) ? 'في الفترة المحددة' : ''}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

/**
 * Helper function to safely extract string from value (handles objects)
 */
function getStringValue(value: any): string {
  if (value === null || value === undefined) return 'غير محدد';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  if (typeof value === 'object') {
    // Try common name fields in order of preference
    if (value.nameArabic) return value.nameArabic;
    if (value.nameEnglish) return value.nameEnglish;
    if (value.fullName) return value.fullName;
    if (value.name) return value.name;
    // Fallback to any string property
    for (const key in value) {
      if (typeof value[key] === 'string' && value[key]) {
        return value[key];
      }
    }
    return 'غير محدد';
  }
  return String(value);
}

/**
 * مكون صف الزيارة - يعرض تفاصيل زيارة واحدة
 */
function VisitRow({ visit, index }: { visit: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  return (
    <>
      <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="py-3 px-4">{index + 1}</td>
        <td className="py-3 px-4 font-mono" dir="ltr">{formatDate(visit.date)}</td>
        <td className="py-3 px-4">
          <Badge className={visit.departmentColor}>
            {visit.serviceName}
          </Badge>
        </td>
        <td className="py-3 px-4 font-mono">{getStringValue(visit.serialNo)}</td>
        <td className="py-3 px-4">{getStringValue(visit.supervisor)}</td>
        <td className="py-3 px-4 font-mono">{getStringValue(visit.vehicleNo)}</td>
        <td className="py-3 px-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? 'إخفاء' : 'عرض'} التفاصيل
          </Button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b bg-gray-50">
          <td colSpan={7} className="p-0">
            <VisitDetails visit={visit} serviceType={visit.serviceType} />
          </td>
        </tr>
      )}
    </>
  );
}

/**
 * مكون تفاصيل الزيارة - يعرض التفاصيل الكاملة حسب نوع الخدمة
 */
function VisitDetails({ visit, serviceType }: { visit: any; serviceType: string }) {
  switch (serviceType) {
    case 'mobileClinic':
      return <MobileClinicDetails visit={visit as MobileClinic} />;
    case 'vaccination':
      return <VaccinationDetails visit={visit as Vaccination} />;
    case 'parasiteControl':
      return <ParasiteControlDetails visit={visit as ParasiteControl} />;
    case 'equineHealth':
      return <EquineHealthDetails visit={visit as EquineHealth} />;
    case 'laboratory':
      return <LaboratoryDetails visit={visit as Laboratory} />;
    default:
      return <div className="p-4">لا توجد تفاصيل متاحة</div>;
  }
}

/**
 * تفاصيل زيارة العيادة المتنقلة
 */
function MobileClinicDetails({ visit }: { visit: MobileClinic }) {
  return (
    <div className="p-6 space-y-4">
      <h4 className="font-semibold text-lg mb-4">تفاصيل زيارة العيادة المتنقلة</h4>
      
      {/* Animal Counts */}
      <div>
        <h5 className="font-semibold mb-2">أعداد الحيوانات</h5>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-right border">أغنام</th>
              <th className="py-2 px-3 text-right border">ماعز</th>
              <th className="py-2 px-3 text-right border">إبل</th>
              <th className="py-2 px-3 text-right border">أبقار</th>
              <th className="py-2 px-3 text-right border">خيول</th>
              <th className="py-2 px-3 text-right border font-bold">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-3 text-center border font-mono">{visit.animalCounts?.sheep || 0}</td>
              <td className="py-2 px-3 text-center border font-mono">{visit.animalCounts?.goats || 0}</td>
              <td className="py-2 px-3 text-center border font-mono">{visit.animalCounts?.camel || 0}</td>
              <td className="py-2 px-3 text-center border font-mono">{visit.animalCounts?.cattle || 0}</td>
              <td className="py-2 px-3 text-center border font-mono">{visit.animalCounts?.horse || 0}</td>
              <td className="py-2 px-3 text-center border font-mono font-bold">
                {(visit.animalCounts?.sheep || 0) + 
                 (visit.animalCounts?.goats || 0) + 
                 (visit.animalCounts?.camel || 0) + 
                 (visit.animalCounts?.cattle || 0) + 
                 (visit.animalCounts?.horse || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Diagnosis and Treatment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold mb-2">التشخيص</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.diagnosis)}</p>
        </div>
        <div>
          <h5 className="font-semibold mb-2">العلاج</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.treatment)}</p>
        </div>
      </div>

      {/* Intervention Category */}
      <div>
        <h5 className="font-semibold mb-2">فئة التدخل</h5>
        <p className="p-3 bg-white border rounded">{getStringValue(visit.interventionCategory)}</p>
      </div>

      {/* Medications Used */}
      {visit.medicationsUsed && visit.medicationsUsed.length > 0 && (
        <div>
          <h5 className="font-semibold mb-2">الأدوية المستخدمة</h5>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-right border">اسم الدواء</th>
                <th className="py-2 px-3 text-right border">الجرعة</th>
                <th className="py-2 px-3 text-right border">الكمية</th>
                <th className="py-2 px-3 text-right border">طريقة الإعطاء</th>
              </tr>
            </thead>
            <tbody>
              {visit.medicationsUsed.map((med, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 border">{getStringValue(med.name)}</td>
                  <td className="py-2 px-3 border">{getStringValue(med.dosage)}</td>
                  <td className="py-2 px-3 border font-mono">{getStringValue(med.quantity)}</td>
                  <td className="py-2 px-3 border">{getStringValue(med.route)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Follow-up */}
      {visit.followUpRequired && (
        <div>
          <h5 className="font-semibold mb-2">المتابعة</h5>
          <p className="p-3 bg-white border rounded">
            مطلوب متابعة في تاريخ: {visit.followUpDate ? new Date(visit.followUpDate).toLocaleDateString('ar-EG') : "غير محدد"}
          </p>
        </div>
      )}

      {/* Remarks */}
      {visit.remarks && (
        <div>
          <h5 className="font-semibold mb-2">ملاحظات</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.remarks)}</p>
        </div>
      )}
    </div>
  );
}

/**
 * تفاصيل زيارة التطعيمات
 */
function VaccinationDetails({ visit }: { visit: Vaccination }) {
  return (
    <div className="p-6 space-y-4">
      <h4 className="font-semibold text-lg mb-4">تفاصيل زيارة التطعيمات</h4>
      
      {/* Vaccine Type */}
      <div>
        <h5 className="font-semibold mb-2">نوع اللقاح</h5>
        <p className="p-3 bg-white border rounded font-medium">{getStringValue(visit.vaccineType)}</p>
      </div>

      {/* Herd Counts and Vaccinated */}
      <div>
        <h5 className="font-semibold mb-2">أعداد القطيع والحيوانات الملقحة</h5>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-right border">النوع</th>
              <th className="py-2 px-3 text-right border">الإجمالي</th>
              <th className="py-2 px-3 text-right border">الصغار</th>
              <th className="py-2 px-3 text-right border">الإناث</th>
              <th className="py-2 px-3 text-right border">الملقحة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-3 border font-semibold">أغنام</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.sheep?.total || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.sheep?.young || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.sheep?.female || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.sheep?.vaccinated || 0}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 border font-semibold">ماعز</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.goats?.total || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.goats?.young || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.goats?.female || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.goats?.vaccinated || 0}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 border font-semibold">إبل</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.camel?.total || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.camel?.young || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.camel?.female || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.camel?.vaccinated || 0}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 border font-semibold">أبقار</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.cattle?.total || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.cattle?.young || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.cattle?.female || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.cattle?.vaccinated || 0}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 border font-semibold">خيول</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.horse?.total || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.horse?.young || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.horse?.female || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.horse?.vaccinated || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold mb-2">صحة القطيع</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.herdHealth)}</p>
        </div>
        <div>
          <h5 className="font-semibold mb-2">سهولة التعامل مع الحيوانات</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.animalsHandling)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold mb-2">توفر العمالة</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.labours)}</p>
        </div>
        <div>
          <h5 className="font-semibold mb-2">سهولة الوصول للموقع</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.reachableLocation)}</p>
        </div>
      </div>

      {/* Remarks */}
      {visit.remarks && (
        <div>
          <h5 className="font-semibold mb-2">ملاحظات</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.remarks)}</p>
        </div>
      )}
    </div>
  );
}

/**
 * تفاصيل زيارة مكافحة الطفيليات
 */
function ParasiteControlDetails({ visit }: { visit: ParasiteControl }) {
  return (
    <div className="p-6 space-y-4">
      <h4 className="font-semibold text-lg mb-4">تفاصيل زيارة مكافحة الطفيليات</h4>
      
      {/* Herd Counts */}
      <div>
        <h5 className="font-semibold mb-2">أعداد القطيع والحيوانات المعالجة</h5>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-right border">النوع</th>
              <th className="py-2 px-3 text-right border">الإجمالي</th>
              <th className="py-2 px-3 text-right border">الصغار</th>
              <th className="py-2 px-3 text-right border">الإناث</th>
              <th className="py-2 px-3 text-right border">المعالجة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-3 border font-semibold">أغنام</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.sheep?.total || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.sheep?.young || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.sheep?.female || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.sheep?.treated || 0}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 border font-semibold">ماعز</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.goats?.total || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.goats?.young || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.goats?.female || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.goats?.treated || 0}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 border font-semibold">إبل</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.camel?.total || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.camel?.young || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.camel?.female || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.camel?.treated || 0}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 border font-semibold">أبقار</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.cattle?.total || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.cattle?.young || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.cattle?.female || 0}</td>
              <td className="py-2 px-3 border text-center font-mono">{visit.herdCounts?.cattle?.treated || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Insecticide Information */}
      <div>
        <h5 className="font-semibold mb-2">معلومات المبيد الحشري</h5>
        <table className="w-full text-sm border">
          <tbody>
            <tr>
              <td className="py-2 px-3 bg-gray-100 font-semibold border w-1/4">نوع المبيد</td>
              <td className="py-2 px-3 border">{getStringValue(visit.insecticide?.type)}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 bg-gray-100 font-semibold border">طريقة الاستخدام</td>
              <td className="py-2 px-3 border">{getStringValue(visit.insecticide?.method)}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 bg-gray-100 font-semibold border">الحجم المستخدم (مل)</td>
              <td className="py-2 px-3 border font-mono">{getStringValue(visit.insecticide?.volumeMl)}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 bg-gray-100 font-semibold border">الفئة</td>
              <td className="py-2 px-3 border">{getStringValue(visit.insecticide?.category)}</td>
            </tr>
            <tr>
              <td className="py-2 px-3 bg-gray-100 font-semibold border">حالة الرش</td>
              <td className="py-2 px-3 border">
                <Badge variant={visit.insecticide?.status === "Sprayed" ? "default" : "secondary"}>
                  {getStringValue(visit.insecticide?.status)}
                </Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Barn and Breeding Sites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold mb-2">مساحة الحظيرة (متر مربع)</h5>
          <p className="p-3 bg-white border rounded font-mono">{visit.animalBarnSizeSqM || "غير محدد"}</p>
        </div>
        <div>
          <h5 className="font-semibold mb-2">حالة صحة القطيع</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.herdHealthStatus)}</p>
        </div>
      </div>

      {/* Breeding Sites */}
      {visit.breedingSites && (
        <div>
          <h5 className="font-semibold mb-2">مواقع التكاثر</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.breedingSites)}</p>
        </div>
      )}

      {/* Compliance */}
      <div>
        <h5 className="font-semibold mb-2">الامتثال للتعليمات</h5>
        <p className="p-3 bg-white border rounded">{getStringValue(visit.complyingToInstructions)}</p>
      </div>

      {/* Remarks */}
      {visit.remarks && (
        <div>
          <h5 className="font-semibold mb-2">ملاحظات</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.remarks)}</p>
        </div>
      )}
    </div>
  );
}

/**
 * تفاصيل زيارة صحة الخيول
 */
function EquineHealthDetails({ visit }: { visit: EquineHealth }) {
  return (
    <div className="p-6 space-y-4">
      <h4 className="font-semibold text-lg mb-4">تفاصيل زيارة صحة الخيول</h4>
      
      {/* Horse Count */}
      <div>
        <h5 className="font-semibold mb-2">عدد الخيول</h5>
        <p className="p-3 bg-white border rounded font-mono text-lg">{visit.horseCount || 0}</p>
      </div>

      {/* Diagnosis and Treatment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold mb-2">التشخيص</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.diagnosis)}</p>
        </div>
        <div>
          <h5 className="font-semibold mb-2">العلاج</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.treatment)}</p>
        </div>
      </div>

      {/* Intervention Category */}
      <div>
        <h5 className="font-semibold mb-2">فئة التدخل</h5>
        <p className="p-3 bg-white border rounded">{getStringValue(visit.interventionCategory)}</p>
      </div>

      {/* Follow-up */}
      <div>
        <h5 className="font-semibold mb-2">المتابعة</h5>
        <div className="p-3 bg-white border rounded">
          <p>
            <span className="font-semibold">مطلوب متابعة: </span>
            <Badge variant={visit.followUpRequired ? "default" : "secondary"}>
              {visit.followUpRequired ? "نعم" : "لا"}
            </Badge>
          </p>
          {visit.followUpRequired && visit.followUpDate && (
            <p className="mt-2">
              <span className="font-semibold">تاريخ المتابعة: </span>
              {new Date(visit.followUpDate).toLocaleDateString('ar-EG')}
            </p>
          )}
        </div>
      </div>

      {/* Remarks */}
      {visit.remarks && (
        <div>
          <h5 className="font-semibold mb-2">ملاحظات</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.remarks)}</p>
        </div>
      )}
    </div>
  );
}

/**
 * تفاصيل زيارة المختبر
 */
function LaboratoryDetails({ visit }: { visit: Laboratory }) {
  return (
    <div className="p-6 space-y-4">
      <h4 className="font-semibold text-lg mb-4">تفاصيل زيارة المختبر</h4>
      
      {/* Sample Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold mb-2">رمز العينة</h5>
          <p className="p-3 bg-white border rounded font-mono">{getStringValue(visit.sampleCode)}</p>
        </div>
        <div>
          <h5 className="font-semibold mb-2">نوع العينة</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.sampleType)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold mb-2">جامع العينة</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.collector)}</p>
        </div>
        <div>
          <h5 className="font-semibold mb-2">رقم جامع العينة</h5>
          <p className="p-3 bg-white border rounded font-mono">{getStringValue(visit.sampleNumber)}</p>
        </div>
      </div>

      {/* Test Type */}
      {visit.testType && (
        <div>
          <h5 className="font-semibold mb-2">نوع الاختبار</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.testType)}</p>
        </div>
      )}

      {/* Species Counts */}
      <div>
        <h5 className="font-semibold mb-2">أعداد الأنواع</h5>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-right border">أغنام</th>
              <th className="py-2 px-3 text-right border">ماعز</th>
              <th className="py-2 px-3 text-right border">إبل</th>
              <th className="py-2 px-3 text-right border">أبقار</th>
              <th className="py-2 px-3 text-right border">خيول</th>
              {visit.speciesCounts?.other && (
                <th className="py-2 px-3 text-right border">أخرى</th>
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-3 text-center border font-mono">{visit.speciesCounts?.sheep || 0}</td>
              <td className="py-2 px-3 text-center border font-mono">{visit.speciesCounts?.goats || 0}</td>
              <td className="py-2 px-3 text-center border font-mono">{visit.speciesCounts?.camel || 0}</td>
              <td className="py-2 px-3 text-center border font-mono">{visit.speciesCounts?.cattle || 0}</td>
              <td className="py-2 px-3 text-center border font-mono">{visit.speciesCounts?.horse || 0}</td>
              {visit.speciesCounts?.other && (
                <td className="py-2 px-3 text-center border">{visit.speciesCounts.other}</td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold mb-2">الحالات الإيجابية</h5>
          <p className="p-3 bg-white border rounded font-mono text-lg text-red-600 font-bold">
            {visit.positiveCases || 0}
          </p>
        </div>
        <div>
          <h5 className="font-semibold mb-2">الحالات السلبية</h5>
          <p className="p-3 bg-white border rounded font-mono text-lg text-green-600 font-bold">
            {visit.negativeCases || 0}
          </p>
        </div>
      </div>

      {/* Remarks */}
      {visit.remarks && (
        <div>
          <h5 className="font-semibold mb-2">ملاحظات</h5>
          <p className="p-3 bg-white border rounded">{getStringValue(visit.remarks)}</p>
        </div>
      )}
    </div>
  );
}
