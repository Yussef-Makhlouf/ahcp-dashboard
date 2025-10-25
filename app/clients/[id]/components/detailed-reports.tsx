"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  Stethoscope, 
  Syringe, 
  TestTube, 
  Bug, 
  Zap,
  FileText,
  Download,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { FilterState } from "./advanced-filters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Visit {
  _id?: string;
  id?: string;
  type: 'mobile_clinic' | 'vaccination' | 'laboratory' | 'parasite_control' | 'equine_health';
  date: string;
  serialNo?: string;
  supervisor?: string;
  vehicleNo?: string;
  coordinates?: { latitude: number; longitude: number };
  client?: any;
  // البيانات الخاصة بكل نوع زيارة
  [key: string]: any;
}

interface DetailedReportsProps {
  clientId: string;
  visits: Visit[];
  filters: FilterState;
}

export function DetailedReports({ clientId, visits, filters }: DetailedReportsProps) {
  const [expandedVisits, setExpandedVisits] = useState<Set<string>>(new Set());

  // تطبيق الفلاتر على الزيارات
  const filteredVisits = useMemo(() => {
    return visits.filter(visit => {
      // فلترة التاريخ
      if (filters.dateRange.from || filters.dateRange.to) {
        const visitDate = new Date(visit.date);
        if (filters.dateRange.from && visitDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && visitDate > filters.dateRange.to) return false;
      }

      // فلترة نوع الخدمة
      if (filters.services.length > 0 && !filters.services.includes(visit.type)) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [visits, filters]);

  // تجميع الزيارات حسب النوع
  const visitsByType = useMemo(() => {
    const grouped: Record<string, Visit[]> = {};
    filteredVisits.forEach(visit => {
      if (!grouped[visit.type]) {
        grouped[visit.type] = [];
      }
      grouped[visit.type].push(visit);
    });
    return grouped;
  }, [filteredVisits]);

  // إحصائيات سريعة
  const stats = useMemo(() => {
    return {
      total: filteredVisits.length,
      mobile_clinic: visitsByType.mobile_clinic?.length || 0,
      vaccination: visitsByType.vaccination?.length || 0,
      laboratory: visitsByType.laboratory?.length || 0,
      parasite_control: visitsByType.parasite_control?.length || 0,
      equine_health: visitsByType.equine_health?.length || 0,
    };
  }, [filteredVisits, visitsByType]);

  const toggleVisitExpansion = (visitId: string) => {
    const newExpanded = new Set(expandedVisits);
    if (newExpanded.has(visitId)) {
      newExpanded.delete(visitId);
    } else {
      newExpanded.add(visitId);
    }
    setExpandedVisits(newExpanded);
  };

  const getVisitIcon = (type: string) => {
    switch (type) {
      case 'mobile_clinic': return <Stethoscope className="h-4 w-4" />;
      case 'vaccination': return <Syringe className="h-4 w-4" />;
      case 'laboratory': return <TestTube className="h-4 w-4" />;
      case 'parasite_control': return <Bug className="h-4 w-4" />;
      case 'equine_health': return <Zap className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getVisitTypeName = (type: string) => {
    const names: Record<string, string> = {
      'mobile_clinic': 'العيادة المتنقلة',
      'vaccination': 'التطعيمات',
      'laboratory': 'المختبر',
      'parasite_control': 'مكافحة الطفيليات',
      'equine_health': 'صحة الخيول'
    };
    return names[type] || type;
  };

  const renderVisitDetails = (visit: Visit) => {
    const visitId = visit._id || visit.id || `${visit.type}-${visit.serialNo}`;
    const isExpanded = expandedVisits.has(visitId);
    
    return (
      <Card key={visitId} className="mb-4">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleVisitExpansion(visitId)}
            >
              <div className="flex items-center justify-between" dir="rtl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getVisitIcon(visit.type)}
                    <span className="font-medium">{getVisitTypeName(visit.type)}</span>
                  </div>
                  <Badge variant="outline">{visit.serialNo || 'غير محدد'}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(visit.date)}
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* معلومات أساسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {visit.supervisor && (
                    <div>
                      <span className="font-medium">المشرف: </span>
                      <span>{visit.supervisor}</span>
                    </div>
                  )}
                  {visit.vehicleNo && (
                    <div>
                      <span className="font-medium">رقم المركبة: </span>
                      <span>{visit.vehicleNo}</span>
                    </div>
                  )}
                </div>

                {/* معلومات الموقع */}
                {(visit.coordinates || visit.client?.village) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{visit.client?.village || "غير محدد"}</span>
                    {visit.coordinates && (
                      <span className="text-muted-foreground">
                        ({visit.coordinates.latitude?.toFixed(4)}, {visit.coordinates.longitude?.toFixed(4)})
                      </span>
                    )}
                  </div>
                )}

                {/* تفاصيل خاصة بنوع الزيارة */}
                {renderTypeSpecificDetails(visit)}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  const renderTypeSpecificDetails = (visit: Visit) => {
    switch (visit.type) {
      case 'mobile_clinic':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {visit.diagnosis && (
              <div>
                <span className="font-medium">التشخيص: </span>
                <span>{visit.diagnosis}</span>
              </div>
            )}
            {visit.interventionCategory && (
              <div>
                <span className="font-medium">نوع التدخل: </span>
                <span>{visit.interventionCategory}</span>
              </div>
            )}
            {visit.treatment && (
              <div className="md:col-span-2">
                <span className="font-medium">العلاج: </span>
                <span>{visit.treatment}</span>
              </div>
            )}
            {visit.animalCounts && (
              <div className="md:col-span-2">
                <span className="font-medium">أعداد الحيوانات: </span>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {Object.entries(visit.animalCounts).map(([animal, count]) => (
                    Number(count) > 0 && (
                      <Badge key={animal} variant="secondary" className="text-xs">
                        {animal}: {Number(count)}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
            )}
            {visit.medicationsUsed && visit.medicationsUsed.length > 0 && (
              <div className="md:col-span-2">
                <span className="font-medium">الأدوية المستخدمة: </span>
                <div className="space-y-1 mt-1">
                  {visit.medicationsUsed.map((med: any, index: number) => (
                    <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                      {med.name} - {med.dosage} ({med.route})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'vaccination':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {visit.vaccineType && (
              <div>
                <span className="font-medium">نوع اللقاح: </span>
                <span>{visit.vaccineType}</span>
              </div>
            )}
            {visit.herdHealth && (
              <div>
                <span className="font-medium">حالة القطيع: </span>
                <span>{visit.herdHealth}</span>
              </div>
            )}
            {visit.herdCounts && (
              <div className="md:col-span-2">
                <span className="font-medium">أعداد الحيوانات المطعمة: </span>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {Object.entries(visit.herdCounts).map(([animal, counts]: [string, any]) => (
                    counts?.vaccinated > 0 && (
                      <Badge key={animal} variant="secondary" className="text-xs">
                        {animal}: {counts.vaccinated}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
            )}
            {visit.animalsHandling && (
              <div>
                <span className="font-medium">سهولة التعامل: </span>
                <span>{visit.animalsHandling}</span>
              </div>
            )}
            {visit.reachableLocation && (
              <div>
                <span className="font-medium">سهولة الوصول: </span>
                <span>{visit.reachableLocation}</span>
              </div>
            )}
          </div>
        );

      case 'laboratory':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {visit.sampleCode && (
              <div>
                <span className="font-medium">رمز العينة: </span>
                <span>{visit.sampleCode}</span>
              </div>
            )}
            {visit.sampleType && (
              <div>
                <span className="font-medium">نوع العينة: </span>
                <span>{visit.sampleType}</span>
              </div>
            )}
            {visit.collector && (
              <div>
                <span className="font-medium">جامع العينة: </span>
                <span>{visit.collector}</span>
              </div>
            )}
            {visit.sampleNumber && (
              <div>
                <span className="font-medium">رقم العينة: </span>
                <span>{visit.sampleNumber}</span>
              </div>
            )}
            <div>
              <span className="font-medium">الحالات الإيجابية: </span>
              <span>{visit.positiveCases || 0}</span>
            </div>
            <div>
              <span className="font-medium">الحالات السلبية: </span>
              <span>{visit.negativeCases || 0}</span>
            </div>
            {visit.speciesCounts && (
              <div className="md:col-span-2">
                <span className="font-medium">أعداد العينات: </span>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {Object.entries(visit.speciesCounts).map(([species, count]) => (
                    count > 0 && (
                      <Badge key={species} variant="outline" className="text-xs">
                        {species}: {count}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'parasite_control':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {visit.insecticide?.type && (
              <div>
                <span className="font-medium">نوع المبيد: </span>
                <span>{visit.insecticide.type}</span>
              </div>
            )}
            {visit.insecticide?.method && (
              <div>
                <span className="font-medium">طريقة التطبيق: </span>
                <span>{visit.insecticide.method}</span>
              </div>
            )}
            {visit.insecticide?.status && (
              <div>
                <span className="font-medium">حالة الرش: </span>
                <span>{visit.insecticide.status}</span>
              </div>
            )}
            {visit.herdHealthStatus && (
              <div>
                <span className="font-medium">حالة القطيع: </span>
                <span>{visit.herdHealthStatus}</span>
              </div>
            )}
            {visit.complyingToInstructions && (
              <div>
                <span className="font-medium">الالتزام بالتعليمات: </span>
                <span>{visit.complyingToInstructions}</span>
              </div>
            )}
            {visit.animalBarnSizeSqM && (
              <div>
                <span className="font-medium">مساحة الحظيرة: </span>
                <span>{visit.animalBarnSizeSqM} متر مربع</span>
              </div>
            )}
            {visit.herdCounts && (
              <div className="md:col-span-2">
                <span className="font-medium">أعداد الحيوانات المعالجة: </span>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {Object.entries(visit.herdCounts).map(([animal, counts]: [string, any]) => (
                    counts?.treated > 0 && (
                      <Badge key={animal} variant="secondary" className="text-xs">
                        {animal}: {counts.treated}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'equine_health':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {visit.horseCount && (
              <div>
                <span className="font-medium">عدد الخيول: </span>
                <span>{visit.horseCount}</span>
              </div>
            )}
            {visit.diagnosis && (
              <div>
                <span className="font-medium">التشخيص: </span>
                <span>{visit.diagnosis}</span>
              </div>
            )}
            {visit.interventionCategory && (
              <div>
                <span className="font-medium">نوع التدخل: </span>
                <span>{visit.interventionCategory}</span>
              </div>
            )}
            {visit.treatment && (
              <div>
                <span className="font-medium">العلاج: </span>
                <span>{visit.treatment}</span>
              </div>
            )}
            {visit.followUpRequired !== undefined && (
              <div>
                <span className="font-medium">متابعة مطلوبة: </span>
                <span>{visit.followUpRequired ? 'نعم' : 'لا'}</span>
              </div>
            )}
            {visit.followUpDate && (
              <div>
                <span className="font-medium">تاريخ المتابعة: </span>
                <span>{formatDate(visit.followUpDate)}</span>
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-sm text-muted-foreground">تفاصيل غير متوفرة</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ملخص الزيارات</span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              تصدير التقرير
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي الزيارات</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{stats.mobile_clinic}</div>
              <div className="text-xs text-muted-foreground">عيادة متنقلة</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{stats.vaccination}</div>
              <div className="text-xs text-muted-foreground">تطعيمات</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{stats.laboratory}</div>
              <div className="text-xs text-muted-foreground">مختبر</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{stats.parasite_control}</div>
              <div className="text-xs text-muted-foreground">مكافحة طفيليات</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{stats.equine_health}</div>
              <div className="text-xs text-muted-foreground">صحة خيول</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تبويبات الزيارات */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">الكل ({stats.total})</TabsTrigger>
          <TabsTrigger value="mobile_clinic">عيادة ({stats.mobile_clinic})</TabsTrigger>
          <TabsTrigger value="vaccination">تطعيم ({stats.vaccination})</TabsTrigger>
          <TabsTrigger value="laboratory">مختبر ({stats.laboratory})</TabsTrigger>
          <TabsTrigger value="parasite_control">طفيليات ({stats.parasite_control})</TabsTrigger>
          <TabsTrigger value="equine_health">خيول ({stats.equine_health})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredVisits.length > 0 ? (
            filteredVisits.map(renderVisitDetails)
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">لا توجد زيارات تطابق المعايير المحددة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {Object.entries(visitsByType).map(([type, visits]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {visits.length > 0 ? (
              visits.map(renderVisitDetails)
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">لا توجد زيارات من هذا النوع</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
