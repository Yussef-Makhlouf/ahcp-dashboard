"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button, LoadingButton } from "@/components/ui/button-modern";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMobileTabs } from "@/components/ui/mobile-tabs";
import { equineHealthApi } from "@/lib/api/equine-health";
import type { EquineHealth } from "@/types";
import { validateEgyptianPhone, validateSaudiPhone, validatePhoneNumber, validateNationalId } from "@/lib/utils";
import { User, Heart, Shield, Activity } from "lucide-react";
import { useState } from "react";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { SupervisorSelect } from "@/components/ui/supervisor-select";
import { entityToasts } from "@/lib/utils/toast-utils";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedSelect } from "@/components/ui/validated-select";
import { ValidatedTextarea } from "@/components/ui/validated-textarea";

const formSchema = z.object({
  serialNo: z.string().min(1, "رقم السجل مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
  client: z.object({
    name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
    nationalId: z.string().min(3, "رقم الهوية يجب أن يكون أكثر من 3 أحرف").refine(
      (nationalId) => validateNationalId(nationalId),
      { message: "رقم الهوية يجب أن يكون بين 10-14 رقم فقط" }
    ),
    phone: z.string().refine(validatePhoneNumber, "رقم الهاتف غير صحيح. يجب أن يكون بين 10-15 رقم"),
    village: z.string().optional(),
    detailedAddress: z.string().optional(),
  }),
  farmLocation: z.string().min(1, "موقع المزرعة مطلوب"),
  coordinates: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  supervisor: z.string().min(2, "اسم المشرف يجب أن يكون أكثر من حرفين"),
  vehicleNo: z.string().min(1, "رقم المركبة مطلوب"),
  horseCount: z.number().min(1, "عدد الخيول يجب أن يكون أكبر من صفر"),
  diagnosis: z.string().min(3, "التشخيص يجب أن يكون أكثر من 3 أحرف"),
  interventionCategory: z.enum([
    "Emergency",
    "Routine", 
    "Preventive",
    "Follow-up",
    "Breeding",
    "Performance"
  ]),
  treatment: z.string().min(3, "العلاج يجب أن يكون أكثر من 3 أحرف"),
  request: z.object({
    date: z.string().min(1, "تاريخ الطلب مطلوب"),
    situation: z.enum(["Open", "Closed", "Pending"]),
    fulfillingDate: z.string().optional(),
  }),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EquineHealthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: EquineHealth | null;
  onSuccess: () => void;
}

export function EquineHealthDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: EquineHealthDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");

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
      },
      farmLocation: "",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      supervisor: "",
      vehicleNo: "",
      horseCount: 1,
      diagnosis: "",
      interventionCategory: "Routine",
      treatment: "",
      request: {
        date: new Date().toISOString().split("T")[0],
        situation: "Open",
        fulfillingDate: "",
      },
      remarks: "",
    },
  });

  useEffect(() => {
    if (item) {
      // Ensure all values are defined to prevent uncontrolled to controlled input changes
      const safeItem = {
        serialNo: item.serialNo || "",
        date: item.date || new Date().toISOString().split("T")[0],
        client: {
          name: item.client?.name || "",
          nationalId: item.client?.nationalId || "",
          phone: item.client?.phone || "",
          village: item.client?.village || "",
          detailedAddress: item.client?.detailedAddress || "",
        },
        farmLocation: item.farmLocation || "",
        coordinates: {
          latitude: item.coordinates?.latitude || 0,
          longitude: item.coordinates?.longitude || 0,
        },
        supervisor: item.supervisor || "",
        vehicleNo: item.vehicleNo || "",
        horseCount: item.horseCount || 1,
        diagnosis: item.diagnosis || "",
        interventionCategory: item.interventionCategory || "Routine",
        treatment: item.treatment || "",
        request: {
          date: item.request?.date || new Date().toISOString().split("T")[0],
          situation: item.request?.situation || "Open",
          fulfillingDate: item.request?.fulfillingDate || "",
        },
        remarks: item.remarks || "",
      };
      form.reset(safeItem);
    }
  }, [item, form]);

  const onSubmit = async (data: FormData) => {
    try {
      // تحويل البيانات إلى الشكل المطلوب من الباك إند
      const apiData = {
        serialNo: data.serialNo,
        date: data.date,
        client: data.client,
        farmLocation: data.farmLocation,
        coordinates: data.coordinates,
        supervisor: data.supervisor,
        vehicleNo: data.vehicleNo,
        horseCount: data.horseCount,
        diagnosis: data.diagnosis,
        interventionCategory: data.interventionCategory,
        treatment: data.treatment,
        request: {
          date: data.request.date,
          situation: data.request.situation,
          fulfillingDate: data.request.fulfillingDate || undefined,
        },
        remarks: data.remarks || "",
      };

      if (item) {
        await equineHealthApi.update(item.serialNo, apiData);
        entityToasts.equineHealth.update();
      } else {
        await equineHealthApi.create(apiData);
        entityToasts.equineHealth.create();
      }
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Error saving data:", error);
      entityToasts.equineHealth.error(item ? 'update' : 'create');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 lg:p-6">
        <DialogHeader>
          <DialogTitle>
            {item ? "تعديل سجل صحة الخيول" : "إضافة سجل صحة خيول جديد"}
          </DialogTitle>
          <DialogDescription>
            {item ? "قم بتعديل بيانات سجل صحة الخيول" : "أدخل بيانات سجل صحة الخيول الجديد"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form id="equine-health-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                      value: "owner",
                      label: "بيانات المالك",
                      shortLabel: "مالك",
                      icon: <Heart className="w-4 h-4" />
                    },
                    {
                      value: "medical",
                      label: "المعلومات الطبية",
                      shortLabel: "طبية",
                      icon: <Shield className="w-4 h-4" />
                    },
                    {
                      value: "request",
                      label: "الطلب والمتابعة",
                      shortLabel: "طلب",
                      icon: <Activity className="w-4 h-4" />
                    }
                  ]}
                />

              <TabsContent value="basic" className="tabs-content-modern">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
                  <FormField
                    control={form.control as any}
                    name="serialNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم السجل</FormLabel>
                        <FormControl>
                          <Input placeholder="EH001" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <ModernDatePicker
                            label="التاريخ"
                            placeholder="اختر التاريخ"
                            value={field.value}
                            onChange={(date) => {
                              const dateString = date ? date.toISOString().split('T')[0] : '';
                              field.onChange(dateString);
                            }}
                            required
                            variant="modern"
                            size="md"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="supervisor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المشرف</FormLabel>
                        <FormControl>
                          <SupervisorSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="اختر المشرف"
                            section="صحة الخيول"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="vehicleNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم المركبة</FormLabel>
                        <FormControl>
                          <Input placeholder="VET001" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="horseCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد الخيول</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="farmLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>موقع المزرعة</FormLabel>
                        <FormControl>
                          <Input placeholder="موقع المزرعة" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="owner" className="tabs-content-modern">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="client.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المالك</FormLabel>
                        <FormControl>
                          <Input placeholder="الاسم الكامل" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="client.nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهوية</FormLabel>
                        <FormControl>
                          <Input placeholder="رقم الهوية الوطنية" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="client.village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>القرية/المدينة</FormLabel>
                        <FormControl>
                          <Input placeholder="القرية أو المدينة" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="client.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="+966501234567 أو 0501234567" dir="ltr" {...field} />
                        </FormControl>
                        <FormDescription>
                          رقم الموبايل السعودي (يبدأ بـ +966 أو 05)
                        </FormDescription>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control as any}
                    name="client.detailedAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان التفصيلي</FormLabel>
                        <FormControl>
                          <Textarea placeholder="العنوان التفصيلي للمزرعة" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="coordinates.longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>خط الطول (E)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            placeholder="31.2357"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="coordinates.latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>خط العرض (N)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            placeholder="30.0444"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="medical" className="tabs-content-modern">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التشخيص</FormLabel>
                        <FormControl>
                          <Input placeholder="وصف التشخيص" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="interventionCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فئة التدخل</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر فئة التدخل" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Emergency">طوارئ</SelectItem>
                            <SelectItem value="Routine">روتيني</SelectItem>
                            <SelectItem value="Preventive">وقائي</SelectItem>
                            <SelectItem value="Follow-up">متابعة</SelectItem>
                            <SelectItem value="Breeding">تربية</SelectItem>
                            <SelectItem value="Performance">أداء</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as any}
                  name="treatment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العلاج المقدم</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="وصف العلاج والإجراءات الطبية..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات إضافية</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أي ملاحظات إضافية..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="request" className="tabs-content-modern">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="request.date"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <ModernDatePicker
                            label="تاريخ الطلب"
                            placeholder="اختر تاريخ الطلب"
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => {
                              const dateString = date ? date.toISOString().split('T')[0] : '';
                              field.onChange(dateString);
                            }}
                            required
                            variant="modern"
                            size="md"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="request.situation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حالة الطلب</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة الطلب" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Open">مفتوح</SelectItem>
                            <SelectItem value="Closed">مغلق</SelectItem>
                            <SelectItem value="Pending">معلق</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
                {form.watch("request.situation") === "Closed" && (
                  <FormField
                    control={form.control as any}
                    name="request.fulfillingDate"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <ModernDatePicker
                            label="تاريخ إنجاز الطلب"
                            placeholder="اختر تاريخ إنجاز الطلب"
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => {
                              const dateString = date ? date.toISOString().split('T')[0] : '';
                              field.onChange(dateString);
                            }}
                            required
                            variant="modern"
                            size="md"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                )}
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
          >
            إلغاء
          </Button>
          <LoadingButton 
            type="submit"
            form="equine-health-form"
            variant="default"
            leftIcon={<Shield className="w-4 h-4" />}
          >
            {item ? "تحديث" : "إضافة"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
