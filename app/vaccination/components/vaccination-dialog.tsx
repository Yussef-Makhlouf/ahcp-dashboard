"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { arEG } from "date-fns/locale/ar-EG";

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
    detailedAddress: z.string().optional(),
    birthDate: z.string().optional(),
  }),
  coordinates: z.object({
    latitude: z.union([z.number(), z.null()]).optional(),
    longitude: z.union([z.number(), z.null()]).optional(),
  }).optional(),
  supervisor: z.string().min(2, { message: "يجب إدخال اسم المشرف (أكثر من حرفين)" }),
  vehicleNo: z.string().min(1, { message: "يجب إدخال رقم المركبة" }),
  farmLocation: z.string().min(1, { message: "يجب إدخال موقع المزرعة" }),
  team: z.string().min(1, { message: "يجب إدخال اسم الفريق" }),
  vaccineType: z.string().min(1, { message: "يجب اختيار نوع المصل" }),
  vaccineCategory: z.string().min(1, { message: "يجب اختيار فئة المصل" }),
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
    'farmLocation': { required: true },
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
        detailedAddress: "",
        birthDate: "",
      },
      coordinates: { latitude: null, longitude: null },
      supervisor: "",
      vehicleNo: "",
      farmLocation: "",
      team: "",
      vaccineType: "",
      vaccineCategory: "",
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
            detailedAddress: item.client.detailedAddress || '',
            birthDate: item.client.birthDate ? item.client.birthDate.split("T")[0] : '',
          } : {
            name: '',
            nationalId: '',
            phone: '',
            village: '',
            detailedAddress: '',
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
            detailedAddress: "",
            birthDate: "",
          },
          coordinates: { latitude: null, longitude: null },
          supervisor: "",
          vehicleNo: "",
          farmLocation: "",
          team: "",
          vaccineType: "",
          vaccineCategory: "",
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

      // First, find or create client to get ObjectId
      let clientId: string;
      
      if (item && item.client && typeof item.client === 'object' && item.client._id) {
        // Existing client - use the ID
        clientId = item.client._id;
      } else {
        // For now, we'll send the client data and let backend handle it
        // In a real scenario, we'd need to create/find the client first
        clientId = 'temp-client-id'; // This should be handled by backend
      }

      // Transform form data to match backend validation schema exactly
      const transformedData = {
        serialNo: data.serialNo,
        date: new Date(data.date).toISOString(),
        client: clientId || {
          _id: data.client._id || '',
          name: data.client.name,
          nationalId: data.client.nationalId,
          phone: data.client.phone,
          village: data.client.village || '',
          detailedAddress: data.client.detailedAddress || '',
          birthDate: data.client.birthDate || '',
        },
        farmLocation: data.farmLocation,
        coordinates: data.coordinates && (data.coordinates.latitude || data.coordinates.longitude) ? {
          latitude: data.coordinates.latitude || 0,
          longitude: data.coordinates.longitude || 0,
        } : undefined,
        supervisor: data.supervisor,
        team: data.team,
        vehicleNo: data.vehicleNo,
        vaccineType: data.vaccineType,
        vaccineCategory: data.vaccineCategory,
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
          date: new Date(data.request.date).toISOString(),
          situation: data.request.situation,
          fulfillingDate: data.request.fulfillingDate ? new Date(data.request.fulfillingDate).toISOString() : undefined,
        },
        remarks: data.remarks || '',
        // Include client data for backend to handle client creation/update
        clientData: {
          name: data.client.name,
          nationalId: data.client.nationalId,
          phone: data.client.phone,
          village: data.client.village || '',
          detailedAddress: data.client.detailedAddress || '',
          birthDate: data.client.birthDate ? new Date(data.client.birthDate).toISOString() : undefined,
        },
      };

      if (item) {
        // Update existing item
        const updateId = item._id || item.serialNo;
        await vaccinationApi.update(updateId, transformedData);
        entityToasts.vaccination.update();
      } else {
        // Create new item
        await vaccinationApi.create(transformedData);
        entityToasts.vaccination.create();
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving vaccination record:", error);
      entityToasts.vaccination.error(item ? 'update' : 'create');
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
            value={form.watch(name) ? new Date(form.watch(name)) : undefined}
            onChange={(date) => {
              const dateString = date ? date.toISOString().split('T')[0] : '';
              form.setValue(name, dateString);
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
                          form.setValue("client.detailedAddress", client.detailedAddress || client.detailed_address || "");
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

                  {/* Client Detailed Address */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      العنوان التفصيلي
                    </label>
                    <Input
                      value={form.watch("client.detailedAddress") || ""}
                      onChange={(e) => form.setValue("client.detailedAddress", e.target.value)}
                      placeholder="العنوان التفصيلي"
                    />
                  </div>

                  {/* Client Birth Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      تاريخ الميلاد
                    </label>
                    <SimpleDatePicker
                      placeholder="اختر تاريخ الميلاد"
                      value={form.watch("client.birthDate") ? new Date(form.watch("client.birthDate")) : undefined}
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
                      onValueChange={(value) => {
                        form.setValue("supervisor", value);
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
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      موقع المزرعة *
                    </label>
                    <Input
                      value={form.watch("farmLocation") || ""}
                      onChange={(e) => {
                        form.setValue("farmLocation", e.target.value);
                        clearFieldError("farmLocation");
                      }}
                      placeholder="موقع المزرعة"
                      required
                      className={getFieldError("farmLocation") ? 'border-red-500' : ''}
                    />
                    {getFieldError("farmLocation") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("farmLocation")}</p>
                    )}
                  </div>

                  {/* Team */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      اسم الفريق *
                    </label>
                    <Input
                      value={form.watch("team") || ""}
                      onChange={(e) => {
                        form.setValue("team", e.target.value);
                        clearFieldError("team");
                      }}
                      placeholder="اسم الفريق"
                      required
                      className={getFieldError("team") ? 'border-red-500' : ''}
                    />
                    {getFieldError("team") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("team")}</p>
                    )}
                  </div>

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
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      نوع المصل *
                    </label>
                    <Select
                      value={form.watch("vaccineType") || ""}
                      onValueChange={(value) => {
                        form.setValue("vaccineType", value);
                        clearFieldError("vaccineType");
                      }}
                    >
                      <SelectTrigger className={getFieldError("vaccineType") ? 'border-red-500' : ''}>
                        <SelectValue placeholder="اختر نوع المصل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FMD">FMD</SelectItem>
                        <SelectItem value="PPR">PPR</SelectItem>
                        <SelectItem value="HS">HS</SelectItem>
                        <SelectItem value="CCPP">CCPP</SelectItem>
                        <SelectItem value="ET">ET</SelectItem>
                        <SelectItem value="No Vaccination">No Vaccination</SelectItem>
                        <SelectItem value="SG POX">SG POX</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError("vaccineType") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("vaccineType")}</p>
                    )}
                  </div>

                  {/* Vaccine Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      فئة المصل *
                    </label>
                    <Select
                      value={form.watch("vaccineCategory") || ""}
                      onValueChange={(value) => {
                        form.setValue("vaccineCategory", value);
                        clearFieldError("vaccineCategory");
                      }}
                    >
                      <SelectTrigger className={getFieldError("vaccineCategory") ? 'border-red-500' : ''}>
                        <SelectValue placeholder="اختر فئة المصل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventive">وقائي</SelectItem>
                        <SelectItem value="Emergency">طوارئ</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError("vaccineCategory") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("vaccineCategory")}</p>
                    )}
                  </div>

                  {/* Herd Health */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      حالة القطيع *
                    </label>
                    <Select
                      value={form.watch("herdHealth") || ""}
                      onValueChange={(value) => {
                        form.setValue("herdHealth", value);
                        clearFieldError("herdHealth");
                      }}
                    >
                      <SelectTrigger className={getFieldError("herdHealth") ? 'border-red-500' : ''}>
                        <SelectValue placeholder="اختر حالة القطيع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Healthy">صحي</SelectItem>
                        <SelectItem value="Sick">مريض</SelectItem>
                        <SelectItem value="Under Treatment">قيد العلاج</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError("herdHealth") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("herdHealth")}</p>
                    )}
                  </div>

                  {/* Animals Handling */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      معاملة الحيوانات *
                    </label>
                    <Select
                      value={form.watch("animalsHandling") || ""}
                      onValueChange={(value) => {
                        form.setValue("animalsHandling", value);
                        clearFieldError("animalsHandling");
                      }}
                    >
                      <SelectTrigger className={getFieldError("animalsHandling") ? 'border-red-500' : ''}>
                        <SelectValue placeholder="اختر معاملة الحيوانات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">سهلة</SelectItem>
                        <SelectItem value="Difficult">صعبة</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError("animalsHandling") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("animalsHandling")}</p>
                    )}
                  </div>

                  {/* Labours */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      حالة العمال *
                    </label>
                    <Select
                      value={form.watch("labours") || ""}
                      onValueChange={(value) => {
                        form.setValue("labours", value);
                        clearFieldError("labours");
                      }}
                    >
                      <SelectTrigger className={getFieldError("labours") ? 'border-red-500' : ''}>
                        <SelectValue placeholder="اختر حالة العمال" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">متوفر</SelectItem>
                        <SelectItem value="Not Available">غير متوفر</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError("labours") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("labours")}</p>
                    )}
                  </div>

                  {/* Reachable Location */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      سهولة الوصول للموقع *
                    </label>
                    <Select
                      value={form.watch("reachableLocation") || ""}
                      onValueChange={(value) => {
                        form.setValue("reachableLocation", value);
                        clearFieldError("reachableLocation");
                      }}
                    >
                      <SelectTrigger className={getFieldError("reachableLocation") ? 'border-red-500' : ''}>
                        <SelectValue placeholder="اختر سهولة الوصول للموقع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">سهل</SelectItem>
                        <SelectItem value="Hard to reach">صعب الوصول</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError("reachableLocation") && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("reachableLocation")}</p>
                    )}
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
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          حالة الطلب *
                        </label>
                        <Select
                          value={form.watch("request.situation") || ""}
                          onValueChange={(value) => {
                            form.setValue("request.situation", value);
                            clearFieldError("request.situation");
                          }}
                        >
                          <SelectTrigger className={getFieldError("request.situation") ? 'border-red-500' : ''}>
                            <SelectValue placeholder="اختر حالة الطلب" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">مفتوح</SelectItem>
                            <SelectItem value="Closed">مغلق</SelectItem>
                            <SelectItem value="Pending">معلق</SelectItem>
                          </SelectContent>
                        </Select>
                        {getFieldError("request.situation") && (
                          <p className="text-red-500 text-sm font-medium mt-1">{getFieldError("request.situation")}</p>
                        )}
                      </div>
                      
                      {form.watch("request.situation") === "Closed" && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            تاريخ الإنجاز
                          </label>
                          <SimpleDatePicker
                            placeholder="اختر تاريخ الإنجاز"
                            value={form.watch("request.fulfillingDate") ? new Date(form.watch("request.fulfillingDate")) : undefined}
                            onChange={(date) => {
                              const dateString = date ? date.toISOString().split('T')[0] : '';
                              form.setValue("request.fulfillingDate", dateString);
                            }}
                            minDate={form.watch("request.date") ? new Date(form.watch("request.date")) : undefined}
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
