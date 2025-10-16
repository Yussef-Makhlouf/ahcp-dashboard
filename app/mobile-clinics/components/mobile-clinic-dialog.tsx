"use client";

import { useState, useEffect } from "react";
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
import { CalendarIcon, MapPin, Stethoscope, Plus, Trash2, Activity, User, Heart, Shield, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { validateSaudiPhone } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMobileTabs } from "@/components/ui/mobile-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VillageSelect } from "@/components/ui/village-select";
import { ClientSelector } from "@/components/ui/client-selector";
import { useClientData } from "@/lib/hooks/use-client-data";
import React, { useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import type { MobileClinic } from "@/types";
import { entityToasts } from "@/lib/utils/toast-utils";
import { mobileClinicsApi } from "@/lib/api/mobile-clinics";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedSelect } from "@/components/ui/validated-select";
import { ValidatedTextarea } from "@/components/ui/validated-textarea";

interface MobileClinicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinic?: MobileClinic;
  onSave: (data: any) => void;
}

// Removed static supervisors array - now using API

const vehicles = [
  { id: "MC1", name: "عيادة متنقلة 1" },
  { id: "MC2", name: "عيادة متنقلة 2" },
  { id: "MC3", name: "عيادة متنقلة 3" },
];

const diagnoses = [
  "التهاب رئوي",
  "طفيليات معوية",
  "جروح وإصابات",
  "التهاب الضرع",
  "حمى قلاعية",
  "نقص التغذية",
  "التهاب الأمعاء",
  "كسور",
  "التهاب العيون",
  "أمراض جلدية",
];

const interventionCategories = [
  { value: "Clinical Examination", label: "Clinical Examination" },
  { value: "Surgical Operation", label: "Surgical Operation" },
  { value: "Ultrasonography", label: "Ultrasonography" },
  { value: "Lab Analysis", label: "Lab Analysis" },
];

interface Treatment {
  id: string;
  medicine: string;
  dosage: string;
  duration: string;
  notes: string;
}

export function MobileClinicDialog({ open, onOpenChange, clinic, onSave }: MobileClinicDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation rules
  const validationRules = {
    'client.name': { required: true, minLength: 2 },
    'client.nationalId': { required: true, nationalId: true },
    'client.phone': { required: true, phone: true },
    'supervisor': { required: true },
    'vehicleNo': { required: true },
    'farmLocation': { required: true },
    'date': { required: true },
    'interventionCategory': { required: true },
    'diagnosis': { required: true },
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
    serialNo: "",
    date: undefined as Date | undefined,
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
      latitude: null as number | null, 
      longitude: null as number | null 
    },
    supervisor: "",
    vehicleNo: "",
    farmLocation: "",
    animalCounts: {
      sheep: 0,
      goats: 0,
      camel: 0,
      horse: 0,
      cattle: 0,
    },
    diagnosis: "",
    interventionCategory: "",
    treatment: "",
    medicationsUsed: [] as {
      name: string;
      dosage: string;
      quantity: number;
      route: string;
    }[],
    request: {
      date: "",
      situation: "Open" as "Open" | "Closed" | "Pending",
      fulfillingDate: "",
    },
    followUpRequired: false,
    followUpDate: undefined as Date | undefined,
    remarks: "",
    
    // Legacy fields for backward compatibility
    owner: {
      name: "",
      id: "",
      birthDate: "",
      phone: "",
    },
    location: { e: null as number | null, n: null as number | null },
    sheep: 0,
    goats: 0,
    camel: 0,
    horse: 0,
    cattle: 0,
    treatments: [] as Treatment[],
    prescriptions: [] as string[],
  });

  const [newTreatment, setNewTreatment] = useState<Treatment>({
    id: "",
    medicine: "",
    dosage: "",
    duration: "",
    notes: "",
  });

  const [newPrescription, setNewPrescription] = useState("");

  useEffect(() => {
    if (clinic) {
      // تحويل البيانات من الخادم إلى بنية النموذج
      setFormData({
        serialNo: clinic.serialNo || "",
        date: clinic.date ? new Date(clinic.date) : undefined,
        client: {
          _id: clinic.client?._id || "",
          name: clinic.client?.name || "",
          nationalId: clinic.client?.nationalId || "",
          phone: clinic.client?.phone || "",
          village: clinic.client?.village || "",
          detailedAddress: clinic.client?.detailedAddress || "",
          birthDate: clinic.client?.birthDate || "",
        },
        coordinates: {
          latitude: clinic.coordinates?.latitude || null,
          longitude: clinic.coordinates?.longitude || null,
        },
        supervisor: clinic.supervisor || "",
        vehicleNo: clinic.vehicleNo || "",
        farmLocation: clinic.farmLocation || "",
        animalCounts: {
          sheep: clinic.animalCounts?.sheep || clinic.sheep || 0,
          goats: clinic.animalCounts?.goats || clinic.goats || 0,
          camel: clinic.animalCounts?.camel || clinic.camel || 0,
          horse: clinic.animalCounts?.horse || clinic.horse || 0,
          cattle: clinic.animalCounts?.cattle || clinic.cattle || 0,
        },
        diagnosis: clinic.diagnosis || "",
        interventionCategory: clinic.interventionCategory || "",
        treatment: clinic.treatment || "",
        medicationsUsed: clinic.medicationsUsed || [],
        request: {
          date: clinic.request?.date ? format(new Date(clinic.request.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          situation: clinic.request?.situation || "Open",
          fulfillingDate: clinic.request?.fulfillingDate ? format(new Date(clinic.request.fulfillingDate), "yyyy-MM-dd") : "",
        },
        followUpRequired: clinic.followUpRequired || false,
        followUpDate: clinic.followUpDate ? new Date(clinic.followUpDate) : undefined,
        remarks: clinic.remarks || "",
        
        // Legacy fields for backward compatibility
        owner: {
          name: clinic.client?.name || clinic.owner?.name || "",
          id: clinic.client?.nationalId || clinic.owner?.id || "",
          birthDate: clinic.owner?.birthDate || "",
          phone: clinic.client?.phone || clinic.owner?.phone || "",
        },
        location: clinic.location || { 
          e: clinic.coordinates?.longitude || null, 
          n: clinic.coordinates?.latitude || null 
        },
        sheep: clinic.animalCounts?.sheep || clinic.sheep || 0,
        goats: clinic.animalCounts?.goats || clinic.goats || 0,
        camel: clinic.animalCounts?.camel || clinic.camel || 0,
        horse: clinic.animalCounts?.horse || clinic.horse || 0,
        cattle: clinic.animalCounts?.cattle || clinic.cattle || 0,
        treatments: [],
        prescriptions: [],
      });
    } else {
      // Generate new serial number
      const newSerialNo = generateSerialNo();
      setFormData({
        serialNo: newSerialNo,
        date: new Date(),
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
          latitude: null, 
          longitude: null 
        },
        supervisor: "",
        vehicleNo: "",
        farmLocation: "",
        animalCounts: {
          sheep: 0,
          goats: 0,
          camel: 0,
          horse: 0,
          cattle: 0,
        },
        diagnosis: "",
        interventionCategory: "",
        treatment: "",
        medicationsUsed: [],
        request: {
          date: format(new Date(), "yyyy-MM-dd"),
          situation: "Open",
          fulfillingDate: "",
        },
        followUpRequired: false,
        followUpDate: undefined,
        remarks: "",
        
        // Legacy fields for backward compatibility
        owner: {
          name: "",
          id: "",
          birthDate: "",
          phone: "",
        },
        location: { e: null, n: null },
        sheep: 0,
        goats: 0,
        camel: 0,
        horse: 0,
        cattle: 0,
        treatments: [],
        prescriptions: [],
      });
    }
    
    // Clear errors when dialog opens
    clearAllErrors();
  }, [clinic]);


  const validateForm = () => {
    // Use the unified validation system
    const validationData = {
      'client.name': formData.client?.name,
      'client.nationalId': formData.client?.nationalId,
      'client.phone': formData.client?.phone,
      'supervisor': formData.supervisor,
      'vehicleNo': formData.vehicleNo,
      'farmLocation': formData.farmLocation,
      'date': formData.date,
      'interventionCategory': formData.interventionCategory,
      'diagnosis': formData.diagnosis,
    };

    const isValid = validateFormData(validationData);
    
    // Additional custom validations
    const totalAnimals = getTotalAnimals();
    if (totalAnimals === 0) {
      setFieldError('animalCount', 'يجب إدخال عدد الحيوانات المعالجة');
      return false;
    }
    
    if (formData.treatments.length === 0 && !formData.treatment.trim()) {
      setFieldError('treatment', 'يجب إدخال تفاصيل العلاج');
      return false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show field-specific errors directly in the form
      // The validateForm function already sets errors in the errors state
      // which will be displayed by FormMessage components
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const treatmentText = formData.treatments.length > 0
        ? formData.treatments.map(t => `${t.medicine} - ${t.dosage}`).join(", ")
        : formData.treatment;

      // تحويل البيانات للشكل المطلوب من الباك إند
      const submitData = {
        serialNo: formData.serialNo,
        date: formData.date ? format(formData.date, "yyyy-MM-dd") : "",
        // إرسال بيانات العميل للباك إند ليتعامل معها
        client: formData.client._id || {
          name: formData.client.name.trim(),
          nationalId: formData.client.nationalId.trim(),
          phone: formData.client.phone.trim(),
          village: formData.client.village || '',
          detailedAddress: formData.client.detailedAddress || '',
          birthDate: formData.client.birthDate || '',
        },
        farmLocation: formData.farmLocation,
        coordinates: {
          latitude: formData.coordinates.latitude || 0,
          longitude: formData.coordinates.longitude || 0,
        },
        supervisor: formData.supervisor,
        vehicleNo: formData.vehicleNo,
        animalCounts: {
          sheep: formData.animalCounts.sheep || 0,
          goats: formData.animalCounts.goats || 0,
          camel: formData.animalCounts.camel || 0,
          cattle: formData.animalCounts.cattle || 0,
          horse: formData.animalCounts.horse || 0,
        },
        diagnosis: formData.diagnosis,
        interventionCategory: formData.interventionCategory,
        treatment: treatmentText,
        medicationsUsed: formData.medicationsUsed.map(med => ({
          name: med.name,
          dosage: med.dosage,
          quantity: med.quantity,
          route: med.route,
        })),
        request: {
          date: formData.request.date || format(new Date(), "yyyy-MM-dd"),
          situation: formData.request.situation,
          fulfillingDate: formData.request.situation === "Closed" 
            ? format(new Date(), "yyyy-MM-dd") 
            : formData.request.fulfillingDate || null,
        },
        followUpRequired: formData.followUpRequired,
        followUpDate: formData.followUpDate ? format(formData.followUpDate, "yyyy-MM-dd") : null,
        remarks: formData.remarks || '',
      };
      
      if (clinic) {
        // Update existing clinic
        await mobileClinicsApi.update(clinic._id || clinic.serialNo || '', submitData);
        entityToasts.mobileClinic.update();
      } else {
        // Create new clinic
        await mobileClinicsApi.create(submitData);
        entityToasts.mobileClinic.create();
      }
      
      await onSave(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      entityToasts.mobileClinic.error(clinic ? 'update' : 'create');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTreatment = () => {
    if (newTreatment.medicine && newTreatment.dosage) {
      setFormData({
        ...formData,
        treatments: [...formData.treatments, { ...newTreatment, id: Date.now().toString() }],
      });
      setNewTreatment({
        id: "",
        medicine: "",
        dosage: "",
        duration: "",
        notes: "",
      });
    }
  };

  const removeTreatment = (id: string) => {
    setFormData({
      ...formData,
      treatments: formData.treatments.filter(t => t.id !== id),
    });
  };

  const addPrescription = () => {
    if (newPrescription) {
      setFormData({
        ...formData,
        prescriptions: [...formData.prescriptions, newPrescription],
      });
      setNewPrescription("");
    }
  };

  const removePrescription = (index: number) => {
    setFormData({
      ...formData,
      prescriptions: formData.prescriptions.filter((_, i) => i !== index),
    });
  };

  const getTotalAnimals = () => {
    return formData.animalCounts.sheep + formData.animalCounts.goats + formData.animalCounts.camel + formData.animalCounts.horse + formData.animalCounts.cattle;
  };


  // توليد رقم تسلسلي جديد
  const generateSerialNo = useCallback(() => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `MC-${timestamp}-${randomNum}`;
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 lg:p-6">
        <DialogHeader>
          <DialogTitle>
            {clinic ? "تعديل زيارة العيادة المتنقلة" : "إضافة زيارة عيادة متنقلة جديدة"}
          </DialogTitle>
          <DialogDescription>
            {clinic ? "قم بتعديل بيانات الزيارة" : "أدخل بيانات الزيارة الجديدة"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form id="mobile-clinic-form" onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full tabs-modern" dir="rtl">
              <EnhancedMobileTabs
                value={activeTab}
                onValueChange={setActiveTab}
                tabs={[
                  {
                    value: "basic",
                    label: "البيانات الأساسية",
                    shortLabel: "الأساسية",
                    icon: <User className="h-4 w-4" />
                  },
                  {
                    value: "animals",
                    label: "الحيوانات",
                    shortLabel: "الحيوانات",
                    icon: <Heart className="h-4 w-4" />
                  },
                  {
                    value: "diagnosis",
                    label: "التشخيص والعلاج",
                    shortLabel: "التشخيص",
                    icon: <Stethoscope className="h-4 w-4" />
                  },
                  {
                    value: "followup",
                    label: "المتابعة",
                    shortLabel: "المتابعة",
                    icon: <FileText className="h-4 w-4" />
                  }
                ]}
              />

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الرقم المسلسل</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.serialNo}
                      onChange={(e) => {
                        setFormData({ ...formData, serialNo: e.target.value });
                        // Clear error when user starts typing
                        clearFieldError('serialNo');
                      }}
                      type="text"
                      disabled={!!clinic}
                      placeholder="سيتم توليده تلقائياً"
                      className={errors.serialNo ? 'border-red-500' : ''}
                    />
                    {!clinic && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, serialNo: generateSerialNo() })}
                        className="whitespace-nowrap"
                      >
                        توليد رقم
                      </Button>
                    )}
                  </div>
                  {errors.serialNo && (
                    <p className="text-red-500 text-sm font-medium mt-1">{errors.serialNo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <SimpleDatePicker
                    label="التاريخ"
                    placeholder="اختر التاريخ"
                    value={formData.date}
                    onChange={(date) => {
                      setFormData({ ...formData, date: date || undefined });
                      // Clear error when user selects date
                      clearFieldError('date');
                    }}
                    required
                    variant="modern"
                    size="md"
                    maxDate={new Date()} // منع اختيار تواريخ مستقبلية
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm font-medium mt-1">{errors.date}</p>
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
                          },
                          owner: {
                            name: client.name,
                            id: client.nationalId || client.national_id || "",
                            phone: client.phone || "",
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
                      client: { ...formData.client, name: value },
                      owner: { ...formData.owner, name: value }
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
                      client: { ...formData.client, nationalId: value },
                      owner: { ...formData.owner, id: value }
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
                      client: { ...formData.client, phone: value },
                      owner: { ...formData.owner, phone: value }
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
                      client: { ...formData.client, birthDate: date ? date.toISOString().split('T')[0] : "" },
                      owner: { ...formData.owner, birthDate: date ? date.toISOString().split('T')[0] : "" }
                    })}
                    placeholder="اختر تاريخ الميلاد"
                    maxDate={new Date()}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="after:content-['*'] after:text-red-500 after:ml-1">المشرف</Label>
                  <SupervisorSelect
                    value={formData.supervisor}
                    onValueChange={(value) => {
                      setFormData({ ...formData, supervisor: value });
                      clearFieldError('supervisor');
                    }}
                    placeholder="اختر المشرف"
                    section=" mobile-clinics"
                  />
                  {getFieldError('supervisor') && (
                    <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('supervisor')}</p>
                  )}
                </div>

                <ValidatedSelect
                  label="رقم المركبة"
                  required
                  value={formData.vehicleNo}
                  placeholder="اختر المركبة"
                  options={vehicles.map(vehicle => ({ value: vehicle.id, label: vehicle.name }))}
                  error={getFieldError('vehicleNo')}
                  onValueChange={(value) => {
                    setFormData({ ...formData, vehicleNo: value });
                    clearFieldError('vehicleNo');
                  }}
                  onBlur={() => {
                    const error = validateField('vehicleNo', formData.vehicleNo);
                    if (error) {
                      setFieldError('vehicleNo', error);
                    }
                  }}
                />

                <ValidatedInput
                  label="موقع المزرعة"
                  required
                  value={formData.farmLocation}
                  placeholder="أدخل موقع المزرعة"
                  error={getFieldError('farmLocation')}
                  onValueChange={(value) => {
                    setFormData({ ...formData, farmLocation: value });
                    clearFieldError('farmLocation');
                  }}
                  onBlur={() => {
                    const error = validateField('farmLocation', formData.farmLocation);
                    if (error) {
                      setFieldError('farmLocation', error);
                    }
                  }}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>خط الطول (Longitude)</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.coordinates?.longitude || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: { 
                        ...formData.coordinates, 
                        longitude: parseFloat(e.target.value) || null 
                      },
                      location: { 
                        ...formData.location, 
                        e: parseFloat(e.target.value) || null 
                      }
                    })}
                    placeholder="46.123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label>خط العرض (Latitude)</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.coordinates?.latitude || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: { 
                        ...formData.coordinates, 
                        latitude: parseFloat(e.target.value) || null 
                      },
                      location: { 
                        ...formData.location, 
                        n: parseFloat(e.target.value) || null 
                      }
                    })}
                    placeholder="24.123456"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  يمكن الحصول على الموقع الجغرافي من خلال GPS أو خرائط جوجل
                </span>
              </div>
            </TabsContent>

            <TabsContent value="animals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">عدد الحيوانات المعالجة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>أغنام</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.animalCounts.sheep}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          animalCounts: { 
                            ...formData.animalCounts, 
                            sheep: parseInt(e.target.value) || 0 
                          },
                          sheep: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ماعز</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.animalCounts.goats}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          animalCounts: { 
                            ...formData.animalCounts, 
                            goats: parseInt(e.target.value) || 0 
                          },
                          goats: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>إبل</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.animalCounts.camel}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          animalCounts: { 
                            ...formData.animalCounts, 
                            camel: parseInt(e.target.value) || 0 
                          },
                          camel: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>خيول</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.animalCounts.horse}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          animalCounts: { 
                            ...formData.animalCounts, 
                            horse: parseInt(e.target.value) || 0 
                          },
                          horse: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>أبقار</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.animalCounts.cattle}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          animalCounts: { 
                            ...formData.animalCounts, 
                            cattle: parseInt(e.target.value) || 0 
                          },
                          cattle: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>المجموع</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                        <span className="font-bold text-lg">{getTotalAnimals()}</span>
                        <span className="mr-2 text-muted-foreground">حيوان</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <Stethoscope className="inline-block ml-2 h-4 w-4" />
                  تأكد من إدخال العدد الصحيح للحيوانات المعالجة لكل نوع
                </p>
              </div>
            </TabsContent>

            <TabsContent value="diagnosis" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>التشخيص *</Label>
                  <Select
                    value={formData.diagnosis}
                    onValueChange={(value) => {
                      setFormData({ ...formData, diagnosis: value });
                      // Clear error when user selects diagnosis
                      clearFieldError('diagnosis');
                    }}
                  >
                    <SelectTrigger className={errors.diagnosis ? 'border-red-500' : ''}>
                      <SelectValue placeholder="اختر التشخيص" />
                    </SelectTrigger>
                    <SelectContent>
                      {diagnoses.map((diagnosis) => (
                        <SelectItem key={diagnosis} value={diagnosis}>
                          {diagnosis}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.diagnosis && (
                    <p className="text-red-500 text-sm font-medium mt-1">{errors.diagnosis}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>نوع التدخل *</Label>
                  <Select
                    value={formData.interventionCategory}
                    onValueChange={(value) => {
                      setFormData({ ...formData, interventionCategory: value });
                      // Clear error when user selects category
                      clearFieldError('interventionCategory');
                    }}
                  >
                    <SelectTrigger className={errors.interventionCategory ? 'border-red-500' : ''}>
                      <SelectValue placeholder="اختر نوع التدخل" />
                    </SelectTrigger>
                    <SelectContent>
                      {interventionCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.interventionCategory && (
                    <p className="text-red-500 text-sm font-medium mt-1">{errors.interventionCategory}</p>
                  )}
                </div>
              </div>

              {/* قسم الأدوية المستخدمة */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الأدوية المستخدمة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* عرض الأدوية الموجودة */}
                  {formData.medicationsUsed && formData.medicationsUsed.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">الأدوية المستخدمة ({formData.medicationsUsed.length}):</Label>
                      <div className="space-y-2">
                        {formData.medicationsUsed.map((medication, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm">
                              <div className="font-medium text-gray-900">{medication.name}</div>
                              <div className="text-gray-600">{medication.dosage}</div>
                              <div className="text-gray-600">{medication.quantity} وحدة</div>
                              <div className="text-gray-600">
                                {medication.route === 'Intramuscular' ? 'عضلي' : 
                                 medication.route === 'Subcutaneous' ? 'تحت الجلد' :
                                 medication.route === 'Intravenous' ? 'وريدي' :
                                 medication.route === 'Oral' ? 'فموي' : medication.route}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedMedications = formData.medicationsUsed.filter((_, i) => i !== index);
                                setFormData({ ...formData, medicationsUsed: updatedMedications });
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* إضافة دواء جديد */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">إضافة دواء جديد:</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>اسم الدواء</Label>
                        <Input
                          value={newTreatment.medicine}
                          onChange={(e) => setNewTreatment({ ...newTreatment, medicine: e.target.value })}
                          placeholder="مثال: أموكسيسيلين"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>الجرعة</Label>
                        <Input
                          value={newTreatment.dosage}
                          onChange={(e) => setNewTreatment({ ...newTreatment, dosage: e.target.value })}
                          placeholder="مثال: 10 مل مرتين يومياً"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>الكمية</Label>
                        <Input
                          type="number"
                          value={newTreatment.notes}
                          onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })}
                          placeholder="5"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>طريقة الإعطاء</Label>
                        <Select
                          value={newTreatment.duration}
                          onValueChange={(value) => setNewTreatment({ ...newTreatment, duration: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر طريقة الإعطاء" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Intramuscular">عضلي</SelectItem>
                            <SelectItem value="Subcutaneous">تحت الجلد</SelectItem>
                            <SelectItem value="Intravenous">وريدي</SelectItem>
                            <SelectItem value="Oral">فموي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      if (newTreatment.medicine && newTreatment.dosage && newTreatment.notes && newTreatment.duration) {
                        const newMedication = {
                          name: newTreatment.medicine,
                          dosage: newTreatment.dosage,
                          quantity: parseInt(newTreatment.notes) || 1,
                          route: newTreatment.duration
                        };
                        setFormData({
                          ...formData,
                          medicationsUsed: [...formData.medicationsUsed, newMedication]
                        });
                        setNewTreatment({ id: "", medicine: "", dosage: "", duration: "", notes: "" });
                      }
                    }}
                    variant="secondary"
                    className="w-full"
                    disabled={!newTreatment.medicine || !newTreatment.dosage || !newTreatment.notes || !newTreatment.duration}
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة دواء
                  </Button>

                  <ScrollArea className="h-[150px] w-full rounded-md border p-4">
                    {formData.treatments.length === 0 ? (
                      <p className="text-center text-muted-foreground">لا توجد أدوية مضافة</p>
                    ) : (
                      <div className="space-y-2">
                        {formData.treatments.map((treatment) => (
                          <div
                            key={treatment.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{treatment.medicine}</div>
                              <div className="text-sm text-muted-foreground">
                                {treatment.dosage} {treatment.duration && `- ${treatment.duration}`}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTreatment(treatment.id)}
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

              {/* ملاحظات العلاج */}
              <div className="space-y-2">
                <Label>ملاحظات العلاج</Label>
                <Textarea
                  value={formData.treatment}
                  onChange={(e) => {
                    setFormData({ ...formData, treatment: e.target.value });
                    // Clear error when user starts typing
                    clearFieldError('treatment');
                  }}
                  placeholder="أدخل تفاصيل العلاج والملاحظات"
                  rows={3}
                  className={errors.treatment ? 'border-red-500' : ''}
                />
                {errors.treatment && (
                  <p className="text-red-500 text-sm font-medium mt-1">{errors.treatment}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="followup" className="space-y-4">
              {/* معلومات الطلب */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>تاريخ الطلب</Label>
                      <Input
                        type="date"
                        value={formData.request.date}
                        onChange={(e) => setFormData({
                          ...formData,
                          request: { ...formData.request, date: e.target.value }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>حالة الطلب</Label>
                      <Select
                        value={formData.request.situation}
                        onValueChange={(value: "Open" | "Closed" | "Pending") => 
                          setFormData({
                            ...formData,
                            request: { ...formData.request, situation: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">مفتوح</SelectItem>
                          <SelectItem value="Closed">مغلق</SelectItem>
                          <SelectItem value="Pending">معلق</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>تاريخ الإنجاز</Label>
                      <Input
                        type="date"
                        value={formData.request.fulfillingDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          request: { ...formData.request, fulfillingDate: e.target.value }
                        })}
                        disabled={formData.request.situation !== "Closed"}
                      />
                    </div>
                  </div>

                  {/* ملخص حالة الطلب */}
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">حالة الطلب:</span>
                        <span className={
                          formData.request.situation === "Open" ? "text-green-700 font-medium" :
                          formData.request.situation === "Closed" ? "text-gray-700 font-medium" :
                          "text-yellow-700 font-medium"
                        }>
                          {formData.request.situation === "Open" ? "مفتوح" :
                           formData.request.situation === "Closed" ? "مغلق" : "معلق"}
                        </span>
                      </div>
                      {formData.request.fulfillingDate && (
                        <span className="text-gray-600">أُنجز في: {formData.request.fulfillingDate}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* الوصفات الطبية */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الوصفات والتوصيات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newPrescription}
                      onChange={(e) => setNewPrescription(e.target.value)}
                      placeholder="أدخل وصفة طبية أو توصية"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addPrescription();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addPrescription}
                      variant="secondary"
                      disabled={!newPrescription.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.prescriptions.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">الوصفات المضافة ({formData.prescriptions.length}):</Label>
                      {formData.prescriptions.map((prescription, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-sm text-gray-900">{prescription}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePrescription(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>ملاحظات عامة</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="أي ملاحظات إضافية عن الزيارة"
                  rows={4}
                />
              </div>
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
            form="mobile-clinic-form"
            variant="default"
            leftIcon={<Activity className="w-4 h-4" />}
            loading={isSubmitting}
          >
            {clinic ? "حفظ التعديلات" : "إضافة الزيارة"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
