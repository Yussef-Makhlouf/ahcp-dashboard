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
  date: z.string().min(1, { message: "يجب إدخال التاريخ" }),
  owner: z.object({
    name: z.string().min(2, { message: "يجب إدخال اسم المالك (أكثر من حرفين)" }),
    id: z.string().min(3, { message: "يجب إدخال رقم الهوية (أكثر من 3 أحرف)" }),
    birthDate: z.string().optional(),
    phone: z.string().min(1, { message: "يجب إدخال رقم الهاتف" }).refine(
      (phone) => validateSaudiPhone(phone),
      { message: "رقم الهاتف غير صحيح. يجب أن يبدأ بـ +966 أو 05" }
    ),
  }),
  location: z.object({
    e: z.union([z.number(), z.null()]).optional(),
    n: z.union([z.number(), z.null()]).optional(),
  }),
  supervisor: z.string().min(2, { message: "يجب إدخال اسم المشرف (أكثر من حرفين)" }),
  vehicleNo: z.string().min(1, { message: "يجب إدخال رقم المركبة" }),
  // New fields from database schema
  farmLocation: z.string().min(1, { message: "يجب إدخال موقع المزرعة" }),
  team: z.string().min(1, { message: "يجب إدخال اسم الفريق" }),
  vaccineType: z.string().min(1, { message: "يجب اختيار نوع المصل" }),
  vaccineCategory: z.string().min(1, { message: "يجب اختيار فئة المصل" }),
  herd: z.object({
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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      owner: {
        name: "",
        id: "",
        birthDate: "",
        phone: "",
      },
      location: { e: null, n: null },
      supervisor: "",
      vehicleNo: "",
      // New fields from database schema
      farmLocation: "",
      team: "",
      vaccineType: "",
      vaccineCategory: "",
      herd: {
        sheep: { total: 0, young: 0, female: 0, vaccinated: 0 },
        goats: { total: 0, young: 0, female: 0, vaccinated: 0 },
        camel: { total: 0, young: 0, female: 0, vaccinated: 0 },
        cattle: { total: 0, young: 0, female: 0, vaccinated: 0 },
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
          date: item.date.split("T")[0],
          // Map new structure to old form structure for compatibility
          owner: item.client ? {
            name: item.client.name || '',
            id: item.client.nationalId || '',
            birthDate: item.client.birthDate ? item.client.birthDate.split("T")[0] : '',
            phone: item.client.phone || '',
          } : (item.owner ? {
            name: item.owner.name || '',
            id: item.owner.id || '',
            birthDate: item.owner.birthDate ? item.owner.birthDate.split("T")[0] : '',
            phone: item.owner.phone || '',
          } : {
            name: '',
            id: '',
            birthDate: '',
            phone: '',
          }),
          location: item.coordinates ? {
            e: item.coordinates.longitude,
            n: item.coordinates.latitude,
          } : (item.location || { e: null, n: null }),
          herd: item.herdCounts ? {
            sheep: item.herdCounts.sheep || { total: 0, young: 0, female: 0, vaccinated: 0 },
            goats: item.herdCounts.goats || { total: 0, young: 0, female: 0, vaccinated: 0 },
            camel: item.herdCounts.camel || { total: 0, young: 0, female: 0, vaccinated: 0 },
            cattle: item.herdCounts.cattle || { total: 0, young: 0, female: 0, vaccinated: 0 },
          } : (item.herd || {
            sheep: { total: 0, young: 0, female: 0, vaccinated: 0 },
            goats: { total: 0, young: 0, female: 0, vaccinated: 0 },
            camel: { total: 0, young: 0, female: 0, vaccinated: 0 },
            cattle: { total: 0, young: 0, female: 0, vaccinated: 0 },
          }),
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
          ...form.getValues(),
          date: new Date().toISOString().split("T")[0],
          request: {
            date: new Date().toISOString().split("T")[0],
            situation: "Open",
            fulfillingDate: undefined,
          },
        });
      }
    }
  }, [item, open, form]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Transform form data to match backend structure
      const transformedData = {
        ...data,
        // Convert owner to client structure
        client: {
          name: data.owner?.name || '',
          nationalId: data.owner?.id || '',
          phone: data.owner?.phone || '',
          village: '', // Not available in form
          detailedAddress: '', // Not available in form
          birthDate: data.owner?.birthDate || '',
        },
        // Convert location to coordinates
        coordinates: data.location ? {
          longitude: data.location.e || 0,
          latitude: data.location.n || 0,
        } : undefined,
        // Convert herd to herdCounts
        herdCounts: data.herd ? {
          sheep: data.herd.sheep || { total: 0, young: 0, female: 0, vaccinated: 0 },
          goats: data.herd.goats || { total: 0, young: 0, female: 0, vaccinated: 0 },
          camel: data.herd.camel || { total: 0, young: 0, female: 0, vaccinated: 0 },
          cattle: data.herd.cattle || { total: 0, young: 0, female: 0, vaccinated: 0 },
          horse: { total: 0, young: 0, female: 0, vaccinated: 0 }, // Default
        } : undefined,
        // Remove old structure fields
        owner: undefined,
        location: undefined,
        herd: undefined,
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
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {renderFormField(
          `herd.${animal}.total`,
          "العدد الكلي",
          "number",
          undefined,
          true
        )}
        {renderFormField(
          `herd.${animal}.young`,
          "عدد الصغار",
          "number",
          undefined,
          true
        )}
        {renderFormField(
          `herd.${animal}.female`,
          "عدد الإناث",
          "number",
          undefined,
          true
        )}
        {renderFormField(
          `herd.${animal}.vaccinated`,
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
                      معلومات المالك
                    </h3>
                    {renderFormField("owner.name", "اسم المالك")}
                    {renderFormField("owner.id", "رقم الهوية")}
                    {renderFormField("owner.phone", "رقم الهاتف")}
                    {renderFormField("owner.birthDate", "تاريخ الميلاد", "date")}
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-400 pb-3">
                      معلومات التحصين
                    </h3>
                    {renderFormField("date", "تاريخ التحصين", "date")}
                    {renderFormField("supervisor", "اسم المشرف")}
                    {renderFormField("vehicleNo", "رقم المركبة")}
                    {renderFormField("farmLocation", "موقع المزرعة")}
                    {renderFormField("team", "اسم الفريق")}
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
                </div>
              </TabsContent>

              <TabsContent value="request" className="tabs-content-modern">
                <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-400 pb-3">
                  معلومات الطلب
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                  <div className="space-y-4">
                    {renderFormField("request.date", "تاريخ الطلب", "date")}
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
                    {form.watch("request.situation") === "Closed" &&
                      renderFormField(
                        "request.fulfillingDate",
                        "تاريخ الإنجاز",
                        "date"
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
