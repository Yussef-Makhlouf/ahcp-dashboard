// القيم الفعلية للفلاتر المستخرجة من نماذج قاعدة البيانات
// تم إنشاؤها بناءً على Schema definitions في الباك إند

export const ACTUAL_FILTER_VALUES = {
  // فلاتر مكافحة الطفيليات - من ParasiteControl.js
  parasiteControl: {
    // حالة الرش - من insecticideSchema.status
    'insecticide.status': [
      { value: 'Sprayed', label: 'تم الرش', color: 'default' as const },
      { value: 'Not Sprayed', label: 'لم يتم الرش', color: 'destructive' as const }
    ],
    
    // الحالة الصحية للقطيع - من parasiteControlSchema.herdHealthStatus
    herdHealthStatus: [
      { value: 'Healthy', label: 'صحي', color: 'default' as const },
      { value: 'Sick', label: 'مريض', color: 'destructive' as const },
      { value: 'Sporadic cases', label: 'حالات متفرقة', color: 'secondary' as const }
    ],
    
    // الامتثال للتعليمات - من parasiteControlSchema.complyingToInstructions
    complyingToInstructions: [
      { value: 'Comply', label: 'ملتزم', color: 'default' as const },
      { value: 'Not Comply', label: 'غير ملتزم', color: 'destructive' as const },
      { value: 'Partially Comply', label: 'ملتزم جزئياً', color: 'secondary' as const }
    ],
    
    // حالة الطلب - من requestSchema.situation
    'request.situation': [
      { value: 'Ongoing', label: 'جاري', color: 'outline' as const },
      { value: 'Closed', label: 'مغلق', color: 'secondary' as const }
    ],
    
    // طريقة الرش - قيم شائعة من الواقع العملي
    'insecticide.method': [
      { value: 'Spray', label: 'رش', color: 'default' as const },
      { value: 'Dipping', label: 'غمس', color: 'secondary' as const },
      { value: 'Pour-on', label: 'صب على الظهر', color: 'outline' as const },
      { value: 'Injection', label: 'حقن', color: 'destructive' as const },
      { value: 'Powder', label: 'بودرة', color: 'default' as const },
      { value: 'Aerosol', label: 'رذاذ', color: 'secondary' as const }
    ],
    
    // فئة المبيد - قيم شائعة من الواقع العملي
    'insecticide.category': [
      { value: 'Organophosphate', label: 'فوسفات عضوي', color: 'default' as const },
      { value: 'Pyrethroid', label: 'بيريثرويد', color: 'secondary' as const },
      { value: 'Carbamate', label: 'كاربامات', color: 'outline' as const },
      { value: 'Biological', label: 'بيولوجي', color: 'default' as const },
      { value: 'Synthetic', label: 'صناعي', color: 'secondary' as const }
    ],
    
    // نوع المبيد - قيم شائعة من الواقع العملي
    'insecticide.type': [
      { value: 'Deltamethrin', label: 'دلتاميثرين', color: 'default' as const },
      { value: 'Cypermethrin', label: 'سايبرميثرين', color: 'secondary' as const },
      { value: 'Malathion', label: 'مالاثيون', color: 'outline' as const },
      { value: 'Diazinon', label: 'ديازينون', color: 'destructive' as const },
      { value: 'Ivermectin', label: 'إيفرمكتين', color: 'default' as const },
      { value: 'Fipronil', label: 'فيبرونيل', color: 'secondary' as const },
      { value: 'Amitraz', label: 'أميتراز', color: 'outline' as const }
    ]
  },

  // فلاتر التطعيمات - من Vaccination.js
  vaccination: {
    // الحالة الصحية للقطيع - من vaccinationSchema.herdHealth
    herdHealthStatus: [
      { value: 'Healthy', label: 'صحي', color: 'default' as const },
      { value: 'Sick', label: 'مريض', color: 'destructive' as const },
      { value: 'Sporadic Cases', label: 'حالات متفرقة', color: 'secondary' as const }
    ],
    
    // سهولة التعامل مع الحيوانات - من vaccinationSchema.animalsHandling
    animalsHandling: [
      { value: 'Easy', label: 'سهل', color: 'default' as const },
      { value: 'Difficult', label: 'صعب', color: 'destructive' as const }
    ],
    
    // توفر العمالة - من vaccinationSchema.labours
    labours: [
      { value: 'Available', label: 'متوفرة', color: 'default' as const },
      { value: 'Not Available', label: 'غير متوفرة', color: 'destructive' as const },
      { value: 'Not Helpful', label: 'غير مفيدة', color: 'secondary' as const }
    ],
    
    // إمكانية الوصول للموقع - من vaccinationSchema.reachableLocation
    reachableLocation: [
      { value: 'Easy', label: 'سهل الوصول', color: 'default' as const },
      { value: 'Hard to reach', label: 'صعب الوصول', color: 'destructive' as const },
      { value: 'Moderate', label: 'متوسط', color: 'secondary' as const }
    ],
    
    // حالة الطلب - من requestSchema.situation
    'request.situation': [
      { value: 'Ongoing', label: 'جاري', color: 'outline' as const },
      { value: 'Closed', label: 'مغلق', color: 'secondary' as const }
    ],
    
    // نوع اللقاح - قيم شائعة من الواقع العملي
    'vaccine.type': [
      { value: 'FMD', label: 'الحمى القلاعية', color: 'default' as const },
      { value: 'PPR', label: 'طاعون المجترات الصغيرة', color: 'destructive' as const },
      { value: 'Anthrax', label: 'الجمرة الخبيثة', color: 'secondary' as const },
      { value: 'Blackleg', label: 'الساق السوداء', color: 'outline' as const },
      { value: 'Rabies', label: 'داء الكلب', color: 'destructive' as const },
      { value: 'Brucellosis', label: 'البروسيلا', color: 'default' as const },
      { value: 'Enterotoxemia', label: 'التسمم المعوي', color: 'secondary' as const },
      { value: 'Pasteurellosis', label: 'الباستوريلا', color: 'outline' as const }
    ],
    
    // فئة اللقاح - قيم شائعة
    'vaccine.category': [
      { value: 'Preventive', label: 'وقائي', color: 'default' as const },
      { value: 'Emergency', label: 'طارئ', color: 'destructive' as const }
    ]
  },

  // فلاتر المختبرات - من Laboratory.js
  laboratory: {
    // نوع العينة - قيم محدثة حسب النموذج
    sampleType: [
      { value: 'Serum', label: 'مصل', color: 'default' as const },
      { value: 'Whole Blood', label: 'دم كامل', color: 'secondary' as const },
      { value: 'Fecal Sample', label: 'عينة براز', color: 'outline' as const },
      { value: 'Skin Scrape', label: 'كشط جلدي', color: 'destructive' as const }
    ],
    
    // حالة الفحص - من testResultSchema.status
    testResult: [
      { value: 'Normal', label: 'طبيعي', color: 'default' as const },
      { value: 'Abnormal', label: 'غير طبيعي', color: 'destructive' as const },
      { value: 'Positive', label: 'إيجابي', color: 'secondary' as const },
      { value: 'Negative', label: 'سلبي', color: 'outline' as const },
      { value: 'Inconclusive', label: 'غير حاسم', color: 'default' as const }
    ],
    
    // حالة الفحص - من laboratorySchema (إذا كان موجود)
    testStatus: [
      { value: 'Pending', label: 'في الانتظار', color: 'outline' as const },
      { value: 'In Progress', label: 'قيد التنفيذ', color: 'secondary' as const },
      { value: 'Completed', label: 'مكتمل', color: 'default' as const },
      { value: 'Failed', label: 'فاشل', color: 'destructive' as const }
    ],
    
    // نوع الفحص - قيم شائعة من الواقع العملي
    testType: [
      { value: 'PCR', label: 'تفاعل البوليميراز المتسلسل', color: 'default' as const },
      { value: 'ELISA', label: 'إليزا', color: 'secondary' as const },
      { value: 'Culture', label: 'زراعة', color: 'outline' as const },
      { value: 'Microscopy', label: 'فحص مجهري', color: 'destructive' as const },
      { value: 'Serology', label: 'فحص مصلي', color: 'default' as const },
      { value: 'Biochemistry', label: 'كيمياء حيوية', color: 'secondary' as const }
    ],
    
    // الأولوية - قيم شائعة
    priority: [
      { value: 'Low', label: 'منخفضة', color: 'outline' as const },
      { value: 'Normal', label: 'عادية', color: 'default' as const },
      { value: 'High', label: 'عالية', color: 'secondary' as const },
      { value: 'Urgent', label: 'عاجلة', color: 'destructive' as const }
    ]
  },

  // فلاتر العيادات المتنقلة - من MobileClinic.js
  mobileClinic: {
    // فئة التدخل - من mobileClinicSchema.interventionCategory
    interventionCategory: [
      { value: 'Emergency', label: 'طارئ', color: 'destructive' as const },
      { value: 'Routine', label: 'روتيني', color: 'default' as const },
      { value: 'Preventive', label: 'وقائي', color: 'secondary' as const },
      { value: 'Follow-up', label: 'متابعة', color: 'outline' as const },
      { value: 'Clinical Examination', label: 'فحص سريري', color: 'default' as const },
      { value: 'Ultrasonography', label: 'تصوير بالموجات فوق الصوتية', color: 'secondary' as const },
      { value: 'Lab Analysis', label: 'تحليل مختبري', color: 'outline' as const },
      { value: 'Surgical Operation', label: 'عملية جراحية', color: 'destructive' as const },
      { value: 'Farriery', label: 'بيطرة', color: 'default' as const }
    ],
    
    // يتطلب متابعة - من mobileClinicSchema.followUpRequired
    followUpRequired: [
      { value: 'true', label: 'نعم', color: 'secondary' as const },
      { value: 'false', label: 'لا', color: 'default' as const }
    ],
    
    // حالة الطلب - من requestSchema.situation
    'request.situation': [
      { value: 'Ongoing', label: 'جاري', color: 'outline' as const },
      { value: 'Closed', label: 'مغلق', color: 'secondary' as const }
    ],
    
    // التشخيص - قيم شائعة من الواقع العملي
    diagnosis: [
      { value: 'Respiratory Infection', label: 'التهاب تنفسي', color: 'destructive' as const },
      { value: 'Digestive Disorder', label: 'اضطراب هضمي', color: 'secondary' as const },
      { value: 'Skin Disease', label: 'مرض جلدي', color: 'outline' as const },
      { value: 'Parasitic Infection', label: 'عدوى طفيلية', color: 'destructive' as const },
      { value: 'Nutritional Deficiency', label: 'نقص غذائي', color: 'default' as const },
      { value: 'Reproductive Disorder', label: 'اضطراب تناسلي', color: 'secondary' as const },
      { value: 'Musculoskeletal Injury', label: 'إصابة عضلية هيكلية', color: 'outline' as const },
      { value: 'Eye Infection', label: 'التهاب العين', color: 'destructive' as const },
      { value: 'Wound Treatment', label: 'علاج الجروح', color: 'default' as const },
      { value: 'Vaccination', label: 'تطعيم', color: 'secondary' as const }
    ]
  }
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
      key: 'testResult',
      label: 'نتيجة الفحص',
      type: 'select' as const,
      placeholder: 'اختر نتيجة الفحص',
      options: ACTUAL_FILTER_VALUES.laboratory.testResult
    },
    {
      key: 'testStatus',
      label: 'حالة الفحص',
      type: 'select' as const,
      placeholder: 'اختر حالة الفحص',
      options: ACTUAL_FILTER_VALUES.laboratory.testStatus
    },
    {
      key: 'testType',
      label: 'نوع الفحص',
      type: 'multiselect' as const,
      options: ACTUAL_FILTER_VALUES.laboratory.testType
    },
    {
      key: 'priority',
      label: 'الأولوية',
      type: 'select' as const,
      placeholder: 'اختر الأولوية',
      options: ACTUAL_FILTER_VALUES.laboratory.priority
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
