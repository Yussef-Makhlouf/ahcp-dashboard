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
import { FormField, FormLabel, Input, FormError, FormHelp } from "@/components/ui/form-modern";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, StatsCard } from "@/components/ui/card-modern";
import { StatusBadge, Badge } from "@/components/ui/badge-modern";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { 
  CalendarIcon, 
  MapPin, 
  Plus, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Home,
  Heart,
  Shield,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { validateSaudiPhone, validatePhoneNumber, validateNationalId } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMobileTabs } from "@/components/ui/mobile-tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VillageSelect } from "@/components/ui/village-select";
import { HoldingCodeSelector } from "@/components/common/HoldingCodeSelector";
import type { Client, Animal } from "@/types";
import { entityToasts } from "@/lib/utils/toast-utils";
import { clientsApi } from "@/lib/api/clients";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedSelect } from "@/components/ui/validated-select";
import { ValidatedTextarea } from "@/components/ui/validated-textarea";

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSave: (data: Client) => void;
}

// Villages are now loaded dynamically from the API

const availableServices = [
  { code: "parasite_control", name: "parasite control", icon: "🦠" },
  { code: "vaccination", name: "vaccination", icon: "💉" },
  { code: "mobile_clinic", name: "mobile clinic", icon: "🚑" },
  { code: "equine_health", name: "equine health", icon: "🐎" },
  { code: "laboratory", name: "laboratory", icon: "🔬" }
];

const animalTypes = [
  "horses",
  "sheep",
  "goats",
  "cattle",
  "camel",
];

export function ClientDialog({ open, onOpenChange, client, onSave }: ClientDialogProps) {
  // Validation rules for unified system
  const validationRules = {
    'name': { required: true, minLength: 2 },
    'nationalId': { required: true, nationalId: true },
    'phone': { required: true, phone: true },
    'email': { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    'village': { required: true },
    'detailedAddress': { required: true },
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

  const [formData, setFormData] = useState<{
    name: string;
    nationalId: string;
    birthDate?: string;
    phone: string;
    email?: string;
    village?: string;
    holdingCode?: string | {
      _id: string;
      code: string;
      village: string;
      description?: string;
    };
    detailedAddress?: string;
    status: "نشط" | "غير نشط";
    animals: Animal[];
    availableServices: string[];
  }>({
    name: "",
    nationalId: "",
    birthDate: "",
    phone: "",
    email: "",
    village: "",
    holdingCode: "",
    detailedAddress: "",
    status: "نشط",
    animals: [],
    availableServices: [],
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [newAnimal, setNewAnimal] = useState<Animal>({
    animalType: "horses",
    breed: "",
    age: 0,
    gender: "ذكر",
    healthStatus: "سليم",
    identificationNumber: "",
    animalCount: 0,
  });

  useEffect(() => {
    if (client) {
      // Transform client data to match form structure
      setFormData({
        ...client,
        nationalId: client.nationalId || client.national_id || "",
        birthDate: client.birthDate || client.birth_date || "",
        holdingCode: typeof client.holdingCode === 'string' ? client.holdingCode : (client.holdingCode?._id || ""),
        availableServices: client.availableServices || client.available_services || [],
      });
    } else {
      setFormData({
        name: "",
        nationalId: "",
        birthDate: "",
        phone: "",
        email: "",
        village: "",
        holdingCode: "",
        detailedAddress: "",
        status: "نشط",
        animals: [],
        availableServices: [],
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "الاسم الكامل مطلوب";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "الاسم يجب أن يكون أكثر من حرفين";
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = "الرقم القومي مطلوب";
    } else if (!validateNationalId(formData.nationalId)) {
      newErrors.nationalId = "الرقم القومي يجب أن يكون بين 10-14 رقم";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = "رقم الهاتف غير صحيح. يجب أن يكون بين 10-15 رقم";
    }
    
    if (!formData.village) {
      newErrors.village = "القرية مطلوبة";
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = "تاريخ الميلاد مطلوب";
    }
    
    // Email validation (if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }
    
    // setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show field-specific errors directly in the form
      // The validateForm function already sets errors in the errors state
      // which will be displayed by FormMessage components
      return;
    }
    
    setLoading(true);
    
    try {
      // Ensure holdingCode is properly formatted
      const submitData = {
        ...formData,
        holdingCode: typeof formData.holdingCode === 'string' ? formData.holdingCode : (formData.holdingCode?._id || undefined),
      };

      if (client) {
        // Update existing client
        await clientsApi.update(client._id || client.id || '', submitData);
        entityToasts.client.update();
      } else {
        // Create new client
        await clientsApi.create(submitData);
        entityToasts.client.create();
      }
      
      onSave(formData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving client:", error);
      entityToasts.client.error('save');
    } finally {
      setLoading(false);
    }
  };

  const addAnimal = () => {
    // Validate animal data
    if (!newAnimal.identificationNumber?.trim()) {
      entityToasts.client.error("validation");
      return;
    }
    if (!newAnimal.breed.trim()) {
      entityToasts.client.error("validation");
      return;
    }
    if (newAnimal.age <= 0) {
      entityToasts.client.error("validation");
      return;
    }
    if (newAnimal.animalCount <= 0) {
      entityToasts.client.error("validation");
      return;
    }
    
    // Check if animal ID already exists
    if (formData.animals.some(animal => 
      (animal.identificationNumber || animal.identification_number) === newAnimal.identificationNumber
    )) {
      entityToasts.client.error("duplicate");
      return;
    }
    
    setFormData({
      ...formData,
      animals: [...formData.animals, newAnimal],
    });
    setNewAnimal({
      animalType: "خيول",
      breed: "",
      age: 0,
      gender: "ذكر",
      healthStatus: "سليم",
      identificationNumber: "",
      animalCount: 0,
    });
  };

  const removeAnimal = (identificationNumber: string) => {
    setFormData({
      ...formData,
      animals: formData.animals.filter(a => 
        (a.identificationNumber || a.identification_number) !== identificationNumber
      ),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 lg:p-6">
        <DialogHeader>
          <DialogTitle>
            {client ? "تعديل بيانات المربي" : "إضافة مربي جديد"}
          </DialogTitle>
          <DialogDescription>
            {client ? "قم بتعديل بيانات المربي" : "أدخل بيانات المربي الجديد"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form id="client-form" onSubmit={handleSubmit}>
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
                    value: "additional",
                    label: "بيانات إضافية",
                    shortLabel: "إضافية",
                    icon: <Shield className="w-4 h-4" />
                  }
                ]}
              />

            <TabsContent value="basic" className="tabs-content-modern">
              <div className="section-modern">
                <div className="section-header-modern">
                  <h3 className="section-title-modern">المعلومات الشخصية</h3>
                  <p className="section-description-modern">أدخل البيانات الأساسية للمربي</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  <FormField>
                    <FormLabel htmlFor="name" required>الاسم الكامل</FormLabel>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="أدخل الاسم الكامل"
                      variant="enhanced"
                      error={!!errors.name}
                      dir="rtl"
                    />
                    {errors.name && <p className="error-message">{errors.name}</p>}
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="nationalId" required>الرقم القومي</FormLabel>
                    <Input
                      id="nationalId"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      placeholder="7777777777"
                      variant="enhanced"
                      error={!!errors.nationalId}
                      maxLength={10}
                      dir="ltr"
                    />
                    {errors.nationalId && <p className="error-message">{errors.nationalId}</p>}
                  </FormField>


                  <FormField>
                    <FormLabel htmlFor="phone" required>رقم الهاتف</FormLabel>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+966501234567 أو 0501234567"
                      variant="enhanced"
                      error={!!errors.phone}
                      dir="ltr"
                    />
                    {errors.phone && <p className="error-message">{errors.phone}</p>}
                  </FormField>

                  <FormField>
                    <SimpleDatePicker
                      label="تاريخ الميلاد"
                      placeholder="اختر تاريخ الميلاد"
                      value={formData.birthDate}
                      onChange={(date: Date | null) => {
                        const dateString = date ? format(date, 'yyyy-MM-dd') : '';
                        setFormData({ ...formData, birthDate: dateString });
                      }}
                      required
                      error={errors.birthDate}
                      maxDate={new Date()} // لا يمكن اختيار تاريخ مستقبلي
                      minDate={new Date(1900, 0, 1)} // حد أدنى منطقي
                      size="md"
                      variant="modern"
                    />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="email" >البريد الإلكتروني </FormLabel>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                      variant="enhanced"
                      error={!!errors.email}
                      dir="ltr"
                    />
                    {errors.email && <p className="error-message">{errors.email}</p>}
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="village" required>القرية</FormLabel>
                    <VillageSelect
                      value={formData.village}
                      onValueChange={(value) => {
                        console.log('🏘️ Village changed in client form:', value);
                        setFormData({ ...formData, village: value });
                      }}
                      placeholder="اختر القرية"
                      error={errors.village}
                      required
                    />
                  </FormField>

                  <FormField>
                    <FormLabel>رمز الحيازة</FormLabel>
                    <HoldingCodeSelector
                      value={typeof formData.holdingCode === 'string' ? formData.holdingCode : (formData.holdingCode?._id || "")}
                      onValueChange={(value) => {
                        setFormData({ ...formData, holdingCode: value || "" });
                      }}
                      village={formData.village}
                      placeholder="اختر أو أضف رمز حيازة"
                    />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="status">الحالة</FormLabel>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as "نشط" | "غير نشط" })}
                    >
                      <SelectTrigger className="form-select-enhanced">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="غير نشط">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <FormField>
                  <FormLabel htmlFor="detailedAddress">العنوان التفصيلي</FormLabel>
                  <Textarea
                    id="detailedAddress"
                    value={formData.detailedAddress}
                    onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
                    placeholder="أدخل العنوان التفصيلي"
                    className="form-input-enhanced"
                    rows={2}
                  />
                </FormField>
              </div>
            </TabsContent>

            <TabsContent value="animals" className="tabs-content-modern">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إضافة حيوان جديد</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-white">
                      <Label>نوع الحيوان</Label>
                      <Select
                        value={newAnimal.animalType}
                        onValueChange={(value) => setNewAnimal({ ...newAnimal, animalType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {animalTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>السلالة</Label>
                      <Input
                        value={newAnimal.breed}
                        onChange={(e) => setNewAnimal({ ...newAnimal, breed: e.target.value })}
                        placeholder="أدخل السلالة"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>العمر</Label>
                      <Input
                        type="number"
                        value={newAnimal.age}
                        onChange={(e) => setNewAnimal({ ...newAnimal, age: parseInt(e.target.value) || 0 })}
                        placeholder="مثال: 2"
                        min="0"
                      />
       
                    </div>

                    <div className="space-y-2">
                      <Label>الجنس</Label>
                      <Select
                        value={newAnimal.gender}
                        onValueChange={(value) => setNewAnimal({ ...newAnimal, gender: value as "ذكر" | "أنثى" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ذكر">ذكر</SelectItem>
                          <SelectItem value="أنثى">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الحالة الصحية</Label>
                      <Select
                        value={newAnimal.healthStatus}
                        onValueChange={(value) => setNewAnimal({ ...newAnimal, healthStatus: value as "سليم" | "مريض" | "تحت العلاج" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="سليم">سليم</SelectItem>
                          <SelectItem value="مريض">مريض</SelectItem>
                          <SelectItem value="تحت العلاج">تحت العلاج</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>رقم التعريف</Label>
                      <Input
                        value={newAnimal.identificationNumber}
                        onChange={(e) => setNewAnimal({ ...newAnimal, identificationNumber: e.target.value })}
                        placeholder="رقم التعريف"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>عدد الحيوانات</Label>
                      <Input
                        type="number"
                        value={newAnimal.animalCount}
                        onChange={(e) => setNewAnimal({ ...newAnimal, animalCount: parseInt(e.target.value) || 0 })}
                        placeholder="عدد الحيوانات"
                        min="0"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addAnimal}
                    className="mt-4"
                    variant="secondary"
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة الحيوان
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>قائمة الحيوانات ({formData.animals.length})</Label>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {formData.animals.length === 0 ? (
                    <p className="text-center text-muted-foreground">لا توجد حيوانات مضافة</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.animals.map((animal, index) => (
                        <div
                          key={animal.identificationNumber || animal.identification_number || index}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {animal.animalType || animal.animal_type}
                            </Badge>
                            <span className="text-sm">{animal.breed}</span>
                            <Badge variant={(animal.healthStatus || animal.health_status) === "سليم" ? "default" : "danger"}>
                              {animal.healthStatus || animal.health_status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {animal.age} سنة
                            </span>
                            <span className="text-xs text-blue-600 font-medium">
                              {animal.animalCount || animal.animal_count} رأس
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAnimal(animal.identificationNumber || animal.identification_number || "")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="tabs-content-modern">
              <div className="section-modern">
                <div className="section-header-modern">
                  <h3 className="section-title-modern">الخدمات المتاحة</h3>
                  <p className="section-description-modern">اختر الخدمات المتاحة لهذا المربي</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableServices.map((service) => {
                    const isChecked = (formData.availableServices || []).includes(service.code);
                    return (
                      <div 
                        key={service.code} 
                        className={`relative flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                          isChecked 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => {
                          const currentServices = formData.availableServices || [];
                          if (isChecked) {
                            setFormData({
                              ...formData,
                              availableServices: currentServices.filter(s => s !== service.code)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              availableServices: [...currentServices, service.code]
                            });
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          id={service.code}
                          checked={isChecked}
                          onChange={() => {}} // Handled by div onClick
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3 w-full">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            isChecked ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {service.icon}
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={service.code} className="text-sm font-medium cursor-pointer">
                              {service.name}
                            </Label>
                          </div>
                          <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isChecked 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* عرض الخدمات المختارة */}
                {(formData.availableServices || []).length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-sm font-medium text-green-800 mb-2">الخدمات المختارة:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(formData.availableServices || []).map((serviceCode) => {
                        const service = availableServices.find(s => s.code === serviceCode);
                        return service ? (
                          <Badge key={serviceCode} variant="outline" className="bg-white border-green-300 text-green-700">
                            {service.icon} {service.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
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
            disabled={loading}
          >
            إلغاء
          </Button>
          <LoadingButton 
            type="submit"
            form="client-form"
            variant="default"
            loading={loading}
            loadingText="جاري الحفظ..."
            leftIcon={<User className="w-4 h-4" />}
          >
            {client ? "حفظ التعديلات" : "إضافة المربي"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
