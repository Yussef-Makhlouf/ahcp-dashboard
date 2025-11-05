"use client";

import {  useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { Button, LoadingButton } from "@/components/ui/button-modern";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { SupervisorSelect } from "@/components/ui/supervisor-select";
import { ClientSelector } from "@/components/ui/client-selector";
import { VillageSelect } from "@/components/ui/village-select";
import { CalendarIcon, Plus, Trash2, AlertCircle, CheckCircle2, User, Heart, Shield, Activity } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { handleFormError, showSuccessToast, showErrorToast, translateFieldName } from "@/lib/utils/error-handler";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { validateSaudiPhone } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMobileTabs } from "@/components/ui/mobile-tabs";
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from "@/components/ui/card-modern";
import { Badge, StatusBadge } from "@/components/ui/badge-modern";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import type { Laboratory, Client } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { entityToasts } from "@/lib/utils/toast-utils";
import { laboratoriesApi } from "@/lib/api/laboratories";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedSelect } from "@/components/ui/validated-select";
import { ValidatedTextarea } from "@/components/ui/validated-textarea";
import { DynamicSelect } from "@/components/ui/dynamic-select";

interface LaboratoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laboratory?: Laboratory;
  onSave: (data: any) => void;
}

const sampleTypes = [
  { value: "Serum", label: "Serum" },
  { value: "Whole Blood", label: "Whole Blood" },
  { value: "Fecal Sample", label: "Fecal Sample" },
  { value: "Skin Scrape", label: "Skin Scrape" },
];

// Removed static collectors array - now using API

const testTypes = [
  { value: "Brucella ICT", label: "Brucella ICT" },
  { value: "Trypanosoma CATT", label: "Trypanosoma CATT" },
  { value: "Blood Parasite Smear", label: "Blood Parasite Smear" },
  { value: "Internal Parasite Microscopic Examination", label: "Internal Parasite Microscopic Examination" },
  { value: "CBC", label: "CBC" },
  { value: "Chemistry Analysis", label: "Chemistry Analysis" },
];

interface TestResult {
  id: string;
  animalId: string;
  animalType: string;
  testType: string;
  result: string;
  notes: string;
}

export function LaboratoryDialog({ open, onOpenChange, laboratory, onSave }: LaboratoryDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Validation rules for unified system - matching backend requirements
  const validationRules = {
    'client.name': { required: true, minLength: 2 },
    'client.nationalId': { required: true, nationalId: true },
    'client.phone': { 
      required: true, 
      custom: (value: string) => {
        if (!value) return null;
        if (!validateSaudiPhone(value)) {
          return 'رقم الهاتف السعودي غير صحيح. يجب أن يبدأ بـ 05 ويكون مكون من 10 أرقام';
        }
        return null;
      }
    },
    'collector': { required: true },
    'sampleType': { required: true },
    'sampleNumber': { required: true },
    'sampleCode': { required: true }
  };

  const {
    errors,
    validateField,
    validateForm: validateFormData,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldError,
  } = useFormValidation(validationRules);

  const [formData, setFormData] = useState({
    serialNo: 0,
    date: undefined as Date | undefined,
    sampleCode: "",
    client: {
      _id: "",
      name: "",
      nationalId: "",
      phone: "",
      village: "",
      detailedAddress: "",
      birthDate: "",
    },
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    speciesCounts: {
      sheep: 0,
      goats: 0,
      camel: 0,
      cattle: 0,
      horse: 0,
      other: "",
    },
    collector: "",
    supervisor: "",
    vehicleNo: "",
    sampleType: "",
    sampleNumber: "",
    testType: "",
    causeOfSample: "",
    animalCategory: "",
    positiveCases: 0,
    negativeCases: 0,
    remarks: "",
    testResults: [] as TestResult[],
  });

  const [newTestResult, setNewTestResult] = useState<TestResult>({
    id: "",
    animalId: "",
    animalType: "sheep",
    testType: "",
    result: "pending",
    notes: "",
  });

  useEffect(() => {
    if (laboratory) {
      console.log('🔄 Loading laboratory for edit:', laboratory);
      console.log('📋 Client data check:', {
        hasClientObject: !!(laboratory.client && typeof laboratory.client === 'object'),
        hasClientName: !!laboratory.clientName,
        hasClientId: !!laboratory.clientId,
        clientName: laboratory.clientName,
        clientId: laboratory.clientId,
        clientPhone: laboratory.clientPhone
      });
      
      // Handle client data - support both flat and nested structures
      if (laboratory.client && typeof laboratory.client === 'object') {
        // Client exists as an object - use ClientSelector
        console.log('✅ Using ClientSelector - client object found');
        setSelectedClient(laboratory.client as Client);
      } else if (laboratory.clientName && laboratory.clientId) {
        // Client data exists as flat fields - this was manual input
        console.log('✅ Using manual input - flat client data found');
        setSelectedClient(null);
      } else {
        console.log('⚠️ No client data found - defaulting to ClientSelector');
        setSelectedClient(null);
      }
      
      setFormData({
        serialNo: laboratory.serialNo || 0,
        date: laboratory.date ? new Date(laboratory.date) : undefined,
        sampleCode: laboratory.sampleCode || "",
        // Handle both flat client fields and nested client object for maximum compatibility
        client: {
          _id: (laboratory.client as any)?._id || "",
          name: laboratory.clientName || (laboratory.client as any)?.name || "",
          nationalId: laboratory.clientId || (laboratory.client as any)?.nationalId || "",
          phone: laboratory.clientPhone || (laboratory.client as any)?.phone || "",
          village: typeof (laboratory.client as any)?.village === 'string' ? (laboratory.client as any)?.village : (laboratory.client as any)?.village?.nameArabic || (laboratory.client as any)?.village?.name || "",
          detailedAddress: (laboratory.client as any)?.detailedAddress || "",
          birthDate: laboratory.clientBirthDate || (laboratory.client as any)?.birthDate || "",
        },
        coordinates: laboratory.coordinates || { latitude: 0, longitude: 0 },
        speciesCounts: laboratory.speciesCounts ? {
          sheep: laboratory.speciesCounts.sheep || 0,
          goats: laboratory.speciesCounts.goats || 0,
          camel: laboratory.speciesCounts.camel || 0,
          cattle: laboratory.speciesCounts.cattle || 0,
          horse: laboratory.speciesCounts.horse || 0,
          other: laboratory.speciesCounts.other || "",
        } : {
          sheep: 0,
          goats: 0,
          camel: 0,
          cattle: 0,
          horse: 0,
          other: "",
        },
        collector: laboratory.collector || "",
        supervisor: (laboratory as any).supervisor || "",
        vehicleNo: (laboratory as any).vehicleNo || "",
        sampleType: laboratory.sampleType || "",
        sampleNumber: laboratory.sampleNumber || "",
        testType: (laboratory as any).testType || "",
        causeOfSample: (laboratory as any).causeOfSample || "",
        animalCategory: (laboratory as any).animalCategory || "",
        positiveCases: laboratory.positiveCases || 0,
        negativeCases: laboratory.negativeCases || 0,
        remarks: laboratory.remarks || "",
        testResults: laboratory.testResults || [],
      });
    } else {
      // Reset selected client for new record
      setSelectedClient(null);
      
      // Generate new sample code and serial number
      const newCode = `LAB${String(Math.floor(Math.random() * 10000)).padStart(3, '0')}`;
      const newSerial = Math.floor(Math.random() * 9000000000) + 1000000000;
      setFormData({
        serialNo: newSerial,
        date: new Date(),
        sampleCode: newCode,
        client: {
          _id: "",
          name: "",
          nationalId: "",
          phone: "",
          village: "",
          detailedAddress: "",
          birthDate: "",
        },
        coordinates: { latitude: 0, longitude: 0 },
        speciesCounts: {
          sheep: 0,
          goats: 0,
          camel: 0,
          cattle: 0,
          horse: 0,
          other: "",
        },
        collector: "",
        supervisor: "",
        vehicleNo: "",
        sampleType: "",
        sampleNumber: "",
        testType: "",
        causeOfSample: "",
        animalCategory: "",
        positiveCases: 0,
        negativeCases: 0,
        remarks: "",
        testResults: [],
      });
    }
  }, [laboratory]);

  const validateForm = () => {
    console.log('🔍 Starting form validation...');
    console.log('📋 Form data to validate:', formData);
    
    // Validate phone number format for backend
    if (formData.client.phone && !formData.client.phone.match(/^05\d{8}$/)) {
      const normalizedPhone = formData.client.phone.startsWith('05') ? formData.client.phone : `05${formData.client.phone.replace(/^0+/, '')}`;
      if (!normalizedPhone.match(/^05\d{8}$/)) {
        console.log('❌ Phone validation failed:', formData.client.phone, '-> normalized:', normalizedPhone);
        setFieldError('client.phone', 'رقم الهاتف يجب أن يبدأ بـ 05 ويكون مكون من 10 أرقام');
        return false;
      }
    }
    
    // Clear all previous errors
    clearAllErrors();
    
    // Check required fields manually - matching backend schema
    const requiredFields = {
      'client.name': formData.client.name,
      'client.nationalId': formData.client.nationalId,
      'client.phone': formData.client.phone,
      'collector': formData.collector,
      'sampleType': formData.sampleType,
      'sampleNumber': formData.sampleNumber,
      'sampleCode': formData.sampleCode
    };
    
    let hasErrors = false;
    
    // Check each required field
    Object.entries(requiredFields).forEach(([fieldName, value]) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        console.log(`❌ Required field missing: ${fieldName}`);
        setFieldError(fieldName, `${getArabicFieldName(fieldName)} مطلوب`);
        hasErrors = true;
      }
    });
    
    // Use the unified validation system
    const isValid = validateFormData(formData);
    console.log('📝 Basic validation result:', isValid);
    
    if (!isValid) {
      hasErrors = true;
    }
    
    // Additional custom validations
    const totalSamples = getTotalSamples();
    console.log('🔢 Total samples calculated:', totalSamples);
    
    if (totalSamples === 0) {
      console.log('❌ Validation failed: No samples');
      setFieldError('speciesCounts', "يجب إدخال عدد العينات في تبويب العينات");
      hasErrors = true;
    }
    
    // Validate positive and negative cases
    if (formData.positiveCases < 0) {
      console.log('❌ Validation failed: Negative positive cases');
      setFieldError('positiveCases', "الحالات الإيجابية لا يمكن أن تكون سالبة");
      hasErrors = true;
    }
    
    if (formData.negativeCases < 0) {
      console.log('❌ Validation failed: Negative negative cases');
      setFieldError('negativeCases', "الحالات السلبية لا يمكن أن تكون سالبة");
      hasErrors = true;
    }
    
    const totalCases = formData.positiveCases + formData.negativeCases;
    console.log('🔢 Total cases:', totalCases, 'vs Total samples:', totalSamples);
    
    if (totalCases > totalSamples) {
      console.log('❌ Validation failed: Cases exceed samples');
      setFieldError('positiveCases', "مجموع الحالات الإيجابية والسلبية لا يمكن أن يكون أكبر من إجمالي العينات");
      hasErrors = true;
    }
    
    const finalResult = !hasErrors;
    console.log('✅ Final validation result:', finalResult);
    
    if (hasErrors) {
      console.log('❌ Validation errors found, please check all required fields');
    }
    
    return finalResult;
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    console.log('🔍 Form submission started');
    console.log('📋 Current form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    console.log('✅ Form validation passed');
    
    // Prepare data for backend - matching the table structure exactly
    const submitData = {
      serialNo: formData.serialNo,
      date: formData.date ? format(formData.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"), // Use current date if not set
      sampleCode: formData.sampleCode,
      client: {
        _id: formData.client._id,
        name: formData.client.name,
        nationalId: formData.client.nationalId,
        phone: formData.client.phone.startsWith('05') ? formData.client.phone : `05${formData.client.phone.replace(/^0+/, '')}`, // Ensure phone starts with 05
        village: formData.client.village,
        detailedAddress: formData.client.detailedAddress,
        birthDate: formData.client.birthDate ? format(formData.client.birthDate, "yyyy-MM-dd") : undefined,
      },
      coordinates: formData.coordinates,
      speciesCounts: formData.speciesCounts,
      collector: formData.collector,
      supervisor: formData.supervisor,
      vehicleNo: formData.vehicleNo,
      sampleType: formData.sampleType,
      sampleNumber: formData.sampleNumber,
      testType: formData.testType,
      causeOfSample: formData.causeOfSample,
      animalCategory: formData.animalCategory,
      positiveCases: formData.positiveCases,
      negativeCases: formData.negativeCases,
      remarks: formData.remarks,
    };
    
    console.log('📤 Data being sent to API:', submitData);
    
    try {
      if (laboratory) {
        console.log('🔄 Updating existing laboratory...');
        // Update existing laboratory
        await laboratoriesApi.update(laboratory._id || '', submitData);
        entityToasts.laboratory.update();
      } else {
        console.log('➕ Creating new laboratory...');
        
        // Create client if we have client data but no client reference
        const hasClientReference = formData.client._id && formData.client._id.trim();
        const hasClientData = formData.client.name && formData.client.nationalId;
        
        // Create client if we have client data but no client reference
        if (!hasClientReference && hasClientData) {
          console.log('👤 Creating client from form data...');
          try {
            const clientData = {
              name: formData.client.name,
              nationalId: formData.client.nationalId,
              phone: formData.client.phone || '',
              birthDate: formData.client.birthDate ? format(new Date(formData.client.birthDate), "yyyy-MM-dd") : undefined,
              village: formData.client.village || '',
              detailedAddress: formData.client.detailedAddress || '',
              status: 'نشط'
            };
            
            // Create client via API
            const clientResponse = await fetch('/api/clients', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(clientData),
            });
            
            if (clientResponse.ok) {
              const createdClient = await clientResponse.json();
              // Add client reference to submitData
              (submitData as any).client = createdClient.data?._id || createdClient._id;
              console.log('✅ Client created successfully:', createdClient);
            } else {
              console.log('⚠️ Client creation failed, proceeding with flat data');
            }
          } catch (clientError) {
            console.error('❌ Error creating client:', clientError);
            console.log('⚠️ Proceeding with flat client data');
          }
        }
        
        // Create new laboratory
        const result = await laboratoriesApi.create(submitData);
        console.log('✅ Laboratory created successfully:', result);
        entityToasts.laboratory.create();
      }
      
      console.log('🎉 Laboratory saved successfully, calling onSave...');
      onSave(submitData);
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Create/Update laboratory error:', error);
      
      // استخدام نظام الأخطاء المحسن
      handleFormError(error, setFieldError, clearAllErrors);
    }
  };

  // Helper function to get Arabic field names
  const getArabicFieldName = (fieldName: string): string => {
    const fieldNames: { [key: string]: string } = {
      'serialNo': 'الرقم التسلسلي',
      'date': 'التاريخ',
      'sampleCode': 'رمز العينة',
      'clientName': 'اسم العميل',
      'clientId': 'رقم الهوية',
      'clientPhone': 'رقم الهاتف',
      'clientBirthDate': 'تاريخ الميلاد',
      'collector': 'جامع العينة',
      'sampleType': 'نوع العينة',
      'sampleNumber': 'رمز جامع العينة',
      'positiveCases': 'الحالات الإيجابية',
      'negativeCases': 'الحالات السلبية',
      'speciesCounts': 'عدد العينات',
      'coordinates.latitude': 'الإحداثي الشمالي',
      'coordinates.longitude': 'الإحداثي الشرقي',
      'remarks': 'الملاحظات'
    };
    
    return fieldNames[fieldName] || fieldName;
  };

  const addTestResult = () => {
    if (newTestResult.animalId && newTestResult.testType) {
      setFormData({
        ...formData,
        testResults: [...formData.testResults, { ...newTestResult, id: Date.now().toString() }],
      });
      setNewTestResult({
        id: "",
        animalId: "",
        animalType: "sheep",
        testType: "",
        result: "pending",
        notes: "",
      });
    }
  };

  const removeTestResult = (id: string) => {
    setFormData({
      ...formData,
      testResults: formData.testResults.filter(t => t.id !== id),
    });
  };

  const getTotalSamples = () => {
    const counts = formData.speciesCounts || {};
    return (counts.sheep || 0) + (counts.goats || 0) + (counts.camel || 0) + (counts.cattle || 0) + (counts.horse || 0);
  };

  const getPositivePercentage = () => {
    const total = formData.positiveCases + formData.negativeCases;
    return total > 0 ? (formData.positiveCases / total) * 100 : 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 lg:p-6">
        <DialogHeader>
          <DialogTitle>
            {laboratory ? "تعديل نتائج الفحص المخبري" : "إضافة فحص مخبري جديد"}
          </DialogTitle>
          <DialogDescription>
            {laboratory ? "قم بتعديل بيانات الفحص المخبري" : "أدخل بيانات الفحص المخبري الجديد"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form id="laboratory-form">
            {/* Display validation errors */}
            {Object.keys(errors).length > 0 && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-medium mb-2">يرجى تصحيح الأخطاء التالية:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} className="text-sm">
                        <strong>{getArabicFieldName(field)}:</strong> {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-modern" dir="rtl">
              <EnhancedMobileTabs
                value={activeTab}
                onValueChange={setActiveTab}
                tabs={[
                  {
                    value: "basic",
                    label: "البيانات الأساسية",
                    shortLabel: "أساسية",
                    icon: <User className="w-4 h-4" />
                  },
                  {
                    value: "samples",
                    label: "العينات",
                    shortLabel: "عينات",
                    icon: <Heart className="w-4 h-4" />
                  },
                  {
                    value: "results",
                    label: "النتائج",
                    shortLabel: "نتائج",
                    icon: <Shield className="w-4 h-4" />
                  },
                  {
                    value: "report",
                    label: "التقرير",
                    shortLabel: "تقرير",
                    icon: <Activity className="w-4 h-4" />
                  }
                ]}
              />

            <TabsContent value="basic" className="tabs-content-modern">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Serial Number */}
                <div className="space-y-2">
                  <Label>رقم التسلسل *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formData.serialNo}
                      onChange={(e) => {
                        setFormData({ ...formData, serialNo: parseInt(e.target.value) || 0 });
                        clearFieldError('serialNo');
                      }}
                      required
                      disabled={!!laboratory}
                      className={`flex-1 ${getFieldError('serialNo') ? 'border-red-500' : ''}`}
                    />
                    {!laboratory && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const randomSerial = Math.floor(Math.random() * 9000000000) + 1000000000;
                          setFormData({ ...formData, serialNo: randomSerial });
                        }}
                        className="px-3"
                      >
                        عشوائي
                      </Button>
                    )}
                  </div>
                  {getFieldError('serialNo') && (
                    <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('serialNo')}</p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <SimpleDatePicker
                    label="التاريخ *"
                    placeholder="اختر التاريخ"
                    value={formData.date}
                    onChange={(date) => {
                      setFormData({ ...formData, date: date || undefined });
                      clearFieldError('date');
                    }}
                    required
                    variant="modern"
                    size="md"
                  />
                  {getFieldError('date') && (
                    <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('date')}</p>
                  )}
                </div>

                {/* Sample Code */}
                <div className="space-y-2">
                  <Label>رمز العينة *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.sampleCode}
                      onChange={(e) => {
                        setFormData({ ...formData, sampleCode: e.target.value });
                        clearFieldError('sampleCode');
                      }}
                      required
                      disabled={!!laboratory}
                      className={`font-mono flex-1 ${getFieldError('sampleCode') ? 'border-red-500' : ''}`}
                    />
                    {!laboratory && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const randomCode = `LAB${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
                          setFormData({ ...formData, sampleCode: randomCode });
                        }}
                        className="px-3"
                      >
                        عشوائي
                      </Button>
                    )}
                  </div>
                  {getFieldError('sampleCode') && (
                    <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('sampleCode')}</p>
                  )}
                </div>

                {/* Client Selector */}
                <div className="space-y-2">
                  <Label>اختيار المربي</Label>
                  <ClientSelector
                    value={formData.client?._id || ""}
                    onValueChange={(client) => {
                      if (client) {
                        setFormData({
                          ...formData,
                          client: {
                            _id: client._id || "",
                            name: client.name,
                            nationalId: client.nationalId || client.national_id || "",
                            phone: client.phone || "",
                            village: client.village || "",
                            detailedAddress: client.detailedAddress || client.detailed_address || "",
                            birthDate: client.birthDate || client.birth_date || "",
                          }
                        });
                        // Clear any existing errors for client fields
                        clearFieldError('client.name');
                        clearFieldError('client.nationalId');
                        clearFieldError('client.phone');
                      }
                    }}
                    placeholder="ابحث عن المربي"
                    showDetails
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    اختر مربي موجود من القائمة أو املأ بيانات المربي في الحقول أدناه
                  </p>
                  {getFieldError('client.name') && (
                    <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('client.name')}</p>
                  )}
                </div>

                <ValidatedInput
                  label="اسم المربي"
                  required
                  value={formData.client?.name || ""}
                  placeholder="أدخل اسم المربي"
                  error={getFieldError('client.name')}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      client: { ...formData.client, name: value }
                    });
                    clearFieldError('client.name');
                  }}
                  onBlur={() => {
                    const error = validateField('client.name', formData.client?.name);
                    if (error) {
                      setFieldError('client.name', error);
                    }
                  }}
                />

                <ValidatedInput
                  label="رقم هوية المربي"
                  required
                  value={formData.client?.nationalId || ""}
                  placeholder="1234567890"
                  error={getFieldError('client.nationalId')}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      client: { ...formData.client, nationalId: value }
                    });
                    clearFieldError('client.nationalId');
                  }}
                  onBlur={() => {
                    const error = validateField('client.nationalId', formData.client?.nationalId);
                    if (error) {
                      setFieldError('client.nationalId', error);
                    }
                  }}
                />

                <ValidatedInput
                  label="رقم الهاتف"
                  required
                  value={formData.client?.phone || ""}
                  placeholder="+966501234567 أو 0501234567"
                  dir="ltr"
                  error={getFieldError('client.phone')}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      client: { ...formData.client, phone: value }
                    });
                    clearFieldError('client.phone');
                  }}
                  onBlur={() => {
                    const error = validateField('client.phone', formData.client?.phone);
                    if (error) {
                      setFieldError('client.phone', error);
                    }
                  }}
                />

                <div className="space-y-2">
                  <Label>القرية</Label>
                  <VillageSelect
                    value={formData.client?.village || ""}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      client: { ...formData.client, village: value }
                    })}
                    placeholder="اختر القرية"
                  />
                </div>

                <div className="space-y-2">
                  <Label>تاريخ الميلاد</Label>
                  <SimpleDatePicker
                    value={formData.client?.birthDate ? new Date(formData.client.birthDate) : undefined}
                    onChange={(date) => setFormData({
                      ...formData,
                      client: { ...formData.client, birthDate: date ? date.toISOString().split('T')[0] : "" }
                    })}
                    placeholder="اختر تاريخ الميلاد"
                    maxDate={new Date()}
                  />
                </div>

                {/* North Coordinate */}
                <div className="space-y-2">
                  <Label>الإحداثي الشمالي (N)</Label>
                  <Input
                    type="number"
                    value={formData.coordinates.latitude}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      coordinates: { ...formData.coordinates, latitude: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="الإحداثي الشمالي"
                  />
                </div>

                {/* East Coordinate */}
                <div className="space-y-2">
                  <Label>الإحداثي الشرقي (E)</Label>
                  <Input
                    type="number"
                    value={formData.coordinates.longitude}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      coordinates: { ...formData.coordinates, longitude: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="الإحداثي الشرقي"
                  />
                </div>

                {/* Sample Collector */}
                <div className="space-y-2">
                  <Label>جامع العينة *</Label>
                  <Input
                    value={formData.collector}
                    onChange={(e) => {
                      setFormData({ ...formData, collector: e.target.value });
                      clearFieldError('collector');
                    }}
                    placeholder="اسم جامع العينة"
                    required
                    className={getFieldError('collector') ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {getFieldError('collector') && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-sm font-medium">{getFieldError('collector')}</p>
                    </div>
                  )}
                </div>

                {/* Supervisor */}
                <div className="space-y-2">
                  <Label>المشرف</Label>
                  <Input
                    value={formData.supervisor}
                    onChange={(e) => {
                      setFormData({ ...formData, supervisor: e.target.value });
                    }}
                    placeholder="اسم المشرف"
                  />
                </div>

                {/* Vehicle Number */}
                <div className="space-y-2">
                  <Label>رقم المركبة</Label>
                  <Input
                    value={formData.vehicleNo}
                    onChange={(e) => {
                      setFormData({ ...formData, vehicleNo: e.target.value });
                    }}
                    placeholder="رقم المركبة (مثل: V001)"
                  />
                </div>

                {/* Sample Type */}
                <div className="space-y-2">
                  <DynamicSelect
                    category="SAMPLE_TYPES"
                    value={formData.sampleType}
                    onValueChange={(value) => {
                      setFormData({ ...formData, sampleType: value });
                      clearFieldError('sampleType');
                    }}
                    label="نوع العينة"
                    required={true}
                    placeholder="اختر نوع العينة"
                    error={getFieldError('sampleType') || undefined}
                    language="en"
                  />
                </div>

                {/* Test Type */}
                <div className="space-y-2">
                  <Label>نوع الفحص</Label>
                  <Select
                    value={formData.testType}
                    onValueChange={(value) => {
                      setFormData({ ...formData, testType: value });
                      clearFieldError('testType');
                    }}
                  >
                    <SelectTrigger className={getFieldError('testType') ? 'border-red-500' : ''}>
                      <SelectValue placeholder="اختر نوع الفحص" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError('testType') && (
                    <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('testType')}</p>
                  )}
                </div>

                {/* Collector Code */}
                <div className="space-y-2">
                  <Label>رمز جامع العينة *</Label>
                  <Input
                    value={formData.sampleNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, sampleNumber: e.target.value });
                      clearFieldError('sampleNumber');
                    }}
                    placeholder="رمز جامع العينة (مثل: OS001, KN002)"
                    required
                    className={getFieldError('sampleNumber') ? 'border-red-500' : ''}
                  />
                  {getFieldError('sampleNumber') && (
                    <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('sampleNumber')}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="samples" className="tabs-content-modern">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">عدد العينات حسب النوع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>أغنام *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.speciesCounts.sheep}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, sheep: parseInt(e.target.value) || 0 }
                        })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ماعز *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.speciesCounts.goats}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, goats: parseInt(e.target.value) || 0 }
                        })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>إبل *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.speciesCounts.camel}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, camel: parseInt(e.target.value) || 0 }
                        })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>أبقار *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.speciesCounts.cattle}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, cattle: parseInt(e.target.value) || 0 }
                        })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>خيول *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.speciesCounts.horse}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, horse: parseInt(e.target.value) || 0 }
                        })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>أنواع أخرى</Label>
                      <Input
                        value={formData.speciesCounts.other}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, other: e.target.value }
                        })}
                        placeholder="أنواع أخرى"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>المجموع</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                        <span className="font-bold text-lg">{getTotalSamples()}</span>
                        <span className="mr-2 text-muted-foreground">عينة</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  تأكد من إدخال العدد الصحيح للعينات لكل نوع من الحيوانات
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="results" className="tabs-content-modern">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">النتائج الإجمالية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الحالات الإيجابية *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.positiveCases}
                        onChange={(e) => setFormData({ ...formData, positiveCases: parseInt(e.target.value) || 0 })}
                        className="border-red-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الحالات السلبية *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.negativeCases}
                        onChange={(e) => setFormData({ ...formData, negativeCases: parseInt(e.target.value) || 0 })}
                        className="border-green-200"
                        required
                      />
                    </div>

                    {/* Animal Category */}
                    <div className="space-y-2">
                      <Label>فئة الحيوان</Label>
                      <Select
                        value={formData.animalCategory}
                        onValueChange={(value) => setFormData({ ...formData, animalCategory: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر فئة الحيوان" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sheep">Sheep (أغنام)</SelectItem>
                          <SelectItem value="Goat">Goat (ماعز)</SelectItem>
                          <SelectItem value="Cattle">Cattle (أبقار)</SelectItem>
                          <SelectItem value="Camel">Camel (إبل)</SelectItem>
                          <SelectItem value="Horse">Horse (خيول)</SelectItem>
                          <SelectItem value="Mixed">Mixed (مختلط)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cause of Sample */}
                    <div className="space-y-2 sm:col-span-1">
                      <Label>سبب أخذ العينة</Label>
                      <Textarea
                        value={formData.causeOfSample}
                        onChange={(e) => setFormData({ ...formData, causeOfSample: e.target.value })}
                        placeholder="سبب أخذ العينة..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>نسبة الإيجابية</span>
                      <span className="font-bold">{getPositivePercentage().toFixed(1)}%</span>
                    </div>
                    <Progress value={getPositivePercentage()} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    <Label>ملاحظات</Label>
                    <Textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="أي ملاحظات إضافية..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">نتائج تفصيلية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>رقم الحيوان</Label>
                      <Input
                        value={newTestResult.animalId}
                        onChange={(e) => setNewTestResult({ ...newTestResult, animalId: e.target.value })}
                        placeholder="مثال: A001"
                      />
                    </div>

                    <div className="space-y-2">
                      <DynamicSelect
                        category="ANIMAL_TYPES"
                        value={newTestResult.animalType}
                        onValueChange={(value) => setNewTestResult({ ...newTestResult, animalType: value })}
                        label="نوع الحيوان"
                        placeholder="اختر نوع الحيوان"
                        language="en"
                      />
                    </div>

                    <div className="space-y-2">
                      <DynamicSelect
                        category="TEST_TYPES"
                        value={newTestResult.testType}
                        onValueChange={(value) => setNewTestResult({ ...newTestResult, testType: value })}
                        label="نوع الفحص"
                        placeholder="اختر نوع الفحص"
                        language="en"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>النتيجة</Label>
                      <Select
                        value={newTestResult.result}
                        onValueChange={(value: "positive" | "negative" | "pending") => 
                          setNewTestResult({ ...newTestResult, result: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">إيجابي</SelectItem>
                          <SelectItem value="negative">سلبي</SelectItem>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ملاحظات</Label>
                    <Input
                      value={newTestResult.notes}
                      onChange={(e) => setNewTestResult({ ...newTestResult, notes: e.target.value })}
                      placeholder="ملاحظات إضافية"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={addTestResult}
                    variant="secondary"
                    className="w-full"
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة نتيجة
                  </Button>

                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    {formData.testResults.length === 0 ? (
                      <p className="text-center text-muted-foreground">لا توجد نتائج مضافة</p>
                    ) : (
                      <div className="space-y-2">
                        {formData.testResults.map((result, index) => (
                          <div
                            key={result.id || `test-result-${index}`}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{result.animalId}</Badge>
                              <span className="text-sm">{result.testType}</span>
                              {result.result === "positive" && (
                                <Badge variant="danger">إيجابي</Badge>
                              )}
                              {result.result === "negative" && (
                                <Badge variant="default">سلبي</Badge>
                              )}
                              {result.result === "pending" && (
                                <Badge variant="secondary">قيد الانتظار</Badge>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTestResult(result.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="report" className="tabs-content-modern">
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="أي ملاحظات إضافية عن الفحص"
                  rows={4}
                />
              </div>

              {formData.positiveCases > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    تم اكتشاف {formData.positiveCases} حالة إيجابية. يجب اتخاذ Actions الوقائية اللازمة.
                  </AlertDescription>
                </Alert>
              )}

              {formData.negativeCases > 0 && formData.positiveCases === 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    جميع النتائج سلبية. الحيوانات في حالة صحية جيدة.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            </Tabs>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <LoadingButton 
            type="button"
            onClick={handleSubmit}
            variant="default"
            leftIcon={<Activity className="w-4 h-4" />}
          >
            {laboratory ? "حفظ التعديلات" : "إضافة الفحص"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
