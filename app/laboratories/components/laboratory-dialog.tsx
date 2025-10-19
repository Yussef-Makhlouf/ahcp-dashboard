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

interface LaboratoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laboratory?: Laboratory;
  onSave: (data: any) => void;
}

const sampleTypes = [
  { value: "Blood", label: "دم" },
  { value: "Serum", label: "مصل" },
  { value: "Urine", label: "بول" },
  { value: "Feces", label: "براز" },
  { value: "Milk", label: "حليب" },
  { value: "Tissue", label: "أنسجة" },
  { value: "Swab", label: "مسحة" },
  { value: "Hair", label: "شعر" },
  { value: "Skin", label: "جلد" },
];

// Removed static collectors array - now using API

const testTypes = [
  { value: "Parasitology", label: "فحص طفيليات" },
  { value: "Bacteriology", label: "فحص بكتيري" },
  { value: "Virology", label: "فحص فيروسي" },
  { value: "Serology", label: "فحص مصلي" },
  { value: "Biochemistry", label: "فحص كيمياء حيوية" },
  { value: "Hematology", label: "فحص دم شامل" },
  { value: "Pathology", label: "فحص نسيجي" },
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

  // Validation rules for unified system
  const validationRules = {
    'clientName': { required: true, minLength: 2 },
    'clientId': { required: true, nationalId: true },
    'clientPhone': { 
      required: true, 
      custom: (value: string) => {
        if (!value) return null;
        if (!validateSaudiPhone(value)) {
          return 'رقم الهاتف السعودي غير صحيح. يجب أن يبدأ بـ 05 ويكون مكون من 10 أرقام';
        }
        return null;
      }
    },
    'supervisor': { required: true },
    'vehicleNo': { required: true },
    'farmLocation': { required: true },
    'sampleCode': { required: true },
    'testType': { required: true },
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
    clientName: "",
    clientId: "",
    clientBirthDate: undefined as Date | undefined,
    clientPhone: "",
    farmLocation: "",
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
    sampleType: "",
    sampleNumber: "",
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
      // Set selected client for editing mode
      if (laboratory.client && typeof laboratory.client === 'object') {
        setSelectedClient(laboratory.client as Client);
      } else if (laboratory.clientName && laboratory.clientId) {
        // Create a mock client object from flat fields for ClientSelector
        setSelectedClient({
          _id: laboratory.clientId, // Use clientId as _id for selector
          name: laboratory.clientName,
          nationalId: laboratory.clientId,
          phone: laboratory.clientPhone || '',
          birthDate: laboratory.clientBirthDate,
          village: '',
          detailedAddress: '',
          status: 'نشط',
          animals: [],
          availableServices: [] // Required field for Client type
        } as Client);
      } else {
        setSelectedClient(null);
      }
      
      setFormData({
        serialNo: laboratory.serialNo || 0,
        date: laboratory.date ? new Date(laboratory.date) : undefined,
        sampleCode: laboratory.sampleCode || "",
        // Handle both flat client fields and nested client object for maximum compatibility
        clientName: laboratory.clientName || laboratory.client?.name || "",
        clientId: laboratory.clientId || laboratory.client?.nationalId || "",
        clientBirthDate: laboratory.clientBirthDate ? new Date(laboratory.clientBirthDate) : 
                        laboratory.client?.birthDate ? new Date(laboratory.client.birthDate) : undefined,
        clientPhone: laboratory.clientPhone || laboratory.client?.phone || "",
        farmLocation: laboratory.farmLocation || "",
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
        sampleType: laboratory.sampleType || "",
        sampleNumber: laboratory.sampleNumber || "",
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
        clientName: "",
        clientId: "",
        clientBirthDate: undefined,
        clientPhone: "",
        farmLocation: "",
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
        sampleType: "",
        sampleNumber: "",
        positiveCases: 0,
        negativeCases: 0,
        remarks: "",
        testResults: [],
      });
    }
  }, [laboratory]);

  const validateForm = () => {
    // Use the unified validation system
    const isValid = validateFormData(formData);
    
    // Additional custom validations
    const totalSamples = getTotalSamples();
    if (totalSamples === 0) {
      setFieldError('speciesCounts', "يجب إدخال عدد العينات");
      return false;
    }
    
    // Validate positive and negative cases
    if (formData.positiveCases < 0) {
      setFieldError('positiveCases', "الحالات الإيجابية لا يمكن أن تكون سالبة");
      return false;
    }
    
    if (formData.negativeCases < 0) {
      setFieldError('negativeCases', "الحالات السلبية لا يمكن أن تكون سالبة");
      return false;
    }
    
    const totalCases = formData.positiveCases + formData.negativeCases;
    if (totalCases > totalSamples) {
      setFieldError('positiveCases', "مجموع الحالات الإيجابية والسلبية لا يمكن أن يكون أكبر من إجمالي العينات");
      return false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prepare data for backend - matching the table structure exactly
    const submitData = {
      serialNo: formData.serialNo,
      date: formData.date ? format(formData.date, "yyyy-MM-dd") : "",
      sampleCode: formData.sampleCode,
      clientName: formData.clientName,
      clientId: formData.clientId,
      clientBirthDate: formData.clientBirthDate ? format(formData.clientBirthDate, "yyyy-MM-dd") : "",
      clientPhone: formData.clientPhone,
      farmLocation: formData.farmLocation,
      coordinates: formData.coordinates,
      speciesCounts: formData.speciesCounts,
      collector: formData.collector,
      sampleType: formData.sampleType,
      sampleNumber: formData.sampleNumber,
      positiveCases: formData.positiveCases,
      negativeCases: formData.negativeCases,
      remarks: formData.remarks,
    };
    
    try {
      if (laboratory) {
        // Update existing laboratory
        await laboratoriesApi.update(laboratory._id || '', submitData);
        entityToasts.laboratory.update();
      } else {
        // Create new laboratory
        await laboratoriesApi.create(submitData);
        entityToasts.laboratory.create();
      }
      
      onSave(submitData);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving laboratory:', error);
      
      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        
        // Map backend validation errors to form fields
        backendErrors.forEach((err: any) => {
          const fieldName = err.field;
          let errorMessage = err.message;
          
          // Translate common validation messages to Arabic
          if (errorMessage.includes('required')) {
            errorMessage = `${getArabicFieldName(fieldName)} مطلوب`;
          } else if (errorMessage.includes('pattern')) {
            if (fieldName === 'clientPhone') {
              errorMessage = 'رقم الهاتف يجب أن يبدأ بـ 05 ويكون مكون من 10 أرقام';
            } else if (fieldName === 'clientId') {
              errorMessage = 'رقم الهوية يجب أن يكون مكون من 9-10 أرقام';
            } else {
              errorMessage = `${getArabicFieldName(fieldName)} غير صحيح`;
            }
          } else if (errorMessage.includes('min')) {
            errorMessage = `${getArabicFieldName(fieldName)} قصير جداً`;
          } else if (errorMessage.includes('max')) {
            errorMessage = `${getArabicFieldName(fieldName)} طويل جداً`;
          }
          
          setFieldError(fieldName, errorMessage);
        });
        
        entityToasts.laboratory.error(laboratory ? 'update' : 'create');
      } else {
        entityToasts.laboratory.error(laboratory ? 'update' : 'create');
      }
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
      'farmLocation': 'موقع المزرعة',
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
          <form id="laboratory-form" onSubmit={handleSubmit}>
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

                {/* Client Name */}
                <div className="space-y-2">
                  <Label>اسم العميل *</Label>
                  <ClientSelector
                    value={selectedClient?._id || ''} // Use selected client ID
                    onValueChange={(client) => {
                      setSelectedClient(client);
                      if (client) {
                        setFormData({ 
                          ...formData, 
                          clientName: client.name,
                          clientId: client.nationalId || '',
                          clientPhone: client.phone || '',
                          clientBirthDate: client.birthDate ? new Date(client.birthDate) : undefined
                        });
                        clearFieldError('clientName');
                        clearFieldError('clientId');
                        clearFieldError('clientPhone');
                        clearFieldError('clientBirthDate');
                      } else {
                        setFormData({ 
                          ...formData, 
                          clientName: '',
                          clientId: '',
                          clientPhone: '',
                          clientBirthDate: undefined
                        });
                      }
                    }}
                    placeholder="اختر العميل"
                    error={getFieldError('clientName') || undefined}
                    required
                  />
                  {getFieldError('clientName') && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-sm font-medium">{getFieldError('clientName')}</p>
                    </div>
                  )}
                </div>

                {/* Client ID */}
                <div className="space-y-2">
                  <Label>رقم الهوية *</Label>
                  <Input
                    value={formData.clientId}
                    onChange={(e) => {
                      setFormData({ ...formData, clientId: e.target.value });
                      clearFieldError('clientId');
                    }}
                    placeholder="رقم الهوية (9-10 أرقام)"
                    required
                    maxLength={10}
                    className={getFieldError('clientId') ? 'border-red-500' : ''}
                  />
                  {getFieldError('clientId') && (
                    <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('clientId')}</p>
                  )}
                </div>

                {/* Client Birth Date */}
                <div className="space-y-2">
                  <SimpleDatePicker
                    label="تاريخ الميلاد"
                    placeholder="اختر تاريخ الميلاد"
                    value={formData.clientBirthDate}
                    onChange={(date) => setFormData({ ...formData, clientBirthDate: date || undefined })}
                    variant="modern"
                    size="md"
                  />
                </div>

                {/* Client Phone */}
                <div className="space-y-2">
                  <Label>رقم الهاتف *</Label>
                  <Input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => {
                      // Allow only numbers and limit to 10 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, clientPhone: value });
                      clearFieldError('clientPhone');
                    }}
                    placeholder="رقم الهاتف السعودي (10 أرقام - مثال: 0501234567)"
                    required
                    maxLength={10}
                    className={getFieldError('clientPhone') ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {getFieldError('clientPhone') && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-sm font-medium">{getFieldError('clientPhone')}</p>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>الموقع *</Label>
                  <Input
                    value={formData.farmLocation}
                    onChange={(e) => {
                      setFormData({ ...formData, farmLocation: e.target.value });
                      clearFieldError('farmLocation');
                    }}
                    placeholder="موقع المزرعة"
                    required
                    className={getFieldError('farmLocation') ? 'border-red-500' : ''}
                  />
                  {getFieldError('farmLocation') && (
                    <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('farmLocation')}</p>
                  )}
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

                {/* Sample Type */}
                <div className="space-y-2">
                  <Label>نوع العينة *</Label>
                  <Select
                    value={formData.sampleType}
                    onValueChange={(value) => {
                      setFormData({ ...formData, sampleType: value });
                      clearFieldError('sampleType');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع العينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError('sampleType') && (
                    <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('sampleType')}</p>
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
                      <Label>نوع الحيوان</Label>
                      <Select
                        value={newTestResult.animalType}
                        onValueChange={(value) => setNewTestResult({ ...newTestResult, animalType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sheep">أغنام</SelectItem>
                          <SelectItem value="goats">ماعز</SelectItem>
                          <SelectItem value="cattle">أبقار</SelectItem>
                          <SelectItem value="camel">إبل</SelectItem>
                          <SelectItem value="horse">خيول</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>نوع الفحص</Label>
                      <Select
                        value={newTestResult.testType}
                        onValueChange={(value) => setNewTestResult({ ...newTestResult, testType: value })}
                      >
                        <SelectTrigger>
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
                    تم اكتشاف {formData.positiveCases} حالة إيجابية. يجب اتخاذ الإجراءات الوقائية اللازمة.
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
            type="submit"
            form="laboratory-form"
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
