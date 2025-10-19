"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { handleFormError, showSuccessToast, showErrorToast, translateFieldName } from "@/lib/utils/error-handler";
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
import { validateEgyptianPhone, validateSaudiPhone, validatePhoneNumber, validateNationalId } from "@/lib/utils";
import { User, Heart, Shield, Activity } from "lucide-react";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { SupervisorSelect } from "@/components/ui/supervisor-select";
import { VillageSelect } from "@/components/ui/village-select";
import { ClientSelector } from "@/components/ui/client-selector";
import { useClientData } from "@/lib/hooks/use-client-data";
import { entityToasts } from "@/lib/utils/toast-utils";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedSelect } from "@/components/ui/validated-select";
import { ValidatedTextarea } from "@/components/ui/validated-textarea";

const formSchema = z.object({
  serialNo: z.string().min(1, "رقم السجل مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
  client: z.object({
    _id: z.string().optional(),
    name: z.string().min(1, "اسم العميل مطلوب"),
    nationalId: z.string().min(1, "رقم الهوية مطلوب"),
    phone: z.string().min(1, "رقم الهاتف مطلوب"),
    village: z.string().default(""),
    detailedAddress: z.string().default(""),
    birthDate: z.string().optional(),
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
  breedingSites: z.enum(["Sprayed", "Not Available", "Not Applicable"]).default("Not Available"),
  parasiteControlVolume: z.number().min(0, "يجب أن تكون الكمية أكبر من أو تساوي 0").default(0),
  parasiteControlStatus: z.string().min(1, "حالة مكافحة الطفيليات مطلوبة").default("مكتمل"),
  herdHealthStatus: z.enum(["Healthy", "Sick", "Under Treatment"]).default("Healthy"),
  complyingToInstructions: z.enum(["Comply", "Not Comply", "Partially Comply"]).default("Comply"),
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
  
  // Validation rules for unified system
  const validationRules = {
    'client.name': { required: true, minLength: 2 },
    'client.nationalId': { required: true, nationalId: true },
    'client.phone': { required: true, phone: true },
    'supervisor': { required: true },
    'vehicleNo': { required: true },
    'herdLocation': { required: true },
    'insecticide.type': { required: true },
    'insecticide.method': { required: true },
    'insecticide.category': { required: true },
    'insecticide.volumeMl': { required: true },
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

  // دوال حساب الإجماليات
  const calculateTotals = (herdCounts: any) => {
    const totals = {
      totalHerd: 0,
      totalYoung: 0,
      totalFemale: 0,
      totalTreated: 0,
    };

    Object.values(herdCounts).forEach((animalGroup: any) => {
      totals.totalHerd += animalGroup.total || 0;
      totals.totalYoung += animalGroup.young || 0;
      totals.totalFemale += animalGroup.female || 0;
      totals.totalTreated += animalGroup.treated || 0;
    });

    return totals;
  };

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
        birthDate: "",
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
      breedingSites: "Not Available",
      parasiteControlVolume: 0,
      parasiteControlStatus: "مكتمل",
      herdHealthStatus: "Healthy",
      complyingToInstructions: "Comply",
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
      // دالة لتحويل التاريخ من الباك إند بشكل صحيح (تجنب مشكلة المنطقة الزمنية)
      const formatDateFromBackend = (dateString: string) => {
        if (!dateString) return '';
        // تحويل التاريخ من UTC إلى تاريخ محلي بدون تأثير المنطقة الزمنية
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Transform backend data to form format
      const formData = {
        serialNo: item.serialNo || '',
        date: item.date ? formatDateFromBackend(item.date) : new Date().toISOString().split('T')[0],
        client: {
          name: typeof item.client === 'object' ? item.client?.name || '' : '',
          nationalId: typeof item.client === 'object' ? item.client?.nationalId || '' : '',
          phone: typeof item.client === 'object' ? item.client?.phone || '' : '',
          village: typeof item.client === 'object' ? item.client?.village || '' : '',
          detailedAddress: typeof item.client === 'object' ? item.client?.detailedAddress || '' : '',
          birthDate: typeof item.client === 'object' && item.client?.birthDate ? formatDateFromBackend(item.client.birthDate) : '',
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
        breedingSites: (item.breedingSites as 'Sprayed' | 'Not Available' | 'Not Applicable') || 'Not Available',
        parasiteControlVolume: item.parasiteControlVolume || 0,
        parasiteControlStatus: item.parasiteControlStatus || 'مكتمل',
        herdHealthStatus: item.herdHealthStatus || 'Healthy',
        complyingToInstructions: (() => {
          // Handle both boolean and string types for backward compatibility
          if (typeof item.complyingToInstructions === 'boolean') {
            return item.complyingToInstructions ? 'Comply' : 'Not Comply';
          }
          // Handle string type
          const validValues: ('Comply' | 'Not Comply' | 'Partially Comply')[] = ['Comply', 'Not Comply', 'Partially Comply'];
          return validValues.includes(item.complyingToInstructions as any) 
            ? (item.complyingToInstructions as 'Comply' | 'Not Comply' | 'Partially Comply')
            : 'Comply';
        })(),
        request: {
          date: item.request?.date ? formatDateFromBackend(item.request.date) : new Date().toISOString().split('T')[0],
          situation: item.request?.situation || 'Open',
          fulfillingDate: item.request?.fulfillingDate ? formatDateFromBackend(item.request.fulfillingDate) : undefined,
        },
        remarks: item.remarks || '',
      };
      
      console.log('📝 Loading form data for edit:', formData);
      console.log('🔍 breedingSites data type and value:', {
        type: typeof item.breedingSites,
        value: item.breedingSites,
        processed: formData.breedingSites
      });
      form.reset(formData as any);
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
          birthDate: undefined,
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
          type: 'Ivermectin',
          method: 'Pour on',
          volumeMl: 100,
          status: 'Not Sprayed' as 'Sprayed' | 'Not Sprayed',
          category: 'Pour-on',
        },
        animalBarnSizeSqM: 0,
        breedingSites: 'Not Available' as 'Sprayed' | 'Not Available' | 'Not Applicable',
        parasiteControlVolume: 0,
        parasiteControlStatus: 'مكتمل',
        herdHealthStatus: 'Healthy' as 'Healthy' | 'Sick' | 'Under Treatment',
        complyingToInstructions: 'Comply' as 'Comply' | 'Not Comply' | 'Partially Comply',
        request: {
          date: new Date().toISOString().split('T')[0],
          situation: 'Open' as 'Open' | 'Closed' | 'Pending',
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
        form.setError('client.name', { 
          type: 'required', 
          message: 'اسم العميل مطلوب' 
        });
        setActiveTab('client');
        return;
      }
      
      // تحقق من وجود البيانات المطلوبة الأخرى
      if (!data.serialNo?.trim()) {
        form.setError('serialNo', { 
          type: 'required', 
          message: 'رقم السجل مطلوب' 
        });
        setActiveTab('basic');
        return;
      }
      
      if (!data.herdLocation?.trim()) {
        form.setError('herdLocation', { 
          type: 'required', 
          message: 'موقع القطيع مطلوب' 
        });
        setActiveTab('basic');
        return;
      }
      
      if (!data.supervisor?.trim()) {
        form.setError('supervisor', { 
          type: 'required', 
          message: 'اسم المشرف مطلوب' 
        });
        setActiveTab('basic');
        return;
      }
      
      if (!data.vehicleNo?.trim()) {
        form.setError('vehicleNo', { 
          type: 'required', 
          message: 'رقم المركبة مطلوب' 
        });
        setActiveTab('basic');
        return;
      }
      
      // تحقق من بيانات المبيد المطلوبة
      if (!data.insecticide?.type?.trim()) {
        form.setError('insecticide.type', { 
          type: 'required', 
          message: 'نوع المبيد مطلوب' 
        });
        setActiveTab('treatment');
        return;
      }
      
      if (!data.insecticide?.method?.trim()) {
        form.setError('insecticide.method', { 
          type: 'required', 
          message: 'طريقة الرش مطلوبة' 
        });
        setActiveTab('treatment');
        return;
      }
      
      if (!data.insecticide?.category?.trim()) {
        form.setError('insecticide.category', { 
          type: 'required', 
          message: 'فئة المبيد مطلوبة' 
        });
        setActiveTab('treatment');
        return;
      }
      
      if (!data.insecticide?.volumeMl || Number(data.insecticide.volumeMl) <= 0) {
        console.error('❌ Invalid volumeMl:', data.insecticide?.volumeMl);
        form.setError('insecticide.volumeMl', { 
          type: 'min', 
          message: 'كمية المبيد يجب أن تكون أكبر من 0' 
        });
        setActiveTab('treatment');
        return;
      }
      
      // دالة لتحويل التاريخ بشكل صحيح (تجنب مشكلة المنطقة الزمنية)
      const formatDateForBackend = (dateString: string) => {
        if (!dateString) return new Date().toISOString();
        // إنشاء تاريخ في المنطقة الزمنية المحلية وتحويله لـ UTC
        const localDate = new Date(dateString + 'T00:00:00');
        return localDate.toISOString();
      };

      // إرسال البيانات بالشكل المطلوب تماماً من الباك إند
      const backendData = {
        serialNo: data.serialNo,
        date: formatDateForBackend(data.date),
        client: {
          name: data.client.name.trim(),
          nationalId: data.client.nationalId.trim(),
          phone: data.client.phone.trim(),
          village: data.client.village || '',
          detailedAddress: data.client.detailedAddress || '',
          birthDate: data.client.birthDate ? formatDateForBackend(data.client.birthDate) : undefined,
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
        complyingToInstructions: data.complyingToInstructions as "Comply" | "Not Comply" | "Partially Comply",
        request: {
          date: formatDateForBackend(data.request.date || data.date),
          situation: data.request.situation || 'Open',
          fulfillingDate: data.request.fulfillingDate ? formatDateForBackend(data.request.fulfillingDate) : undefined,
        },
        remarks: data.remarks || '',
      };
      
      // التحقق النهائي من البيانات قبل الإرسال
      if (!backendData.client?.name?.trim()) {
        console.error('❌ Client name is invalid:', backendData.client);
        form.setError('client.name', { 
          type: 'required', 
          message: 'اسم العميل مطلوب' 
        });
        setActiveTab('client');
        return;
      }
      
      if (!backendData.insecticide.volumeMl || backendData.insecticide.volumeMl <= 0) {
        console.error('❌ Insecticide volumeMl is invalid:', backendData.insecticide.volumeMl);
        form.setError('insecticide.volumeMl', { 
          type: 'min', 
          message: 'كمية المبيد يجب أن تكون أكبر من 0' 
        });
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
      console.error('❌ Create/Update parasite control error:', error);
      
      // استخدام نظام الأخطاء المحسن
      handleFormError(error, (field: string, message: string) => {
        form.setError(field as any, { message });
      }, () => {
        form.clearErrors();
      });
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium after:content-['*'] after:text-red-500 after:ml-1">
                      رقم السجل
                    </label>
                    <div className="flex gap-2">
                      <ValidatedInput
                        placeholder="PC001"
                        value={form.watch('serialNo')}
                        error={getFieldError('serialNo')}
                        onValueChange={(value) => {
                          form.setValue('serialNo', value);
                          clearFieldError('serialNo');
                        }}
                        onBlur={() => {
                          const error = validateField('serialNo', form.watch('serialNo'));
                          if (error) {
                            setFieldError('serialNo', error);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSerial = `PC${Date.now().toString().slice(-6)}`;
                          form.setValue('serialNo', newSerial);
                          clearFieldError('serialNo');
                        }}
                        className="whitespace-nowrap"
                      >
                        توليد جديد
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium after:content-['*'] after:text-red-500 after:ml-1">
                      التاريخ
                    </label>
                    <SimpleDatePicker
                      label=""
                      placeholder="اختر التاريخ"
                      value={form.watch('date') ? new Date(form.watch('date')) : undefined}
                      onChange={(date) => {
                        const dateString = date ? date.toISOString().split('T')[0] : '';
                        form.setValue('date', dateString);
                        clearFieldError('date');
                      }}
                      required
                      variant="modern"
                      size="md"
                    />
                    {getFieldError('date') && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('date')}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium after:content-['*'] after:text-red-500 after:ml-1">
                      المشرف
                    </label>
                    <SupervisorSelect
                      value={form.watch('supervisor')}
                      onValueChange={(value) => {
                        form.setValue('supervisor', value);
                        clearFieldError('supervisor');
                      }}
                      placeholder="اختر المشرف"
                      section="مكافحة الطفيليات"
                    />
                    {getFieldError('supervisor') && (
                      <p className="text-red-500 text-sm font-medium mt-1">{getFieldError('supervisor')}</p>
                    )}
                  </div>
                  <ValidatedInput
                    label="رقم المركبة"
                    required
                    placeholder="P1"
                    value={form.watch('vehicleNo')}
                    error={getFieldError('vehicleNo')}
                    onValueChange={(value) => {
                      form.setValue('vehicleNo', value);
                      clearFieldError('vehicleNo');
                    }}
                    onBlur={() => {
                      const error = validateField('vehicleNo', form.watch('vehicleNo'));
                      if (error) {
                        setFieldError('vehicleNo', error);
                      }
                    }}
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
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <ValidatedInput
                    label="موقع القطيع"
                    required
                    placeholder="موقع القطيع"
                    value={form.watch('herdLocation')}
                    error={getFieldError('herdLocation')}
                    onValueChange={(value) => {
                      form.setValue('herdLocation', value);
                      clearFieldError('herdLocation');
                    }}
                    onBlur={() => {
                      const error = validateField('herdLocation', form.watch('herdLocation'));
                      if (error) {
                        setFieldError('herdLocation', error);
                      }
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="client" className="tabs-content-modern">
                {/* Client Selector */}
                <div className="mb-6">
                  <FormField
                    control={form.control as any}
                    name="client._id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اختيار المربي</FormLabel>
                        <FormControl>
                          <ClientSelector
                            value={field.value || ""}
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
                                clearFieldError('client.name');
                                clearFieldError('client.nationalId');
                                clearFieldError('client.phone');
                              }
                            }}
                            placeholder="ابحث عن المربي"
                            showDetails
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Client Name */}
                  <ValidatedInput
                    label="اسم العميل"
                    required
                    placeholder="محمد أحمد الشمري"
                    value={form.watch('client.name')}
                    error={getFieldError('client.name')}
                    onValueChange={(value) => {
                      form.setValue('client.name', value);
                      clearFieldError('client.name');
                    }}
                    onBlur={() => {
                      const error = validateField('client.name', form.watch('client.name'));
                      if (error) {
                        setFieldError('client.name', error);
                      }
                    }}
                  />
                  
                  {/* National ID */}
                  <ValidatedInput
                    label="رقم الهوية الوطنية"
                    required
                    placeholder="1234567890"
                    value={form.watch('client.nationalId')}
                    error={getFieldError('client.nationalId')}
                    onValueChange={(value) => {
                      form.setValue('client.nationalId', value);
                      clearFieldError('client.nationalId');
                    }}
                    onBlur={() => {
                      const error = validateField('client.nationalId', form.watch('client.nationalId'));
                      if (error) {
                        setFieldError('client.nationalId', error);
                      }
                    }}
                  />
                  
                  {/* Phone */}
                  <ValidatedInput
                    label="رقم الهاتف"
                    required
                    placeholder="+966501234567"
                    value={form.watch('client.phone')}
                    error={getFieldError('client.phone')}
                    onValueChange={(value) => {
                      form.setValue('client.phone', value);
                      clearFieldError('client.phone');
                    }}
                    onBlur={() => {
                      const error = validateField('client.phone', form.watch('client.phone'));
                      if (error) {
                        setFieldError('client.phone', error);
                      }
                    }}
                  />
                  
                  {/* Village */}
                  <FormField
                    control={form.control as any}
                    name="client.village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>القرية</FormLabel>
                        <FormControl>
                          <VillageSelect
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="اختر القرية"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  
                  {/* Birth Date */}
                  <FormField
                    control={form.control as any}
                    name="client.birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الميلاد</FormLabel>
                        <FormControl>
                          <SimpleDatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : "")}
                            placeholder="اختر تاريخ الميلاد"
                            maxDate={new Date()}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="herd" className="tabs-content-modern">
                {/* عرض الإجماليات العامة */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5 text-blue-600" />
                      الإجماليات العامة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {calculateTotals(form.watch('herdCounts')).totalHerd}
                        </div>
                        <div className="text-sm text-gray-600">إجمالي القطيع</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {calculateTotals(form.watch('herdCounts')).totalYoung}
                        </div>
                        <div className="text-sm text-gray-600">إجمالي الصغار</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {calculateTotals(form.watch('herdCounts')).totalFemale}
                        </div>
                        <div className="text-sm text-gray-600">إجمالي الإناث</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {calculateTotals(form.watch('herdCounts')).totalTreated}
                        </div>
                        <div className="text-sm text-gray-600">إجمالي المعالج</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* تفاصيل كل نوع حيوان */}
                {["sheep", "goats", "camel", "cattle", "horse"].map((animal) => {
                  const herdCounts = form.watch('herdCounts') as any;
                  const currentAnimalData = herdCounts[animal] || { total: 0, young: 0, female: 0, treated: 0 };
                  const animalTotal = (currentAnimalData?.young || 0) + (currentAnimalData?.female || 0);
                  
                  return (
                    <Card key={animal} className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>
                            {animal === "sheep" && "🐑 الأغنام"}
                            {animal === "goats" && "🐐 الماعز"}
                            {animal === "camel" && "🐪 الإبل"}
                            {animal === "cattle" && "🐄 الأبقار"}
                            {animal === "horse" && "🐎 الخيول"}
                          </span>
                          <Badge variant="secondary" className="text-sm">
                            المجموع: {currentAnimalData?.total || 0}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {["total", "young", "female", "treated"].map((field) => (
                            <FormField
                              key={`${animal}.${field}`}
                              control={form.control as any}
                              name={`herdCounts.${animal}.${field}` as any}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">
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
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        formField.onChange(value);
                                        
                                        // تحديث الإجمالي تلقائياً عند تغيير الصغار أو الإناث
                                        if (field === 'young' || field === 'female') {
                                          const allHerdCounts = form.getValues('herdCounts') as any;
                                          const currentData = allHerdCounts[animal] || { total: 0, young: 0, female: 0, treated: 0 };
                                          const newTotal = 
                                            (field === 'young' ? value : currentData.young || 0) +
                                            (field === 'female' ? value : currentData.female || 0);
                                          form.setValue(`herdCounts.${animal}.total` as any, newTotal);
                                        }
                                      }}
                                      className={field === 'total' ? 'bg-gray-50 font-semibold' : ''}
                                    />
                                  </FormControl>
                                  {field === 'total' && (
                                    <FormDescription className="text-xs text-gray-500">
                                      يتم الحساب تلقائياً
                                    </FormDescription>
                                  )}
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        
                        {/* تحذير إذا كان المعالج أكبر من الإجمالي */}
                        {(currentAnimalData?.treated || 0) > (currentAnimalData?.total || 0) && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            ⚠️ تحذير: عدد المعالج أكبر من الإجمالي
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                            <SelectItem value="Oral Drenching">Oral Drenching</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                            <SelectItem value="Oral Drenching">Oral Drenching</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                            <SelectItem value="Sprayed">Sprayed</SelectItem>
                            <SelectItem value="Not Sprayed">Not Sprayed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                            <SelectItem value="Healthy">Healthy</SelectItem>
                            <SelectItem value="Sick">Sick</SelectItem>
                            <SelectItem value="Sporadic Cases">Sporadic Cases</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                          onValueChange={(value) => field.onChange(value)} 
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة الامتثال" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Comply">Comply</SelectItem>
                            <SelectItem value="Not Comply">Not Comply</SelectItem>
                            <SelectItem value="Partially Comply">Partially Comply</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="breedingSites"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مواقع التكاثر</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value)} 
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة مواقع التكاثر" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sprayed">Sprayed</SelectItem>
                            <SelectItem value="Not Available">Not Available</SelectItem>
                            <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                              <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
                          <SimpleDatePicker
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة الطلب" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-sm font-medium" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="request.fulfillingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SimpleDatePicker
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
                        <FormMessage className="text-red-500 text-sm font-medium" />
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
