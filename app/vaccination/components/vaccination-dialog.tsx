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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, User, Heart, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { vaccinationApi } from "@/lib/api/vaccination";
import type { Vaccination } from "@/types";

const formSchema = z.object({
  date: z.string().min(1, { message: "يجب إدخال التاريخ" }),
  owner: z.object({
    name: z.string().min(2, { message: "يجب إدخال اسم المالك" }),
    id: z.string().min(1, { message: "يجب إدخال رقم الهوية" }),
    birthDate: z.string().optional(),
    phone: z.string().min(1, { message: "يجب إدخال رقم الهاتف" }),
  }),
  location: z.object({
    e: z.union([z.number(), z.null()]).optional(),
    n: z.union([z.number(), z.null()]).optional(),
  }),
  supervisor: z.string().min(1, { message: "يجب إدخال اسم المشرف" }),
  vehicleNo: z.string().min(1, { message: "يجب إدخال رقم المركبة" }),
  vaccineType: z.string().min(1, { message: "يجب اختيار نوع المصل" }),
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
  animalsHandling: z.string().min(1, { message: "يجب اختيار معاملة الحيوانات" }),
  labours: z.number().min(0, { message: "يجب إدخال عدد العمال" }),
  reachableLocation: z.boolean().default(true),
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
      vaccineType: "",
      herd: {
        sheep: { total: 0, young: 0, female: 0, vaccinated: 0 },
        goats: { total: 0, young: 0, female: 0, vaccinated: 0 },
        camel: { total: 0, young: 0, female: 0, vaccinated: 0 },
        cattle: { total: 0, young: 0, female: 0, vaccinated: 0 },
      },
      herdHealth: "Healthy",
      animalsHandling: "Good",
      labours: 1,
      reachableLocation: true,
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
          request: {
            ...item.request,
            date: item.request.date.split("T")[0],
            fulfillingDate: item.request.fulfillingDate 
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

      if (item) {
        // Update existing item
        await vaccinationApi.update(item.serialNo, data);
        toast.success("تم تحديث سجل التحصين بنجاح");
      } else {
        // Create new item
        await vaccinationApi.create(data);
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
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-right font-normal border-2 border-gray-400 focus:border-blue-500 transition-colors duration-200",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "yyyy-MM-dd")
                      ) : (
                        <span>اختر تاريخًا</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date.toISOString().split("T")[0]);
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={arEG}
                  />
                </PopoverContent>
              </Popover>
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2">
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
                <TabsList className="tabs-list-modern">
                  <TabsTrigger value="info" className="tabs-trigger-modern">
                    <User className="w-4 h-4 ml-2" />
                    المعلومات الأساسية
                  </TabsTrigger>
                  <TabsTrigger value="herd" className="tabs-trigger-modern">
                    <Heart className="w-4 h-4 ml-2" />
                    تفاصيل القطيع
                  </TabsTrigger>
                  <TabsTrigger value="request" className="tabs-trigger-modern">
                    <Shield className="w-4 h-4 ml-2" />
                    معلومات الطلب
                  </TabsTrigger>
                </TabsList>

              <TabsContent value="info" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    {renderFormField(
                      "vaccineType",
                      "نوع المصل",
                      "select",
                      [
                        { value: "FMD Vaccine", label: "لقاح الحمى القلاعية" },
                        { value: "PPR Vaccine", label: "لقاح طاعون المجترات الصغيرة" },
                        { value: "Brucella Vaccine", label: "لقاح البروسيلا" },
                        { value: "Rabies Vaccine", label: "لقاح السعار" },
                        { value: "Anthrax Vaccine", label: "لقاح الجمرة الخبيثة" },
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
                        { value: "Good", label: "جيدة" },
                        { value: "Fair", label: "متوسطة" },
                        { value: "Poor", label: "سيئة" },
                      ]
                    )}
                    {renderFormField("labours", "عدد العمال", "number", undefined, true)}
                    {renderFormField(
                      "reachableLocation",
                      "الموقع قابل للوصول",
                      "checkbox"
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="herd" className="space-y-8">
                <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-400 pb-3">
                  تفاصيل القطيع
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {renderHerdInputs("sheep")}
                  {renderHerdInputs("goats")}
                  {renderHerdInputs("camel")}
                  {renderHerdInputs("cattle")}
                </div>
              </TabsContent>

              <TabsContent value="request" className="space-y-6">
                <h3 className="text-xl font-semibold text-blue-700 border-b-2 border-blue-400 pb-3">
                  معلومات الطلب
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
