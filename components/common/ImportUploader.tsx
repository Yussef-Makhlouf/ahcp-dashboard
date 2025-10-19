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
              { label: 'Name', key: 'name' },
              { label: 'ID', key: 'id' },
              { label: 'Birth Date', key: 'birthDate' },
              { label: 'Phone', key: 'phone' },
              { label: 'Holding Code', key: 'holdingCode' },
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
              { label: 'Name', key: 'name' },
              { label: 'ID', key: 'id' },
              { label: 'Birth Date', key: 'birthDate' },
              { label: 'Phone', key: 'phone' },
              { label: 'Holding Code', key: 'holdingCode' },
              { label: 'Herd Location', key: 'herdLocation' },
              { label: 'Latitude', key: 'latitude' },
              { label: 'Longitude', key: 'longitude' },
              { label: 'Supervisor', key: 'supervisor' },
              { label: 'Vehicle No', key: 'vehicleNo' },
              { label: 'Insecticide Type', key: 'insecticideType' },
              { label: 'Insecticide Volume', key: 'insecticideVolume' },
              { label: 'Sheep Total', key: 'sheepTotal' },
              { label: 'Sheep Treated', key: 'sheepTreated' },
              { label: 'Sheep Young', key: 'sheepYoung' },
              { label: 'Sheep Female', key: 'sheepFemale' },
              { label: 'Goats Total', key: 'goatsTotal' },
              { label: 'Goats Treated', key: 'goatsTreated' },
              { label: 'Goats Young', key: 'goatsYoung' },
              { label: 'Goats Female', key: 'goatsFemale' },
              { label: 'Cattle Total', key: 'cattleTotal' },
              { label: 'Cattle Treated', key: 'cattleTreated' },
              { label: 'Cattle Young', key: 'cattleYoung' },
              { label: 'Cattle Female', key: 'cattleFemale' },
              { label: 'Camel Total', key: 'camelTotal' },
              { label: 'Camel Treated', key: 'camelTreated' },
              { label: 'Camel Young', key: 'camelYoung' },
              { label: 'Camel Female', key: 'camelFemale' },
              { label: 'Horse Total', key: 'horseTotal' },
              { label: 'Horse Treated', key: 'horseTreated' },
              { label: 'Horse Young', key: 'horseYoung' },
              { label: 'Horse Female', key: 'horseFemale' },
              { label: 'Herd Health Status', key: 'herdHealthStatus' },
              { label: 'Animal Barn Size SqM', key: 'animalBarnSizeSqM' },
              { label: 'Breeding Sites Type', key: 'breedingSitesType' },
              { label: 'Breeding Sites Area', key: 'breedingSitesArea' },
              { label: 'Breeding Sites Treatment', key: 'breedingSitesTreatment' },
              { label: 'Parasite Control Volume', key: 'parasiteControlVolume' },
              { label: 'Parasite Control Status', key: 'parasiteControlStatus' },
              { label: 'Complying', key: 'complying' },
              { label: 'Total Herd', key: 'totalHerd' },
              { label: 'Total Young', key: 'totalYoung' },
              { label: 'Total Female', key: 'totalFemale' },
              { label: 'Total Treated', key: 'totalTreated' },
              { label: 'Type', key: 'type' },
              { label: 'Volume (ml)', key: 'volume' },
              { label: 'Category', key: 'category' },
              { label: 'Status', key: 'status' },
              { label: 'Request Date', key: 'requestDate' },
              { label: 'Request Situation', key: 'requestSituation' },
              { label: 'Request Fulfilling Date', key: 'requestFulfillingDate' },
              { label: 'Complying To Instructions', key: 'complyingToInstructions' },
              { label: 'Remarks', key: 'remarks' }
            ];
          case 'mobile':
            return [
              // Basic Information
              { label: 'Serial No', key: 'serialNo' },
              { label: 'Date', key: 'date' },
              
              // Client Information (will be populated from Client reference)
              { label: 'Client Name', key: 'clientName' },
              { label: 'National ID', key: 'nationalId' },
              { label: 'Birth Date', key: 'birthDate' },
              { label: 'Phone', key: 'phone' },
              { label: 'Village', key: 'village' },
              { label: 'Detailed Address', key: 'detailedAddress' },
              
              // Location Information
              { label: 'Farm Location', key: 'farmLocation' },
              { label: 'Latitude', key: 'latitude' },
              { label: 'Longitude', key: 'longitude' },
              
              // Staff Information
              { label: 'Supervisor', key: 'supervisor' },
              { label: 'Vehicle No', key: 'vehicleNo' },
              
              // Animal Counts
              { label: 'Sheep Count', key: 'sheepCount' },
              { label: 'Goats Count', key: 'goatsCount' },
              { label: 'Camel Count', key: 'camelCount' },
              { label: 'Cattle Count', key: 'cattleCount' },
              { label: 'Horse Count', key: 'horseCount' },
              
              // Medical Information
              { label: 'Diagnosis', key: 'diagnosis' },
              { label: 'Intervention Category', key: 'interventionCategory' },
              { label: 'Treatment', key: 'treatment' },
              
              // Medication Information
              { label: 'Medication Name', key: 'medicationName' },
              { label: 'Medication Dosage', key: 'dosage' },
              { label: 'Medication Quantity', key: 'quantity' },
              { label: 'Administration Route', key: 'route' },
              
              // Request Information
              { label: 'Request Date', key: 'requestDate' },
              { label: 'Request Situation', key: 'requestSituation' },
              { label: 'Request Fulfilling Date', key: 'requestFulfillingDate' },
              
              // Follow-up Information
              { label: 'Follow Up Required', key: 'followUpRequired' },
              { label: 'Follow Up Date', key: 'followUpDate' },
              
              // Additional Information
              { label: 'Remarks', key: 'remarks' }
            ];
          case 'equine_health':
            return [
              // Basic Information
              { label: 'Serial No', key: 'serialNo' },
              { label: 'Date', key: 'date' },
              
              // Client Information
              { label: 'Client Name', key: 'clientName' },
              { label: 'National ID', key: 'nationalId' },
              { label: 'Birth Date', key: 'birthDate' },
              { label: 'Phone', key: 'phone' },
              { label: 'Village', key: 'village' },
              { label: 'Detailed Address', key: 'detailedAddress' },
              
              // Location Information
              { label: 'Farm Location', key: 'farmLocation' },
              { label: 'Latitude', key: 'latitude' },
              { label: 'Longitude', key: 'longitude' },
              
              // Staff Information
              { label: 'Supervisor', key: 'supervisor' },
              { label: 'Vehicle No', key: 'vehicleNo' },
              
              // Horse Information
              { label: 'Horse Count', key: 'horseCount' },
              
              // Horse Details (for individual horses)
              { label: 'Horse ID', key: 'horseId' },
              { label: 'Horse Breed', key: 'breed' },
              { label: 'Horse Age', key: 'age' },
              { label: 'Horse Gender', key: 'gender' },
              { label: 'Horse Color', key: 'color' },
              { label: 'Horse Health Status', key: 'healthStatus' },
              { label: 'Horse Weight', key: 'weight' },
              { label: 'Temperature', key: 'temperature' },
              { label: 'Heart Rate', key: 'heartRate' },
              { label: 'Respiratory Rate', key: 'respiratoryRate' },
              
              // Medical Information
              { label: 'Diagnosis', key: 'diagnosis' },
              { label: 'Intervention Category', key: 'interventionCategory' },
              { label: 'Treatment', key: 'treatment' },
              
              // Medication Information
              { label: 'Medication Name', key: 'medicationName' },
              { label: 'Medication Dosage', key: 'dosage' },
              { label: 'Medication Quantity', key: 'quantity' },
              { label: 'Administration Route', key: 'route' },
              { label: 'Medication Frequency', key: 'frequency' },
              { label: 'Treatment Duration', key: 'duration' },
              
              // Request Information
              { label: 'Request Date', key: 'requestDate' },
              { label: 'Request Situation', key: 'requestSituation' },
              { label: 'Request Fulfilling Date', key: 'requestFulfillingDate' },
              
              // Follow-up Information
              { label: 'Follow Up Required', key: 'followUpRequired' },
              { label: 'Follow Up Date', key: 'followUpDate' },
              
              // Health Status Information
              { label: 'Vaccination Status', key: 'vaccinationStatus' },
              { label: 'Deworming Status', key: 'dewormingStatus' },
              
              // Additional Information
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
      
      // دالة الحصول على webhook URL - بدون /api (حسب server.js)
      const getWebhookUrl = (type: string): string => {
        const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL;
        let baseUrl = ngrokUrl || process.env.NEXT_PUBLIC_API_URL || 'https://ahcp-backend-production.up.railway.app';
        
        // إزالة /api إذا كانت موجودة (webhook routes بدون /api)
        baseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
        
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
      
      // بيانات المستخدم من auth store أو default
      const authUser = JSON.parse(localStorage.getItem('user') || '{}');
      const user = {
        id: authUser.id || 'anonymous_user',
        name: authUser.name || 'مستخدم النظام',
        email: authUser.email || 'user@ahcp.gov.sa'
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
      
      // معالجة البيانات من Dromo Starter Plan - إرسال مباشر
      if (uploaderRef.current.onResults) {
        uploaderRef.current.onResults(async (results: any) => {
          console.log('📊 Dromo Starter Plan - Received results:', results);
          
          // البيانات يمكن أن تأتي في عدة أشكال من Dromo
          let data = null;
          
          if (Array.isArray(results)) {
            // البيانات تأتي مباشرة كـ array
            data = results;
            console.log('✅ Data format: Direct array');
          } else if (results && results.validData && Array.isArray(results.validData)) {
            // البيانات في results.validData
            data = results.validData;
            console.log('✅ Data format: results.validData');
          } else if (results && results.data && Array.isArray(results.data)) {
            // البيانات في results.data
            data = results.data;
            console.log('✅ Data format: results.data');
          } else if (results && typeof results === 'object' && !Array.isArray(results)) {
            // البيانات كـ object واحد - تحويل إلى array
            data = [results];
            console.log('✅ Data format: Single object converted to array');
          }
          
          if (data && Array.isArray(data) && data.length > 0) {
            console.log(`✅ Received ${data.length} valid rows - إرسال مباشر إلى قاعدة البيانات`);
            console.log('📊 Sample data:', data[0]);
            
            // إرسال مباشر إلى قاعدة البيانات بدون تأكيد
            setIsProcessing(true);
            setUiState('sending');
            
            try {
              // إرسال البيانات مباشرة إلى Backend
              const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL;
              let baseUrl = ngrokUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
              if (!baseUrl) {
                baseUrl = 'http://localhost:3001';
              }
              baseUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
              
              const getWebhookUrl = (type: string): string => {
                switch (type) {
                  case 'laboratory':
                    return `${baseUrl}/import-export/laboratories/import-dromo`;
                  case 'vaccination':
                    return `${baseUrl}/import-export/vaccination/import-dromo`;
                  case 'parasite_control':
                    return `${baseUrl}/import-export/parasite-control/import-dromo`; // Placeholder route
                  case 'mobile':
                    return `${baseUrl}/import-export/mobile-clinics/import-dromo`; // Placeholder route
                  case 'equine_health':
                    return `${baseUrl}/import-export/equine-health/import-dromo`; // Placeholder route
                  default:
                    console.warn(`⚠️ Unknown table type: ${type}, using default route`);
                    return `${baseUrl}/import-export/vaccination/import-dromo`; // Fallback to working route
                }
              };

              const webhookUrl = getWebhookUrl(tableType);
              console.log('📤 إرسال مباشر إلى:', webhookUrl);
              console.log('📤 البيانات المرسلة:', { data, tableType, totalRows: data.length });
              
              const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                  'X-Table-Type': tableType,
                  'X-Source': 'dromo-auto-import'
                },
                body: JSON.stringify({
                  data: data,
                  validData: data,
                  source: 'dromo-starter-auto',
                  tableType: tableType,
                  totalRows: data.length
                })
              });

              const result = await response.json();
              console.log('📥 نتيجة الحفظ:', result);

              if (!response.ok) {
                throw new Error(result.message || 'فشل في الحفظ');
              }

              if (result.success) {
                setUiState('done');
                setImportResponse(result);
                onSuccess(result);
                toast.success(`✅ تم حفظ ${result.insertedCount || data.length} سجل بنجاح في قاعدة البيانات!`);
              } else {
                throw new Error(result.message || 'فشل في الحفظ');
              }
              
            } catch (error: any) {
              console.error('❌ فشل الحفظ المباشر:', error);
              setUiState('error');
              setErrorMessage(error.message || 'حدث خطأ أثناء الحفظ');
              onError(error);
              toast.error('فشل في حفظ البيانات');
            } finally {
              setIsProcessing(false);
            }
            
          } else if (results && results.errors && results.errors.length > 0) {
            console.error('❌ Import errors:', results.errors);
            setErrorMessage(`تم العثور على ${results.errors.length} خطأ في البيانات`);
            setUiState('error');
          } else {
            console.error('❌ No valid data found in results:', results);
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
  }, [tableType, templateKey, onError]);

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

  // إعادة تعيين الحالة
  const resetState = () => {
    setUiState('idle');
    setImportResponse(null);
    setErrorMessage('');
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

        {/* حالة الإرسال المباشر */}
        {uiState === 'sending' && (
          <div className="text-center space-y-4">
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-blue-800">
                جاري حفظ البيانات...
              </h3>
              <p className="text-blue-600">
                يتم إرسال البيانات مباشرة إلى قاعدة البيانات
              </p>
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

    </Card>
  );
};
