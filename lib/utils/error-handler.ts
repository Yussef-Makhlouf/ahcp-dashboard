import { toast } from 'sonner';

// نوع الأخطاء المختلفة
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  statusCode?: number;
  details?: any;
}

// ترجمة رسائل الأخطاء للعربية
export const errorTranslations: Record<string, string> = {
  // أخطاء عامة
  'VALIDATION_ERROR': 'خطأ في التحقق من صحة البيانات',
  'INVALID_ID_FORMAT': 'تنسيق المعرف غير صحيح',
  'RESOURCE_NOT_FOUND': 'المورد غير موجود',
  'SERIAL_NUMBER_EXISTS': 'الرقم التسلسلي موجود مسبقاً',
  'SAMPLE_CODE_EXISTS': 'رمز العينة موجود مسبقاً',
  'UNAUTHORIZED': 'غير مخول للوصول',
  'FORBIDDEN': 'ممنوع الوصول',
  'INTERNAL_SERVER_ERROR': 'خطأ في الخادم الداخلي',
  'NETWORK_ERROR': 'خطأ في الشبكة',
  'TIMEOUT_ERROR': 'انتهت مهلة الاتصال',
  'UNKNOWN_ERROR': 'خطأ غير معروف',
  'CONNECTION_ERROR': 'خطأ في الاتصال',
  'SERVER_ERROR': 'خطأ في الخادم',
  'DATABASE_ERROR': 'خطأ في قاعدة البيانات',
  'DUPLICATE_ENTRY': 'البيانات مكررة',
  'INVALID_REQUEST': 'طلب غير صحيح',
  'BAD_REQUEST': 'طلب خاطئ',
  'NOT_FOUND': 'غير موجود',
  'METHOD_NOT_ALLOWED': 'الطريقة غير مسموحة',
  'CONFLICT': 'تعارض في البيانات',
  'UNPROCESSABLE_ENTITY': 'البيانات غير قابلة للمعالجة',
  'TOO_MANY_REQUESTS': 'عدد كبير جداً من الطلبات',
  'SERVICE_UNAVAILABLE': 'الخدمة غير متاحة',
  
  // أخطاء الشبكة والاتصال
  'Failed to update record': 'فشل في تحديث السجل',
  'Failed to create record': 'فشل في إنشاء السجل',
  'Failed to delete record': 'فشل في حذف السجل',
  'Failed to fetch data': 'فشل في جلب البيانات',
  'Request failed with status': 'فشل الطلب مع الحالة',
  'Network request failed': 'فشل طلب الشبكة',
  'Connection timeout': 'انتهت مهلة الاتصال',
  'Server not responding': 'الخادم لا يستجيب',
  'Invalid response from server': 'استجابة غير صحيحة من الخادم',
  'Request was aborted': 'تم إلغاء الطلب',
  
  // أخطاء الحقول المحددة
  'serialNo is required': 'الرقم التسلسلي مطلوب - يرجى إدخال رقم تسلسلي صحيح',
  'date is required': 'التاريخ مطلوب - يرجى اختيار تاريخ صحيح',
  'clientName is required': 'اسم العميل مطلوب - يرجى إدخال اسم العميل أو اختياره من القائمة',
  'clientId is required': 'رقم هوية العميل مطلوب - يرجى إدخال رقم الهوية الوطنية (10 أرقام)',
  'clientPhone is required': 'رقم هاتف العميل مطلوب - يرجى إدخال رقم هاتف سعودي صحيح يبدأ بـ 05',
  'farmLocation is required': 'موقع المزرعة مطلوب - يرجى إدخال موقع المزرعة',
  'supervisor is required': 'المشرف مطلوب - يرجى اختيار المشرف المسؤول',
  'vehicleNo is required': 'رقم المركبة مطلوب - يرجى إدخال رقم المركبة',
  'diagnosis is required': 'التشخيص مطلوب - يرجى إدخال التشخيص الطبي',
  'interventionCategory is required': 'فئة التدخل مطلوبة - يرجى اختيار فئة التدخل المناسبة',
  'treatment is required': 'العلاج مطلوب - يرجى إدخال تفاصيل العلاج',
  'request is required': 'معلومات الطلب مطلوبة - يرجى ملء بيانات الطلب',
  'collector is required': 'جامع العينة مطلوب - يرجى إدخال اسم جامع العينة',
  'sampleType is required': 'نوع العينة مطلوب - يرجى اختيار نوع العينة',
  'sampleCode is required': 'رمز العينة مطلوب - يرجى إدخال رمز العينة',
  'sampleNumber is required': 'رقم العينة مطلوب - يرجى إدخال رقم العينة',
  'vaccineType is required': 'نوع اللقاح مطلوب - يرجى اختيار نوع اللقاح',
  'vaccineCategory is required': 'فئة اللقاح مطلوبة - يرجى اختيار فئة اللقاح',
  'insecticide is required': 'المبيد الحشري مطلوب - يرجى إدخال نوع المبيد المستخدم',
  'medicationsUsed is required': 'الأدوية المستخدمة مطلوبة - يرجى إدخال قائمة الأدوية',
  'followUpRequired is required': 'المتابعة المطلوبة - يرجى تحديد ما إذا كانت المتابعة مطلوبة',
  
  // أخطاء التحقق من التنسيق
  'Invalid Saudi phone number format': 'تنسيق رقم الهاتف السعودي غير صحيح - يجب أن يبدأ بـ 05 ويتكون من 10 أرقام',
  'National ID must be between 10-14 digits': 'رقم الهوية يجب أن يكون بين 10-14 رقماً - يرجى التحقق من رقم الهوية',
  'Phone number must start with 05': 'رقم الهاتف يجب أن يبدأ بـ 05 - يرجى إدخال رقم هاتف سعودي صحيح',
  'Serial number cannot exceed 20 characters': 'الرقم التسلسلي لا يمكن أن يتجاوز 20 حرفاً - يرجى تقصير الرقم',
  'Client name cannot exceed 100 characters': 'اسم العميل لا يمكن أن يتجاوز 100 حرف - يرجى تقصير الاسم',
  'Invalid email format': 'تنسيق البريد الإلكتروني غير صحيح - يرجى إدخال بريد إلكتروني صحيح',
  'Invalid date format': 'تنسيق التاريخ غير صحيح - يرجى اختيار تاريخ صحيح',
  'Invalid number format': 'تنسيق الرقم غير صحيح - يرجى إدخال رقم صحيح',
  'Field cannot be empty': 'الحقل لا يمكن أن يكون فارغاً - يرجى ملء هذا الحقل',
  'Value is too short': 'القيمة قصيرة جداً - يرجى إدخال قيمة أطول',
  'Value is too long': 'القيمة طويلة جداً - يرجى تقصير القيمة',
  
  // أخطاء التدخل والحالات
  'Intervention category must be one of': 'فئة التدخل يجب أن تكون واحدة من القيم المحددة - يرجى اختيار قيمة صحيحة',
  'Request situation must be one of': 'حالة الطلب يجب أن تكون واحدة من القيم المحددة - يرجى اختيار حالة صحيحة',
  'Status must be one of': 'الحالة يجب أن تكون واحدة من القيم المحددة - يرجى اختيار حالة صحيحة',
  'Priority must be one of': 'الأولوية يجب أن تكون واحدة من القيم المحددة - يرجى اختيار أولوية صحيحة',
  'Category must be one of': 'الفئة يجب أن تكون واحدة من القيم المحددة - يرجى اختيار فئة صحيحة',
  
  // أخطاء القيم والأرقام
  'Horse count must be at least 1': 'عدد الخيول يجب أن يكون على الأقل 1 - يرجى إدخال عدد صحيح',
  'Weight must be between 0 and 2000': 'الوزن يجب أن يكون بين 0 و 2000 كيلوغرام - يرجى إدخال وزن صحيح',
  'Temperature must be between 35 and 45': 'درجة الحرارة يجب أن تكون بين 35 و 45 درجة مئوية - يرجى إدخال درجة حرارة صحيحة',
  'Heart rate must be between 20 and 100': 'معدل ضربات القلب يجب أن يكون بين 20 و 100 نبضة/دقيقة - يرجى إدخال معدل صحيح',
  'Respiratory rate must be between 5 and 50': 'معدل التنفس يجب أن يكون بين 5 و 50 نفس/دقيقة - يرجى إدخال معدل صحيح',
  'Value must be positive': 'القيمة يجب أن تكون موجبة - يرجى إدخال رقم أكبر من الصفر',
  'Value must be negative': 'القيمة يجب أن تكون سالبة - يرجى إدخال رقم أقل من الصفر',
  'Value must be between': 'القيمة يجب أن تكون بين - يرجى إدخال قيمة ضمن النطاق المحدد',
  'Minimum value is': 'الحد الأدنى للقيمة هو - يرجى إدخال قيمة أكبر',
  'Maximum value is': 'الحد الأقصى للقيمة هو - يرجى إدخال قيمة أصغر',
  
  // أخطاء التواريخ
  'Date cannot be in the future': 'التاريخ لا يمكن أن يكون في المستقبل - يرجى اختيار تاريخ سابق أو حالي',
  'Date cannot be in the past': 'التاريخ لا يمكن أن يكون في الماضي - يرجى اختيار تاريخ حالي أو مستقبلي',
  'Start date must be before end date': 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية - يرجى تصحيح التواريخ',
  'Invalid date range': 'نطاق التاريخ غير صحيح - يرجى اختيار تواريخ صحيحة',
  'Date is required': 'التاريخ مطلوب - يرجى اختيار تاريخ',
  
  // أخطاء الملفات والاستيراد
  'File upload failed': 'فشل في رفع الملف - يرجى المحاولة مرة أخرى',
  'Invalid file format': 'تنسيق الملف غير صحيح - يرجى استخدام ملف Excel صحيح',
  'File is too large': 'الملف كبير جداً - يرجى استخدام ملف أصغر',
  'File is empty': 'الملف فارغ - يرجى استخدام ملف يحتوي على بيانات',
  'Import failed': 'فشل الاستيراد - يرجى التحقق من البيانات والمحاولة مرة أخرى',
  'Export failed': 'فشل التصدير - يرجى المحاولة مرة أخرى',
  'Missing required columns': 'أعمدة مطلوبة مفقودة - يرجى التحقق من تنسيق الملف',
  'Invalid data in row': 'بيانات غير صحيحة في الصف - يرجى تصحيح البيانات',
  
  // أخطاء الصلاحيات والأمان
  'Access denied': 'تم رفض الوصول - ليس لديك صلاحية للقيام بهذا الإجراء',
  'Session expired': 'انتهت صلاحية الجلسة - يرجى تسجيل الدخول مرة أخرى',
  'Invalid credentials': 'بيانات الاعتماد غير صحيحة - يرجى التحقق من اسم المستخدم وكلمة المرور',
  'Account locked': 'الحساب مقفل - يرجى الاتصال بالمسؤول',
  'Permission denied': 'تم رفض الإذن - ليس لديك صلاحية كافية',
  
  // أخطاء عامة أخرى
  'Operation failed': 'فشلت العملية - يرجى المحاولة مرة أخرى',
  'Data not found': 'البيانات غير موجودة - يرجى التحقق من المعرف',
  'Invalid operation': 'عملية غير صحيحة - هذا الإجراء غير مسموح',
  'Resource busy': 'المورد مشغول - يرجى المحاولة لاحقاً',
  'Quota exceeded': 'تم تجاوز الحد المسموح - يرجى الاتصال بالمسؤول',
  'Feature not available': 'الميزة غير متاحة - هذه الميزة قيد التطوير',
  'Maintenance mode': 'وضع الصيانة - النظام قيد الصيانة، يرجى المحاولة لاحقاً',
};

// ترجمة أسماء الحقول للعربية
export const fieldTranslations: Record<string, string> = {
  'serialNo': 'الرقم التسلسلي',
  'date': 'التاريخ',
  'clientName': 'اسم العميل',
  'clientId': 'رقم هوية العميل',
  'clientPhone': 'رقم هاتف العميل',
  'clientBirthDate': 'تاريخ ميلاد العميل',
  'farmLocation': 'موقع المزرعة',
  'supervisor': 'المشرف',
  'vehicleNo': 'رقم المركبة',
  'horseCount': 'عدد الخيول',
  'diagnosis': 'التشخيص',
  'interventionCategory': 'فئة التدخل',
  'treatment': 'العلاج',
  'followUpRequired': 'المتابعة مطلوبة',
  'followUpDate': 'تاريخ المتابعة',
  'vaccinationStatus': 'حالة التطعيم',
  'dewormingStatus': 'حالة إزالة الديدان',
  'remarks': 'الملاحظات',
  'collector': 'جامع العينة',
  'sampleType': 'نوع العينة',
  'sampleCode': 'رمز العينة',
  'sampleNumber': 'رقم العينة',
  'positiveCases': 'الحالات الإيجابية',
  'negativeCases': 'الحالات السلبية',
  'client.name': 'اسم العميل',
  'client.nationalId': 'رقم هوية العميل',
  'client.phone': 'رقم هاتف العميل',
  'client.village': 'القرية',
  'client.detailedAddress': 'العنوان التفصيلي',
  'request.date': 'تاريخ الطلب',
  'request.situation': 'حالة الطلب',
  'request.fulfillingDate': 'تاريخ تنفيذ الطلب',
};

// دالة ترجمة رسالة الخطأ
export const translateErrorMessage = (message: string): string => {
  // البحث عن ترجمة مباشرة
  if (errorTranslations[message]) {
    return errorTranslations[message];
  }
  
  // البحث عن ترجمة جزئية
  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (message.includes(key)) {
      return message.replace(key, translation);
    }
  }
  
  // إذا لم توجد ترجمة، إرجاع الرسالة الأصلية
  return message;
};

// دالة ترجمة اسم الحقل
export const translateFieldName = (fieldName: string): string => {
  return fieldTranslations[fieldName] || fieldName;
};

// دالة عرض Toast للأخطاء
export const showErrorToast = (error: ApiError | string, title?: string) => {
  let errorMessage = '';
  let errorTitle = title || 'حدث خطأ';
  
  if (typeof error === 'string') {
    errorMessage = translateErrorMessage(error);
  } else {
    // ترجمة رسالة الخطأ الرئيسية
    errorMessage = translateErrorMessage(error.message);
    
    // ترجمة رمز الخطأ إذا وجد
    if (error.error) {
      errorTitle = translateErrorMessage(error.error);
    }
    
    // إضافة تفاصيل الأخطاء إذا وجدت
    if (error.errors && error.errors.length > 0) {
      const fieldErrors = error.errors.map(err => {
        const fieldName = translateFieldName(err.field);
        const message = translateErrorMessage(err.message);
        return `• ${fieldName}: ${message}`;
      }).join('\n');
      
      errorMessage += '\n\nتفاصيل الأخطاء:\n' + fieldErrors;
    }
  }
  
  toast.error(errorTitle, {
    description: errorMessage,
    duration: 6000,
    style: {
      direction: 'rtl',
      textAlign: 'right',
      fontFamily: 'Cairo, sans-serif'
    },
    className: 'error-toast'
  });
};

// دالة عرض Toast للنجاح
export const showSuccessToast = (message: string, title?: string) => {
  toast.success(title || 'تم بنجاح', {
    description: message,
    duration: 4000,
    style: {
      direction: 'rtl',
      textAlign: 'right',
      fontFamily: 'Cairo, sans-serif'
    },
    className: 'success-toast'
  });
};

// دالة عرض Toast للتحذير
export const showWarningToast = (message: string, title?: string) => {
  toast.warning(title || 'تحذير', {
    description: message,
    duration: 5000,
    style: {
      direction: 'rtl',
      textAlign: 'right',
      fontFamily: 'Cairo, sans-serif'
    },
    className: 'warning-toast'
  });
};

// دالة معالجة أخطاء API
export const handleApiError = (error: any): ApiError => {
  // إذا كان الخطأ من axios
  if (error.response) {
    return {
      success: false,
      message: error.response.data?.message || 'حدث خطأ في الخادم',
      error: error.response.data?.error,
      errors: error.response.data?.errors,
      statusCode: error.response.status,
      details: error.response.data
    };
  }
  
  // إذا كان خطأ في الشبكة
  if (error.request) {
    return {
      success: false,
      message: 'خطأ في الاتصال بالخادم',
      error: 'NETWORK_ERROR',
      statusCode: 0
    };
  }
  
  // خطأ عام
  return {
    success: false,
    message: error.message || 'حدث خطأ غير متوقع',
    error: 'UNKNOWN_ERROR'
  };
};

// دالة معالجة أخطاء النموذج وعرضها
export const handleFormError = (
  error: any,
  setFieldError: (field: string, message: string) => void,
  clearAllErrors?: () => void
) => {
  const apiError = handleApiError(error);
  
  // مسح الأخطاء السابقة
  if (clearAllErrors) {
    clearAllErrors();
  }
  
  // عرض Toast للخطأ العام
  showErrorToast(apiError);
  
  // عرض أخطاء الحقول المحددة
  if (apiError.errors && apiError.errors.length > 0) {
    apiError.errors.forEach(err => {
      const translatedMessage = translateErrorMessage(err.message);
      setFieldError(err.field, translatedMessage);
    });
  }
  
  // معالجة أخطاء خاصة
  if (apiError.error === 'SERIAL_NUMBER_EXISTS') {
    setFieldError('serialNo', 'الرقم التسلسلي موجود مسبقاً، يرجى استخدام رقم آخر');
  }
  
  if (apiError.error === 'SAMPLE_CODE_EXISTS') {
    setFieldError('sampleCode', 'رمز العينة موجود مسبقاً، يرجى استخدام رمز آخر');
  }
  
  if (apiError.error === 'INVALID_ID_FORMAT') {
    showErrorToast('المعرف المرسل غير صحيح، يرجى المحاولة مرة أخرى', 'خطأ في المعرف');
  }
  
  return apiError;
};
