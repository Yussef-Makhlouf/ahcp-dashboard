import { FieldFilter } from "@/components/data-table/table-filters";
import { dropdownListsApi } from "@/lib/api/dropdown-lists";

// Cache للتشخيصات والأدوية
let diagnosisOptionsCache: { value: string; label: string; color: any }[] = [];
let medicationsOptionsCache: { value: string; label: string; color: any }[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// دالة لتحميل التشخيصات من القوائم المنسدلة
async function loadDiagnosisOptions() {
  const now = Date.now();
  if (diagnosisOptionsCache.length > 0 && now - cacheTimestamp < CACHE_DURATION) {
    return diagnosisOptionsCache;
  }

  try {
    // تحميل جميع التشخيصات بدون حد (limit: 1000)
    const response = await dropdownListsApi.getAll({ 
      category: 'diagnosis',
      limit: 1000 
    });
    
    // فلترة النشطة فقط
    const activeItems = response.data.filter(item => item.isActive !== false);
    
    diagnosisOptionsCache = activeItems.map((item, index) => ({
      value: item.value,
      label: item.labelAr || item.label,
      color: ['default', 'secondary', 'outline', 'destructive'][index % 4] as any
    }));
    
    cacheTimestamp = now;
    console.log(`✅ Loaded ${diagnosisOptionsCache.length} diagnosis options for filters`);
    return diagnosisOptionsCache;
  } catch (error) {
    console.error('❌ Error loading diagnosis options:', error);
    return [];
  }
}

// دالة لتحميل الأدوية من القوائم المنسدلة
async function loadMedicationsOptions() {
  const now = Date.now();
  if (medicationsOptionsCache.length > 0 && now - cacheTimestamp < CACHE_DURATION) {
    return medicationsOptionsCache;
  }

  try {
    // تحميل جميع الأدوية بدون حد (limit: 1000)
    const response = await dropdownListsApi.getAll({ 
      category: 'medications',
      limit: 1000 
    });
    
    // فلترة النشطة فقط
    const activeItems = response.data.filter(item => item.isActive !== false);
    
    medicationsOptionsCache = activeItems.map((item, index) => ({
      value: item.value,
      label: item.labelAr || item.label,
      color: ['default', 'secondary', 'outline', 'destructive'][index % 4] as any
    }));
    
    cacheTimestamp = now;
    console.log(`✅ Loaded ${medicationsOptionsCache.length} medication options for filters`);
    return medicationsOptionsCache;
  } catch (error) {
    console.error('❌ Error loading medications options:', error);
    return [];
  }
}

// تكوينات الفلاتر لكل جدول - محدثة بالقيم الفعلية من قاعدة البيانات
export const TABLE_FILTER_CONFIGS: Record<string, FieldFilter[]> = {
  // فلاتر جدول مكافحة الطفيليات
  parasiteControl: [
    {
      key: "insecticide.method",
      label: "Spray Method",
      type: "multiselect" as const,
      options: [
      { value: 'Pour on', label: 'Pour on', color: 'default' as const },
      { value: 'Spraying', label: 'Spraying', color: 'secondary' as const },
      { value: 'Oral Drenching', label: 'Oral Drenching', color: 'outline' as const },
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
      key: "testType",
      label: "Test Type",
      type: "multiselect" as const,
      options: [
        { value: "Brucella ICT", label: "Brucella ICT", color: "default" as const },
        { value: "Trypanosoma CATT", label: "Trypanosoma CATT", color: "secondary" as const },
        { value: "Blood Parasite Smear", label: "Blood Parasite Smear", color: "outline" as const },
        { value: "Internal Parasite Microscopic Examination", label: "Internal Parasite Microscopic Examination", color: "destructive" as const },
        { value: "CBC", label: "CBC", color: "default" as const },
        { value: "Chemistry Analysis", label: "Chemistry Analysis", color: "secondary" as const }
      ]
    }
  ],

  // فلاتر جدول العيادات المتنقلة
  mobileClinics: [
    {
      key: "diagnosis",
      label: "التشخيص",
      type: "select" as const,
      placeholder: "اختر التشخيص",
      options: [] // سيتم ملؤها ديناميكياً من dropdown-lists API
    },
    {
      key: "medications",
      label: "الأدوية",
      type: "select" as const,
      placeholder: "اختر الدواء",
      options: [] // سيتم ملؤها ديناميكياً من dropdown-lists API
    },
    {
      key: "interventionCategory",
      label: "Intervention Category",
      type: "multiselect" as const,
      options: [
        { value: "Clinical Examination", label: "Clinical Examination", color: "default" as const },
        { value: "Surgical Operation", label: "Surgical Operation", color: "destructive" as const },
        { value: "Ultrasonography", label: "Ultrasonography", color: "secondary" as const },
        { value: "Lab Analysis", label: "Lab Analysis", color: "outline" as const },
        { value: "Farriery", label: "Farriery", color: "secondary" as const }
      ]
    },
    {
      key: "followUpRequired",
      label: "Follow-up Required",
      type: "select" as const,
      placeholder: "Select follow-up status",
      options: [
        { value: "true", label: "Yes", color: "secondary" as const },
        { value: "false", label: "No", color: "default" as const }
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

  // فلاتر جدول المربيين (العملاء)
  clients: [
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
        { value: "Clinical Examination", label: "Clinical Examination", color: "destructive" as const },
        { value: "Surgical Operation", label: "Surgical Operation", color: "default" as const },
        { value: "Ultrasonography", label: "Ultrasonography", color: "secondary" as const },
        { value: "Lab Analysis", label: "Lab Analysis", color: "outline" as const },
        { value: "Farriery", label: "Farriery", color: "default" as const }
      ]
    }
  ]
};

// دالة للحصول على تكوين فلاتر جدول محدد
export function getTableFilterConfig(tableName: string): FieldFilter[] {
  return TABLE_FILTER_CONFIGS[tableName] || [];
}

// دالة للحصول على تكوين فلاتر مع تحميل البيانات الديناميكية
export async function getTableFilterConfigWithDynamicData(tableName: string): Promise<FieldFilter[]> {
  const baseConfig = TABLE_FILTER_CONFIGS[tableName] || [];
  
  if (tableName === 'mobileClinics') {
    // تحميل التشخيصات والأدوية
    const [diagnosisOptions, medicationsOptions] = await Promise.all([
      loadDiagnosisOptions(),
      loadMedicationsOptions()
    ]);
    
    return baseConfig.map(filter => {
      if (filter.key === 'diagnosis') {
        return { ...filter, options: diagnosisOptions };
      }
      if (filter.key === 'medications') {
        return { ...filter, options: medicationsOptions };
      }
      return filter;
    });
  }
  
  return baseConfig;
}

// تصدير الدوال لاستخدامها مباشرة
export { loadDiagnosisOptions, loadMedicationsOptions };

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
