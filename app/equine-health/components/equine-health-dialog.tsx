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
import { equineHealthApi } from "@/lib/api/equine-health";
import type { EquineHealth } from "@/types";
import { validateEgyptianPhone } from "@/lib/utils";
import { User, Heart, Shield, Activity } from "lucide-react";

const formSchema = z.object({
  date: z.string().min(1, "التاريخ مطلوب"),
  owner: z.object({
    name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
    id: z.string().min(1, "رقم الهوية مطلوب"),
    birthDate: z.string().min(1, "تاريخ الميلاد مطلوب"),
    phone: z.string().refine(validateEgyptianPhone, "رقم الهاتف غير صحيح"),
  }),
  location: z.object({
    e: z.number().nullable(),
    n: z.number().nullable(),
  }),
  supervisor: z.string().min(1, "اسم المشرف مطلوب"),
  vehicleNo: z.string().min(1, "رقم المركبة مطلوب"),
  horseCount: z.number().min(1, "عدد الخيول يجب أن يكون أكبر من صفر"),
  diagnosis: z.string().min(1, "التشخيص مطلوب"),
  interventionCategory: z.enum([
    "Clinical Examination",
    "Surgical Operation",
    "Ultrasonography",
    "Lab Analysis",
    "Farriery"
  ]),
  treatment: z.string().min(1, "العلاج مطلوب"),
  request: z.object({
    date: z.string().min(1, "تاريخ الطلب مطلوب"),
    situation: z.enum(["Open", "Closed", "Pending"]),
    fulfillingDate: z.string().optional(),
  }),
  category: z.string().default("Equine Health Service"),
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
      horseCount: 1,
      diagnosis: "",
      interventionCategory: "Clinical Examination",
      treatment: "",
      request: {
        date: new Date().toISOString().split("T")[0],
        situation: "Open",
        fulfillingDate: undefined,
      },
      category: "Equine Health Service",
      remarks: "",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset(item as any);
    }
  }, [item, form]);

  const onSubmit = async (data: any) => {
    try {
      if (item) {
        await equineHealthApi.update(item.serialNo, data as any);
      } else {
        await equineHealthApi.create(data as any);
      }
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2">
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
              <Tabs defaultValue="basic" className="tabs-modern" dir="rtl">
                <TabsList className="tabs-list-modern">
                  <TabsTrigger value="basic" className="tabs-trigger-modern">
                    <User className="w-4 h-4 ml-2" />
                    البيانات الأساسية
                  </TabsTrigger>
                  <TabsTrigger value="owner" className="tabs-trigger-modern">
                    <Heart className="w-4 h-4 ml-2" />
                    بيانات المالك
                  </TabsTrigger>
                  <TabsTrigger value="medical" className="tabs-trigger-modern">
                    <Shield className="w-4 h-4 ml-2" />
                    المعلومات الطبية
                  </TabsTrigger>
                  <TabsTrigger value="request" className="tabs-trigger-modern">
                    <Activity className="w-4 h-4 ml-2" />
                    الطلب والمتابعة
                  </TabsTrigger>
                </TabsList>

              <TabsContent value="basic" className="space-y-6 p-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control as any}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-800">التاريخ</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="border-2 border-gray-400 focus:border-purple-500 transition-colors duration-200" dir="rtl" />
                        </FormControl>
                        <FormMessage />
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
                          <Input placeholder="اسم المشرف" {...field} />
                        </FormControl>
                        <FormMessage />
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
                        <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="owner" className="space-y-4 p-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="owner.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المالك</FormLabel>
                        <FormControl>
                          <Input placeholder="الاسم الكامل" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="owner.id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهوية</FormLabel>
                        <FormControl>
                          <Input placeholder="رقم الهوية الوطنية" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="owner.birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الميلاد</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="owner.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="01012345678" dir="ltr" {...field} />
                        </FormControl>
                        <FormDescription>
                          رقم الموبايل المصري (يبدأ بـ 010، 011، 012، أو 015)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="location.e"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="location.n"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-4 p-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التشخيص</FormLabel>
                        <FormControl>
                          <Input placeholder="وصف التشخيص" {...field} />
                        </FormControl>
                        <FormMessage />
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
                            <SelectItem value="Clinical Examination">فحص سريري</SelectItem>
                            <SelectItem value="Surgical Operation">عملية جراحية</SelectItem>
                            <SelectItem value="Ultrasonography">موجات فوق صوتية</SelectItem>
                            <SelectItem value="Lab Analysis">تحليل مخبري</SelectItem>
                            <SelectItem value="Farriery">حداء وعلاج الحوافر</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
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
              </TabsContent>

              <TabsContent value="request" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="request.date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الطلب</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {form.watch("request.situation") === "Closed" && (
                  <FormField
                    control={form.control as any}
                    name="request.fulfillingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ إنجاز الطلب</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control as any}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات</FormLabel>
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
