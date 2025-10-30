import { FieldFilter } from "@/components/data-table/table-filters";

// تكوينات الفلاتر لكل جدول - محدثة بالقيم الفعلية من قاعدة البيانات
export const TABLE_FILTER_CONFIGS: Record<string, FieldFilter[]> = {
  // فلاتر جدول مكافحة الطفيليات
  parasiteControl: [
    {
      key: "insecticide.method",
      label: "Spray Method",
      type: "multiselect" as const,
      options: [
      { value: 'Spray', label: 'Spray', color: 'default' as const },
      { value: 'Oral-Drenching', label: 'Oral-Drenching', color: 'secondary' as const },
      { value: 'Pour-on', label: 'Pour-on', color: 'outline' as const },
      ]
    },
    {
      key: "insecticide.category",
      label: "Insecticide Category",
      type: "select" as const,
      placeholder: "Select insecticide category",
      options: [
           { value: 'Cyperdip', label: 'Cyperdip 10%', color: 'default' as const },
      { value: 'Ultra-Pour', label: 'Ultra-Pour 1%', color: 'secondary' as const },
      { value: 'Albevet', label: 'Albevet 2.5%', color: 'outline' as const },
      { value: 'Cypermethrin', label: 'Cyper-Cide 10%', color: 'destructive' as const },
      { value: 'Albendazole', label: 'Albendazole 2.5%', color: 'secondary' as const }
       
      ]
    },
    {
      key: "insecticide.status",
      label: "Spray Status",
      type: "select" as const,
      placeholder: "Select spray status",
      options: [
        { value: "Sprayed", label: "Sprayed", color: "default" as const },
        { value: "Not-Sprayed", label: "Not-Sprayed", color: "destructive" as const }
      ]
    },
    {
      key: "insecticide.type",
      label: "Insecticide Type",
      type: "multiselect" as const,
      options: [
       { value: 'Cyperdip', label: 'Cyperdip 10%', color: 'default' as const },
      { value: 'Ultra-Pour', label: 'Ultra-Pour 1%', color: 'secondary' as const },
      { value: 'Albevet', label: 'Albevet 2.5%', color: 'outline' as const },
      { value: 'Cypermethrin', label: 'Cyper-Cide 10%', color: 'destructive' as const },
      { value: 'Albendazole', label: 'Albendazole 2.5%', color: 'secondary' as const }
      ]
    },
    {
      key: "herdHealthStatus",
      label: "Herd Health Status",
      type: "multiselect" as const,
      options: [
        { value: "Healthy", label: "Healthy", color: "default" as const },
        { value: "Sick", label: "Sick", color: "destructive" as const },
        { value: "Sporadic-cases", label: "Sporadic-cases", color: "secondary" as const }
      ]
    },
    {
      key: "complyingToInstructions",
      label: "Compliance to Instructions",
      type: "select" as const,
      placeholder: "Select compliance status",
      options: [
        { value: "Comply", label: "Comply", color: "default" as const },
        { value: "Not-Comply", label: "Not-Comply", color: "destructive" as const },
        { value: "Partially-Comply", label: "Partially-Comply", color: "secondary" as const }
      ]
    },
    {
      key: "request.situation",
      label: "Request Status",
      type: "select" as const,
      placeholder: "Select request status",
      options: [
        { value: "Ongoing", label: "Ongoing", color: "outline" as const },
        { value: "Closed", label: "Closed", color: "secondary" as const }
      ]
    }
  ],

  // فلاتر جدول التطعيمات
  vaccination: [
    {
      key: "vaccine.type",
      label: "Vaccine Type",
      type: "multiselect" as const,
      options: [
   { value: 'FMD', label: 'FMD', color: 'default' as const },
      { value: 'PPR', label: 'PPR', color: 'destructive' as const },
      { value: 'SG-POX', label: 'SG-POX', color: 'secondary' as const },
      { value: 'ET', label: 'ET', color: 'outline' as const },
      { value: 'No-Vaccination', label: 'No Vaccination', color: 'destructive' as const },
      { value: 'HS', label: 'HS', color: 'default' as const },
      { value: 'CCPP', label: 'CCPP', color: 'secondary' as const },
      ]
    },
    {
      key: "vaccine.category",
      label: "Vaccine Category",
      type: "select" as const,
      placeholder: "Select vaccine category",
      options: [
        { value: "Preventive", label: "Preventive", color: "default" as const },
        { value: "Emergency", label: "Emergency", color: "destructive" as const }
      ]
    },
    {
      key: "herdHealthStatus",
      label: "Herd Health Status",
      type: "multiselect" as const,
      options: [
        { value: "Healthy", label: "Healthy", color: "default" as const },
        { value: "Sick", label: "Sick", color: "destructive" as const },
        { value: "Sporadic Cases", label: "Sporadic Cases", color: "secondary" as const }
      ]
    },
    {
      key: "animalsHandling",
      label: "Animals Handling",
      type: "select" as const,
      placeholder: "Select animals handling",
      options: [
        { value: "Easy", label: "Easy Handling", color: "default" as const },
        { value: "Difficult", label: "Difficult Handling", color: "destructive" as const }
      ]
    },
    {
      key: "labours",
      label: "Labour Availability",
      type: "select" as const,
      placeholder: "Select labour availability",
      options: [
        { value: "Available", label: "Available", color: "default" as const },
        { value: "Not-Available", label: "Not Available", color: "destructive" as const },
        { value: "Not-Helpful", label: "Not Helpful", color: "secondary" as const }
      ]
    },
    {
      key: "reachableLocation",
      label: "Location Accessibility",
      type: "select" as const,
      placeholder: "Select location accessibility",
      options: [
        { value: "Easy", label: "Easy", color: "default" as const },
        { value: "Hard-to-reach", label: "Hard to reach", color: "destructive" as const },
        { value: "Moderate", label: "Moderate", color: "secondary" as const }
      ]
    },
    {
      key: "request.situation",
      label: "Request Status",
      type: "select" as const,
      placeholder: "Select request status",
      options: [
        { value: "Ongoing", label: "Ongoing", color: "outline" as const },
        { value: "Closed", label: "Closed", color: "secondary" as const }
      ]
    }
  ],

  // فلاتر جدول المختبرات
  laboratories: [
    {
      key: "sampleType",
      label: "Sample Type",
      type: "multiselect" as const,
      options: [
        { value: "Serum", label: "Serum", color: "default" as const },
        { value: "Whole-Blood", label: "Whole Blood", color: "secondary" as const },
        { value: "Fecal-Sample", label: "Fecal Sample", color: "outline" as const },
        { value: "Skin-Scrape", label: "Skin Scrape", color: "destructive" as const }
      ]
    },
    {
      key: "testResult",
      label: "Test Result",
      type: "select" as const,
      placeholder: "Select test result",
      options: [
        { value: "Normal", label: "Normal", color: "default" as const },
        { value: "Abnormal", label: "Abnormal", color: "destructive" as const },
        { value: "Positive", label: "Positive", color: "secondary" as const },
        { value: "Negative", label: "Negative", color: "outline" as const },
        { value: "Inconclusive", label: "Inconclusive", color: "default" as const }
      ]
    },
    {
      key: "testStatus",
      label: "Test Status",
      type: "select" as const,
      placeholder: "Select test status",
      options: [
        { value: "Pending", label: "Pending", color: "outline" as const },
        { value: "In-Progress", label: "In Progress", color: "secondary" as const },
        { value: "Completed", label: "Completed", color: "default" as const },
        { value: "Failed", label: "Failed", color: "destructive" as const }
      ]
    },
    {
      key: "testType",
      label: "Test Type",
      type: "multiselect" as const,
      options: [
        { value: "PCR", label: "PCR", color: "default" as const },
        { value: "ELISA", label: "ELISA", color: "secondary" as const },
        { value: "Culture", label: "Culture", color: "outline" as const },
        { value: "Microscopy", label: "Microscopy", color: "destructive" as const },
        { value: "Serology", label: "Serology", color: "default" as const },
        { value: "Biochemistry", label: "Biochemistry", color: "secondary" as const }
      ]
    },
    {
      key: "priority",
      label: "Priority",
      type: "select" as const,
      placeholder: "Select priority",
      options: [
        { value: "Low", label: "Low", color: "outline" as const },
        { value: "Normal", label: "Normal", color: "default" as const },
        { value: "High", label: "High", color: "secondary" as const },
        { value: "Urgent", label: "Urgent", color: "destructive" as const }
      ]
    }
  ],

  // فلاتر جدول العيادات المتنقلة
  mobileClinics: [
    {
      key: "interventionCategory",
      label: "Intervention Category",
      type: "multiselect" as const,
      options: [
        { value: "clinical-examination", label: "Clinical Examination", color: "destructive" as const },
        { value: "surgical-operation", label: "Surgical Operation", color: "default" as const },
        { value: "ultrasonography", label: "Ultrasonography", color: "secondary" as const },
        { value: "lab-analysis", label: "Lab Analysis", color: "outline" as const }
      ]
    },
    // {
    //   key: "interventionCategory",
    //   label: "فئة التدخل",
    //   type: "select" as const,
    //   placeholder: "اختر فئة التدخل",
    //   options: [
    //     { value: "clinical-examination", label: "Clinical Examination", color: "destructive" as const },
    //     { value: "surgical-operation", label: "Surgical Operation", color: "default" as const },
    //     { value: "ultrasonography", label: "Ultrasonography", color: "secondary" as const },
    //     { value: "lab-analysis", label: "Lab Analysis", color: "outline" as const },
    //     { value: "surgical-operation", label: "Surgical Operation", color: "destructive" as const }
    //   ]
    // },
    // {
    //   key: "followUpRequired",
    //   label: "يتطلب متابعة",
    //   type: "select" as const,
    //   placeholder: "اختر متطلبات المتابعة",
    //   options: [
    //     { value: "true", label: "نعم", color: "secondary" as const },
    //     { value: "false", label: "لا", color: "default" as const }
    //   ]
    // },
    {
      key: "request.situation",
      label: "Request Status",
      type: "select" as const,
      placeholder: "Select request status",
      options: [
        { value: "Ongoing", label: "Ongoing", color: "outline" as const },
        { value: "Closed", label: "Closed", color: "secondary" as const }
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
  ],

  // فلاتر جدول صحة الخيول
  equineHealth: [
    {
      key: "request.situation",
      label: "Request Status",
      type: "select" as const,
      placeholder: "Select request status",
      options: [
        { value: "Ongoing", label: "Ongoing", color: "outline" as const },
        { value: "Closed", label: "Closed", color: "secondary" as const }
      ]
    },
    {
      key: "interventionCategory",
      label: "Intervention Category",
      type: "multiselect" as const,
      options: [
        { value: "clinical-examination", label: "Clinical Examination", color: "destructive" as const },
        { value: "surgical-operation", label: "Surgical Operation", color: "default" as const },
        { value: "ultrasonography", label: "Ultrasonography", color: "secondary" as const },
        { value: "lab-analysis", label: "Lab Analysis", color: "outline" as const },
        { value: "farriery", label: "Farriery", color: "default" as const }
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
