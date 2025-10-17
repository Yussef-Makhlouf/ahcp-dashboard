"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, FileSpreadsheet } from 'lucide-react';

interface ImportPreviewProps {
  data: any[];
  tableType: string;
  maxRows?: number;
}

// تسميات الحقول بالعربية
const fieldLabels: Record<string, string> = {
  // حقول عامة
  id: 'المعرف',
  serialNo: 'الرقم التسلسلي',
  date: 'التاريخ',
  client: 'العميل',
  clientName: 'اسم العميل',
  clientId: 'رقم هوية العميل',
  clientBirthDate: 'تاريخ ميلاد العميل',
  clientPhone: 'هاتف العميل',
  name: 'الاسم',
  nationalId: 'رقم الهوية الوطنية',
  birthDate: 'تاريخ الميلاد',
  phone: 'رقم الهاتف',
  email: 'البريد الإلكتروني',
  village: 'القرية',
  detailedAddress: 'العنوان التفصيلي',
  status: 'الحالة',
  totalAnimals: 'إجمالي الحيوانات',
  farmLocation: 'موقع المزرعة',
  herdLocation: 'موقع القطيع',
  supervisor: 'المشرف',
  team: 'الفريق',
  vehicleNo: 'رقم المركبة',
  coordinates: 'الإحداثيات',
  remarks: 'ملاحظات',
  
  // حقول المختبرات
  sampleCode: 'رمز العينة',
  sampleType: 'نوع العينة',
  sampleNumber: 'رقم العينة',
  collector: 'جامع العينة',
  positiveCases: 'الحالات الإيجابية',
  negativeCases: 'الحالات السلبية',
  testResults: 'نتائج الفحص',
  otherSpecies: 'أنواع أخرى',
  
  // حقول التطعيمات
  vaccinationType: 'نوع التطعيم',
  vaccineType: 'نوع اللقاح',
  vaccineCategory: 'فئة اللقاح',
  vaccineSource: 'مصدر اللقاح',
  batchNumber: 'رقم الدفعة',
  expiryDate: 'تاريخ الانتهاء',
  veterinarian: 'الطبيب البيطري',
  herdNumber: 'رقم القطيع',
  herdFemales: 'إناث القطيع',
  totalVaccinated: 'إجمالي المطعمة',
  herdHealth: 'صحة القطيع',
  animalsHandling: 'التعامل مع الحيوانات',
  labours: 'العمالة',
  reachableLocation: 'سهولة الوصول',
  
  // حقول الحيوانات - الأغنام
  sheep: 'الأغنام',
  sheepTotal: 'إجمالي الأغنام',
  sheepYoung: 'صغار الأغنام',
  sheepFemale: 'إناث الأغنام',
  sheepVaccinated: 'الأغنام المطعمة',
  sheepTreated: 'الأغنام المعالجة',
  
  // حقول الحيوانات - الماعز
  goats: 'الماعز',
  goatsTotal: 'إجمالي الماعز',
  goatsYoung: 'صغار الماعز',
  goatsFemale: 'إناث الماعز',
  goatsVaccinated: 'الماعز المطعمة',
  goatsTreated: 'الماعز المعالجة',
  
  // حقول الحيوانات - الإبل
  camel: 'الإبل',
  camelTotal: 'إجمالي الإبل',
  camelYoung: 'صغار الإبل',
  camelFemale: 'إناث الإبل',
  camelVaccinated: 'الإبل المطعمة',
  camelTreated: 'الإبل المعالجة',
  
  // حقول الحيوانات - الأبقار
  cattle: 'الأبقار',
  cattleTotal: 'إجمالي الأبقار',
  cattleYoung: 'صغار الأبقار',
  cattleFemale: 'إناث الأبقار',
  cattleVaccinated: 'الأبقار المطعمة',
  cattleTreated: 'الأبقار المعالجة',
  
  // حقول الحيوانات - الخيول
  horse: 'الخيول',
  horseTotal: 'إجمالي الخيول',
  horseYoung: 'صغار الخيول',
  horseFemale: 'إناث الخيول',
  horseTreated: 'الخيول المعالجة',
  horseCount: 'عدد الخيول',
  
  // إجماليات القطيع
  totalHerd: 'إجمالي القطيع',
  totalYoung: 'إجمالي الصغار',
  totalFemale: 'إجمالي الإناث',
  totalTreated: 'إجمالي المعالجة',
  
  // حقول مكافحة الطفيليات
  insecticideType: 'نوع المبيد',
  insecticide: 'المبيد',
  sprayMethod: 'طريقة الرش',
  volume: 'الكمية',
  animalBarnSizeSqM: 'مساحة الحظيرة (م²)',
  breedingSites: 'مواقع التكاثر',
  parasiteControlVolume: 'كمية مكافحة الطفيليات',
  parasiteControlStatus: 'حالة مكافحة الطفيليات',
  herdHealthStatus: 'الحالة الصحية للقطيع',
  complyingToInstructions: 'الامتثال للتعليمات',
  
  // حقول العيادات المتنقلة والفحوصات السريرية
  diagnosis: 'التشخيص',
  interventionCategory: 'فئة التدخل',
  treatment: 'العلاج',
  medicationsUsed: 'الأدوية المستخدمة',
  followUpRequired: 'المتابعة مطلوبة',
  followUpDate: 'تاريخ المتابعة',
  
  // حقول العمليات الجراحية (صحة الخيول)
  surgeryType: 'نوع العملية',
  surgeon: 'الجراح',
  anesthesia: 'التخدير',
  complications: 'المضاعفات'
};

// تنسيق القيم للعرض
const formatValue = (key: string, value: any): string => {
  if (value === null || value === undefined) {
    return '-';
  }

  // تنسيق التواريخ
  if (key.includes('date') || key.includes('Date')) {
    try {
      return new Date(value).toLocaleDateString('ar-SA');
    } catch {
      return String(value);
    }
  }

  // تنسيق الأرقام
  if (typeof value === 'number') {
    return value.toLocaleString('ar-SA');
  }

  // تنسيق القيم المنطقية
  if (typeof value === 'boolean') {
    return value ? 'نعم' : 'لا';
  }

  // تنسيق الكائنات
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

// الحصول على تسمية الحقل
const getFieldLabel = (key: string): string => {
  return fieldLabels[key] || key;
};

export const ImportPreview: React.FC<ImportPreviewProps> = ({
  data,
  tableType,
  maxRows = 800
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لا توجد بيانات للمعاينة</p>
        </CardContent>
      </Card>
    );
  }

  const previewData = data.slice(0, maxRows);
  const allKeys = Array.from(
    new Set(previewData.flatMap(row => Object.keys(row)))
  ).filter(key => !key.startsWith('_')); // تجاهل الحقول الداخلية

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          معاينة البيانات
          <Badge variant="secondary">
            {previewData.length} من {data.length} صف
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="space-y-4">
            {previewData.map((row, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    الصف {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allKeys.map(key => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {getFieldLabel(key)}
                        </label>
                        <div className="text-sm p-2 bg-muted rounded border">
                          {formatValue(key, row[key])}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        {data.length > maxRows && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            يتم عرض أول {maxRows} صفوف فقط. 
            سيتم استيراد جميع الـ {data.length} صف عند التأكيد.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
