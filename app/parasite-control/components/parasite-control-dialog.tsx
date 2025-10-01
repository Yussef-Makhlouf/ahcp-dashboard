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
import { parasiteControlApi } from "@/lib/api/parasite-control";
import type { ParasiteControl } from "@/types";
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
  herd: z.object({
    sheep: z.object({
      total: z.number().min(0),
      young: z.number().min(0),
      female: z.number().min(0),
      treated: z.number().min(0),
    }),
    goats: z.object({
      total: z.number().min(0),
      young: z.number().min(0),
      female: z.number().min(0),
      treated: z.number().min(0),
    }),
    camel: z.object({
      total: z.number().min(0),
      young: z.number().min(0),
      female: z.number().min(0),
      treated: z.number().min(0),
    }),
    cattle: z.object({
      total: z.number().min(0),
      young: z.number().min(0),
      female: z.number().min(0),
      treated: z.number().min(0),
    }),
  }),
  insecticide: z.object({
    type: z.string().min(1, "نوع المبيد مطلوب"),
    method: z.string().min(1, "طريقة الرش مطلوبة"),
    volume_ml: z.number().min(0),
    status: z.enum(["Sprayed", "Not Sprayed"]),
  }),
  herdHealthStatus: z.enum(["Healthy", "Sick", "Under Treatment"]),
  complying: z.enum(["Comply", "Not Comply"]),
  request: z.object({
    date: z.string().min(1, "تاريخ الطلب مطلوب"),
    situation: z.enum(["Open", "Closed", "Pending"]),
    fulfillingDate: z.string().optional(),
  }),
  category: z.string().default("مكافحة الطفيليات"),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ParasiteControlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ParasiteControl | null;
  onSuccess: () => void;
}

export function ParasiteControlDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: ParasiteControlDialogProps) {
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
      herd: {
        sheep: { total: 0, young: 0, female: 0, treated: 0 },
        goats: { total: 0, young: 0, female: 0, treated: 0 },
        camel: { total: 0, young: 0, female: 0, treated: 0 },
        cattle: { total: 0, young: 0, female: 0, treated: 0 },
      },
      insecticide: {
        type: "",
        method: "Pour on",
        volume_ml: 0,
        status: "Not Sprayed",
      },
      herdHealthStatus: "Healthy",
      complying: "Comply",
      request: {
        date: new Date().toISOString().split("T")[0],
        situation: "Open",
        fulfillingDate: undefined,
      },
      category: "مكافحة الطفيليات",
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
        await parasiteControlApi.update(item.serialNo, data as any);
      } else {
        await parasiteControlApi.create(data as any);
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
            {item ? "تعديل سجل مكافحة الطفيليات" : "إضافة سجل مكافحة طفيليات جديد"}
          </DialogTitle>
          <DialogDescription>
            {item ? "قم بتعديل بيانات سجل مكافحة الطفيليات" : "أدخل بيانات سجل مكافحة الطفيليات الجديد"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form id="parasite-control-form" onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs defaultValue="basic" className="tabs-modern" dir="rtl">
                <TabsList className="tabs-list-modern">
                  <TabsTrigger value="basic" className="tabs-trigger-modern">
                    <User className="w-4 h-4 ml-2" />
                    البيانات الأساسية
                  </TabsTrigger>
                  <TabsTrigger value="owner" className="tabs-trigger-modern">
                    <Heart className="w-4 h-4 ml-2" />
                    بيانات المربي
                  </TabsTrigger>
                  <TabsTrigger value="herd" className="tabs-trigger-modern">
                    <Shield className="w-4 h-4 ml-2" />
                    القطيع
                  </TabsTrigger>
                  <TabsTrigger value="treatment" className="tabs-trigger-modern">
                    <Activity className="w-4 h-4 ml-2" />
                    المعالجة
                  </TabsTrigger>
                </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control as any}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التاريخ</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                          <Input placeholder="P1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الفئة</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="owner" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="owner.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المربي</FormLabel>
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
                </div>
              </TabsContent>

              <TabsContent value="herd" className="space-y-4">
                {["sheep", "goats", "camel", "cattle"].map((animal) => (
                  <div key={animal} className="space-y-2">
                    <h4 className="font-medium">
                      {animal === "sheep" && "الأغنام"}
                      {animal === "goats" && "الماعز"}
                      {animal === "camel" && "الإبل"}
                      {animal === "cattle" && "الأبقار"}
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {["total", "young", "female", "treated"].map((field) => (
                        <FormField
                          key={`${animal}.${field}`}
                          control={form.control as any}
                          name={`herd.${animal}.${field}` as any}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                {field === "total" && "الإجمالي"}
                                {field === "young" && "الصغار"}
                                {field === "female" && "الإناث"}
                                {field === "treated" && "المعالج"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...formField}
                                  onChange={(e) =>
                                    formField.onChange(parseInt(e.target.value) || 0)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="treatment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="insecticide.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع المبيد</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع المبيد" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cyperdip 10%">Cyperdip 10%</SelectItem>
                            <SelectItem value="Ultra-Pour 1%">Ultra-Pour 1%</SelectItem>
                            <SelectItem value="Deltamethrin 5%">Deltamethrin 5%</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="insecticide.method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>طريقة الرش</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر طريقة الرش" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pour on">Pour on</SelectItem>
                            <SelectItem value="Spray">Spray</SelectItem>
                            <SelectItem value="Injection">Injection</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="insecticide.volume_ml"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كمية المبيد (مل)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="insecticide.status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حالة الرش</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة الرش" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sprayed">تم الرش</SelectItem>
                            <SelectItem value="Not Sprayed">لم يتم الرش</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="herdHealthStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الحالة الصحية للقطيع</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الحالة الصحية" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Healthy">صحي</SelectItem>
                            <SelectItem value="Sick">مريض</SelectItem>
                            <SelectItem value="Under Treatment">تحت العلاج</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="complying"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الامتثال</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة الامتثال" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Comply">ممتثل</SelectItem>
                            <SelectItem value="Not Comply">غير ممتثل</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
            form="parasite-control-form"
            variant="default"
            leftIcon={<Activity className="w-4 h-4" />}
          >
            {item ? "تحديث" : "إضافة"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
