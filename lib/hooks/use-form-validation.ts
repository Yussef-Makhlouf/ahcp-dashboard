import { useState, useCallback } from 'react';
import { validatePhoneNumber, validateNationalId } from '@/lib/utils';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  phone?: boolean;
  nationalId?: boolean;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${getFieldLabel(fieldName)} مطلوب`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return `${getFieldLabel(fieldName)} يجب أن يكون أكثر من ${rule.minLength} أحرف`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return `${getFieldLabel(fieldName)} يجب أن يكون أقل من ${rule.maxLength} أحرف`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${getFieldLabel(fieldName)} غير صحيح`;
    }

    // Phone validation
    if (rule.phone && typeof value === 'string' && !validatePhoneNumber(value)) {
      return 'رقم الهاتف غير صحيح. يجب أن يكون بين 10-15 رقم';
    }

    // National ID validation
    if (rule.nationalId && typeof value === 'string' && !validateNationalId(value)) {
      return 'رقم الهوية غير صحيح. يجب أن يكون بين 10-14 رقم';
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((formData: any): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setErrors(prev => {
      if (error) {
        return { ...prev, [fieldName]: error };
      } else {
        const { [fieldName]: removed, ...rest } = prev;
        return rest;
      }
    });
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldError(fieldName, null);
  }, [setFieldError]);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback((fieldName: string) => {
    return errors[fieldName] || null;
  }, [errors]);

  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasErrors,
  };
};

// Helper function to get field labels in Arabic
const getFieldLabel = (fieldName: string): string => {
  const labels: { [key: string]: string } = {
    // Client fields
    'client.name': 'اسم العميل',
    'client.nationalId': 'رقم هوية العميل',
    'client.phone': 'رقم هاتف العميل',
    'client.village': 'القرية',
    'client.detailedAddress': 'العنوان التفصيلي',
    
    // Owner fields
    'ownerName': 'اسم المربي',
    'ownerId': 'رقم هوية المربي',
    'ownerPhone': 'رقم هاتف المربي',
    
    // General fields
    'name': 'الاسم',
    'nationalId': 'رقم الهوية',
    'phone': 'رقم الهاتف',
    'email': 'البريد الإلكتروني',
    'village': 'القرية',
    'address': 'العنوان',
    'supervisor': 'المشرف',
    'vehicleNo': 'رقم المركبة',
    'farmLocation': 'موقع المزرعة',
    'herdLocation': 'موقع القطيع',
    'date': 'التاريخ',
    'serialNo': 'الرقم المسلسل',
    'interventionCategory': 'نوع التدخل',
    'diagnosis': 'التشخيص',
    'treatment': 'العلاج',
    'category': 'الفئة',
    'type': 'النوع',
    'method': 'الطريقة',
    'volumeMl': 'الحجم (مل)',
    'title': 'العنوان',
    'location': 'الموقع',
    'notes': 'الملاحظات',
    'quantity': 'الكمية',
    'unit': 'الوحدة',
    'price': 'السعر',
    'status': 'الحالة',
    'priority': 'الأولوية',
    'duration': 'المدة',
    'time': 'الوقت',
    'animalType': 'نوع الحيوان',
    'animalCount': 'عدد الحيوانات',
    'sampleCode': 'رمز العينة',
    'testType': 'نوع الفحص',
    'result': 'النتيجة',
    'temperature': 'درجة الحرارة',
    'humidity': 'الرطوبة',
    'weather': 'الطقس',
    'coordinates': 'الإحداثيات',
    'latitude': 'خط العرض',
    'longitude': 'خط الطول',
  };

  return labels[fieldName] || fieldName;
};
