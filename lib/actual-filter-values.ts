// القيم الفعلية للفلاتر المستخرجة من نماذج قاعدة البيانات
// تم إنشاؤها بناءً على Schema definitions في الباك إند

export const ACTUAL_FILTER_VALUES = {
  // فلاتر مكافحة الطفيليات - من ParasiteControl.js
  parasiteControl: {
    // حالة الرش - من insecticideSchema.status
    'insecticide.status': [
      { value: 'Sprayed', label: 'Sprayed', color: 'default' as const },
      { value: 'Not Sprayed', label: 'Not Sprayed', color: 'destructive' as const }
    ],
    
    // الحالة الصحية للقطيع - من parasiteControlSchema.herdHealthStatus
    herdHealthStatus: [
      { value: 'Healthy', label: 'Healthy', color: 'default' as const },
      { value: 'Sick', label: 'Sick', color: 'destructive' as const },
      { value: 'Sporadic cases', label: 'Sporadic cases', color: 'secondary' as const }
    ],
    
    // الامتثال للتعليمات - من parasiteControlSchema.complyingToInstructions
    complyingToInstructions: [
      { value: 'Comply', label: 'Comply', color: 'default' as const },
      { value: 'Not Comply', label: 'Not Comply', color: 'destructive' as const },
      { value: 'Partially Comply', label: 'Partially Comply', color: 'secondary' as const }
    ],
    
    // حالة الطلب - من requestSchema.situation
    'request.situation': [
      { value: 'Ongoing', label: 'Ongoing', color: 'outline' as const },
      { value: 'Closed', label: 'Closed', color: 'secondary' as const }
    ],
    
    // طريقة الرش - قيم شائعة من الواقع العملي
    'insecticide.method': [
      { value: 'Spray', label: 'Spray', color: 'default' as const },
      { value: 'Oral-Drenching', label: 'Oral-Drenching', color: 'secondary' as const },
      { value: 'Pour-on', label: 'Pour-on', color: 'outline' as const },
    ],
    
    // فئة المبيد - قيم شائعة من الواقع العملي
    'insecticide.category': [
     { value: 'Cyperdip', label: 'Cyperdip 10%', color: 'default' as const },
      { value: 'Ultra-Pour', label: 'Ultra-Pour 1%', color: 'secondary' as const },
      { value: 'Albevet', label: 'Albevet 2.5%', color: 'outline' as const },
      { value: 'Cypermethrin', label: 'Cyper-Cide 10%', color: 'destructive' as const },
      { value: 'Albendazole', label: 'Albendazole 2.5%', color: 'secondary' as const }
    ],
    
    // نوع المبيد - قيم شائعة من الواقع العملي
    'insecticide.type': [
      { value: 'Cyperdip', label: 'Cyperdip 10%', color: 'default' as const },
      { value: 'Ultra-Pour', label: 'Ultra-Pour 1%', color: 'secondary' as const },
      { value: 'Albevet', label: 'Albevet 2.5%', color: 'outline' as const },
      { value: 'Cypermethrin', label: 'Cyper-Cide 10%', color: 'destructive' as const },
      { value: 'Albendazole', label: 'Albendazole 2.5%', color: 'secondary' as const }
    ]
  },

  // فلاتر التطعيمات - من Vaccination.js
  vaccination: {
    // الحالة الصحية للقطيع - من vaccinationSchema.herdHealth
    herdHealthStatus: [
      { value: 'Healthy', label: 'Healthy', color: 'default' as const },
      { value: 'Sick', label: 'Sick', color: 'destructive' as const },
      { value: 'Sporadic Cases', label: 'Sporadic Cases', color: 'secondary' as const }
    ],
    
    // سهولة التعامل مع الحيوانات - من vaccinationSchema.animalsHandling
    animalsHandling: [
      { value: 'Easy', label: 'Easy', color: 'default' as const },
      { value: 'Difficult', label: 'Difficult', color: 'destructive' as const }
    ],
    
    // توفر العمالة - من vaccinationSchema.labours
    labours: [
      { value: 'Available', label: 'Available', color: 'default' as const },
      { value: 'Not Available', label: 'Not Available', color: 'destructive' as const },
      { value: 'Not Helpful', label: 'Not Helpful', color: 'secondary' as const }
    ],
    
    // إمكانية الوصول للموقع - من vaccinationSchema.reachableLocation
    reachableLocation: [
      { value: 'Easy', label: 'Easy', color: 'default' as const },
      { value: 'Hard to reach', label: 'Hard to reach', color: 'destructive' as const },
      { value: 'Moderate', label: 'Moderate', color: 'secondary' as const }
    ],
    
    // حالة الطلب - من requestSchema.situation
    'request.situation': [
      { value: 'Ongoing', label: 'Ongoing', color: 'outline' as const },
      { value: 'Closed', label: 'Closed', color: 'secondary' as const }
    ],
    
    // نوع اللقاح - قيم شائعة من الواقع العملي
    'vaccine.type': [
      { value: 'FMD', label: 'FMD', color: 'default' as const },
      { value: 'PPR', label: 'PPR', color: 'destructive' as const },
      { value: 'SG-POX', label: 'SG-POX', color: 'secondary' as const },
      { value: 'ET', label: 'ET', color: 'outline' as const },
      { value: 'No-Vaccination', label: 'No Vaccination', color: 'destructive' as const },
      { value: 'HS', label: 'HS', color: 'default' as const },
      { value: 'CCPP', label: 'CCPP', color: 'secondary' as const },
    ],
    
    // فئة اللقاح - قيم شائعة
    'vaccine.category': [
      { value: 'Preventive', label: 'Preventive', color: 'default' as const },
      { value: 'Emergency', label: 'Emergency', color: 'destructive' as const }
    ]
  },

  // فلاتر المختبرات - من Laboratory.js
  laboratory: {
    // نوع العينة - قيم محدثة حسب النموذج
    sampleType: [
      { value: 'Serum', label: 'Serum', color: 'default' as const },
      { value: 'Whole-Blood', label: 'Whole Blood', color: 'secondary' as const },
      { value: 'Fecal-Sample', label: 'Fecal Sample', color: 'outline' as const },
      { value: 'Skin-Scrape', label: 'Skin Scrape', color: 'destructive' as const }
    ],
    
    // نوع الفحص - قيم من الواقع العملي
    testType: [
      { value: 'Brucella ICT', label: 'Brucella ICT', color: 'default' as const },
      { value: 'Trypanosoma CATT', label: 'Trypanosoma CATT', color: 'secondary' as const },
      { value: 'Blood Parasite Smear', label: 'Blood Parasite Smear', color: 'outline' as const },
      { value: 'Internal Parasite Microscopic Examination', label: 'Internal Parasite Microscopic Examination', color: 'destructive' as const },
      { value: 'CBC', label: 'CBC', color: 'default' as const },
      { value: 'Chemistry Analysis', label: 'Chemistry Analysis', color: 'secondary' as const }
    ]
  },

  // فلاتر العيادات المتنقلة - من MobileClinic.js
  mobileClinic: {
    // فئة التدخل - من mobileClinicSchema.interventionCategory
    interventionCategory: [
      { value: 'Emergency', label: 'Emergency', color: 'destructive' as const },
      { value: 'Routine', label: 'Routine', color: 'default' as const },
      { value: 'Preventive', label: 'Preventive', color: 'secondary' as const },
      { value: 'Follow-up', label: 'Follow-up', color: 'outline' as const },
      { value: 'Clinical-Examination', label: 'Clinical Examination', color: 'default' as const },
      { value: 'Ultrasonography', label: 'Ultrasonography', color: 'secondary' as const },
      { value: 'Lab Analysis', label: 'Lab Analysis', color: 'outline' as const },
      { value: 'Surgical Operation', label: 'Surgical Operation', color: 'destructive' as const },
      { value: 'Farriery', label: 'Farriery', color: 'default' as const }
    ],
    
    // يتطلب متابعة - من mobileClinicSchema.followUpRequired
    followUpRequired: [
      { value: 'true', label: 'true', color: 'secondary' as const },
      { value: 'false', label: 'false', color: 'default' as const }
    ],
    
    // حالة الطلب - من requestSchema.situation
    'request.situation': [
      { value: 'Ongoing', label: 'Ongoing', color: 'outline' as const },
      { value: 'Closed', label: 'Closed', color: 'secondary' as const }
    ],
    
    // التشخيص - قيم شائعة من الواقع العملي
    diagnosis: [
      { value: 'Respiratory Infection', label: 'Respiratory Infection', color: 'destructive' as const },
      { value: 'Digestive Disorder', label: 'Digestive Disorder', color: 'secondary' as const },
      { value: 'Skin Disease', label: 'Skin Disease', color: 'outline' as const },
      { value: 'Parasitic Infection', label: 'Parasitic Infection', color: 'destructive' as const },
      { value: 'Nutritional Deficiency', label: 'Nutritional Deficiency', color: 'default' as const },
      { value: 'Reproductive Disorder', label: 'Reproductive Disorder', color: 'secondary' as const },
      { value: 'Musculoskeletal Injury', label: 'Musculoskeletal Injury', color: 'outline' as const },
      { value: 'Eye Infection', label: 'Eye Infection', color: 'destructive' as const },
      { value: 'Wound Treatment', label: 'Wound Treatment', color: 'default' as const },
      { value: 'Vaccination', label: 'Vaccination', color: 'secondary' as const }
    ]
  },

};

// دالة للحصول على خيارات فلتر محدد
export function getActualFilterOptions(table: string, field: string) {
  return ACTUAL_FILTER_VALUES[table]?.[field] || [];
}

// تكوين الفلاتر المحدث بناءً على القيم الفعلية
export const UPDATED_TABLE_FILTER_CONFIGS = {
  parasiteControl: [
    {
      key: 'insecticide.method',
      label: 'طريقة الرش',
      type: 'multiselect' as const,
      options: ACTUAL_FILTER_VALUES.parasiteControl['insecticide.method']
    },
    {
      key: 'insecticide.category',
      label: 'فئة المبيد',
      type: 'select' as const,
      placeholder: 'اختر فئة المبيد',
      options: ACTUAL_FILTER_VALUES.parasiteControl['insecticide.category']
    },
    {
      key: 'insecticide.status',
      label: 'حالة الرش',
      type: 'select' as const,
      placeholder: 'اختر حالة الرش',
      options: ACTUAL_FILTER_VALUES.parasiteControl['insecticide.status']
    },
    {
      key: 'insecticide.type',
      label: 'نوع المبيد',
      type: 'multiselect' as const,
      options: ACTUAL_FILTER_VALUES.parasiteControl['insecticide.type']
    },
    {
      key: 'herdHealthStatus',
      label: 'الحالة الصحية للقطيع',
      type: 'multiselect' as const,
      options: ACTUAL_FILTER_VALUES.parasiteControl.herdHealthStatus
    },
    {
      key: 'complyingToInstructions',
      label: 'الامتثال للتعليمات',
      type: 'select' as const,
      placeholder: 'اختر حالة الامتثال',
      options: ACTUAL_FILTER_VALUES.parasiteControl.complyingToInstructions
    },
    {
      key: 'request.situation',
      label: 'حالة الطلب',
      type: 'select' as const,
      placeholder: 'اختر حالة الطلب',
      options: ACTUAL_FILTER_VALUES.parasiteControl['request.situation']
    }
  ],

  vaccination: [
    {
      key: 'vaccine.type',
      label: 'نوع اللقاح',
      type: 'multiselect' as const,
      options: ACTUAL_FILTER_VALUES.vaccination['vaccine.type']
    },
    {
      key: 'vaccine.category',
      label: 'فئة اللقاح',
      type: 'select' as const,
      placeholder: 'اختر فئة اللقاح',
      options: ACTUAL_FILTER_VALUES.vaccination['vaccine.category']
    },
    {
      key: 'herdHealthStatus',
      label: 'الحالة الصحية للقطيع',
      type: 'multiselect' as const,
      options: ACTUAL_FILTER_VALUES.vaccination.herdHealthStatus
    },
    {
      key: 'animalsHandling',
      label: 'سهولة التعامل مع الحيوانات',
      type: 'select' as const,
      placeholder: 'اختر سهولة التعامل',
      options: ACTUAL_FILTER_VALUES.vaccination.animalsHandling
    },
    {
      key: 'labours',
      label: 'توفر العمالة',
      type: 'select' as const,
      placeholder: 'اختر توفر العمالة',
      options: ACTUAL_FILTER_VALUES.vaccination.labours
    },
    {
      key: 'reachableLocation',
      label: 'إمكانية الوصول للموقع',
      type: 'select' as const,
      placeholder: 'اختر إمكانية الوصول',
      options: ACTUAL_FILTER_VALUES.vaccination.reachableLocation
    },
    {
      key: 'request.situation',
      label: 'حالة الطلب',
      type: 'select' as const,
      placeholder: 'اختر حالة الطلب',
      options: ACTUAL_FILTER_VALUES.vaccination['request.situation']
    }
  ],

  laboratories: [
    {
      key: 'sampleType',
      label: 'نوع العينة',
      type: 'multiselect' as const,
      options: ACTUAL_FILTER_VALUES.laboratory.sampleType
    },
    {
      key: 'testType',
      label: 'نوع الفحص',
      type: 'multiselect' as const,
      options: ACTUAL_FILTER_VALUES.laboratory.testType
    }
  ],

  mobileClinics: [
    {
      key: 'diagnosis',
      label: 'التشخيص',
      type: 'multiselect' as const,
      options: ACTUAL_FILTER_VALUES.mobileClinic.diagnosis
    },
    {
      key: 'interventionCategory',
      label: 'فئة التدخل',
      type: 'select' as const,
      placeholder: 'اختر فئة التدخل',
      options: ACTUAL_FILTER_VALUES.mobileClinic.interventionCategory
    },
    {
      key: 'followUpRequired',
      label: 'يتطلب متابعة',
      type: 'select' as const,
      placeholder: 'اختر متطلبات المتابعة',
      options: ACTUAL_FILTER_VALUES.mobileClinic.followUpRequired
    },
    {
      key: 'request.situation',
      label: 'حالة الطلب',
      type: 'select' as const,
      placeholder: 'اختر حالة الطلب',
      options: ACTUAL_FILTER_VALUES.mobileClinic['request.situation']
    }
  ]
};
