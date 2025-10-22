"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { mobileClinicsApi } from "@/lib/api/mobile-clinics";

interface InterventionBreakdown {
  category: string;
  count: number;
  totalAnimals: number;
  percentage: number;
}

interface MobileClinicStats {
  totalRecords: number;
  recordsThisMonth: number;
  totalAnimalsExamined: number;
  emergencyCases: number;
  interventionBreakdown: InterventionBreakdown[];
}

// ترجمة فئات التدخل
const getCategoryLabel = (category: string): string => {
  const translations: Record<string, string> = {
    'Emergency': 'طارئ',
    'Routine': 'روتيني',
    'Preventive': 'وقائي',
    'Follow-up': 'متابعة',
    'Clinical Examination': 'فحص سريري',
    'Ultrasonography': 'فحص بالموجات فوق الصوتية',
    'Lab Analysis': 'تحليل مخبري',
    'Surgical Operation': 'عملية جراحية',
    'Farriery': 'حدادة'
  };
  return translations[category] || category;
};

// مكون شريط التقدم الأفقي
const HorizontalProgressBar = ({ 
  label, 
  percentage, 
  count, 
  totalAnimals 
}: { 
  label: string; 
  percentage: number; 
  count: number; 
  totalAnimals: number; 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex gap-2 text-sm">
          <span className="text-slate-600">({percentage}%)</span>
          <span className="text-slate-600">({totalAnimals} حيوان)</span>
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export function MobileClinicStats() {
  const { data: stats, isLoading, error } = useQuery<MobileClinicStats>({
    queryKey: ['mobile-clinics-stats'],
    queryFn: () => mobileClinicsApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">إحصائيات فئات التدخل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats?.interventionBreakdown) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">إحصائيات فئات التدخل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 py-8">
            <p>لا توجد بيانات متاحة</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const interventionData = stats.interventionBreakdown || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">
          إحصائيات فئات التدخل
        </CardTitle>
        <p className="text-sm text-slate-600">
          توزيع زيارات العيادات المتنقلة حسب نوع التدخل
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {interventionData.length > 0 ? (
            interventionData.map((item) => (
              <HorizontalProgressBar
                key={item.category}
                label={getCategoryLabel(item.category)}
                percentage={item.percentage}
                count={item.count}
                totalAnimals={item.totalAnimals}
              />
            ))
          ) : (
            <div className="text-center text-slate-500 py-8">
              <p>لا توجد بيانات متاحة</p>
            </div>
          )}
        </div>
        
        {/* إجمالي الإحصائيات */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-slate-800">{stats.totalRecords}</div>
              <div className="text-slate-600">إجمالي الزيارات</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-800">{stats.totalAnimalsExamined}</div>
              <div className="text-slate-600">إجمالي الحيوانات</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
