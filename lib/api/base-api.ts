import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

// Base API configuration - إنتاج
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // تجنب مشاكل CORS
});

// Request interceptor - مع المصادقة
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // تأكد من أن BASE URL صحيح
    if (!config.baseURL || config.baseURL.includes('undefined')) {
      config.baseURL = 'http://localhost:3001/api';
      console.log('🔧 Fixed BASE URL to:', config.baseURL);
    }
    
    // إضافة token للمصادقة
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔒 Added auth token to request');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // معالجة أخطاء الشبكة والاتصال
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('❌ فشل الاتصال بالخادم:', error.message);
      error.message = 'فشل الاتصال بالخادم. تأكد من تشغيل الخادم الخلفي على localhost:3001';
    }
    
    // معالجة أخطاء CORS
    if (error.message?.includes('CORS')) {
      console.error('❌ خطأ CORS:', error.message);
      error.message = 'خطأ في إعدادات CORS. تحقق من إعدادات الخادم الخلفي';
    }
    
    // معالجة timeout
    if (error.code === 'ECONNABORTED') {
      console.error('❌ انتهت مهلة الطلب:', error.message);
      error.message = 'انتهت مهلة الطلب. الخادم قد يكون بطيئاً أو غير متاح';
    }
    
    // معالجة 401 Unauthorized - فقط للـ endpoints الحساسة
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
      const isSupervisorsEndpoint = url.includes('/auth/supervisors');
      
      // لا تقم بتسجيل الخروج إذا كان الخطأ من endpoint المشرفين
      if (isSupervisorsEndpoint) {
        console.warn('⚠️ 401 من endpoint المشرفين - المستخدم غير مسجل الدخول');
        // لا تقم بتسجيل الخروج، فقط أرجع الخطأ
        return Promise.reject(error);
      }
      
      // تسجيل الخروج فقط للـ endpoints الأخرى (ليس auth endpoints)
      if (!isAuthEndpoint) {
        console.warn('⚠️ 401 Unauthorized - تسجيل خروج تلقائي');
        const authStore = useAuthStore.getState();
        
        // تحقق من وجود token قبل تسجيل الخروج
        if (authStore.token) {
          console.log('🔄 تسجيل خروج بسبب token منتهي الصلاحية');
          authStore.logout();
          
          if (typeof window !== 'undefined') {
            // تأخير قصير قبل إعادة التوجيه
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }
        }
      }
    }
    
    // معالجة 0 status code (مشكلة الشبكة)
    if (error.response?.status === 0 || !error.response) {
      console.error('❌ مشكلة في الشبكة أو CORS:', error);
      error.message = 'مشكلة في الاتصال. تحقق من تشغيل الخادم الخلفي وإعدادات CORS';
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),
    
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
    
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;
