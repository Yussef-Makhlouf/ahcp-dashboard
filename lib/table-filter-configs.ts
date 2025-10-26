import { FieldFilter } from "@/components/data-table/table-filters";

// تكوينات الفلاتر لكل جدول - محدثة بالقيم الفعلية من قاعدة البيانات
export const TABLE_FILTER_CONFIGS: Record<string, FieldFilter[]> = {
  // فلاتر جدول مكافحة الطفيليات
  parasiteControl: [
    {
      key: "insecticide.method",
      label: "طريقة الرش",
      type: "multiselect" as const,
      options: [
        { value: "Spray", label: "رش", color: "default" as const },
        { value: "Dipping", label: "غمس", color: "secondary" as const },
        { value: "Pour-on", label: "صب على الظهر", color: "outline" as const },
        { value: "Injection", label: "حقن", color: "destructive" as const },
        { value: "Powder", label: "بودرة", color: "default" as const },
        { value: "Aerosol", label: "رذاذ", color: "secondary" as const }
      ]
    },
    {
      key: "insecticide.category",
      label: "فئة المبيد",
      type: "select" as const,
      placeholder: "اختر فئة المبيد",
      options: [
        { value: "Organophosphate", label: "فوسفات عضوي", color: "default" as const },
        { value: "Pyrethroid", label: "بيريثرويد", color: "secondary" as const },
        { value: "Carbamate", label: "كاربامات", color: "outline" as const },
        { value: "Biological", label: "بيولوجي", color: "default" as const },
        { value: "Synthetic", label: "صناعي", color: "secondary" as const }
      ]
    },
    {
      key: "insecticide.status",
      label: "حالة الرش",
      type: "select" as const,
      placeholder: "اختر حالة الرش",
      options: [
        { value: "Sprayed", label: "تم الرش", color: "default" as const },
        { value: "Not Sprayed", label: "لم يتم الرش", color: "destructive" as const }
      ]
    },
    {
      key: "insecticide.type",
      label: "نوع المبيد",
      type: "multiselect" as const,
      options: [
        { value: "Deltamethrin", label: "دلتاميثرين", color: "default" as const },
        { value: "Cypermethrin", label: "سايبرميثرين", color: "secondary" as const },
        { value: "Malathion", label: "مالاثيون", color: "outline" as const },
        { value: "Diazinon", label: "ديازينون", color: "destructive" as const },
        { value: "Ivermectin", label: "إيفرمكتين", color: "default" as const },
        { value: "Fipronil", label: "فيبرونيل", color: "secondary" as const },
        { value: "Amitraz", label: "أميتراز", color: "outline" as const }
      ]
    },
    {
      key: "herdHealthStatus",
      label: "الحالة الصحية للقطيع",
      type: "multiselect" as const,
      options: [
        { value: "Healthy", label: "صحي", color: "default" as const },
        { value: "Sick", label: "مريض", color: "destructive" as const },
        { value: "Sporadic cases", label: "حالات متفرقة", color: "secondary" as const }
      ]
    },
    {
      key: "complyingToInstructions",
      label: "الامتثال للتعليمات",
      type: "select" as const,
      placeholder: "اختر حالة الامتثال",
      options: [
        { value: "Comply", label: "ملتزم", color: "default" as const },
        { value: "Not Comply", label: "غير ملتزم", color: "destructive" as const },
        { value: "Partially Comply", label: "ملتزم جزئياً", color: "secondary" as const }
      ]
    },
    {
      key: "request.situation",
      label: "حالة الطلب",
      type: "select" as const,
      placeholder: "اختر حالة الطلب",
      options: [
        { value: "Ongoing", label: "جاري", color: "outline" as const },
        { value: "Closed", label: "مغلق", color: "secondary" as const }
      ]
    }
  ],

  // فلاتر جدول التطعيمات
  vaccination: [
    {
      key: "vaccine.type",
      label: "نوع اللقاح",
      type: "multiselect" as const,
      options: [
        { value: "FMD", label: "الحمى القلاعية", color: "default" as const },
        { value: "PPR", label: "طاعون المجترات الصغيرة", color: "destructive" as const },
        { value: "Anthrax", label: "الجمرة الخبيثة", color: "secondary" as const },
        { value: "Blackleg", label: "الساق السوداء", color: "outline" as const },
        { value: "Rabies", label: "داء الكلب", color: "destructive" as const },
        { value: "Brucellosis", label: "البروسيلا", color: "default" as const },
        { value: "Enterotoxemia", label: "التسمم المعوي", color: "secondary" as const },
        { value: "Pasteurellosis", label: "الباستوريلا", color: "outline" as const }
      ]
    },
    {
      key: "vaccine.category",
      label: "فئة اللقاح",
      type: "select" as const,
      placeholder: "اختر فئة اللقاح",
      options: [
        { value: "Preventive", label: "وقائي", color: "default" as const },
        { value: "Emergency", label: "طارئ", color: "destructive" as const }
      ]
    },
    {
      key: "herdHealthStatus",
      label: "الحالة الصحية للقطيع",
      type: "multiselect" as const,
      options: [
        { value: "Healthy", label: "صحي", color: "default" as const },
        { value: "Sick", label: "مريض", color: "destructive" as const },
        { value: "Sporadic Cases", label: "حالات متفرقة", color: "secondary" as const }
      ]
    },
    {
      key: "animalsHandling",
      label: "سهولة التعامل مع الحيوانات",
      type: "select" as const,
      placeholder: "اختر سهولة التعامل",
      options: [
        { value: "Easy", label: "سهل", color: "default" as const },
        { value: "Difficult", label: "صعب", color: "destructive" as const }
      ]
    },
    {
      key: "labours",
      label: "توفر العمالة",
      type: "select" as const,
      placeholder: "اختر توفر العمالة",
      options: [
        { value: "Available", label: "متوفرة", color: "default" as const },
        { value: "Not Available", label: "غير متوفرة", color: "destructive" as const },
        { value: "Not Helpful", label: "غير مفيدة", color: "secondary" as const }
      ]
    },
    {
      key: "reachableLocation",
      label: "إمكانية الوصول للموقع",
      type: "select" as const,
      placeholder: "اختر إمكانية الوصول",
      options: [
        { value: "Easy", label: "سهل الوصول", color: "default" as const },
        { value: "Hard to reach", label: "صعب الوصول", color: "destructive" as const },
        { value: "Moderate", label: "متوسط", color: "secondary" as const }
      ]
    },
    {
      key: "request.situation",
      label: "حالة الطلب",
      type: "select" as const,
      placeholder: "اختر حالة الطلب",
      options: [
        { value: "Ongoing", label: "جاري", color: "outline" as const },
        { value: "Closed", label: "مغلق", color: "secondary" as const }
      ]
    }
  ],

  // فلاتر جدول المختبرات
  laboratories: [
    {
      key: "sampleType",
      label: "نوع العينة",
      type: "multiselect" as const,
      options: [
        { value: "Serum", label: "مصل", color: "default" as const },
        { value: "Whole Blood", label: "دم كامل", color: "secondary" as const },
        { value: "Fecal Sample", label: "عينة براز", color: "outline" as const },
        { value: "Skin Scrape", label: "كشط جلدي", color: "destructive" as const }
      ]
    },
    {
      key: "testResult",
      label: "نتيجة الفحص",
      type: "select" as const,
      placeholder: "اختر نتيجة الفحص",
      options: [
        { value: "Normal", label: "طبيعي", color: "default" as const },
        { value: "Abnormal", label: "غير طبيعي", color: "destructive" as const },
        { value: "Positive", label: "إيجابي", color: "secondary" as const },
        { value: "Negative", label: "سلبي", color: "outline" as const },
        { value: "Inconclusive", label: "غير حاسم", color: "default" as const }
      ]
    },
    {
      key: "testStatus",
      label: "حالة الفحص",
      type: "select" as const,
      placeholder: "اختر حالة الفحص",
      options: [
        { value: "Pending", label: "في الانتظار", color: "outline" as const },
        { value: "In Progress", label: "قيد التنفيذ", color: "secondary" as const },
        { value: "Completed", label: "مكتمل", color: "default" as const },
        { value: "Failed", label: "فاشل", color: "destructive" as const }
      ]
    },
    {
      key: "testType",
      label: "نوع الفحص",
      type: "multiselect" as const,
      options: [
        { value: "PCR", label: "تفاعل البوليميراز المتسلسل", color: "default" as const },
        { value: "ELISA", label: "إليزا", color: "secondary" as const },
        { value: "Culture", label: "زراعة", color: "outline" as const },
        { value: "Microscopy", label: "فحص مجهري", color: "destructive" as const },
        { value: "Serology", label: "فحص مصلي", color: "default" as const },
        { value: "Biochemistry", label: "كيمياء حيوية", color: "secondary" as const }
      ]
    },
    {
      key: "priority",
      label: "الأولوية",
      type: "select" as const,
      placeholder: "اختر الأولوية",
      options: [
        { value: "Low", label: "منخفضة", color: "outline" as const },
        { value: "Normal", label: "عادية", color: "default" as const },
        { value: "High", label: "عالية", color: "secondary" as const },
        { value: "Urgent", label: "عاجلة", color: "destructive" as const }
      ]
    }
  ],

  // فلاتر جدول العيادات المتنقلة
  mobileClinics: [
    {
      key: "diagnosis",
      label: "التشخيص",
      type: "multiselect" as const,
      options: [
        { value: "Respiratory Infection", label: "التهاب تنفسي", color: "destructive" as const },
        { value: "Digestive Disorder", label: "اضطراب هضمي", color: "secondary" as const },
        { value: "Skin Disease", label: "مرض جلدي", color: "outline" as const },
        { value: "Parasitic Infection", label: "عدوى طفيلية", color: "destructive" as const },
        { value: "Nutritional Deficiency", label: "نقص غذائي", color: "default" as const },
        { value: "Reproductive Disorder", label: "اضطراب تناسلي", color: "secondary" as const },
        { value: "Musculoskeletal Injury", label: "إصابة عضلية هيكلية", color: "outline" as const },
        { value: "Eye Infection", label: "التهاب العين", color: "destructive" as const },
        { value: "Wound Treatment", label: "علاج الجروح", color: "default" as const },
        { value: "Vaccination", label: "تطعيم", color: "secondary" as const }
      ]
    },
    {
      key: "interventionCategory",
      label: "فئة التدخل",
      type: "select" as const,
      placeholder: "اختر فئة التدخل",
      options: [
        { value: "Emergency", label: "طارئ", color: "destructive" as const },
        { value: "Routine", label: "روتيني", color: "default" as const },
        { value: "Preventive", label: "وقائي", color: "secondary" as const },
        { value: "Follow-up", label: "متابعة", color: "outline" as const },
        { value: "Clinical Examination", label: "فحص سريري", color: "default" as const },
        { value: "Ultrasonography", label: "تصوير بالموجات فوق الصوتية", color: "secondary" as const },
        { value: "Lab Analysis", label: "تحليل مختبري", color: "outline" as const },
        { value: "Surgical Operation", label: "عملية جراحية", color: "destructive" as const },
        { value: "Farriery", label: "بيطرة", color: "default" as const }
      ]
    },
    {
      key: "followUpRequired",
      label: "يتطلب متابعة",
      type: "select" as const,
      placeholder: "اختر متطلبات المتابعة",
      options: [
        { value: "true", label: "نعم", color: "secondary" as const },
        { value: "false", label: "لا", color: "default" as const }
      ]
    },
    {
      key: "request.situation",
      label: "حالة الطلب",
      type: "select" as const,
      placeholder: "اختر حالة الطلب",
      options: [
        { value: "Ongoing", label: "جاري", color: "outline" as const },
        { value: "Closed", label: "مغلق", color: "secondary" as const }
      ]
    }
  ],

  // فلاتر جدول المربيين (العملاء)
  clients: [
    {
      key: "status",
      label: "الحالة",
      type: "select" as const,
      placeholder: "اختر الحالة",
      options: [
        { value: "نشط", label: "نشط", color: "default" as const },
        { value: "غير نشط", label: "غير نشط", color: "destructive" as const }
      ]
    },
    {
      key: "village",
      label: "القرية",
      type: "select" as const,
      placeholder: "اختر القرية",
      options: [
        { value: "الرياض", label: "الرياض", color: "default" as const },
        { value: "جدة", label: "جدة", color: "secondary" as const },
        { value: "الدمام", label: "الدمام", color: "outline" as const },
        { value: "مكة المكرمة", label: "مكة المكرمة", color: "default" as const },
        { value: "المدينة المنورة", label: "المدينة المنورة", color: "secondary" as const },
        { value: "الطائف", label: "الطائف", color: "outline" as const },
        { value: "تبوك", label: "تبوك", color: "default" as const },
        { value: "بريدة", label: "بريدة", color: "secondary" as const },
        { value: "خميس مشيط", label: "خميس مشيط", color: "outline" as const },
        { value: "حائل", label: "حائل", color: "default" as const }
      ]
    },
    {
      key: "servicesReceived",
      label: "الخدمات المستلمة",
      type: "multiselect" as const,
      options: [
        { value: "vaccination", label: "التطعيمات", color: "default" as const },
        { value: "parasite_control", label: "مكافحة الطفيليات", color: "secondary" as const },
        { value: "mobile_clinic", label: "العيادة المتنقلة", color: "outline" as const },
        { value: "laboratory", label: "المختبر", color: "destructive" as const },
        { value: "equine_health", label: "صحة الخيول", color: "default" as const }
      ]
    },
    {
      key: "animals.animalType",
      label: "نوع الحيوان",
      type: "multiselect" as const,
      options: [
        { value: "Sheep", label: "أغنام", color: "default" as const },
        { value: "Goats", label: "ماعز", color: "secondary" as const },
        { value: "Cattle", label: "أبقار", color: "outline" as const },
        { value: "Camels", label: "إبل", color: "destructive" as const },
        { value: "Horses", label: "خيول", color: "default" as const },
        { value: "Poultry", label: "دواجن", color: "secondary" as const }
      ]
    },
    {
      key: "totalAnimals",
      label: "عدد الحيوانات",
      type: "select" as const,
      placeholder: "اختر نطاق عدد الحيوانات",
      options: [
        { value: "1-10", label: "1-10 حيوانات", color: "default" as const },
        { value: "11-50", label: "11-50 حيوان", color: "secondary" as const },
        { value: "51-100", label: "51-100 حيوان", color: "outline" as const },
        { value: "101-500", label: "101-500 حيوان", color: "destructive" as const },
        { value: "500+", label: "أكثر من 500 حيوان", color: "default" as const }
      ]
    }
  ]
};

// دالة للحصول على تكوين فلاتر جدول محدد
export function getTableFilterConfig(tableName: string): FieldFilter[] {
  return TABLE_FILTER_CONFIGS[tableName] || [];
}

// دالة لتحويل الفلاتر إلى معاملات API
export function filtersToApiParams(filters: Record<string, any>): Record<string, any> {
  const apiParams: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === '__all__') return;

    if (key === 'dateRange' && value.from) {
      apiParams.startDate = value.from.toISOString().split('T')[0];
      if (value.to) {
        apiParams.endDate = value.to.toISOString().split('T')[0];
      }
    } else if (Array.isArray(value) && value.length > 0) {
      apiParams[key] = value.join(',');
    } else if (typeof value === 'string' && value.trim() !== '' && value !== '__all__') {
      apiParams[key] = value;
    }
  });

  return apiParams;
}
