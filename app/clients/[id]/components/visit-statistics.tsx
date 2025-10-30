"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Syringe, 
  Bug, 
  Stethoscope, 
  TestTube, 
  Zap as Horse,
  TrendingUp,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface VisitStatisticsProps {
  visits: {
    mobileClinic: any[];
    vaccination: any[];
    parasiteControl: any[];
    equineHealth: any[];
    laboratory: any[];
  };
}

export function VisitStatistics({ visits }: VisitStatisticsProps) {
  const getServiceStats = () => {
    const stats = {
      vaccination: {
        count: visits.vaccination?.length || 0,
        icon: <Syringe className="h-5 w-5 text-blue-600" />,
        name: 'التطعيمات',
        color: 'blue',
        details: {
          vaccineTypes: new Set(visits.vaccination?.map(v => v.vaccineType).filter(Boolean)).size,
          totalAnimalsVaccinated: visits.vaccination?.reduce((sum, v) => {
            const herdCounts = v.herdCounts || {};
            return sum + Object.values(herdCounts).reduce((herdSum: number, counts: any) => 
              herdSum + (counts?.treated || counts?.total || 0), 0);
          }, 0) || 0,
          lastVaccination: visits.vaccination?.[0]?.date
        }
      },
      parasiteControl: {
        count: visits.parasiteControl?.length || 0,
        icon: <Bug className="h-5 w-5 text-green-600" />,
        name: 'مكافحة الطفيليات',
        color: 'green',
        details: {
          insecticideTypes: new Set(visits.parasiteControl?.map(v => v.insecticide?.type).filter(Boolean)).size,
          completedTreatments: visits.parasiteControl?.filter(v => v.insecticide?.status === 'مكتمل').length || 0,
          totalAreaTreated: visits.parasiteControl?.reduce((sum, v) => sum + (v.animalBarnSize || 0), 0) || 0,
          lastTreatment: visits.parasiteControl?.[0]?.date
        }
      },
      mobileClinic: {
        count: visits.mobileClinic?.length || 0,
        icon: <Stethoscope className="h-5 w-5 text-purple-600" />,
        name: 'العيادة المتنقلة',
        color: 'purple',
        details: {
          diagnoses: new Set(visits.mobileClinic?.map(v => v.diagnosis).filter(Boolean)).size,
          interventionCategories: new Set(visits.mobileClinic?.map(v => v.interventionCategory).filter(Boolean)).size,
          medicationsUsed: new Set(visits.mobileClinic?.map(v => v.medication?.name).filter(Boolean)).size,
          lastVisit: visits.mobileClinic?.[0]?.date
        }
      },
      laboratory: {
        count: visits.laboratory?.length || 0,
        icon: <TestTube className="h-5 w-5 text-orange-600" />,
        name: 'المختبر',
        color: 'orange',
        details: {
          sampleTypes: new Set(visits.laboratory?.map(v => v.sampleType).filter(Boolean)).size,
          positiveCases: visits.laboratory?.reduce((sum, v) => sum + (v.positiveCases || 0), 0) || 0,
          negativeCases: visits.laboratory?.reduce((sum, v) => sum + (v.negativeCases || 0), 0) || 0,
          lastTest: visits.laboratory?.[0]?.date
        }
      },
      equineHealth: {
        count: visits.equineHealth?.length || 0,
        icon: <Horse className="h-5 w-5 text-red-600" />,
        name: 'صحة الخيول',
        color: 'red',
        details: {
          totalHorses: visits.equineHealth?.reduce((sum, v) => sum + (v.horseCount || 0), 0) || 0,
          breeds: new Set(visits.equineHealth?.flatMap(v => v.horseDetails?.map((h: any) => h.breed) || []).filter(Boolean)).size,
          healthyHorses: visits.equineHealth?.reduce((sum, v) => 
            sum + (v.horseDetails?.filter((h: any) => h.healthStatus === 'سليم').length || 0), 0) || 0,
          lastCheckup: visits.equineHealth?.[0]?.date
        }
      }
    };

    return stats;
  };

  const stats = getServiceStats();
  const totalVisits = Object.values(stats).reduce((sum, service) => sum + service.count, 0);

  const getMonthlyTrend = () => {
    const allVisits = [
      ...(visits.vaccination || []).map(v => ({ ...v, type: 'vaccination' })),
      ...(visits.parasiteControl || []).map(v => ({ ...v, type: 'parasiteControl' })),
      ...(visits.mobileClinic || []).map(v => ({ ...v, type: 'mobileClinic' })),
      ...(visits.laboratory || []).map(v => ({ ...v, type: 'laboratory' })),
      ...(visits.equineHealth || []).map(v => ({ ...v, type: 'equineHealth' }))
    ];

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
        count: allVisits.filter(v => {
          const visitDate = new Date(v.date);
          return visitDate.getMonth() === date.getMonth() && 
                 visitDate.getFullYear() === date.getFullYear();
        }).length
      };
    }).reverse();

    return last6Months;
  };

  const monthlyTrend = getMonthlyTrend();
  const maxMonthlyVisits = Math.max(...monthlyTrend.map(m => m.count), 1);

  return (
    <div className="space-y-6" dir='rtl'>
      {/* Service Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, service]) => (
          <Card key={key} className={`border-l-4 border-l-${service.color}-500`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                {service.icon}
                {service.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-800">{service.count}</span>
                <Badge variant="outline" className="text-xs">
                  {totalVisits > 0 ? Math.round((service.count / totalVisits) * 100) : 0}%
                </Badge>
              </div>
              
              {/* Service-specific details */}
              <div className="space-y-1 text-xs text-gray-600">
                {key === 'vaccination' && (
                  <>
                    <div>أنواع اللقاحات: {(service.details as any).vaccineTypes}</div>
                    <div>الحيوانات المطعمة: {(service.details as any).totalAnimalsVaccinated}</div>
                  </>
                )}
                {key === 'parasiteControl' && (
                  <>
                    <div>أنواع المبيدات: {(service.details as any).insecticideTypes}</div>
                    <div>العلاجات المكتملة: {(service.details as any).completedTreatments}</div>
                    <div>المساحة المعالجة: {(service.details as any).totalAreaTreated} م²</div>
                  </>
                )}
                {key === 'mobileClinic' && (
                  <>
                    <div>التشخيصات المختلفة: {(service.details as any).diagnoses}</div>
                    <div>فئات التدخل: {(service.details as any).interventionCategories}</div>
                    <div>الأدوية المستخدمة: {(service.details as any).medicationsUsed}</div>
                  </>
                )}
                {key === 'laboratory' && (
                  <>
                    <div>أنواع العينات: {(service.details as any).sampleTypes}</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-red-500" />
                      <span>إيجابية: {(service.details as any).positiveCases}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>سلبية: {(service.details as any).negativeCases}</span>
                    </div>
                  </>
                )}
                {key === 'equineHealth' && (
                  <>
                    <div>إجمالي الخيول: {(service.details as any).totalHorses}</div>
                    <div>السلالات المختلفة: {(service.details as any).breeds}</div>
                    <div>الخيول السليمة: {(service.details as any).healthyHorses}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            اتجاه الزيارات الشهرية (آخر 6 أشهر)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTrend.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{month.month}</span>
                  <span className="text-gray-600">{month.count} زيارة</span>
                </div>
                <Progress 
                  value={(month.count / maxMonthlyVisits) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-green-600" />
              مؤشرات الفعالية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vaccination Efficiency */}
            {stats.vaccination.count > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">كفاءة التطعيم</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {(stats.vaccination.details as any).totalAnimalsVaccinated > 0 ? 'ممتاز' : 'يحتاج تحسين'}
                  </Badge>
                </div>
                <div className="text-xs text-blue-700">
                  معدل الحيوانات المطعمة: {Math.round((stats.vaccination.details as any).totalAnimalsVaccinated / stats.vaccination.count)} حيوان/زيارة
                </div>
              </div>
            )}

            {/* Parasite Control Efficiency */}
            {stats.parasiteControl.count > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">كفاءة مكافحة الطفيليات</span>
                  <Badge className="bg-green-100 text-green-800">
                    {(((stats.parasiteControl.details as any).completedTreatments / stats.parasiteControl.count) * 100) >= 80 ? 'ممتاز' : 'جيد'}
                  </Badge>
                </div>
                <div className="text-xs text-green-700">
                  معدل إكمال العلاج: {Math.round(((stats.parasiteControl.details as any).completedTreatments / stats.parasiteControl.count) * 100)}%
                </div>
              </div>
            )}

            {/* Laboratory Results */}
            {stats.laboratory.count > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-800">نتائج المختبر</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {(stats.laboratory.details as any).positiveCases === 0 ? 'ممتاز' : 'يحتاج متابعة'}
                  </Badge>
                </div>
                <div className="text-xs text-orange-700">
                  معدل الحالات السلبية: {Math.round(((stats.laboratory.details as any).negativeCases / ((stats.laboratory.details as any).positiveCases + (stats.laboratory.details as any).negativeCases)) * 100)}%
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              آخر الأنشطة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats)
              .filter(([_, service]) => service.count > 0)
              .sort((a, b) => new Date((b[1].details as any).lastVaccination || (b[1].details as any).lastTreatment || (b[1].details as any).lastVisit || (b[1].details as any).lastTest || (b[1].details as any).lastCheckup || 0).getTime() - 
                               new Date((a[1].details as any).lastVaccination || (a[1].details as any).lastTreatment || (a[1].details as any).lastVisit || (a[1].details as any).lastTest || (a[1].details as any).lastCheckup || 0).getTime())
              .map(([key, service]) => {
                const lastDate = (service.details as any).lastVaccination || (service.details as any).lastTreatment || 
                               (service.details as any).lastVisit || (service.details as any).lastTest || (service.details as any).lastCheckup;
                
                if (!lastDate) return null;
                
                const daysAgo = Math.floor((new Date().getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {service.icon}
                      <span className="text-sm font-medium">{service.name}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {daysAgo === 0 ? 'اليوم' : 
                       daysAgo === 1 ? 'أمس' : 
                       daysAgo < 7 ? `${daysAgo} أيام` : 
                       daysAgo < 30 ? `${Math.floor(daysAgo / 7)} أسابيع` : 
                       `${Math.floor(daysAgo / 30)} شهر`}
                    </div>
                  </div>
                );
              })
              .filter(Boolean)
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
