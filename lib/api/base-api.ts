import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

// Base API configuration - إنتاج
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout:120000, // 60 seconds timeout for better reliability
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
    const { token, isAuthenticated, user } = useAuthStore.getState();
    console.log('🔍 Auth state:', { token: !!token, isAuthenticated, user: user?.email });
    console.log('🔍 Token type:', typeof token);
    console.log('🔍 Token length:', token?.length);
    
    // محاولة استعادة البيانات من localStorage إذا لم تكن موجودة في الـ store
    if ((!token || !isAuthenticated) && typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('auth-storage');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          if (parsed.token && parsed.user && parsed.isAuthenticated) {
            console.log('🔄 Restoring auth data from localStorage');
            // استخدام البيانات مباشرة بدون تحديث الـ store
            // سيتم استخدامها في finalToken
          }
        }
      } catch (error) {
        console.warn('⚠️ Error restoring auth data:', error);
      }
    }
    
    // التحقق من localStorage أيضاً
    let finalToken = token;
    let finalIsAuthenticated = isAuthenticated;
    
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem('auth-storage');
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          console.log('🔍 Stored auth:', { 
            hasToken: !!parsed.token, 
            isAuthenticated: parsed.isAuthenticated,
            user: parsed.user?.email 
          });
          
          // استخدام الرمز من localStorage إذا لم يكن موجود في الـ store
          if (parsed.token && (!token || token.trim() === '')) {
            console.warn('⚠️ Using token from localStorage');
            finalToken = parsed.token;
          }
          
          // استخدام حالة المصادقة من localStorage
          if (parsed.isAuthenticated && !isAuthenticated) {
            console.warn('⚠️ Using auth state from localStorage');
            finalIsAuthenticated = parsed.isAuthenticated;
          }
          
          // إذا كان هناك بيانات صالحة في localStorage، استخدمها
          if (parsed.token && parsed.user && parsed.isAuthenticated) {
            finalToken = parsed.token;
            finalIsAuthenticated = parsed.isAuthenticated;
            console.log('✅ Using complete auth data from localStorage');
          }
        } catch (e) {
          console.error('❌ Error parsing stored auth:', e);
        }
      } else {
        console.warn('⚠️ No auth data found in localStorage');
      }
    }
    
    if (finalToken && finalToken.trim() !== '') {
      // التحقق من صحة الرمز قبل إرساله
      try {
        const parts = finalToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < now) {
            console.warn('⚠️ Token expired, but allowing request to proceed');
            // لا نمسح البيانات أو نعيد التوجيه - نترك الطلب يمر
          }
        }
      } catch (error) {
        console.warn('⚠️ Invalid token format, but allowing request to proceed');
        // لا نمسح البيانات أو نعيد التوجيه - نترك الطلب يمر
      }
      
      config.headers.Authorization = `Bearer ${finalToken}`;
      console.log('🔒 Added auth token to request:', config.url);
      console.log('🔒 Token preview:', finalToken.substring(0, 20) + '...');
      console.log('🔒 Full Authorization header:', config.headers.Authorization);
      console.log('🔒 Request headers:', config.headers);
    } else {
      console.warn('⚠️ No valid token found for request:', config.url);
      console.warn('⚠️ Token details:', { 
        hasToken: !!token, 
        hasFinalToken: !!finalToken,
        tokenLength: token?.length,
        finalTokenLength: finalToken?.length,
        isAuthenticated,
        finalIsAuthenticated,
        tokenValue: token,
        finalTokenValue: finalToken
      });
      
      // محاولة استخدام الرمز حتى لو لم يكن المستخدم مسجل دخول في الـ store
      if (finalToken && finalToken.trim() !== '') {
        console.warn('⚠️ Attempting to use token despite auth state issues');
        config.headers.Authorization = `Bearer ${finalToken}`;
        console.log('🔒 Added token despite auth state:', config.url);
        console.log('🔒 Token preview:', finalToken.substring(0, 20) + '...');
      } else {
      // إعادة توجيه إلى صفحة تسجيل الدخول إذا لم يكن هناك رمز صالح - فقط للطلبات المهمة
      if (typeof window !== 'undefined' && !config.url?.includes('/auth/') && !config.url?.includes('/import') && !config.url?.includes('/export')) {
        console.warn('🔄 Redirecting to login due to missing token');
        window.location.href = '/login';
        return Promise.reject(new Error('No valid token found'));
      }
      }
      console.warn('⚠️ Auth state:', { token: !!token, isAuthenticated, user: user?.email });
      
      // إضافة رسالة خطأ واضحة
      if (config.url && (config.url.includes('/import') || config.url.includes('/export'))) {
        console.error('❌ Import/Export request without valid token');
        console.error('❌ This will cause 401 Unauthorized error');
        console.error('❌ Request will fail with MISSING_TOKEN error');
        console.error('❌ User needs to log in again');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - مع معالجة الأخطاء المحسنة
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      }
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
      const isSupervisorsEndpoint = url.includes('/auth/supervisors');
      
      // Don't logout for auth endpoints
      if (isSupervisorsEndpoint || isAuthEndpoint) {
        console.warn('⚠️ 401 from auth endpoint - user not logged in');
        error.userMessage = 'Authentication required. Please log in.';
        return Promise.reject(error);
      }
      
      // Auto logout for other endpoints
      console.warn('⚠️ 401 Unauthorized - auto logout');
      const authStore = useAuthStore.getState();
      
      if (authStore.token) {
        console.log('🔄 Logging out due to expired token');
        authStore.logout();
        
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
      error.userMessage = 'Session expired. Please log in again.';
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) { 
      error.userMessage = 'You don\'t have permission to perform this action.';
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      error.userMessage = 'Item not found. It may have been deleted.';
    }
    
    // Handle 409 Conflict
    if (error.response?.status === 409) {
      error.userMessage = 'Data conflict. The item may have been modified by another user.';
    }
    
    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const serverMessage = error.response?.data?.message;
      error.userMessage = serverMessage || 'Please check your input and try again.';
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      error.userMessage = 'Server error occurred. Please try again later.';
    }
    
    // Handle network issues (0 status code)
    if (error.response?.status === 0 || !error.response) {
      console.error('❌ Network issue:', error);
      const url = error.config?.url || '';
      if (url.includes('/import') || url.includes('/export')) {
        error.userMessage = 'مشكلة في الاتصال بالخادم. يرجى المحاولة مرة أخرى أو تقليل حجم الملف.';
      } else {
        error.userMessage = 'Network connection issue. Please check your connection and try again.';
      }
    }
    
    // Set default user message if none set
    if (!error.userMessage) {
      const serverMessage = error.response?.data?.message || error.response?.data?.error;
      error.userMessage = serverMessage || 'An unexpected error occurred. Please try again.';
    }
    
    // Add original error for debugging
    error.originalError = error;
    
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
