"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  onSuccess: (response: ImportResponse) => void;
  onError: (error: any) => void;
}

export const ImportUploader: React.FC<ImportUploaderProps> = ({
  templateKey,
  tableType,
  onSuccess,
  onError
}) => {
  // States
  const [uiState, setUiState] = useState<UIState>('idle');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [importResponse, setImportResponse] = useState<ImportResponse | null>(null);
  
  // Refs
  const uploaderRef = useRef<DromoUploaderInstance | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          { label: 'Name', key: 'name' },
          { label: 'ID', key: 'id' },
          { label: 'Birth Date', key: 'birthDate' },
          { label: 'Phone', key: 'phone' },
          { label: 'Holding Code', key: 'holdingCode' },
          { label: 'Location', key: 'location' },
          { label: 'E', key: 'e' },
          { label: 'N', key: 'n' },
          { label: 'Supervisor', key: 'supervisor' },
          { label: 'Vehicle No.', key: 'vehicleNo' },
          { label: 'Sheep', key: 'sheep' },
          { label: 'F. Sheep', key: 'fSheep' },
          { label: 'Vaccinated Sheep', key: 'vaccinatedSheep' },
          { label: 'Goats', key: 'goats' },
          { label: 'F.Goats', key: 'fGoats' },
          { label: 'Vaccinated Goats', key: 'vaccinatedGoats' },
          { label: 'Camel', key: 'camel' },
          { label: 'F. Camel', key: 'fCamel' },
          { label: 'Vaccinated Camels', key: 'vaccinatedCamels' },
          { label: 'Cattel', key: 'cattel' },
          { label: 'F. Cattle', key: 'fCattle' },
          { label: 'Vaccinated Cattle', key: 'vaccinatedCattle' },
          { label: 'Herd Number', key: 'herdNumber' },
          { label: 'Herd Females', key: 'herdFemales' },
          { label: 'Total Vaccinated', key: 'totalVaccinated' },
          { label: 'Herd Health', key: 'herdHealth' },
          { label: 'Animals Handling', key: 'animalsHandling' },
          { label: 'Labours', key: 'labours' },
          { label: 'Reachable Location', key: 'reachableLocation' },
          { label: 'Request Date', key: 'requestDate' },
          { label: 'Situation', key: 'situation' },
          { label: 'Request Fulfilling Date', key: 'requestFulfillingDate' },
          { label: 'Vaccine', key: 'vaccine' },
          { label: 'Category', key: 'category' },
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

      const fields = getFieldsForTableType(tableType);
      
      // دالة الحصول على webhook URL
      const getWebhookUrl = (type: string): string => {
        const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL;
        let baseUrl = ngrokUrl || process.env.NEXT_PUBLIC_API_URL || 'https://ahcp-backend-production.up.railway.app';
        
        if (!baseUrl.startsWith('http')) {
          baseUrl = `https://${baseUrl}`;
        }
        
        switch (type) {
          case 'laboratory':
            return `${baseUrl}/import-export/laboratory/import-dromo`;
          case 'vaccination':
            return `${baseUrl}/import-export/vaccination/import-dromo`;
          case 'parasite_control':
            return `${baseUrl}/import-export/parasite-control/import-dromo`;
          case 'mobile':
            return `${baseUrl}/import-export/mobile-clinics/import-dromo`;
          case 'equine_health':
            return `${baseUrl}/import-export/equine-health/import-dromo`;
          default:
            console.warn(`⚠️ Unknown table type: ${type}, using default route`);
            return `${baseUrl}/import-export/vaccination/import-dromo`;
        }
      };

      // إنشاء Dromo uploader
      if (typeof window !== 'undefined' && window.DromoUploader) {
        const webhookUrl = getWebhookUrl(tableType);
        console.log('📤 Webhook URL:', webhookUrl);

        uploaderRef.current = new window.DromoUploader({
          licenseKey: String(licenseKey),
          templateKey: String(templateKey),
          onResults: handleDromoResults,
          onError: handleDromoError
        });

        console.log('✅ Dromo initialized successfully');
        setIsInitializing(false);
      } else {
        throw new Error('Dromo SDK not loaded');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Dromo:', error);
      setErrorMessage(`فشل في تحميل أداة الاستيراد: ${error}`);
      setUiState('error');
      onError(error);
      setIsInitializing(false);
    }
  }, [tableType, templateKey, onError]);

  // معالجة نتائج Dromo
  const handleDromoResults = React.useCallback(async (results: any) => {
    console.log('📊 Dromo Results:', results);
    setIsProcessing(true);
    setUiState('sending');

    try {
      // استخراج البيانات من نتائج Dromo
      let data = null;
      if (Array.isArray(results)) {
        data = results;
        console.log('✅ Data format: Direct array');
      } else if (results && results.validData && Array.isArray(results.validData)) {
        data = results.validData;
        console.log('✅ Data format: results.validData');
      } else if (results && results.data && Array.isArray(results.data)) {
        data = results.data;
        console.log('✅ Data format: results.data');
      } else if (results && typeof results === 'object' && !Array.isArray(results)) {
        data = [results];
        console.log('✅ Data format: Single object converted to array');
      }

      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`✅ Received ${data.length} valid rows - إرسال مباشر إلى قاعدة البيانات`);
        console.log('📊 Sample data:', data[0]);

        // إرسال البيانات إلى الخادم
        const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL;
        let baseUrl = ngrokUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        if (!baseUrl) {
          baseUrl = 'http://localhost:3001';
        }

        const getWebhookUrl = (type: string): string => {
          switch (type) {
            case 'laboratory':
              return `${baseUrl}/import-export/laboratory/import-dromo`;
            case 'vaccination':
              return `${baseUrl}/import-export/vaccination/import-dromo`;
            case 'parasite_control':
              return `${baseUrl}/import-export/parasite-control/import-dromo`;
            case 'mobile':
              return `${baseUrl}/import-export/mobile-clinics/import-dromo`;
            case 'equine_health':
              return `${baseUrl}/import-export/equine-health/import-dromo`;
            default:
              console.warn(`⚠️ Unknown table type: ${type}, using default route`);
              return `${baseUrl}/import-export/vaccination/import-dromo`;
          }
        };

        const webhookUrl = getWebhookUrl(tableType);
        console.log('📤 البيانات المرسلة:', { data, tableType, totalRows: data.length });

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data }),
        });

        const responseData = await response.json();
        console.log('📥 Server Response:', responseData);

        if (responseData.success) {
          setUiState('done');
          setImportResponse(responseData);
          onSuccess(responseData);
          toast.success(`تم استيراد ${responseData.insertedCount || data.length} سجل بنجاح`);
        } else {
          setUiState('error');
          setErrorMessage(responseData.message || 'فشل في الاستيراد');
          onError(responseData);
        }
      } else {
        console.error('❌ No valid data found in results:', results);
        setErrorMessage('لم يتم العثور على بيانات صالحة للاستيراد');
        setUiState('error');
      }
    } catch (error) {
      console.error('❌ Error processing results:', error);
      setErrorMessage(`خطأ في معالجة البيانات: ${error}`);
      setUiState('error');
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  }, [tableType, onSuccess, onError]);

  // معالجة أخطاء Dromo
  const handleDromoError = React.useCallback((error: any) => {
    console.error('❌ Dromo Error:', error);
    setErrorMessage(`خطأ في أداة الاستيراد: ${error.message || error}`);
    setUiState('error');
    onError(error);
  }, [onError]);

  // تشغيل Dromo
  const handleLaunchUploader = async () => {
    if (!uploaderRef.current) {
      await initializeDromo();
    }
    
    if (uploaderRef.current && !isInitializing) {
      try {
        if (uploaderRef.current.open) {
          uploaderRef.current.open();
        } else if (uploaderRef.current.launch) {
          uploaderRef.current.launch();
        }
      } catch (error) {
        console.error('❌ Error launching uploader:', error);
        setErrorMessage(`فشل في تشغيل أداة الاستيراد: ${error}`);
        setUiState('error');
        onError(error);
      }
    }
  };

  // تنظيف الموارد
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

  // إعادة تعيين الحالة
  const resetState = () => {
    setUiState('idle');
    setImportResponse(null);
    setErrorMessage('');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          استيراد بيانات {tableLabels[tableType]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* زر الاستيراد */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleLaunchUploader}
            disabled={isInitializing || isProcessing}
            className="w-full"
            size="lg"
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري تحميل أداة الاستيراد...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري معالجة البيانات...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                استيراد ملف Excel
              </>
            )}
          </Button>
        </div>

        {/* رسائل الحالة */}
        {uiState === 'error' && errorMessage && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
              <Button
                variant="outline"
                size="sm"
                onClick={resetState}
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                إعادة المحاولة
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {uiState === 'sending' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              جاري إرسال البيانات إلى الخادم...
            </AlertDescription>
          </Alert>
        )}

        {uiState === 'done' && importResponse && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="text-green-800">
                  تم الاستيراد بنجاح! تم إدراج {importResponse.insertedCount} سجل.
                </p>
                {importResponse.errors && importResponse.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-amber-600 font-medium">
                      تحذيرات ({importResponse.errors.length}):
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      {importResponse.errors.slice(0, 5).map((error, index) => (
                        <p key={index} className="text-sm text-amber-700">
                          السطر {error.rowIndex + 1}: {error.message}
                        </p>
                      ))}
                      {importResponse.errors.length > 5 && (
                        <p className="text-sm text-amber-600">
                          ... و {importResponse.errors.length - 5} تحذيرات أخرى
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetState}
                  className="mt-2"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  استيراد ملف آخر
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
