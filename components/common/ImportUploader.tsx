"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImportPreview } from './ImportPreview';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Download,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// أنواع البيانات
interface ImportError {
  rowIndex: number;
  field: string;
  message: string;
  value: any;
}

interface ImportResponse {
  success: boolean;
  insertedCount?: number;
  errors?: ImportError[];
  batchId?: string;
  message?: string;
}

// Dromo Types
interface DromoUploaderInstance {
  onResults?: (callback: (results: any) => void) => void;
  onError?: (callback: (error: any) => void) => void;
  onData?: (callback: (data: any) => void) => void;
  onComplete?: (callback: (event: any) => void) => void;
  open?: () => void;
  launch?: () => void;
}

// حالات الواجهة
type UIState = 'idle' | 'preview' | 'sending' | 'done' | 'error';

// تسميات الجداول بالعربية
const tableLabels: Record<string, string> = {
  laboratory: 'المختبرات',
  vaccination: 'التطعيمات',
  parasite_control: 'مكافحة الطفيليات',
  mobile: 'العيادات المتنقلة',
  equine_health: 'صحة الخيول'
};

interface ImportUploaderProps {
  templateKey: string;
  tableType: string;
  onPreview: (data: any[]) => void;
  onSuccess: (response: ImportResponse) => void;
  onError: (error: any) => void;
}

export const ImportUploader: React.FC<ImportUploaderProps> = ({
  templateKey,
  tableType,
  onPreview,
  onSuccess,
  onError
}) => {
  const [uiState, setUiState] = useState<UIState>('idle');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [importResponse, setImportResponse] = useState<ImportResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const uploaderRef = useRef<DromoUploaderInstance | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // تهيئة Dromo Uploader
  const initializeDromo = React.useCallback(async () => {
    if (uploaderRef.current || isInitializing) {
      return;
    }

    setIsInitializing(true);
    console.log('🚀 Initializing Dromo for', tableLabels[tableType]);

    try {
      const licenseKey = process.env.NEXT_PUBLIC_DROMO_LICENSE_KEY;
      if (!licenseKey) {
        throw new Error('Dromo license key not found');
      }

      // تحديد الحقول حسب نوع الجدول
      const getFieldsForTableType = (type: string) => {
        switch (type) {
          case 'laboratory':
            return [
              { label: 'Serial No', key: 'serialNo' },
              { label: 'Sample Code', key: 'sampleCode' },
              { label: 'Date', key: 'date' },
              { label: 'Client Name', key: 'clientName' },
              { label: 'Client ID', key: 'clientId' },
              { label: 'Client Birth Date', key: 'clientBirthDate' },
              { label: 'Client Phone', key: 'clientPhone' },
              { label: 'Farm Location', key: 'farmLocation' },
              { label: 'Latitude', key: 'latitude' },
              { label: 'Longitude', key: 'longitude' },
              { label: 'Sample Type', key: 'sampleType' },
              { label: 'Sample Number', key: 'sampleNumber' },
              { label: 'Collector', key: 'collector' },
              { label: 'Positive Cases', key: 'positiveCases' },
              { label: 'Negative Cases', key: 'negativeCases' },
              { label: 'Sheep Count', key: 'sheepCount' },
              { label: 'Goats Count', key: 'goatsCount' },
              { label: 'Cattle Count', key: 'cattleCount' },
              { label: 'Camel Count', key: 'camelCount' },
              { label: 'Horse Count', key: 'horseCount' },
              { label: 'Other Species', key: 'otherSpecies' },
              { label: 'Remarks', key: 'remarks' }
            ];
          case 'vaccination':
            return [
              { label: 'Serial No', key: 'serialNo' },
              { label: 'Date', key: 'date' },
              { label: 'Client', key: 'client' },
              { label: 'Farm Location', key: 'farmLocation' },
              { label: 'Latitude', key: 'latitude' },
              { label: 'Longitude', key: 'longitude' },
              { label: 'Supervisor', key: 'supervisor' },
              { label: 'Team', key: 'team' },
              { label: 'Vehicle No', key: 'vehicleNo' },
              { label: 'Vaccine Type', key: 'vaccineType' },
              { label: 'Vaccine Category', key: 'vaccineCategory' },
              { label: 'Sheep Total', key: 'sheepTotal' },
              { label: 'Sheep Young', key: 'sheepYoung' },
              { label: 'Sheep Female', key: 'sheepFemale' },
              { label: 'Sheep Vaccinated', key: 'sheepVaccinated' },
              { label: 'Goats Total', key: 'goatsTotal' },
              { label: 'Goats Young', key: 'goatsYoung' },
              { label: 'Goats Female', key: 'goatsFemale' },
              { label: 'Goats Vaccinated', key: 'goatsVaccinated' },
              { label: 'Cattle Total', key: 'cattleTotal' },
              { label: 'Cattle Young', key: 'cattleYoung' },
              { label: 'Cattle Female', key: 'cattleFemale' },
              { label: 'Cattle Vaccinated', key: 'cattleVaccinated' },
              { label: 'Camel Total', key: 'camelTotal' },
              { label: 'Camel Young', key: 'camelYoung' },
              { label: 'Camel Female', key: 'camelFemale' },
              { label: 'Camel Vaccinated', key: 'camelVaccinated' },
              { label: 'Horse Total', key: 'horseTotal' },
              { label: 'Horse Young', key: 'horseYoung' },
              { label: 'Horse Female', key: 'horseFemale' },
              { label: 'Horse Vaccinated', key: 'horseVaccinated' },
              { label: 'Herd Health', key: 'herdHealth' },
              { label: 'Animals Handling', key: 'animalsHandling' },
              { label: 'Labours', key: 'labours' },
              { label: 'Reachable Location', key: 'reachableLocation' },
              { label: 'Request Date', key: 'requestDate' },
              { label: 'Request Situation', key: 'requestSituation' },
              { label: 'Request Fulfilling Date', key: 'requestFulfillingDate' },
              { label: 'Remarks', key: 'remarks' }
            ];
          case 'parasite_control':
            return [
              { label: 'Serial No', key: 'serialNo' },
              { label: 'Date', key: 'date' },
              { label: 'Owner', key: 'owner' },
              { label: 'Herd Location', key: 'herdLocation' },
              { label: 'Latitude', key: 'latitude' },
              { label: 'Longitude', key: 'longitude' },
              { label: 'Supervisor', key: 'supervisor' },
              { label: 'Vehicle No', key: 'vehicleNo' },
              { label: 'Insecticide Type', key: 'insecticideType' },
              { label: 'Insecticide Volume', key: 'insecticideVolume' },
              { label: 'Sheep Total', key: 'sheepTotal' },
              { label: 'Sheep Treated', key: 'sheepTreated' },
              { label: 'Goats Total', key: 'goatsTotal' },
              { label: 'Goats Treated', key: 'goatsTreated' },
              { label: 'Cattle Total', key: 'cattleTotal' },
              { label: 'Cattle Treated', key: 'cattleTreated' },
              { label: 'Camel Total', key: 'camelTotal' },
              { label: 'Camel Treated', key: 'camelTreated' },
              { label: 'Horse Total', key: 'horseTotal' },
              { label: 'Horse Treated', key: 'horseTreated' },
              { label: 'Herd Health Status', key: 'herdHealthStatus' },
              { label: 'Animal Barn Size SqM', key: 'animalBarnSizeSqM' },
              { label: 'Breeding Sites Type', key: 'breedingSitesType' },
              { label: 'Breeding Sites Area', key: 'breedingSitesArea' },
              { label: 'Breeding Sites Treatment', key: 'breedingSitesTreatment' },
              { label: 'Parasite Control Volume', key: 'parasiteControlVolume' },
              { label: 'Parasite Control Status', key: 'parasiteControlStatus' },
              { label: 'Complying', key: 'complying' },
              { label: 'Complying To Instructions', key: 'complyingToInstructions' },
              { label: 'Remarks', key: 'remarks' }
            ];
          case 'mobile':
            return [
              { label: 'Serial No', key: 'serialNo' },
              { label: 'Date', key: 'date' },
              { label: 'Client', key: 'client' },
              { label: 'Location', key: 'location' },
              { label: 'Latitude', key: 'latitude' },
              { label: 'Longitude', key: 'longitude' },
              { label: 'Supervisor', key: 'supervisor' },
              { label: 'Team', key: 'team' },
              { label: 'Vehicle No', key: 'vehicleNo' },
              { label: 'Intervention Category', key: 'interventionCategory' },
              { label: 'Sheep Count', key: 'sheepCount' },
              { label: 'Goats Count', key: 'goatsCount' },
              { label: 'Cattle Count', key: 'cattleCount' },
              { label: 'Camel Count', key: 'camelCount' },
              { label: 'Horse Count', key: 'horseCount' },
              { label: 'Total Animals', key: 'totalAnimals' },
              { label: 'Medications Used', key: 'medicationsUsed' },
              { label: 'Follow Up Required', key: 'followUpRequired' },
              { label: 'Remarks', key: 'remarks' }
            ];
          case 'equine_health':
            return [
              { label: 'Serial No', key: 'serialNo' },
              { label: 'Date', key: 'date' },
              { label: 'Client Name', key: 'clientName' },
              { label: 'Client ID', key: 'clientId' },
              { label: 'Client Birth Date', key: 'clientBirthDate' },
              { label: 'Client Phone', key: 'clientPhone' },
              { label: 'Farm Location', key: 'farmLocation' },
              { label: 'Latitude', key: 'latitude' },
              { label: 'Longitude', key: 'longitude' },
              { label: 'Horse Count', key: 'horseCount' },
              { label: 'Horse Total', key: 'horseTotal' },
              { label: 'Horse Young', key: 'horseYoung' },
              { label: 'Horse Female', key: 'horseFemale' },
              { label: 'Horse Treated', key: 'horseTreated' },
              { label: 'Diagnosis', key: 'diagnosis' },
              { label: 'Treatment', key: 'treatment' },
              { label: 'Veterinarian', key: 'veterinarian' },
              { label: 'Remarks', key: 'remarks' }
            ];
          default:
            return [
              { label: 'Serial No', key: 'serialNo' },
              { label: 'Date', key: 'date' },
              { label: 'Name', key: 'name' },
              { label: 'ID', key: 'id' },
              { label: 'Phone', key: 'phone' },
              { label: 'Location', key: 'location' },
              { label: 'Remarks', key: 'remarks' }
            ];
        }
      };
      
      const fields = getFieldsForTableType(tableType);
      
      // دالة الحصول على webhook URL
      const getWebhookUrl = (type: string): string => {
        const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL;
        const baseUrl = ngrokUrl || process.env.NEXT_PUBLIC_API_URL || 'https://ahcp-backend-production.up.railway.app';
        
        if (baseUrl.includes('localhost') && !ngrokUrl) {
          console.warn('⚠️ Dromo webhook يحاول الوصول إلى localhost');
          console.warn('💡 استخدم ngrok أو ضع NEXT_PUBLIC_NGROK_URL في .env.local');
        }
        
        console.log('🔗 Webhook URL will be:', baseUrl);
        
        switch (type) {
          case 'laboratory':
            return `${baseUrl}/import-export/laboratories/import-dromo`;
          case 'vaccination':
            return `${baseUrl}/import-export/vaccination/import-dromo`;
          case 'parasite_control':
            return `${baseUrl}/import-export/parasite-control/import-dromo`;
          case 'mobile':
            return `${baseUrl}/import-export/mobile-clinics/import-dromo`;
          case 'equine_health':
            return `${baseUrl}/import-export/equine-health/import-dromo`;
          default:
            return `${baseUrl}/import-export/dromo-import-public`;
        }
      };
      
      // إعدادات Dromo Starter Plan الصحيحة
      const settings = {
        importIdentifier: `${tableType}_import`,
        developmentMode: true,
        // لا نستخدم mode أو webhookUrl في Starter Plan
        // Starter Plan يعمل فقط مع callbacks
      };
      
      // بيانات المستخدم
      const user = {
        id: 'user_1',
        name: 'System User',
        email: 'admin@ahcp.gov.sa'
      };
      
      // إنشاء instance جديد من Dromo
      try {
        const DromoModule = await import('dromo-uploader-js');
        const DromoClass = DromoModule.default;
        
        console.log('🔧 Creating Dromo instance with:', {
          licenseKey: licenseKey ? 'present' : 'missing',
          fieldsCount: fields.length,
          settings,
          user
        });
        
        uploaderRef.current = new DromoClass(licenseKey, fields, settings, user) as DromoUploaderInstance;
        console.log('✅ Dromo instance created successfully');
      } catch (error) {
        console.error('❌ Failed to create Dromo instance:', error);
        throw error;
      }
      
      // معالجة البيانات من Dromo Starter Plan
      if (uploaderRef.current.onResults) {
        uploaderRef.current.onResults((results: any) => {
          console.log('📊 Dromo Starter Plan - Received results:', results);
          
          if (results && results.validData && Array.isArray(results.validData)) {
            const data = results.validData;
            console.log(`✅ Received ${data.length} valid rows`);
            
            // عرض البيانات في Dialog للمراجعة
            setPreviewRows(data);
            setIsPreviewDialogOpen(true);
            onPreview(data);
            
            toast.success(`تم تحليل ${data.length} صف - راجع البيانات وأكد الاستيراد`);
          } else if (results && results.errors && results.errors.length > 0) {
            console.error('❌ Import errors:', results.errors);
            setErrorMessage(`تم العثور على ${results.errors.length} خطأ في البيانات`);
            setUiState('error');
          } else {
            setErrorMessage('لم يتم العثور على بيانات صالحة للاستيراد');
            setUiState('error');
          }
        });
      }
      
      // معالج الأخطاء
      if (uploaderRef.current.onError) {
        uploaderRef.current.onError((error: any) => {
          console.error('❌ Dromo error:', error);
          handleDromoError(error);
        });
      }
      
      console.log('Dromo uploader initialized successfully for', tableLabels[tableType]);
      
    } catch (error: any) {
      console.error('Failed to initialize Dromo:', error);
      setErrorMessage(error.message || 'فشل في تهيئة أداة الرفع');
      setUiState('error');
      onError(error);
    } finally {
      setIsInitializing(false);
    }
  }, [tableType, templateKey, onPreview, onError]);

  // إطلاق أداة الرفع
  const handleLaunchUploader = async () => {
    if (!uploaderRef.current) {
      await initializeDromo();
    }

    let attempts = 0;
    while ((!uploaderRef.current || isInitializing) && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!uploaderRef.current) {
      toast.error('أداة الرفع غير جاهزة');
      return;
    }

    try {
      if (uploaderRef.current.open) {
        uploaderRef.current.open();
      } else if (uploaderRef.current.launch) {
        uploaderRef.current.launch();
      } else {
        console.error('No open or launch method found on uploader');
        toast.error('طريقة فتح أداة الرفع غير متاحة');
      }
    } catch (error) {
      console.error('Failed to launch uploader:', error);
      toast.error('فشل في إطلاق أداة الرفع');
    }
  };

  // تنظيف الذاكرة عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      if (uploaderRef.current) {
        uploaderRef.current = null;
      }
    };
  }, []);

  // معالجة الأخطاء
  const handleDromoError = (error: any) => {
    console.error('Dromo error:', error);
    const message = error?.message || 'حدث خطأ أثناء تحميل الملف';
    setErrorMessage(message);
    setUiState('error');
    onError(error);
    toast.error(message);
  };

  // تأكيد الاستيراد - إرسال البيانات إلى Backend
  const confirmImport = async () => {
    if (previewRows.length === 0) {
      toast.error('لا توجد بيانات للاستيراد');
      return;
    }

    setIsConfirming(true);
    console.log(`🚀 Confirming import of ${previewRows.length} rows for ${tableType}`);

    try {
      // إرسال البيانات مباشرة إلى Backend webhook
      const getWebhookUrl = (type: string): string => {
        const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL;
        const baseUrl = ngrokUrl || process.env.NEXT_PUBLIC_API_URL || 'https://ahcp-backend-production.up.railway.app';
        
        switch (type) {
          case 'laboratory':
            return `${baseUrl}/import-export/laboratories/import-dromo`;
          case 'vaccination':
            return `${baseUrl}/import-export/vaccination/import-dromo`;
          case 'parasite_control':
            return `${baseUrl}/import-export/parasite-control/import-dromo`;
          case 'mobile':
            return `${baseUrl}/import-export/mobile-clinics/import-dromo`;
          case 'equine_health':
            return `${baseUrl}/import-export/equine-health/import-dromo`;
          default:
            return `${baseUrl}/import-export/dromo-import-public`;
        }
      };

      const webhookUrl = getWebhookUrl(tableType);
      console.log('📤 Sending to webhook:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'X-Table-Type': tableType,
          'X-Source': 'dromo-starter-plan'
        },
        body: JSON.stringify({
          data: previewRows,
          validData: previewRows,
          source: 'dromo-starter-plan-manual',
          tableType: tableType,
          totalRows: previewRows.length
        })
      });

      const result: ImportResponse = await response.json();
      console.log('📥 Backend response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'فشل في الاستيراد');
      }

      setImportResponse(result);
      
      if (result.success) {
        // إغلاق الـ dialog وعرض النجاح
        setIsPreviewDialogOpen(false);
        setUiState('done');
        onSuccess(result);
        toast.success(`تم استيراد ${result.insertedCount || previewRows.length} سجل بنجاح`);
      } else {
        setUiState('error');
        setErrorMessage(result.message || 'فشل في الاستيراد');
        onError(result);
      }
    } catch (error: any) {
      console.error('❌ Import failed:', error);
      setUiState('error');
      setErrorMessage(error.message || 'حدث خطأ أثناء الاستيراد');
      onError(error);
      toast.error('فشل في الاستيراد');
    } finally {
      setIsConfirming(false);
    }
  };

  // إعادة تعيين الحالة
  const resetState = () => {
    setUiState('idle');
    setPreviewRows([]);
    setImportResponse(null);
    setErrorMessage('');
    setIsPreviewDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          استيراد بيانات {tableLabels[tableType]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* حالة الخمول */}
        {uiState === 'idle' && (
          <div className="text-center space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                رفع ملف {tableLabels[tableType]}
              </h3>
              <p className="text-muted-foreground mb-4">
                اختر ملف Excel أو CSV لاستيراد البيانات
              </p>
              <Button onClick={handleLaunchUploader} size="lg">
                <Upload className="h-4 w-4 mr-2" />
                اختيار الملف
              </Button>
            </div>
          </div>
        )}

        {/* حالة النجاح */}
        {uiState === 'done' && importResponse && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                تم استيراد {importResponse.insertedCount} سجل بنجاح
                {importResponse.batchId && (
                  <span className="block text-sm mt-1">
                    معرف الدفعة: {importResponse.batchId}
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {importResponse.errors && importResponse.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  تم العثور على {importResponse.errors.length} خطأ في البيانات
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={resetState} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              استيراد ملف جديد
            </Button>
          </div>
        )}

        {/* حالة الخطأ */}
        {uiState === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage || 'حدث خطأ أثناء الاستيراد'}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={resetState} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة المحاولة
              </Button>
              <Button onClick={handleLaunchUploader} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                اختيار ملف جديد
              </Button>
            </div>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• الصيغ المدعومة: Excel (.xlsx) و CSV</p>
          <p>• الحد الأقصى لحجم الملف: 50 ميجابايت</p>
          <p>• الحد الأقصى لعدد الصفوف: 50,000 صف</p>
        </div>
      </CardContent>

      {/* Dialog معاينة البيانات */}
      <ImportPreviewDialog
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        data={previewRows}
        tableType={tableType}
        onConfirm={confirmImport}
        isLoading={isConfirming}
      />
    </Card>
  );
};
