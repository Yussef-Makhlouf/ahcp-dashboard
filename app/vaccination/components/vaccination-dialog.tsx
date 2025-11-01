"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { arEG } from "date-fns/locale/ar-EG";
import { handleFormError, showSuccessToast, showErrorToast, translateFieldName } from "@/lib/utils/error-handler";

import { Button, LoadingButton } from "@/components/ui/button-modern";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from "@/components/ui/card-modern";
import { Badge, StatusBadge } from "@/components/ui/badge-modern";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMobileTabs } from "@/components/ui/mobile-tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { SupervisorSelect } from "@/components/ui/supervisor-select";
import { VillageSelect } from "@/components/ui/village-select";
import { ClientSelector } from "@/components/ui/client-selector";
import { useClientData } from "@/lib/hooks/use-client-data";
import { HoldingCodeSelector } from "@/components/common/HoldingCodeSelector";
import { DynamicSelect } from "@/components/ui/dynamic-select";

import { CalendarIcon, Loader2, User, Heart, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vaccination } from "@/types";
import { vaccinationApi } from "@/lib/api/vaccination";
import { entityToasts } from "@/lib/utils/toast-utils";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedSelect } from "@/components/ui/validated-select";
import { ValidatedTextarea } from "@/components/ui/validated-textarea";

// Import validation functions
import { validateSaudiPhone, validatePhoneNumber, validateNationalId } from "@/lib/utils";

const formSchema = z.object({
  serialNo: z.string().min(1, { message: "يجب إدخال رقم السجل" }),
  date: z.string().min(1, { message: "يجب إدخال التاريخ" }),
  client: z.object({
    _id: z.string().optional(),
    name: z.string().min(2, { message: "يجب إدخال اسم العميل (أكثر من حرفين)" }),
    nationalId: z.string().min(10, { message: "يجب إدخال رقم الهوية الوطنية (10 أرقام على الأقل)" }).refine(
      (nationalId) => validateNationalId(nationalId),
      { message: "رقم الهوية يجب أن يكون بين 10-14 رقم فقط" }
    ),
    phone: z.string().min(1, { message: "يجب إدخال رقم الهاتف" }).refine(
      (phone) => validatePhoneNumber(phone),
      { message: "رقم الهاتف غير صحيح. يجب أن يكون بين 10-15 رقم" }
    ),
    village: z.string().optional(),
    birthDate: z.string().optional(),
  }),
  coordinates: z.object({
    latitude: z.union([z.number(), z.null()]).optional(),
    longitude: z.union([z.number(), z.null()]).optional(),
  }).optional(),
  supervisor: z.string().min(2, { message: "يجب إدخال اسم المشرف (أكثر من حرفين)" }),
  vehicleNo: z.string().min(1, { message: "يجب إدخال رقم المركبة" }),
  vaccineType: z.string().min(1, { message: "يجب اختيار نوع المصل" }),
  herdCounts: z.object({
    sheep: z.object({
      total: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      young: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      female: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      vaccinated: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
    }),
    goats: z.object({
      total: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      young: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      female: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      vaccinated: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
    }),
    camel: z.object({
      total: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      young: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      female: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      vaccinated: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
    }),
    cattle: z.object({
      total: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      young: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      female: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      vaccinated: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
    }),
    horse: z.object({
      total: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      young: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      female: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
      vaccinated: z.number().min(0, { message: "يجب أن يكون الرقم أكبر من أو يساوي 0" }),
    }),
  }),
  herdHealth: z.string().min(1, { message: "يجب اختيار حالة القطيع" }),
  holdingCode: z.string().optional(),
  animalsHandling: z.enum(["Easy", "Difficult"], { message: "يجب اختيار معاملة الحيوانات" }),
  labours: z.string().min(1, { message: "يجب اختيار حالة العمال" }),
  reachableLocation: z.string().min(1, { message: "يجب اختيار سهولة الوصول للموقع" }),
  request: z.object({
    date: z.string().min(1, { message: "يجب إدخال تاريخ الطلب" }),
    situation: z.string().min(1, { message: "يجب اختيار حالة الطلب" }),
    fulfillingDate: z.string().optional(),
  }),
  category: z.string().default("التحصين"),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface VaccinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Vaccination | null;
  onSuccess?: () => void;
}

export function VaccinationDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: VaccinationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // Validation rules for unified system
  const validationRules = {
    'client.name': { required: true, minLength: 2 },
    'client.nationalId': { required: true, nationalId: true },
    'client.phone': { required: true, phone: true },
    'supervisor': { required: true },
    'vehicleNo': { required: true },
    'herdHealth': { required: true },
    'animalsHandling': { required: true },
    'labours': { required: true },
    'reachableLocation': { required: true },
    'remarks': { required: true, minLength: 10 },
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

  // Function to generate serial number
  const generateSerialNo = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
    return `V${year}${month}${day}-${time}`;
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serialNo: "",
      date: new Date().toISOString().split("T")[0],
      client: {
        name: "",
        nationalId: "",
        phone: "",
        village: "",
        birthDate: "",
      },
      coordinates: { latitude: null, longitude: null },
      supervisor: "",
      vehicleNo: "",
      vaccineType: "",
      herdCounts: {
        sheep: { total: 0, young: 0, female: 0, vaccinated: 0 },
        goats: { total: 0, young: 0, female: 0, vaccinated: 0 },
        camel: { total: 0, young: 0, female: 0, vaccinated: 0 },
        cattle: { total: 0, young: 0, female: 0, vaccinated: 0 },
        horse: { total: 0, young: 0, female: 0, vaccinated: 0 },
      },
      herdHealth: "Healthy",
      holdingCode: "",
      animalsHandling: "Easy",
      labours: "Available",
      reachableLocation: "Easy",
      request: {
        date: new Date().toISOString().split("T")[0],
        situation: "Open",
        fulfillingDate: undefined,
      },
      category: "التحصين",
      remarks: "",
    },
  });

  // Reset form when item changes or dialog is opened/closed
  useEffect(() => {
    if (open) {
      if (item) {
        // Convert dates to YYYY-MM-DD format for input[type="date"]
        const formattedItem = {
          ...item,
          serialNo: item.serialNo || '',
          date: item.date.split("T")[0],
          // Map client data from backend
          client: item.client ? {
            name: item.client.name || '',
            nationalId: item.client.nationalId || '',
            phone: item.client.phone || '',
            village: item.client.village || '',
            birthDate: item.client.birthDate ? item.client.birthDate.split("T")[0] : '',
          } : {
            name: '',
            nationalId: '',
            phone: '',
            village: '',
            birthDate: '',
          },
          coordinates: item.coordinates ? {
            latitude: item.coordinates.latitude,
            longitude: item.coordinates.longitude,
          } : { latitude: null, longitude: null },
          herdCounts: item.herdCounts ? {
            sheep: item.herdCounts.sheep || { total: 0, young: 0, female: 0, vaccinated: 0 },
            goats: item.herdCounts.goats || { total: 0, young: 0, female: 0, vaccinated: 0 },
            camel: item.herdCounts.camel || { total: 0, young: 0, female: 0, vaccinated: 0 },
            cattle: item.herdCounts.cattle || { total: 0, young: 0, female: 0, vaccinated: 0 },
            horse: item.herdCounts.horse || { total: 0, young: 0, female: 0, vaccinated: 0 },
          } : {
            sheep: { total: 0, young: 0, female: 0, vaccinated: 0 },
            goats: { total: 0, young: 0, female: 0, vaccinated: 0 },
            camel: { total: 0, young: 0, female: 0, vaccinated: 0 },
            cattle: { total: 0, young: 0, female: 0, vaccinated: 0 },
            horse: { total: 0, young: 0, female: 0, vaccinated: 0 },
          },
          request: {
            ...item.request,
            date: item.request?.date?.split("T")[0] || new Date().toISOString().split("T")[0],
            fulfillingDate: item.request?.fulfillingDate 
              ? item.request.fulfillingDate.split("T")[0] 
              : undefined,
          },
          // Handle holdingCode - extract _id if it's an object
          holdingCode: (typeof item.holdingCode === 'object' 
            ? (item.holdingCode as any)?._id 
            : item.holdingCode) || "",
        };
        form.reset(formattedItem);
      } else {
        form.reset({
          serialNo: generateSerialNo(),
          date: new Date().toISOString().split("T")[0],
          client: {
            name: "",
            nationalId: "",
            phone: "",
            village: "",
            birthDate: "",
          },
          coordinates: { latitude: null, longitude: null },
          supervisor: "",
          vehicleNo: "",
          vaccineType: "",
          herdCounts: {
            sheep: { total: 0, young: 0, female: 0, vaccinated: 0 },
            goats: { total: 0, young: 0, female: 0, vaccinated: 0 },
            camel: { total: 0, young: 0, female: 0, vaccinated: 0 },
            cattle: { total: 0, young: 0, female: 0, vaccinated: 0 },
            horse: { total: 0, young: 0, female: 0, vaccinated: 0 },
          },
          herdHealth: "Healthy",
          animalsHandling: "Easy",
          labours: "Available",
          reachableLocation: "Easy",
          request: {
            date: new Date().toISOString().split("T")[0],
            situation: "Open",
            fulfillingDate: undefined,
          },
          category: "التحصين",
          remarks: "",
        });
      }
    }
  }, [item, open, form]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log('🔍 Form submission started for vaccination');
      console.log('📋 Current form data:', data);

      // Transform form data to match backend validation schema exactly
      const transformedData = {
        serialNo: data.serialNo || undefined, // سيتم إنشاؤه تلقائياً إذا لم يوجد
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        client: data.client._id && data.client._id.length === 24 ? 
          data.client._id : // Send ObjectId if valid
          {
            // Send client object for new clients
            name: data.client.name,
            nationalId: data.client.nationalId,
            phone: data.client.phone,
            village: data.client.village || '',
            birthDate: data.client.birthDate || '',
          },
        coordinates: data.coordinates && (data.coordinates.latitude || data.coordinates.longitude) ? {
          latitude: data.coordinates.latitude || 0,
          longitude: data.coordinates.longitude || 0,
        } : undefined,
        supervisor: data.supervisor,
        vehicleNo: data.vehicleNo,
        vaccineType: data.vaccineType,
        herdCounts: {
          sheep: data.herdCounts.sheep || { total: 0, young: 0, female: 0, vaccinated: 0 },
          goats: data.herdCounts.goats || { total: 0, young: 0, female: 0, vaccinated: 0 },
          camel: data.herdCounts.camel || { total: 0, young: 0, female: 0, vaccinated: 0 },
          cattle: data.herdCounts.cattle || { total: 0, young: 0, female: 0, vaccinated: 0 },
          horse: data.herdCounts.horse || { total: 0, young: 0, female: 0, vaccinated: 0 },
        },
        herdHealth: data.herdHealth,
        animalsHandling: data.animalsHandling,
        labours: data.labours,
        reachableLocation: data.reachableLocation,
        request: {
          date: data.request?.date ? new Date(data.request.date).toISOString() : new Date().toISOString(),
          situation: data.request?.situation || 'Ongoing',
          fulfillingDate: data.request?.fulfillingDate ? new Date(data.request.fulfillingDate).toISOString() : undefined,
        },
        holdingCode: typeof data.holdingCode === 'string' ? data.holdingCode : (data.holdingCode?._id || undefined),
        remarks: data.remarks || '',
      };

      console.log('📤 Data being sent to API:', transformedData);

      if (item) {
        const updateId = item._id || item.serialNo;
        const result = await vaccinationApi.update(updateId, transformedData as any);
        console.log('✅ Vaccination record updated successfully:', result);
        showSuccessToast('تم تحديث سجل التطعيم بنجاح', 'تم التحديث');
      } else {
        const result = await vaccinationApi.create(transformedData as any);
        console.log('✅ Vaccination record created successfully:', result);
        showSuccessToast('تم إنشاء سجل التطعيم بنجاح', 'تم الإنشاء');
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('❌ Create/Update vaccination error:', error);
      
      // استخدام نظام الأخطاء المحسن
      handleFormError(error, (field: string, message: string) => {
        form.setError(field as any, { message });
      }, () => {
        form.clearErrors();
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (
    name: string,
    label: string,
    type: string = "text",
    options?: { value: string; label: string }[],
    isNumber: boolean = false
  ) => {
    const isRequired = ['client.name', 'client.nationalId', 'client.phone', 'supervisor', 'vehicleNo', 'herdLocation', 'herdHealth', 'animalsHandling', 'labours', 'reachableLocation'].includes(name);
    
    if (type === "select") {
      return (
        <ValidatedSelect
          label={label}
          required={isRequired}
          value={String(form.watch(name as any) || '')}
          placeholder={`اختر ${label.toLowerCase()}`}
          options={options || []}
          error={getFieldError(name)}
          onValueChange={(value) => {
            form.setValue(name as any, value);
            clearFieldError(name);
          }}
          onBlur={() => {
            const error = validateField(name, form.watch(name as any));
            if (error) {
              setFieldError(name, error);
            }
          }}
        />
      );
    } else if (type === "date") {
      return (
        <div className="mb-6 space-y-3">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {label}
          </label>
          <SimpleDatePicker
            placeholder="اختر التاريخ"
            value={form.watch(name as any) ? new Date(form.watch(name as any)) : undefined}
            onChange={(date) => {
              const dateString = date ? date.toISOString().split('T')[0] : '';
              form.setValue(name as any, dateString);
              clearFieldError(name);
            }}
            variant="modern"
            size="md"
            maxDate={new Date()}
            minDate={new Date(1900, 0, 1)}
          />
          {getFieldError(name) && (
            <p className="text-red-500 text-sm font-medium">{getFieldError(name)}</p>
          )}
        </div>
      );
    } else {
      return (
        <ValidatedInput
          label={label}
          required={isRequired}
          type={type}
          placeholder={`أدخل ${label.toLowerCase()}`}
          value={String(form.watch(name as any) || "")}
          error={getFieldError(name)}
          onValueChange={(value) => {
            if (isNumber) {
              form.setValue(name as any, Number(value) || 0);
            } else {
              form.setValue(name as any, value);
            }
            clearFieldError(name);
          }}
          onBlur={() => {
            const error = validateField(name, form.watch(name as any));
            if (error) {
              setFieldError(name, error);
            }
          }}
        />
      );
    }
  };

  const renderHerdInputs = (animal: string) => (
    <div className="space-y-6 p-6 border-2 border-gray-500 rounded-xl bg-gray-50 shadow-sm">
      <h4 className="font-semibold text-center text-lg text-gray-800 mb-4">
        {animal === "sheep" && "الأغنام"}
        {animal === "goats" && "الماعز"}
        {animal === "camel" && "الإبل"}
        {animal === "cattle" && "الأبقار"}
        {animal === "horse" && "الخيول"}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {renderFormField(
          `herdCounts.${animal}.total`,
          "العدد الكلي",
          "number",
          undefined,
          true
        )}
        {renderFormField(
          `herdCounts.${animal}.young`,
          "عدد الصغار",
          "number",
          undefined,
          true
        )}
        {renderFormField(
          `herdCounts.${animal}.female`,
          "عدد الإناث",
          "number",
          undefined,
          true
        )}
        {renderFormField(
          `herdCounts.${animal}.vaccinated`,
          "عدد المحصنة",
          "number",
          undefined,
          true
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 lg:p-6">
        <DialogHeader>
          <DialogTitle>
            {item ? "تعديل سجل التحصين" : "إضافة سجل تحصين جديد"}
          </DialogTitle>
          <DialogDescription>
            {item ? "قم بتعديل بيانات سجل التحصين" : "أدخل بيانات سجل التحصين الجديد"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form id="vaccination-form" onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="tabs-modern"
                dir="rtl"
              >
                <EnhancedMobileTabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  tabs={[
                    {
                      value: "info",
                      label: "المعلومات الأساسية",
                      shortLabel: "أساسية",
                      icon: <User className="w-4 h-4" />
                    },
                    {
                      value: "herd",
                      label: "تفاصيل القطيع",
                      shortLabel: "قطيع",
                      icon: <Heart className="w-4 h-4" />
                    },
                    {
                      value: "request",
                      label: "معلومات الطلب",
                      shortLabel: "طلب",
                      icon: <Shield className="w-4 h-4" />
                    }
                  ]}
                />

              <TabsContent value="info" className="tabs-content-modern">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Serial Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      رقم السجل *
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={form.watch("serialNo") || ""}
                        onChange={(e) => {
                          form.setValue("serialNo", e.target.value);
                          clearFieldError("serialNo");
                        }}
                        placeholder="رقم السجل"
                        required
                        className={`flex-1 ${getFieldError("serialNo") ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue("serialNo", generateSerialNo())}
                        className="px-3"
                      >
                        توليد تلقائي
                      </Button>
                    </div>
                    {getFieldError("serialNo") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("serialNo")}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      تاريخ التحصين *
                    </label>
                    <SimpleDatePicker
                      placeholder="اختر التاريخ"
                      value={form.watch("date") ? new Date(form.watch("date")) : undefined}
                      onChange={(date) => {
                        const dateString = date ? date.toISOString().split('T')[0] : '';
                        form.setValue("date", dateString);
                        clearFieldError("date");
                      }}
                      required
                      variant="modern"
                      size="md"
                      maxDate={new Date()}
                    />
                    {getFieldError("date") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("date")}</p>
                    )}
                  </div>

                  {/* Client Selector */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      اختيار المربي
                    </label>
                    <ClientSelector
                      value={form.watch("client._id") || ""}
                      onValueChange={(client) => {
                        if (client) {
                          form.setValue("client._id", client._id);
                          form.setValue("client.name", client.name);
                          form.setValue("client.nationalId", client.nationalId || client.national_id || "");
                          form.setValue("client.phone", client.phone || "");
                          form.setValue("client.village", client.village || "");
                          form.setValue("client.birthDate", client.birthDate || client.birth_date || "");
                          // Clear any existing errors for client fields
                          clearFieldError("client.name");
                          clearFieldError("client.nationalId");
                          clearFieldError("client.phone");
                        }
                      }}
                      placeholder="ابحث عن المربي"
                      showDetails
                    />
                  </div>

                  {/* Client Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      اسم العميل *
                    </label>
                    <Input
                      value={form.watch("client.name") || ""}
                      onChange={(e) => {
                        form.setValue("client.name", e.target.value);
                        clearFieldError("client.name");
                      }}
                      placeholder="اسم العميل"
                      required
                      className={getFieldError("client.name") ? 'border-red-500' : ''}
                    />
                    {getFieldError("client.name") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("client.name")}</p>
                    )}
                  </div>

                  {/* Client National ID */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      رقم الهوية الوطنية *
                    </label>
                    <Input
                      value={form.watch("client.nationalId") || ""}
                      onChange={(e) => {
                        form.setValue("client.nationalId", e.target.value);
                        clearFieldError("client.nationalId");
                      }}
                      placeholder="رقم الهوية (10-14 رقم)"
                      required
                      maxLength={14}
                      className={getFieldError("client.nationalId") ? 'border-red-500' : ''}
                    />
                    {getFieldError("client.nationalId") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("client.nationalId")}</p>
                    )}
                  </div>

                  {/* Client Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      رقم الهاتف *
                    </label>
                    <Input
                      value={form.watch("client.phone") || ""}
                      onChange={(e) => {
                        form.setValue("client.phone", e.target.value);
                        clearFieldError("client.phone");
                      }}
                      placeholder="رقم الهاتف (10-15 رقم)"
                      required
                      maxLength={15}
                      className={getFieldError("client.phone") ? 'border-red-500' : ''}
                    />
                    {getFieldError("client.phone") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("client.phone")}</p>
                    )}
                  </div>

                  {/* Client Village */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      القرية
                    </label>
                    <VillageSelect
                      value={form.watch("client.village") || ""}
                      onValueChange={(value) => form.setValue("client.village", value)}
                      placeholder="اختر القرية"
                    />
                  </div>

                  {/* Holding Code Selector */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      رمز الحيازة
                    </label>
                    <HoldingCodeSelector
                      value={
                        typeof form.watch("holdingCode") === 'object' 
                          ? (form.watch("holdingCode") as any)?._id || ""
                          : form.watch("holdingCode") || ""
                      }
                      onValueChange={(value) => form.setValue("holdingCode", value)}
                      village={form.watch("client.village")}
                      placeholder="اختر رمز الحيازة"
                    />
                  </div>

                  {/* Client Detailed Address */}

                  {/* Client Birth Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      تاريخ الميلاد
                    </label>
                    <SimpleDatePicker
                      placeholder="اختر تاريخ الميلاد"
                      value={form.watch("client.birthDate") ? new Date(form.watch("client.birthDate")!) : undefined}
                      onChange={(date) => {
                        const dateString = date ? date.toISOString().split('T')[0] : '';
                        form.setValue("client.birthDate", dateString);
                      }}
                      maxDate={new Date()}
                      minDate={new Date(1900, 0, 1)}
                      variant="modern"
                      size="md"
                    />
                  </div>

                  {/* Supervisor */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      اسم المشرف *
                    </label>
                    <SupervisorSelect
                      value={form.watch("supervisor") || ""}
                      onValueChange={(value, supervisor) => {
                        form.setValue("supervisor", value);
                        // Auto-fill vehicle number if supervisor has one
                        if (supervisor?.vehicleNo) {
                          form.setValue("vehicleNo", supervisor.vehicleNo);
                          clearFieldError("vehicleNo");
                        }
                        clearFieldError("supervisor");
                      }}
                      placeholder="اختر المشرف"
                      section="تحصين"
                    />
                    {getFieldError("supervisor") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("supervisor")}</p>
                    )}
                  </div>

                  {/* Vehicle Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      رقم المركبة *
                    </label>
                    <Input
                      value={form.watch("vehicleNo") || ""}
                      onChange={(e) => {
                        form.setValue("vehicleNo", e.target.value);
                        clearFieldError("vehicleNo");
                      }}
                      placeholder="رقم المركبة"
                      required
                      className={getFieldError("vehicleNo") ? 'border-red-500' : ''}
                    />
                    {getFieldError("vehicleNo") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("vehicleNo")}</p>
                    )}
                  </div>

                  {/* Farm Location */}


                  {/* Coordinates */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      خط العرض
                    </label>
                    <Input
                      type="number"
                      value={form.watch("coordinates.latitude") || ""}
                      onChange={(e) => form.setValue("coordinates.latitude", parseFloat(e.target.value) || null)}
                      placeholder="خط العرض"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      خط الطول
                    </label>
                    <Input
                      type="number"
                      value={form.watch("coordinates.longitude") || ""}
                      onChange={(e) => form.setValue("coordinates.longitude", parseFloat(e.target.value) || null)}
                      placeholder="خط الطول"
                    />
                  </div>

                  {/* Vaccine Type */}
                  <div className="space-y-2">
                    <DynamicSelect
                      category="VACCINE_TYPES"
                      value={form.watch("vaccineType") || ""}
                      onValueChange={(value) => {
                        form.setValue("vaccineType", value ?? undefined);
                        clearFieldError("vaccineType");
                      }}
                      label="نوع المصل"
                      required={true}
                      placeholder="اختر نوع المصل"
                      error={getFieldError("vaccineType")}
                      className={getFieldError("vaccineType") ? 'border-red-500' : ''}
                      language="en"
                    />
                  </div>


                  {/* Herd Health */}
                  <div className="space-y-2">
                    <DynamicSelect
                      category="HERD_HEALTH"
                      value={form.watch("herdHealth") || ""}
                      onValueChange={(value) => {
                        form.setValue("herdHealth", value ?? undefined);
                        clearFieldError("herdHealth");
                      }}
                      label="حالة القطيع"
                      required={true}
                      placeholder="اختر حالة القطيع"
                      error={getFieldError("herdHealth")}
                      className={getFieldError("herdHealth") ? 'border-red-500' : ''}
                      language="en"
                    />
                  </div>

                  {/* Animals Handling */}
                  <div className="space-y-2">
                    <DynamicSelect
                      category="ANIMALS_HANDLING"
                      value={form.watch("animalsHandling") || ""}
                      onValueChange={(value) => {
                        form.setValue("animalsHandling", value ?? undefined);
                        clearFieldError("animalsHandling");
                      }}
                      label="معاملة الحيوانات"
                      required={true}
                      placeholder="اختر معاملة الحيوانات"
                      error={getFieldError("animalsHandling")}
                      className={getFieldError("animalsHandling") ? 'border-red-500' : ''}
                      language="en"
                    />
                  </div>

                  {/* Labours */}
                  <div className="space-y-2">
                    <DynamicSelect
                      category="LABOURS"
                      value={form.watch("labours") || ""}
                      onValueChange={(value) => {
                        form.setValue("labours", value ?? undefined);
                        clearFieldError("labours");
                      }}
                      label="حالة العمال"
                      required={true}
                      placeholder="اختر حالة العمال"
                      error={getFieldError("labours")}
                      className={getFieldError("labours") ? 'border-red-500' : ''}
                      language="en"
                    />
                  </div>

                  {/* Reachable Location */}
                  <div className="space-y-2">
                    <DynamicSelect
                      category="REACHABLE_LOCATION"
                      value={form.watch("reachableLocation") || ""}
                      onValueChange={(value) => {
                        form.setValue("reachableLocation", value ?? undefined);
                        clearFieldError("reachableLocation");
                      }}
                      label="سهولة الوصول للموقع"
                      required={true}
                      placeholder="اختر سهولة الوصول للموقع"
                      error={getFieldError("reachableLocation")}
                      className={getFieldError("reachableLocation") ? 'border-red-500' : ''}
                      language="en"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="herd" className="tabs-content-modern">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-400 pb-3">
                    تفاصيل القطيع
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderHerdInputs("sheep")}
                    {renderHerdInputs("goats")}
                    {renderHerdInputs("camel")}
                    {renderHerdInputs("cattle")}
                    {renderHerdInputs("horse")}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="request" className="tabs-content-modern">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-400 pb-3">
                    معلومات الطلب
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          تاريخ الطلب *
                        </label>
                        <SimpleDatePicker
                          placeholder="اختر تاريخ الطلب"
                          value={form.watch("request.date") ? new Date(form.watch("request.date")) : undefined}
                          onChange={(date) => {
                            const dateString = date ? date.toISOString().split('T')[0] : '';
                            form.setValue("request.date", dateString);
                            clearFieldError("request.date");
                          }}
                          maxDate={new Date()}
                          variant="modern"
                          size="md"
                          required
                        />
                        {getFieldError("request.date") && (
                          <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("request.date")}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <DynamicSelect
                          category="REQUEST_SITUATION"
                          value={form.watch("request.situation") || ""}
                          onValueChange={(value) => {
                            form.setValue("request.situation", value ?? undefined);
                            clearFieldError("request.situation");
                          }}
                          label="حالة الطلب"
                          required={true}
                          placeholder="اختر حالة الطلب"
                          error={getFieldError("request.situation")}
                          className={getFieldError("request.situation") ? 'border-red-500' : ''}
                          language="en"
                        />
                      </div>
                      
                      {form.watch("request.situation") === "Closed" && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            تاريخ الإنجاز
                          </label>
                          <SimpleDatePicker
                            placeholder="اختر تاريخ الإنجاز"
                            value={form.watch("request.fulfillingDate") ? new Date(form.watch("request.fulfillingDate")!) : undefined}
                            onChange={(date) => {
                              const dateString = date ? date.toISOString().split('T')[0] : '';
                              form.setValue("request.fulfillingDate", dateString);
                            }}
                            minDate={form.watch("request.date") ? new Date(form.watch("request.date")!) : undefined}
                            variant="modern"
                            size="md"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          الفئة
                        </label>
                        <Input
                          value={form.watch("category") || ""}
                          onChange={(e) => form.setValue("category", e.target.value)}
                          placeholder="الفئة"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          الملاحظات *
                        </label>
                        <Textarea
                          value={form.watch("remarks") || ""}
                          onChange={(e) => {
                            form.setValue("remarks", e.target.value);
                            clearFieldError("remarks");
                          }}
                          placeholder="أدخل الملاحظات (10 أحرف على الأقل)"
                          className={`min-h-[120px] ${getFieldError("remarks") ? 'border-red-500' : ''}`}
                          dir="rtl"
                          required
                        />
                        {getFieldError("remarks") && (
                          <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("remarks")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              </Tabs>
            </form>
          </Form>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <LoadingButton 
            type="submit"
            form="vaccination-form"
            variant="default"
            loading={isSubmitting}
            loadingText="جاري الحفظ..."
            leftIcon={<Heart className="w-4 h-4" />}
          >
            {item ? "حفظ التغييرات" : "إضافة سجل"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
