"use client";

import { useEffect, useState } from "react";
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
import { parasiteControlApi } from "@/lib/api/parasite-control";
import type { ParasiteControl } from "@/types";
import { validateEgyptianPhone, validateSaudiPhone } from "@/lib/utils";
import { User, Heart, Shield, Activity } from "lucide-react";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { SupervisorSelect } from "@/components/ui/supervisor-select";
import { toast } from "sonner";

const formSchema = z.object({
  serialNo: z.string().min(1, "رقم السجل مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
  client: z.object({
    name: z.string().min(1, "اسم العميل مطلوب"),
    nationalId: z.string().min(1, "رقم الهوية مطلوب"),
    phone: z.string().min(1, "رقم الهاتف مطلوب"),
    village: z.string().default(""),
    detailedAddress: z.string().default(""),
  }),
  herdLocation: z.string().min(1, "موقع القطيع مطلوب"),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90).default(0),
    longitude: z.number().min(-180).max(180).default(0),
  }).optional(),
  supervisor: z.string().min(2, "اسم المشرف يجب أن يكون أكثر من حرفين"),
  vehicleNo: z.string().min(1, "رقم المركبة مطلوب"),
  herdCounts: z.object({
    sheep: z.object({
      total: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      young: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      female: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      treated: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
    }),
    goats: z.object({
      total: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      young: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      female: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      treated: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
    }),
    camel: z.object({
      total: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      young: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      female: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      treated: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
    }),
    cattle: z.object({
      total: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      young: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      female: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      treated: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
    }),
    horse: z.object({
      total: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      young: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      female: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
      treated: z.number().min(0, "يجب أن يكون الرقم أكبر من أو يساوي 0"),
    }),
  }),
  insecticide: z.object({
    type: z.string().min(1, "نوع المبيد مطلوب").default(""),
    method: z.string().min(1, "طريقة الرش مطلوبة").default("Pour on"),
    volumeMl: z.number().min(1, "يجب أن تكون الكمية أكبر من 0").default(100),
    status: z.enum(["Sprayed", "Not Sprayed"]).default("Not Sprayed"),
    category: z.string().min(1, "فئة المبيد مطلوبة").default("Pour-on"),
  }),
  animalBarnSizeSqM: z.number().min(0, "يجب أن يكون الحجم أكبر من أو يساوي 0").default(0),
  breedingSites: z.string().default("غير محدد"),
  parasiteControlVolume: z.number().min(0, "يجب أن تكون الكمية أكبر من أو تساوي 0").default(0),
  parasiteControlStatus: z.string().min(1, "حالة مكافحة الطفيليات مطلوبة").default("مكتمل"),
  herdHealthStatus: z.enum(["Healthy", "Sick", "Under Treatment"]).default("Healthy"),
  complyingToInstructions: z.boolean().default(true),
  request: z.object({
    date: z.string().min(1, "تاريخ الطلب مطلوب").default(() => new Date().toISOString().split('T')[0]),
    situation: z.enum(["Open", "Closed", "Pending"]).default("Open"),
    fulfillingDate: z.string().optional(),
  }).default(() => ({
    date: new Date().toISOString().split('T')[0],
    situation: "Open" as const,
    fulfillingDate: undefined,
  })),
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
  const [activeTab, setActiveTab] = useState("basic");
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serialNo: `PC${Date.now().toString().slice(-6)}`, // توليد رقم تلقائي
      date: new Date().toISOString().split("T")[0],
      client: {
        name: "",
        nationalId: "",
        phone: "",
        village: "",
        detailedAddress: "",
      },
      herdLocation: "",
      coordinates: { latitude: 0, longitude: 0 },
      supervisor: "أحمد سالم",
      vehicleNo: "",
      herdCounts: {
        sheep: { total: 0, young: 0, female: 0, treated: 0 },
        goats: { total: 0, young: 0, female: 0, treated: 0 },
        camel: { total: 0, young: 0, female: 0, treated: 0 },
        cattle: { total: 0, young: 0, female: 0, treated: 0 },
        horse: { total: 0, young: 0, female: 0, treated: 0 },
      },
      insecticide: {
        type: "Ivermectin",
        method: "Pour on",
        volumeMl: 100, // قيمة افتراضية أكبر
        status: "Not Sprayed",
        category: "Pour-on",
      },
      animalBarnSizeSqM: 0,
      breedingSites: "غير محدد",
      parasiteControlVolume: 0,
      parasiteControlStatus: "مكتمل",
      herdHealthStatus: "Healthy",
      complyingToInstructions: true,
      request: {
        date: new Date().toISOString().split("T")[0],
        situation: "Open",
        fulfillingDate: undefined,
      },
      remarks: "",
    },
  });

  useEffect(() => {
    if (item) {
      // Transform backend data to form format
      const formData = {
        serialNo: item.serialNo || '',
        date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
        client: {
          name: typeof item.client === 'object' ? item.client?.name || '' : '',
          nationalId: typeof item.client === 'object' ? item.client?.nationalId || '' : '',
          phone: typeof item.client === 'object' ? item.client?.phone || '' : '',
          village: typeof item.client === 'object' ? item.client?.village || '' : '',
          detailedAddress: typeof item.client === 'object' ? item.client?.detailedAddress || '' : '',
        },
        herdLocation: item.herdLocation || '',
        coordinates: {
          latitude: item.coordinates?.latitude || 0,
          longitude: item.coordinates?.longitude || 0,
        },
        supervisor: item.supervisor || 'أحمد سالم',
        vehicleNo: item.vehicleNo || '',
        herdCounts: {
          sheep: item.herdCounts?.sheep || { total: 0, young: 0, female: 0, treated: 0 },
          goats: item.herdCounts?.goats || { total: 0, young: 0, female: 0, treated: 0 },
          camel: item.herdCounts?.camel || { total: 0, young: 0, female: 0, treated: 0 },
          cattle: item.herdCounts?.cattle || { total: 0, young: 0, female: 0, treated: 0 },
          horse: item.herdCounts?.horse || { total: 0, young: 0, female: 0, treated: 0 },
        },
        insecticide: {
          type: item.insecticide?.type || '',
          method: item.insecticide?.method || 'Pour on',
          volumeMl: item.insecticide?.volumeMl || 0,
          status: item.insecticide?.status || 'Not Sprayed',
          category: item.insecticide?.category || 'Pour-on',
        },
        animalBarnSizeSqM: item.animalBarnSizeSqM || 0,
        breedingSites: (() => {
          if (typeof item.breedingSites === 'string') {
            return item.breedingSites;
          } else if (Array.isArray(item.breedingSites)) {
            // If it's an array, extract meaningful information
            const sites = (item.breedingSites as any[]).map((site: any) => {
              if (typeof site === 'string' && site.trim()) return site;
              
              const parts = [];
              if (site.type && site.type !== 'Not Available' && site.type.trim()) {
                parts.push(site.type);
              }
              if (site.area && site.area > 0) {
                parts.push(`المساحة: ${site.area} م²`);
              }
              if (site.treatment && site.treatment.trim()) {
                parts.push(`المعالجة: ${site.treatment}`);
              }
              
              return parts.length > 0 ? parts.join(' - ') : null;
            }).filter(Boolean);
            
            return sites.length > 0 ? sites.join(' | ') : 'غير محدد';
          } else if (typeof item.breedingSites === 'object' && item.breedingSites !== null) {
            // If it's an object, try to extract meaningful text
            const obj = item.breedingSites as any;
            if (obj.description) return obj.description;
            if (obj.name) return obj.name;
            if (obj.text) return obj.text;
            if (obj.type && obj.type !== 'Not Available') return obj.type;
            if (obj.area && obj.area > 0) return `منطقة: ${obj.area} م²`;
            if (obj.treatment && obj.treatment.trim()) return `معالجة: ${obj.treatment}`;
            // Otherwise convert to JSON string
            return JSON.stringify(item.breedingSites);
          } else {
            return 'غير محدد';
          }
        })(),
        parasiteControlVolume: item.parasiteControlVolume || 0,
        parasiteControlStatus: item.parasiteControlStatus || 'مكتمل',
        herdHealthStatus: item.herdHealthStatus || 'Healthy',
        complyingToInstructions: item.complyingToInstructions !== undefined ? item.complyingToInstructions : true,
        request: {
          date: item.request?.date ? item.request.date.split('T')[0] : new Date().toISOString().split('T')[0],
          situation: item.request?.situation || 'Open',
          fulfillingDate: item.request?.fulfillingDate ? item.request.fulfillingDate.split('T')[0] : undefined,
        },
        remarks: item.remarks || '',
      };
      
      console.log('📝 Loading form data for edit:', formData);
      console.log('🔍 breedingSites data type and value:', {
        type: typeof item.breedingSites,
        value: item.breedingSites,
        processed: formData.breedingSites
      });
      form.reset(formData);
    } else {
      // Reset to default values for new record
      form.reset({
        serialNo: '',
        date: new Date().toISOString().split('T')[0],
        client: {
          name: '',
          nationalId: '',
          phone: '',
          village: '',
          detailedAddress: '',
        },
        herdLocation: '',
        coordinates: { latitude: 0, longitude: 0 },
        supervisor: 'أحمد سالم',
        vehicleNo: '',
        herdCounts: {
          sheep: { total: 0, young: 0, female: 0, treated: 0 },
          goats: { total: 0, young: 0, female: 0, treated: 0 },
          camel: { total: 0, young: 0, female: 0, treated: 0 },
          cattle: { total: 0, young: 0, female: 0, treated: 0 },
          horse: { total: 0, young: 0, female: 0, treated: 0 },
        },
      
        insecticide: {
          type: '',
          method: 'Pour on',
          volumeMl: 100, // قيمة افتراضية أكبر
          status: 'Not Sprayed',
          category: 'Pour-on',
        },
        animalBarnSizeSqM: 0,
        breedingSites: 'غير محدد',
        parasiteControlVolume: 0,
        parasiteControlStatus: 'مكتمل',
        herdHealthStatus: 'Healthy',
        complyingToInstructions: true,
        request: {
          date: new Date().toISOString().split('T')[0],
          situation: 'Open',
          fulfillingDate: undefined,
        },
        remarks: '',
      });
    }
  }, [item, form]);

  const onSubmit = async (data: FormData) => {
    console.log('🚀 onSubmit function called!');
    console.log('📝 Form data received:', data);
    
    try {
      console.log('📝 Form data before transformation:', data);
      console.log('🔍 Client data details:', {
        client: data.client,
        isString: typeof data.client === 'string',
        clientValue: data.client
      }); 
      
      // تحقق من وجود اسم العميل
      if (!data.client?.name?.trim()) {
        console.error('❌ Missing client name:', data.client);
        toast.error('يرجى إدخال اسم العميل');
        setActiveTab('client');
        return;
      }
      
      // تحقق من وجود البيانات المطلوبة الأخرى
      if (!data.serialNo?.trim()) {
        toast.error('يرجى ملء رقم السجل');
        setActiveTab('basic');
        return;
      }
      
      if (!data.herdLocation?.trim()) {
        toast.error('يرجى ملء موقع القطيع');
        setActiveTab('basic');
        return;
      }
      
      if (!data.supervisor?.trim()) {
        toast.error('يرجى ملء اسم المشرف');
        setActiveTab('basic');
        return;
      }
      
      if (!data.vehicleNo?.trim()) {
        toast.error('يرجى ملء رقم المركبة');
        setActiveTab('basic');
        return;
      }
      
      // تحقق من بيانات المبيد المطلوبة
      if (!data.insecticide?.type?.trim()) {
        toast.error('يرجى ملء نوع المبيد');
        setActiveTab('treatment');
        return;
      }
      
      if (!data.insecticide?.method?.trim()) {
        toast.error('يرجى ملء طريقة الرش');
        setActiveTab('treatment');
        return;
      }
      
      if (!data.insecticide?.category?.trim()) {
        toast.error('يرجى ملء فئة المبيد');
        setActiveTab('treatment');
        return;
      }
      
      if (!data.insecticide?.volumeMl || Number(data.insecticide.volumeMl) <= 0) {
        console.error('❌ Invalid volumeMl:', data.insecticide?.volumeMl);
        toast.error('يرجى ملء كمية المبيد (يجب أن تكون أكبر من 0)');
        setActiveTab('treatment');
        return;
      }
      
      // إرسال البيانات بالشكل المطلوب تماماً من الباك إند
      const backendData = {
        serialNo: data.serialNo,
        date: data.date,
        client: {
          name: data.client.name.trim(),
          nationalId: data.client.nationalId.trim(),
          phone: data.client.phone.trim(),
          village: data.client.village || '',
          detailedAddress: data.client.detailedAddress || '',
        },
        herdLocation: data.herdLocation,
        coordinates: {
          latitude: Number(data.coordinates?.latitude) || 0,
          longitude: Number(data.coordinates?.longitude) || 0,
        },
        supervisor: data.supervisor,
        vehicleNo: data.vehicleNo,
        herdCounts: {
          sheep: {
            total: Number(data.herdCounts.sheep.total) || 0,
            young: Number(data.herdCounts.sheep.young) || 0,
            female: Number(data.herdCounts.sheep.female) || 0,
            treated: Number(data.herdCounts.sheep.treated) || 0,
          },
          goats: {
            total: Number(data.herdCounts.goats.total) || 0,
            young: Number(data.herdCounts.goats.young) || 0,
            female: Number(data.herdCounts.goats.female) || 0,
            treated: Number(data.herdCounts.goats.treated) || 0,
          },
          camel: {
            total: Number(data.herdCounts.camel.total) || 0,
            young: Number(data.herdCounts.camel.young) || 0,
            female: Number(data.herdCounts.camel.female) || 0,
            treated: Number(data.herdCounts.camel.treated) || 0,
          },
          cattle: {
            total: Number(data.herdCounts.cattle.total) || 0,
            young: Number(data.herdCounts.cattle.young) || 0,
            female: Number(data.herdCounts.cattle.female) || 0,
            treated: Number(data.herdCounts.cattle.treated) || 0,
          },
          horse: {
            total: Number(data.herdCounts.horse.total) || 0,
            young: Number(data.herdCounts.horse.young) || 0,
            female: Number(data.herdCounts.horse.female) || 0,
            treated: Number(data.herdCounts.horse.treated) || 0,
          },
        },
        insecticide: {
          type: data.insecticide.type,
          method: data.insecticide.method,
          volumeMl: Number(data.insecticide.volumeMl),
          status: data.insecticide.status,
          category: data.insecticide.category,
        },
        animalBarnSizeSqM: Number(data.animalBarnSizeSqM) || 0,
        breedingSites: data.breedingSites,
        parasiteControlVolume: Number(data.parasiteControlVolume) || 0,
        parasiteControlStatus: data.parasiteControlStatus,
        herdHealthStatus: data.herdHealthStatus,
        complyingToInstructions: Boolean(data.complyingToInstructions),
        request: {
          date: data.request.date || data.date,
          situation: data.request.situation || 'Open',
          fulfillingDate: data.request.fulfillingDate || undefined,
        },
        remarks: data.remarks || '',
      };
      
      // التحقق النهائي من البيانات قبل الإرسال
      if (!backendData.client?.name?.trim()) {
        console.error('❌ Client name is invalid:', backendData.client);
        toast.error('اسم العميل غير صحيح');
        setActiveTab('client');
        return;
      }
      
      if (!backendData.insecticide.volumeMl || backendData.insecticide.volumeMl <= 0) {
        console.error('❌ Insecticide volumeMl is invalid:', backendData.insecticide.volumeMl);
        toast.error('كمية المبيد غير صحيحة - يجب أن تكون أكبر من 0');
        setActiveTab('treatment');
        return;
      }
      


      if (item && item._id) {
        // Update existing record
        await parasiteControlApi.update(item._id, backendData);
      } else {
        // Create new record
        await parasiteControlApi.create(backendData);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 lg:p-6">
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
            <form 
              id="parasite-control-form" 
              onSubmit={(e) => {
  
                form.handleSubmit(onSubmit)(e);
              }}
            >
              <Tabs value={activeTab} onValueChange={(value) => {
                // Only change tab, don't trigger any side effects
                setActiveTab(value);
              }} className="tabs-modern" dir="rtl">
                <EnhancedMobileTabs
                  value={activeTab}
                  onValueChange={(value) => {
                    // Only change tab, don't trigger any side effects
                    setActiveTab(value);
                  }}
                  tabs={[
                    {
                      value: "basic",
                      label: "البيانات الأساسية",
                      shortLabel: "أساسية",
                      icon: <User className="w-4 h-4" />
                    },
                    {
                      value: "client",
                      label: "بيانات العميل",
                      shortLabel: "عميل",
                      icon: <Heart className="w-4 h-4" />
                    },
                    {
                      value: "location",
                      label: "الإحداثيات",
                      shortLabel: "موقع",
                      icon: <Activity className="w-4 h-4" />
                    },
                    {
                      value: "herd",
                      label: "القطيع",
                      shortLabel: "قطيع",
                      icon: <Shield className="w-4 h-4" />
                    },
                    {
                      value: "treatment",
                      label: "المعالجة",
                      shortLabel: "معالجة",
                      icon: <Activity className="w-4 h-4" />
                    },
                    {
                      value: "request",
                      label: "بيانات الطلب",
                      shortLabel: "طلب",
                      icon: <User className="w-4 h-4" />
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
                        <FormLabel>رقم السجل <span className="text-red-500">*</span></FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="PC001" {...field} required />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSerial = `PC${Date.now().toString().slice(-6)}`;
                              field.onChange(newSerial);
                            }}
                            className="whitespace-nowrap"
                          >
                            توليد جديد
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
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
                          <SupervisorSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="اختر المشرف"
                            section="مكافحة الطفيليات"
                          />
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
                  <FormField
                    control={form.control as any}
                    name="herdLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>موقع القطيع</FormLabel>
                        <FormControl>
                          <Input placeholder="موقع القطيع" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="client" className="tabs-content-modern">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Client Name */}
                  <FormField
                    control={form.control as any}
                    name="client.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم العميل <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="محمد أحمد الشمري" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* National ID */}
                  <FormField
                    control={form.control as any}
                    name="client.nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهوية الوطنية <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Phone */}
                  <FormField
                    control={form.control as any}
                    name="client.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="+966501234567" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Village */}
                  <FormField
                    control={form.control as any}
                    name="client.village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>القرية</FormLabel>
                        <FormControl>
                          <Input placeholder="الرياض" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Detailed Address */}
                  <FormField
                    control={form.control as any}
                    name="client.detailedAddress"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>العنوان التفصيلي</FormLabel>
                        <FormControl>
                          <Textarea placeholder="مزرعة الأحمد، طريق الخرج" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="location" className="tabs-content-modern">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="coordinates.longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>خط الطول</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            placeholder="46.6753"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
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
                    name="coordinates.latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>خط العرض</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            placeholder="24.7136"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : 0)
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

              <TabsContent value="herd" className="tabs-content-modern">
                {["sheep", "goats", "camel", "cattle", "horse"].map((animal) => (
                  <div key={animal} className="space-y-2">
                    <h4 className="font-medium">
                      {animal === "sheep" && "الأغنام"}
                      {animal === "goats" && "الماعز"}
                      {animal === "camel" && "الإبل"}
                      {animal === "cattle" && "الأبقار"}
                      {animal === "horse" && "الخيول"}
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {["total", "young", "female", "treated"].map((field) => (
                        <FormField
                          key={`${animal}.${field}`}
                          control={form.control as any}
                          name={`herdCounts.${animal}.${field}` as any}
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

              <TabsContent value="treatment" className="tabs-content-modern">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="insecticide.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع المبيد</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع المبيد" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cyperdip 10%">Cyperdip 10%</SelectItem>
                            <SelectItem value="Ultra-Pour 1%">Ultra-Pour 1%</SelectItem>
                            <SelectItem value="Deltamethrin 5%">Deltamethrin 5%</SelectItem>
                            <SelectItem value="Ivermectin">Ivermectin</SelectItem>
                            <SelectItem value="Fipronil">Fipronil</SelectItem>
                            <SelectItem value="Permethrin">Permethrin</SelectItem>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    name="insecticide.volumeMl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كمية المبيد (مل) <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="insecticide.category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فئة المبيد</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر فئة المبيد" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pour-on">Pour-on</SelectItem>
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
                    name="insecticide.status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حالة الرش</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="herdHealthStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الحالة الصحية للقطيع</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    name="complyingToInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الامتثال للتعليمات</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "true")} 
                          value={field.value ? "true" : "false"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة الامتثال" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">ممتثل</SelectItem>
                            <SelectItem value="false">غير ممتثل</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="animalBarnSizeSqM"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حجم الحظيرة (م²)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="100.50"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="breedingSites"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مواقع التكاثر</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="مواقع تكاثر الطفيليات"
                            {...field}
                            value={typeof field.value === 'string' ? field.value : ''}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="parasiteControlVolume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حجم مكافحة الطفيليات</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="50.25"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="parasiteControlStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حالة مكافحة الطفيليات</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة مكافحة الطفيليات" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="مكتمل">مكتمل</SelectItem>
                            <SelectItem value="جاري">جاري</SelectItem>
                            <SelectItem value="معلق">معلق</SelectItem>
                            <SelectItem value="ملغي">ملغي</SelectItem>
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

              <TabsContent value="request" className="tabs-content-modern">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="request.date"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ModernDatePicker
                            label="تاريخ الطلب"
                            placeholder="اختر تاريخ الطلب"
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                  <FormField
                    control={form.control as any}
                    name="request.fulfillingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ModernDatePicker
                            label="تاريخ الإنجاز"
                            placeholder="اختر تاريخ الإنجاز"
                            value={field.value}
                            onChange={(date) => {
                              const dateString = date ? date.toISOString().split('T')[0] : '';
                              field.onChange(dateString || undefined);
                            }}
                            variant="modern"
                            size="md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
