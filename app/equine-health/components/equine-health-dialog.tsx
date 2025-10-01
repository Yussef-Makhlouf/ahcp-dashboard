"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-400 shadow-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? "تعديل سجل صحة الخيول" : "إضافة سجل صحة خيول جديد"}
          </DialogTitle>
          <DialogDescription>
            قم بملء البيانات المطلوبة لإضافة أو تعديل سجل صحة الخيول
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full" dir="rtl">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6 bg-white/80 border-2 border-gray-300 rounded-lg p-1">
                <TabsTrigger value="basic" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium text-sm">البيانات الأساسية</TabsTrigger>
                <TabsTrigger value="owner" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium text-sm">بيانات المالك</TabsTrigger>
                <TabsTrigger value="medical" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium text-sm">المعلومات الطبية</TabsTrigger>
                <TabsTrigger value="request" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium text-sm">الطلب والمتابعة</TabsTrigger>
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

            <div className="flex justify-end gap-3 pt-4 border-t border-purple-200 bg-white/50 backdrop-blur-sm rounded-lg p-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="h-11 px-6 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-gray-800 transition-all duration-200 font-medium"
              >
                إلغاء
              </Button>
              <Button 
                type="submit"
                className="h-11 px-6 bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                {item ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
