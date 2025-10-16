import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

// Base API configuration - إنتاج
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ahcp-backend.vercel.app/api';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Enhanced error handling with better user messages
    const originalError = error;
    
    // Network and connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('❌ Connection failed:', error.message);
      error.userMessage = 'Connection failed. Please check your internet connection and try again.';
    }
    
    // CORS errors
    if (error.message?.includes('CORS')) {
      console.error('❌ CORS error:', error.message);
      error.userMessage = 'CORS configuration error. Please check server settings.';
    }
    
    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout:', error.message);
      error.userMessage = 'Request timed out. Please try again.';
    }
    
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
      error.userMessage = 'Network connection issue. Please check your connection and try again.';
    }
    
    // Set default user message if none set
    if (!error.userMessage) {
      const serverMessage = error.response?.data?.message || error.response?.data?.error;
      error.userMessage = serverMessage || 'An unexpected error occurred. Please try again.';
    }
    
    // Add original error for debugging
    error.originalError = originalError;
    
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
