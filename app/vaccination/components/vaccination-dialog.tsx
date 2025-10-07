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
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { SupervisorSelect } from "@/components/ui/supervisor-select";
import { CalendarIcon, Loader2, User, Heart, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vaccination } from "@/types";
import { vaccinationApi } from "@/lib/api/vaccination";
import { toast } from "sonner";

// Validation function for Saudi phone numbers
const validateSaudiPhone = (phone: string): boolean => {
  const saudiPhoneRegex = /^(\+966|966|05)[0-9]{8}$/;
  return saudiPhoneRegex.test(phone.replace(/\s/g, ''));
};

const formSchema = z.object({
  serialNo: z.string().min(1, { message: "يجب إدخال رقم السجل" }),
  date: z.string().min(1, { message: "يجب إدخال التاريخ" }),
  client: z.object({
    name: z.string().min(2, { message: "يجب إدخال اسم العميل (أكثر من حرفين)" }),
    nationalId: z.string().min(10, { message: "يجب إدخال رقم الهوية الوطنية (10 أرقام على الأقل)" }),
    phone: z.string().min(1, { message: "يجب إدخال رقم الهاتف" }).refine(
      (phone) => validateSaudiPhone(phone),
      { message: "رقم الهاتف غير صحيح. يجب أن يبدأ بـ +966 أو 05" }
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
        client: clientId, // Backend expects ObjectId string
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
        toast.success("تم تحديث سجل التحصين بنجاح");
      } else {
        // Create new item
        await vaccinationApi.create(transformedData);
        toast.success("تم إضافة سجل التحصين بنجاح");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving vaccination record:", error);
      toast.error(
        item
          ? "حدث خطأ أثناء تحديث سجل التحصين"
          : "حدث خطأ أثناء إضافة سجل التحصين"
      );
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
  ) => (
    <FormField
      control={form.control as any}
      name={name as any}
      render={({ field }) => (
        <FormItem className="mb-6 space-y-3">
          <FormLabel className="block text-sm font-semibold text-gray-800 mb-2">
            {label}
          </FormLabel>
          <FormControl>
            {type === "select" ? (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                dir="rtl"
              >
                <SelectTrigger className="w-full border-2 border-gray-400 focus:border-blue-500 transition-colors duration-200">
                  <SelectValue placeholder={`اختر ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "date" ? (
              <ModernDatePicker
                placeholder="اختر التاريخ"
                value={field.value}
                onChange={(date) => {
                  const dateString = date ? date.toISOString().split('T')[0] : '';
                  field.onChange(dateString);
                }}
                variant="modern"
                size="md"
                maxDate={new Date()}
                minDate={new Date(1900, 0, 1)}
              />
            ) : type === "checkbox" ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor={name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </label>
              </div>
            ) : (
              <Input
                type={type}
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  if (isNumber) {
                    field.onChange(Number(e.target.value) || 0);
                  } else {
                    field.onChange(e.target.value);
                  }
                }}
                className="w-full border-2 border-gray-400 focus:border-blue-500 transition-colors duration-200"
                dir="rtl"
              />
            )}
          </FormControl>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  );

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-400 pb-3">
                      معلومات العميل
                    </h3>
                    {renderFormField("client.name", "اسم العميل")}
                    {renderFormField("client.nationalId", "رقم الهوية الوطنية")}
                    {renderFormField("client.phone", "رقم الهاتف")}
                    {renderFormField("client.village", "القرية")}
                    {renderFormField("client.detailedAddress", "العنوان التفصيلي")}
                    <FormField
                      control={form.control}
                      name="client.birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الميلاد</FormLabel>
                          <FormControl>
                            <ModernDatePicker
                              placeholder="اختر تاريخ الميلاد"
                              value={field.value ? new Date(field.value) : undefined}
                              onChange={(date) => {
                                const dateString = date ? date.toISOString().split('T')[0] : '';
                                field.onChange(dateString);
                              }}
                              maxDate={new Date()}
                              minDate={new Date(1900, 0, 1)}
                              variant="modern"
                              size="md"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-400 pb-3">
                      معلومات التحصين
                    </h3>
                    <FormField
                      control={form.control}
                      name="serialNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم السجل</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input {...field} placeholder="رقم السجل" />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.onChange(generateSerialNo())}
                              className="whitespace-nowrap"
                            >
                              توليد تلقائي
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ التحصين</FormLabel>
                          <FormControl>
                            <ModernDatePicker
                              placeholder="اختر تاريخ التحصين"
                              value={field.value ? new Date(field.value) : undefined}
                              onChange={(date) => {
                                const dateString = date ? date.toISOString().split('T')[0] : '';
                                field.onChange(dateString);
                              }}
                              maxDate={new Date()}
                              variant="modern"
                              size="md"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supervisor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المشرف</FormLabel>
                          <FormControl>
                            <SupervisorSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="اختر المشرف"
                              section="تحصين"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {renderFormField("vehicleNo", "رقم المركبة")}
                    {renderFormField("farmLocation", "موقع المزرعة")}
                    {renderFormField("team", "اسم الفريق")}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderFormField("coordinates.latitude", "خط العرض", "number", undefined, true)}
                      {renderFormField("coordinates.longitude", "خط الطول", "number", undefined, true)}
                    </div>
                    {renderFormField(
                      "vaccineType",
                      "نوع المصل",
                      "select",
                      [
                        { value: "HS", label: "لقاح الحمى القلاعية (HS)" },
                        { value: "SG-Pox", label: "لقاح طاعون المجترات الصغيرة (SG-Pox)" },
                        { value: "ET", label: "لقاح الإسهال الوبائي (ET)" },
                        { value: "Brucella", label: "لقاح البروسيلا" },
                        { value: "Rabies", label: "لقاح السعار" },
                        { value: "Anthrax", label: "لقاح الجمرة الخبيثة" },
                      ]
                    )}
                    {renderFormField(
                      "vaccineCategory",
                      "فئة المصل",
                      "select",
                      [
                        { value: "Preventive", label: "وقائي" },
                        { value: "Emergency", label: "طوارئ" },
                      ]
                    )}
                    {renderFormField(
                      "herdHealth",
                      "حالة القطيع",
                      "select",
                      [
                        { value: "Healthy", label: "صحي" },
                        { value: "Sick", label: "مريض" },
                        { value: "Under Treatment", label: "قيد العلاج" },
                      ]
                    )}
                    {renderFormField(
                      "animalsHandling",
                      "معاملة الحيوانات",
                      "select",
                      [
                        { value: "Easy", label: "سهلة" },
                        { value: "Difficult", label: "صعبة" },
                      ]
                    )}
                    {renderFormField(
                      "labours",
                      "حالة العمال",
                      "select",
                      [
                        { value: "Available", label: "متوفر" },
                        { value: "Not Available", label: "غير متوفر" },
                      ]
                    )}
                    {renderFormField(
                      "reachableLocation",
                      "سهولة الوصول للموقع",
                      "select",
                      [
                        { value: "Easy", label: "سهل" },
                        { value: "Hard to reach", label: "صعب الوصول" },
                      ]
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="herd" className="tabs-content-modern">
                <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-400 pb-3">
                  تفاصيل القطيع
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                  {renderHerdInputs("sheep")}
                  {renderHerdInputs("goats")}
                  {renderHerdInputs("camel")}
                  {renderHerdInputs("cattle")}
                  {renderHerdInputs("horse")}
                </div>
              </TabsContent>

              <TabsContent value="request" className="tabs-content-modern">
                <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-400 pb-3">
                  معلومات الطلب
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="request.date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الطلب</FormLabel>
                          <FormControl>
                            <ModernDatePicker
                              placeholder="اختر تاريخ الطلب"
                              value={field.value ? new Date(field.value) : undefined}
                              onChange={(date) => {
                                const dateString = date ? date.toISOString().split('T')[0] : '';
                                field.onChange(dateString);
                              }}
                              maxDate={new Date()}
                              variant="modern"
                              size="md"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {renderFormField(
                      "request.situation",
                      "حالة الطلب",
                      "select",
                      [
                        { value: "Open", label: "مفتوح" },
                        { value: "Closed", label: "مغلق" },
                        { value: "Pending", label: "معلق" },
                      ]
                    )}
                    {form.watch("request.situation") === "Closed" && (
                      <FormField
                        control={form.control}
                        name="request.fulfillingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ الإنجاز</FormLabel>
                            <FormControl>
                              <ModernDatePicker
                                placeholder="اختر تاريخ الإنجاز"
                                value={field.value ? new Date(field.value) : undefined}
                                onChange={(date) => {
                                  const dateString = date ? date.toISOString().split('T')[0] : '';
                                  field.onChange(dateString);
                                }}
                                minDate={form.watch("request.date") ? new Date(form.watch("request.date")) : undefined}
                                variant="modern"
                                size="md"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    {renderFormField("category", "الفئة")}
                    <FormField
                      control={form.control as any}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الملاحظات</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[120px]"
                              dir="rtl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
