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
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { CalendarIcon, MapPin, Stethoscope, Plus, Trash2, User, Heart, Shield, Activity } from "lucide-react";
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
import type { MobileClinic } from "@/types";

interface MobileClinicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinic?: MobileClinic;
  onSave: (data: any) => void;
}

const supervisors = [
  "د. محمد علي",
  "د. سارة محمود",
  "د. أحمد حسن",
  "د. فاطمة عبدالله",
  "د. خالد إبراهيم",
];

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
  "علاج",
  "وقاية",
  "علاج طارئ",
  "فحص روتيني",
  "تطعيم",
  "جراحة بسيطة",
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
          date: clinic.request?.date || "",
          situation: clinic.request?.situation || "Open",
          fulfillingDate: clinic.request?.fulfillingDate || "",
        },
        followUpRequired: clinic.followUpRequired || false,
        followUpDate: clinic.followUpDate ? new Date(clinic.followUpDate) : undefined,
        remarks: clinic.remarks || "",
        
        // Legacy fields for backward compatibility
        owner: {
          name: clinic.owner?.name || clinic.client?.name || "",
          id: clinic.owner?.id || clinic.client?.nationalId || "",
          birthDate: clinic.owner?.birthDate || "",
          phone: clinic.owner?.phone || clinic.client?.phone || "",
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
      const newSerialNo = `MC-${Date.now()}`;
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
  }, [clinic]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.client?.name?.trim()) {
      newErrors.ownerName = "اسم المربي مطلوب";
    } else if (formData.client.name.trim().length < 2) {
      newErrors.ownerName = "اسم المربي يجب أن يكون أكثر من حرفين";
    }
    
    if (!formData.client?.nationalId?.trim()) {
      newErrors.ownerId = "رقم هوية المربي مطلوب";
    } else if (formData.client.nationalId.trim().length < 3) {
      newErrors.ownerId = "رقم هوية المربي يجب أن يكون أكثر من 3 أحرف";
    }
    
    if (!formData.client?.phone?.trim()) {
      newErrors.ownerPhone = "رقم الهاتف مطلوب";
    } else if (!validateSaudiPhone(formData.client.phone)) {
      newErrors.ownerPhone = "رقم الهاتف غير صحيح. يجب أن يبدأ بـ +966 أو 05";
    }
    
    if (!formData.supervisor) {
      newErrors.supervisor = "المشرف مطلوب";
    }
    
    if (!formData.vehicleNo) {
      newErrors.vehicleNo = "رقم المركبة مطلوب";
    }
    
    if (!formData.farmLocation.trim()) {
      newErrors.farmLocation = "موقع المزرعة مطلوب";
    }
    
    if (!formData.diagnosis) {
      newErrors.diagnosis = "التشخيص مطلوب";
    }
    
    if (!formData.interventionCategory) {
      newErrors.interventionCategory = "نوع التدخل مطلوب";
    }
    
    // Validate animal counts
    const totalAnimals = getTotalAnimals();
    if (totalAnimals === 0) {
      newErrors.animalCount = "يجب إدخال عدد الحيوانات المعالجة";
    }
    
    // Validate treatments
    if (formData.treatments.length === 0 && !formData.treatment.trim()) {
      newErrors.treatment = "يجب إدخال تفاصيل العلاج";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const treatmentText = formData.treatments.length > 0
      ? formData.treatments.map(t => `${t.medicine} - ${t.dosage}`).join(", ")
      : formData.treatment;
    
    onSave({
      ...formData,
      date: formData.date ? format(formData.date, "yyyy-MM-dd") : "",
      treatment: treatmentText,
      request: {
        ...formData.request,
        fulfillingDate: formData.request.situation === "Closed" 
          ? format(new Date(), "yyyy-MM-dd") 
          : formData.request.fulfillingDate,
      },
    });
    onOpenChange(false);
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
                    value: "animals",
                    label: "الحيوانات",
                    shortLabel: "حيوانات",
                    icon: <Heart className="w-4 h-4" />
                  },
                  {
                    value: "diagnosis",
                    label: "التشخيص والعلاج",
                    shortLabel: "تشخيص",
                    icon: <Shield className="w-4 h-4" />
                  },
                  {
                    value: "followup",
                    label: "المتابعة",
                    shortLabel: "متابعة",
                    icon: <Activity className="w-4 h-4" />
                  }
                ]}
              />

            <TabsContent value="basic" className="tabs-content-modern">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الرقم المسلسل</Label>
                  <Input
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    type="text"
                    disabled={!!clinic}
                  />
                </div>

                <div className="space-y-2">
                  <ModernDatePicker
                    label="التاريخ"
                    placeholder="اختر التاريخ"
                    value={formData.date}
                    onChange={(date) => setFormData({ ...formData, date: date || undefined })}
                    required
                    variant="modern"
                    size="md"
                  />
                </div>

                <div className="space-y-2">
                  <Label>اسم المربي *</Label>
                  <Input
                    value={formData.client?.name || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      client: { ...formData.client, name: e.target.value },
                      owner: { ...formData.owner, name: e.target.value }
                    })}
                    required
                    placeholder="أدخل اسم المربي"
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم هوية المربي *</Label>
                  <Input
                    value={formData.client?.nationalId || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      client: { ...formData.client, nationalId: e.target.value },
                      owner: { ...formData.owner, id: e.target.value }
                    })}
                    required
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم الهاتف *</Label>
                  <Input
                    value={formData.client?.phone || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      client: { ...formData.client, phone: e.target.value },
                      owner: { ...formData.owner, phone: e.target.value }
                    })}
                    required
                    placeholder="+966501234567 أو 0501234567"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label>القرية</Label>
                  <Input
                    value={formData.client?.village || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      client: { ...formData.client, village: e.target.value }
                    })}
                    placeholder="اسم القرية"
                  />
                </div>

                <div className="space-y-2">
                  <Label>المشرف *</Label>
                  <Select
                    value={formData.supervisor}
                    onValueChange={(value) => setFormData({ ...formData, supervisor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المشرف" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.map((supervisor) => (
                        <SelectItem key={supervisor} value={supervisor}>
                          {supervisor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>رقم المركبة *</Label>
                  <Select
                    value={formData.vehicleNo}
                    onValueChange={(value) => setFormData({ ...formData, vehicleNo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المركبة" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>موقع المزرعة *</Label>
                  <Input
                    value={formData.farmLocation}
                    onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                    required
                    placeholder="أدخل موقع المزرعة"
                  />
                </div>
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

            <TabsContent value="animals" className="tabs-content-modern">
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

            <TabsContent value="diagnosis" className="tabs-content-modern">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>التشخيص *</Label>
                  <Select
                    value={formData.diagnosis}
                    onValueChange={(value) => setFormData({ ...formData, diagnosis: value })}
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label>نوع التدخل *</Label>
                  <Select
                    value={formData.interventionCategory}
                    onValueChange={(value) => setFormData({ ...formData, interventionCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع التدخل" />
                    </SelectTrigger>
                    <SelectContent>
                      {interventionCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الأدوية والعلاجات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <Label>المدة</Label>
                      <Input
                        value={newTreatment.duration}
                        onChange={(e) => setNewTreatment({ ...newTreatment, duration: e.target.value })}
                        placeholder="مثال: 7 أيام"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ملاحظات</Label>
                      <Input
                        value={newTreatment.notes}
                        onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })}
                        placeholder="ملاحظات إضافية"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addTreatment}
                    variant="secondary"
                    className="w-full"
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

              <div className="space-y-2">
                <Label>ملاحظات العلاج</Label>
                <Textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="أدخل تفاصيل العلاج والملاحظات"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="followup" className="tabs-content-modern">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <ModernDatePicker
                    label="تاريخ المتابعة"
                    placeholder="اختر تاريخ المتابعة"
                    value={formData.followUpDate}
                    onChange={(date) => setFormData({ ...formData, followUpDate: date || undefined })}
                    variant="modern"
                    size="md"
                    minDate={new Date()}
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الوصفات الطبية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newPrescription}
                      onChange={(e) => setNewPrescription(e.target.value)}
                      placeholder="أدخل وصفة طبية"
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
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.prescriptions.map((prescription, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm">{prescription}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrescription(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
          >
            {clinic ? "حفظ التعديلات" : "إضافة الزيارة"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
