"use client";

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';

// Lazy load Dromo to improve initial page load
const DromoUploader = lazy(() => import('dromo-uploader-js'));
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

// تعريف الأنواع
interface ImportUploaderProps {
  templateKey: string;
  tableType: 'laboratory' | 'vaccination' | 'parasite_control' | 'mobile' | 'equine_health';
  onPreview: (rows: any[]) => void;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}

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

// Template IDs كـ fallback
const FALLBACK_TEMPLATES: Record<string, string> = {
  laboratory: 'c459bd3e-ac1a-4140-b5c2-0f459c6d5ad5', // REPORTS template
  vaccination: 'a4f34f84-12b9-4756-a109-ce7c616e4b19',
  parasite_control: 'a6af7c7c-0c0a-4b97-a00b-bd3f289040d6',
  mobile: 'cfffa6a0-f460-4781-a852-34e9a0a43314', // MOBILE template
  equine_health: '207f2f78-148a-45e7-b5fc-1a6720509c6f' // EQUINE_HEALTH template
};

// مفتاح الترخيص كـ fallback
const FALLBACK_LICENSE_KEY = '0baceb87-3a34-4905-ad40-40ae733578f5';

// تعريف أنواع Dromo بسيطة
interface BasicDromoField {
  label: string;
  key: string;
}

interface BasicDromoSettings {
  importIdentifier: string;
  developmentMode?: boolean;
}

interface BasicDromoUser {
  id: string;
  name?: string;
  email?: string;
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
  const uploaderRef = useRef<any>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // تهيئة Dromo Uploader مع تحسين الأداء
  const initializeDromo = React.useCallback(async () => {
    // تجنب إعادة التهيئة إذا كان موجود بالفعل
    if (uploaderRef.current || isInitializing) {
      return;
    }

    setIsInitializing(true);
    
    // إلغاء أي timeout سابق
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }

    const envLicenseKey = process.env.NEXT_PUBLIC_DROMO_LICENSE_KEY;
    const licenseKey = envLicenseKey || FALLBACK_LICENSE_KEY;
    const finalTemplateKey = templateKey || FALLBACK_TEMPLATES[tableType];
    
    console.log('Dromo initialization started:', {
      hasEnvLicenseKey: !!envLicenseKey,
      hasTemplateKey: !!templateKey,
      tableType,
      finalTemplateKey: finalTemplateKey?.substring(0, 8) + '...',
      usingFallback: !templateKey
    });
    
    // التحقق من وجود جميع المتطلبات
    if (!licenseKey) {
      console.error('No license key available (env or fallback)');
      setErrorMessage('مفتاح الترخيص غير متاح');
      setUiState('error');
      setIsInitializing(false);
      return;
    }
    
    if (!finalTemplateKey) {
      console.error('No template key available for table type:', tableType);
      setErrorMessage(`معرف القالب غير متاح لجدول ${tableLabels[tableType]}`);
      setUiState('error');
      setIsInitializing(false);
      return;
    }
    
    // مهلة زمنية للتهيئة (10 ثواني)
    initTimeoutRef.current = setTimeout(() => {
      if (isInitializing) {
        console.warn('Dromo initialization timeout');
        setErrorMessage('انتهت مهلة تحميل أداة الاستيراد');
        setUiState('error');
        setIsInitializing(false);
      }
    }, 10000);
    
    try {
      // تأخير قصير لتحسين الأداء
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Creating Dromo instance with:', { 
        licenseKey: licenseKey.substring(0, 10) + '...', 
        templateKey: finalTemplateKey,
        tableType 
      });
      
      // إعداد الحقول الأساسية حسب نوع الجدول
      const getFieldsForTableType = (type: string): BasicDromoField[] => {
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
      
      // إعدادات الاستيراد - Public Mode
      const getWebhookUrl = (type: string): string => {
        // استخدام ngrok URL في development mode
        const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL;
        const baseUrl = ngrokUrl || process.env.NEXT_PUBLIC_API_URL || 'https://ahcp-backend-production.up.railway.app';
        
        // تحذير إذا كان localhost بدون ngrok
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
      
      const settings: any = {
        importIdentifier: `${tableType}_import`,
        developmentMode: true,
        mode: 'public', 
        webhookUrl: getWebhookUrl(tableType),
        webhookHeaders: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'X-Table-Type': tableType
        }
      };
      
      // بيانات المستخدم
      const user: BasicDromoUser = {
        id: 'user_1',
        name: 'System User',
        email: 'admin@ahcp.gov.sa'
      };
      
      // إنشاء instance جديد من Dromo مع تحسين الذاكرة
      const DromoClass = (await import('dromo-uploader-js')).default;
      uploaderRef.current = new (DromoClass as any)(licenseKey, fields, settings, user);
      
      // تسجيل callbacks
      if (uploaderRef.current.onResults) {
        uploaderRef.current.onResults(handleDromoResults);
      }
      if (uploaderRef.current.onError) {
        uploaderRef.current.onError(handleDromoError);
      }
      
      // معالج نجاح الاستيراد في Public Mode
      if (uploaderRef.current.onComplete) {
        uploaderRef.current.onComplete(async (event: any) => {
          console.log('Dromo onComplete event:', event);
          if (event?.webhookResponse?.success) {
            const response = event.webhookResponse;
            setImportResponse({
              success: true,
              insertedCount: response.insertedCount || 0,
              batchId: response.batchId,
              message: response.message
            });
            setUiState('done');
            onSuccess(response);
            toast.success(`تم استيراد ${response.insertedCount} سجل بنجاح`);
          }
        });
      }
      
      // إلغاء timeout عند النجاح
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      console.log('Dromo uploader initialized successfully for', tableLabels[tableType]);
      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to initialize Dromo uploader:', error);
      
      // إلغاء timeout عند الفشل
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      setErrorMessage('فشل في تهيئة أداة الرفع: ' + (error as Error).message);
      setUiState('error');
      setIsInitializing(false);
    }
  }, [templateKey, tableType, isInitializing]);

  // تهيئة Dromo عند الضغط على زر الاستيراد فقط
  const handleLaunchUploader = async () => {
    if (!templateKey) {
      toast.error('لم يتم تحديد قالب الاستيراد');
      return;
    }

    // إذا لم يتم تهيئة Dromo بعد، قم بتهيئته أولاً
    if (!uploaderRef.current && !isInitializing) {
      await initializeDromo();
    }

    // انتظر حتى تنتهي التهيئة
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
      // تنظيف Dromo instance
      if (uploaderRef.current) {
        uploaderRef.current = null;
      }
    };
  }, []);

  // معالجة نتائج Dromo
  const handleDromoResults = (results: any, metadata?: any) => {
    try {
      console.log('Dromo results received:', results);
      console.log('Dromo metadata received:', metadata);
      console.log('Mode:', uploaderRef.current?.settings?.mode || 'unknown');
      
      // تنظيف البيانات - محاولة عدة هياكل مختلفة
      let cleanedRows: any[] = [];
      
      if (Array.isArray(results)) {
        // إذا كانت النتائج مصفوفة مباشرة
        cleanedRows = results;
      } else if (results && typeof results === 'object') {
        // محاولة الوصول للبيانات من خصائص مختلفة
        cleanedRows = results.validData || 
                     results.data || 
                     results.rows || 
                     results.importedData || 
                     results.results || 
                     [];
      }
      
      console.log('Cleaned rows:', cleanedRows);
      
      if (!Array.isArray(cleanedRows)) {
        console.error('Data is not an array:', typeof cleanedRows, cleanedRows);
        throw new Error('البيانات المستلمة ليست في صيغة صحيحة');
      }

      if (cleanedRows.length === 0) {
        console.warn('No data found in results. Full results object:', results);
        throw new Error('لا توجد بيانات صالحة للاستيراد');
      }

      // في Public Mode، البيانات تُرسل مباشرة إلى webhook
      // لكن نعرض المعاينة أولاً
      setPreviewRows(cleanedRows);
      setUiState('preview');
      onPreview(cleanedRows);
      
      toast.info(`تم تحميل ${cleanedRows.length} صف - جاري الإرسال إلى الخادم`);
      
      // في Public Mode، لا نحتاج لتأكيد يدوي
      // البيانات تُرسل تلقائياً إلى webhook
    } catch (error) {
      console.error('Error processing Dromo results:', error);
      handleDromoError(error);
    }
  };

  // معالجة أخطاء Dromo
  const handleDromoError = (error: any) => {
    console.error('Dromo error:', error);
    const message = error?.message || 'حدث خطأ أثناء تحميل الملف';
    setErrorMessage(message);
    setUiState('error');
    onError(error);
    toast.error(message);
  };


  // تأكيد الاستيراد
  const confirmImport = async () => {
    if (previewRows.length === 0) {
      toast.error('لا توجد بيانات للاستيراد');
      return;
    }

    setUiState('sending');

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableType,
          rows: previewRows,
          dromoBackendKey: process.env.NEXT_PUBLIC_DROMO_BACKEND_KEY
        }),
      });

      const result: ImportResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'فشل في الاستيراد');
      }

      setImportResponse(result);
      
      if (result.success) {
        setUiState('done');
        onSuccess(result);
        toast.success(`تم استيراد ${result.insertedCount} سجل بنجاح`);
      } else {
        setUiState('error');
        setErrorMessage(result.message || 'فشل في الاستيراد');
        onError(result);
      }
    } catch (error: any) {
      console.error('Import failed:', error);
      setUiState('error');
      setErrorMessage(error.message || 'حدث خطأ أثناء الاستيراد');
      onError(error);
      toast.error('فشل في الاستيراد');
    }
  };

  // إعادة تعيين الحالة
  const resetState = () => {
    setUiState('idle');
    setPreviewRows([]);
    setImportResponse(null);
    setErrorMessage('');
  };

  // تحميل ملف الأخطاء
  const downloadErrors = () => {
    if (!importResponse?.errors || importResponse.errors.length === 0) {
      return;
    }

    const csvContent = [
      ['Row Index', 'Field', 'Error Message', 'Value'].join(','),
      ...importResponse.errors.map(error => [
        error.rowIndex,
        error.field,
        `"${error.message}"`,
        `"${error.value}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `import_errors_${tableType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full" data-dromo-uploader>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          استيراد بيانات {tableLabels[tableType]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* حالة الخمول */}
        {uiState === 'idle' && (
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                اختر ملف Excel أو CSV لاستيراد بيانات {tableLabels[tableType]}
              </p>
            </div>
            <Button 
              onClick={handleLaunchUploader}
              disabled={isInitializing}
              className="w-full"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  استيراد عبر Dromo
                </>
              )}
            </Button>
            {!templateKey && !FALLBACK_TEMPLATES[tableType] && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  لم يتم تحديد قالب الاستيراد لجدول {tableLabels[tableType]}.
                </AlertDescription>
              </Alert>
            )}
            {isInitializing && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري تحميل أداة الاستيراد... يرجى الانتظار.
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    قد يستغرق هذا عدة ثواني...
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* حالة المعاينة */}
        {uiState === 'preview' && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                تم تحميل {previewRows.length} صف بنجاح. راجع البيانات أدناه وأكد الاستيراد.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button onClick={confirmImport} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                تأكيد الاستيراد
              </Button>
              <Button variant="outline" onClick={resetState}>
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {/* حالة الإرسال */}
        {uiState === 'sending' && (
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p>جاري استيراد البيانات...</p>
            <div className="text-sm text-muted-foreground">
              يرجى عدم إغلاق هذه النافذة
            </div>
          </div>
        )}

        {/* حالة النجاح */}
        {uiState === 'done' && importResponse && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                تم الاستيراد بنجاح! تم إدراج {importResponse.insertedCount} سجل.
                {importResponse.batchId && (
                  <div className="mt-2 text-xs">
                    معرف الدفعة: <code>{importResponse.batchId}</code>
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {importResponse.errors && importResponse.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  تم العثور على {importResponse.errors.length} خطأ في البيانات.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadErrors}
                    className="mt-2 mr-2"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    تحميل ملف الأخطاء
                  </Button>
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
    </Card>
  );
};
