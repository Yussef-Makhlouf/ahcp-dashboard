import { toast } from "sonner";

// Arabic translations for all messages
const translations = {
  // Success messages
  success: {
    create: (entity: string) => `تم إنشاء ${entity} بنجاح`,
    update: (entity: string) => `تم تحديث ${entity} بنجاح`,
    delete: (entity: string) => `تم حذف ${entity} بنجاح`,
    save: (entity: string) => `تم حفظ ${entity} بنجاح`,
    action: (action: string) => `تم تنفيذ العملية: ${action}`,
    login: "تم تسجيل الدخول بنجاح",
    logout: "تم تسجيل الخروج بنجاح",
    passwordReset: "تم إرسال رابط إعادة تعيين كلمة المرور",
    passwordChanged: "تم تغيير كلمة المرور بنجاح",
  },

  // Error messages
  error: {
    network: "فشل في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى",
    server: "حدث خطأ في الخادم. يرجى المحاولة لاحقاً",
    timeout: "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى",
    unauthorized: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى",
    forbidden: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
    notFound: (entity: string) => `لم يتم العثور على ${entity}. قد يكون قد تم حذفه`,
    duplicate: (field: string) => `${field} موجود بالفعل. يرجى استخدام قيمة مختلفة`,
    conflict: (message: string) => `تعارض: ${message}`,
    validation: "يرجى التحقق من البيانات المدخلة والمحاولة مرة أخرى",
    generic: (action: string) => `فشل في ${action}. يرجى المحاولة مرة أخرى`,
    custom: (message: string) => message,
    
    // Authentication specific errors
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    accountDeactivated: "الحساب غير مفعل أو محظور",
    emailRequired: "البريد الإلكتروني مطلوب",
    passwordRequired: "كلمة المرور مطلوبة",
    passwordTooShort: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    userNotFound: "لا يوجد مستخدم بهذا البريد الإلكتروني",
    invalidToken: "الرمز غير صحيح أو منتهي الصلاحية",
    tokenExpired: "انتهت صلاحية الرمز. يرجى طلب رابط جديد",
    emailSendFailed: "فشل في إرسال البريد الإلكتروني",
  },

  // Warning messages
  warning: {
    unsavedChanges: "لديك تغييرات غير محفوظة. هل أنت متأكد من المغادرة؟",
    dataLoss: "هذا الإجراء قد يؤدي إلى فقدان البيانات. يرجى التأكيد",
    custom: (message: string) => message,
  },

  // Info messages
  info: {
    loading: (action: string) => `جاري تحميل ${action}...`,
    processing: (action: string) => `جاري معالجة ${action}...`,
    custom: (message: string) => message,
  }
};

// Enhanced toast utility with Arabic messaging
export const toastUtils = {
  // Success messages
  success: {
    create: (entity: string) => toast.success(translations.success.create(entity)),
    update: (entity: string) => toast.success(translations.success.update(entity)),
    delete: (entity: string) => toast.success(translations.success.delete(entity)),
    save: (entity: string) => toast.success(translations.success.save(entity)),
    action: (action: string) => toast.success(translations.success.action(action)),
    login: () => toast.success(translations.success.login),
    logout: () => toast.success(translations.success.logout),
    passwordReset: () => toast.success(translations.success.passwordReset),
    passwordChanged: () => toast.success(translations.success.passwordChanged),
  },

  // Error messages with Arabic translations
  error: {
    // Network and connection errors
    network: () => toast.error(translations.error.network),
    server: () => toast.error(translations.error.server),
    timeout: () => toast.error(translations.error.timeout),
    
    // Validation errors
    validation: (field?: string) => 
      field 
        ? toast.error(`يرجى التحقق من حقل ${field} والمحاولة مرة أخرى`)
        : toast.error(translations.error.validation),
    
    // Authentication errors
    unauthorized: () => toast.error(translations.error.unauthorized),
    forbidden: () => toast.error(translations.error.forbidden),
    
    // Data errors
    notFound: (entity: string) => toast.error(translations.error.notFound(entity)),
    duplicate: (field: string) => toast.error(translations.error.duplicate(field)),
    conflict: (message: string) => toast.error(translations.error.conflict(message)),
    
    // Authentication specific errors
    invalidCredentials: () => toast.error(translations.error.invalidCredentials),
    accountDeactivated: () => toast.error(translations.error.accountDeactivated),
    emailRequired: () => toast.error(translations.error.emailRequired),
    passwordRequired: () => toast.error(translations.error.passwordRequired),
    passwordTooShort: () => toast.error(translations.error.passwordTooShort),
    userNotFound: () => toast.error(translations.error.userNotFound),
    invalidToken: () => toast.error(translations.error.invalidToken),
    tokenExpired: () => toast.error(translations.error.tokenExpired),
    emailSendFailed: () => toast.error(translations.error.emailSendFailed),
    
    // Generic errors
    generic: (action: string) => toast.error(translations.error.generic(action)),
    custom: (message: string) => toast.error(translations.error.custom(message)),
  },

  // Warning messages
  warning: {
    unsavedChanges: () => toast.warning(translations.warning.unsavedChanges),
    dataLoss: () => toast.warning(translations.warning.dataLoss),
    custom: (message: string) => toast.warning(translations.warning.custom(message)),
  },

  // Info messages
  info: {
    loading: (action: string) => toast.info(translations.info.loading(action)),
    processing: (action: string) => toast.info(translations.info.processing(action)),
    custom: (message: string) => toast.info(translations.info.custom(message)),
  },

  // API error handler - converts server errors to user-friendly Arabic messages
  handleApiError: (error: any, action: string = "تنفيذ هذا الإجراء") => {
    console.error('API Error:', error);

    // Network errors
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        return toastUtils.error.network();
      }
      if (error.code === 'ECONNABORTED') {
        return toastUtils.error.timeout();
      }
      return toastUtils.error.server();
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || data?.error || error.message;

    // Handle specific status codes with Arabic translations
    switch (status) {
      case 400:
        // Bad request - validation errors
        if (message?.includes('validation') || message?.includes('required') || message?.includes('مطلوب')) {
          return toastUtils.error.validation();
        }
        if (message?.includes('duplicate') || message?.includes('exists') || message?.includes('موجود')) {
          return toastUtils.error.duplicate('هذه القيمة');
        }
        if (message?.includes('email') && message?.includes('required')) {
          return toastUtils.error.emailRequired();
        }
        if (message?.includes('password') && message?.includes('required')) {
          return toastUtils.error.passwordRequired();
        }
        if (message?.includes('password') && message?.includes('short')) {
          return toastUtils.error.passwordTooShort();
        }
        if (message?.includes('credentials') || message?.includes('invalid')) {
          return toastUtils.error.invalidCredentials();
        }
        if (message?.includes('deactivated') || message?.includes('inactive')) {
          return toastUtils.error.accountDeactivated();
        }
        if (message?.includes('not found') || message?.includes('غير موجود')) {
          return toastUtils.error.userNotFound();
        }
        if (message?.includes('token') && (message?.includes('invalid') || message?.includes('expired'))) {
          return toastUtils.error.invalidToken();
        }
        if (message?.includes('email') && message?.includes('send')) {
          return toastUtils.error.emailSendFailed();
        }
        return toastUtils.error.custom(message || 'طلب غير صحيح. يرجى التحقق من البيانات المدخلة.');
      
      case 401:
        if (message?.includes('credentials') || message?.includes('invalid')) {
          return toastUtils.error.invalidCredentials();
        }
        if (message?.includes('deactivated') || message?.includes('inactive')) {
          return toastUtils.error.accountDeactivated();
        }
        return toastUtils.error.unauthorized();
      
      case 403:
        return toastUtils.error.forbidden();
      
      case 404:
        if (message?.includes('user') || message?.includes('مستخدم')) {
          return toastUtils.error.userNotFound();
        }
        return toastUtils.error.notFound('العنصر');
      
      case 409:
        return toastUtils.error.conflict(message || 'حدث تعارض في البيانات');
      
      case 422:
        // Unprocessable entity - validation errors
        return toastUtils.error.validation();
      
      case 500:
        return toastUtils.error.server();
      
      default:
        return toastUtils.error.custom(message || `فشل في ${action}`);
    }
  },

  // Form validation error handler
  handleValidationError: (errors: Record<string, string>) => {
    const firstError = Object.values(errors)[0];
    if (firstError) {
      toastUtils.error.validation();
    }
  },

  // Loading states
  loading: {
    show: (message: string) => toast.loading(message),
    dismiss: (toastId: string | number) => toast.dismiss(toastId),
  }
};

// Entity-specific toast messages with Arabic translations
export const entityToasts = {
  client: {
    create: () => toastUtils.success.create("العميل"),
    update: () => toastUtils.success.update("العميل"),
    delete: () => toastUtils.success.delete("العميل"),
    error: (action: string) => toastUtils.handleApiError({}, `إدارة العميل`),
  },
  
  vaccination: {
    create: () => toastUtils.success.create("سجل التحصين"),
    update: () => toastUtils.success.update("سجل التحصين"),
    delete: () => toastUtils.success.delete("سجل التحصين"),
    error: (action: string) => toastUtils.handleApiError({}, `إدارة سجل التحصين`),
  },
  
  mobileClinic: {
    create: () => toastUtils.success.create("زيارة العيادة المتنقلة"),
    update: () => toastUtils.success.update("زيارة العيادة المتنقلة"),
    delete: () => toastUtils.success.delete("زيارة العيادة المتنقلة"),
    error: (action: string) => toastUtils.handleApiError({}, `إدارة زيارة العيادة المتنقلة`),
  },
  
  parasiteControl: {
    create: () => toastUtils.success.create("سجل مكافحة الطفيليات"),
    update: () => toastUtils.success.update("سجل مكافحة الطفيليات"),
    delete: () => toastUtils.success.delete("سجل مكافحة الطفيليات"),
    error: (action: string) => toastUtils.handleApiError({}, `إدارة سجل مكافحة الطفيليات`),
  },
  
  equineHealth: {
    create: () => toastUtils.success.create("سجل صحة الخيول"),
    update: () => toastUtils.success.update("سجل صحة الخيول"),
    delete: () => toastUtils.success.delete("سجل صحة الخيول"),
    error: (action: string) => toastUtils.handleApiError({}, `إدارة سجل صحة الخيول`),
  },
  
  laboratory: {
    create: () => toastUtils.success.create("الفحص المختبري"),
    update: () => toastUtils.success.update("الفحص المختبري"),
    delete: () => toastUtils.success.delete("الفحص المختبري"),
    error: (action: string) => toastUtils.handleApiError({}, `إدارة الفحص المختبري`),
  },
  
  inventory: {
    create: () => toastUtils.success.create("عنصر المخزون"),
    update: () => toastUtils.success.update("عنصر المخزون"),
    delete: () => toastUtils.success.delete("عنصر المخزون"),
    error: (action: string) => toastUtils.handleApiError({}, `إدارة عنصر المخزون`),
  },
  
  schedule: {
    create: () => toastUtils.success.create("الجدولة"),
    update: () => toastUtils.success.update("الجدولة"),
    delete: () => toastUtils.success.delete("الجدولة"),
    error: (action: string) => toastUtils.handleApiError({}, `إدارة الجدولة`),
  },

  // Authentication specific toasts
  auth: {
    login: () => toastUtils.success.login(),
    logout: () => toastUtils.success.logout(),
    passwordReset: () => toastUtils.success.passwordReset(),
    passwordChanged: () => toastUtils.success.passwordChanged(),
    error: (error: any) => toastUtils.handleApiError(error, "المصادقة"),
  },
};

export default toastUtils;
