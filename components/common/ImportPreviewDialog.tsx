"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  FileSpreadsheet, 
  Eye,
  Database,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ImportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  tableType: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

// تسميات الحقول بالعربية
const fieldLabels: Record<string, string> = {
  // حقول عامة
  serialNo: 'الرقم التسلسلي',
  date: 'التاريخ',
  client: 'العميل',
  clientName: 'اسم العميل',
  clientId: 'رقم هوية العميل',
  clientPhone: 'هاتف العميل',
  farmLocation: 'موقع المزرعة',
  latitude: 'خط العرض',
  longitude: 'خط الطول',
  supervisor: 'المشرف',
  team: 'الفريق',
  vehicleNo: 'رقم المركبة',
  remarks: 'ملاحظات',
  
  // حقول التطعيمات
  vaccineType: 'نوع اللقاح',
  vaccineCategory: 'فئة اللقاح',
  herdHealth: 'صحة القطيع',
  
  // حقول مكافحة الطفيليات
  insecticideType: 'نوع المبيد',
  insecticideVolume: 'كمية المبيد',
  parasiteControlStatus: 'حالة مكافحة الطفيليات',
  herdHealthStatus: 'الحالة الصحية للقطيع',
  
  // حقول المختبرات
  sampleCode: 'رمز العينة',
  sampleType: 'نوع العينة',
  testResult: 'نتيجة الفحص',
  
  // حقول العيادات المتنقلة
  interventionCategory: 'فئة التدخل',
  medicationsUsed: 'الأدوية المستخدمة',
  followUpRequired: 'يتطلب متابعة',
  
  // حقول صحة الخيول
  horseCount: 'عدد الخيول',
  diagnosis: 'التشخيص',
  treatment: 'العلاج',
  veterinarian: 'الطبيب البيطري'
};

// تسميات أنواع الجداول
const tableLabels: Record<string, string> = {
  laboratory: 'المختبرات',
  vaccination: 'التطعيمات',
  parasite_control: 'مكافحة الطفيليات',
  mobile: 'العيادات المتنقلة',
  equine_health: 'صحة الخيول'
};

// تنسيق القيم
const formatValue = (value: any, key: string): string => {
  if (value === null || value === undefined || value === '') {
    return 'غير محدد';
  }
  
  // تنسيق التواريخ
  if (key.includes('date') || key.includes('Date')) {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('ar-SA');
    } catch {
      return String(value);
    }
  }
  
  // تنسيق الأرقام
  if (typeof value === 'number') {
    return value.toLocaleString('ar-SA');
  }
  
  // تنسيق البوليان
  if (typeof value === 'boolean') {
    return value ? 'نعم' : 'لا';
  }
  
  // تنسيق الكائنات والمصفوفات
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length > 0 ? `${value.length} عنصر` : 'فارغ';
    }
    return JSON.stringify(value, null, 2);
  }
  
  return String(value);
};

// الحصول على تسمية الحقل
const getFieldLabel = (key: string): string => {
  return fieldLabels[key] || key;
};

export const ImportPreviewDialog: React.FC<ImportPreviewDialogProps> = ({
  isOpen,
  onClose,
  data,
  tableType,
  onConfirm,
  isLoading = false
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  // الحصول على جميع الحقول الموجودة
  const allKeys = Array.from(
    new Set(data.flatMap(row => Object.keys(row)))
  ).filter(key => key !== '_id' && key !== '__v');

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error confirming import:', error);
      toast.error('حدث خطأ أثناء تأكيد الاستيراد');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Eye className="h-6 w-6 text-blue-600" />
            معاينة بيانات {tableLabels[tableType]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الصفوف</p>
                    <p className="text-2xl font-bold">{data.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">الحقول المكتشفة</p>
                    <p className="text-2xl font-bold">{allKeys.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">نوع الجدول</p>
                    <p className="text-lg font-semibold">{tableLabels[tableType]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* عرض البيانات */}
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4">
              {data.slice(0, 50).map((row, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>الصف {index + 1}</span>
                      <Badge variant="outline">{tableLabels[tableType]}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {allKeys.map(key => (
                        <div key={key} className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            {getFieldLabel(key)}
                          </p>
                          <p className="text-sm bg-muted/50 p-2 rounded text-right">
                            {formatValue(row[key], key)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {data.length > 50 && (
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      يتم عرض أول 50 صف فقط للمعاينة
                    </p>
                    <p className="text-xs text-muted-foreground">
                      سيتم استيراد جميع الـ {data.length} صف عند التأكيد
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                تأكيد وحفظ في قاعدة البيانات
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
