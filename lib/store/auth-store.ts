import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi, type LoginRequest } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isRehydrated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => boolean;
  validateToken: () => boolean;
  clearError: () => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isRehydrated: false,
      login: async (credentials: LoginRequest) => {
        try {
          console.log('🔐 محاولة تسجيل الدخول:', { email: credentials.email });
          set({ isLoading: true, error: null });
          
          const response = await authApi.login(credentials);
          console.log('📥 استجابة API:', response);
          
          if (response && response.success && response.data && response.data.user && response.data.token) {
            console.log('✅ تسجيل الدخول ناجح:', {
              user: response.data.user,
              hasToken: !!response.data.token
            });
            
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            
            // حفظ البيانات في localStorage
            if (typeof window !== 'undefined') {
              const authData = {
                user: response.data.user,
                token: response.data.token,
                isAuthenticated: true
              };
              localStorage.setItem('auth-storage', JSON.stringify(authData));
              console.log('💾 تم حفظ بيانات الجلسة في localStorage:', {
                hasToken: !!authData.token,
                isAuthenticated: authData.isAuthenticated,
                user: authData.user?.email
              });
            }
            
            return { success: true, data: response.data };
          } else {
            console.error('❌ فشل في تسجيل الدخول:', response);
            const errorMessage = response?.message || 'فشل في تسجيل الدخول';
            set({
              error: errorMessage,
              isLoading: false,
              isAuthenticated: false,
              user: null,
              token: null
            });
            return { success: false, error: errorMessage };
          }
        } catch (error: any) {
          console.error('❌ خطأ في تسجيل الدخول:', error);
          console.error('❌ تفاصيل الخطأ:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          
          // معالجة أنواع مختلفة من الأخطاء
          let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
          
          if (error.response?.status === 401) {
            errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          } else if (error.response?.status === 403) {
            errorMessage = 'الحساب غير مفعل أو محظور';
          } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            errorMessage = 'خطأ في الاتصال بالخادم. تأكد من تشغيل الخادم الخلفي';
          } else {
            errorMessage = error.response?.data?.message || error.message || errorMessage;
          }
          
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          });
          
          return { success: false, error: errorMessage };
        }
      },
      logout: async () => {
        const currentState = get();
        
        // منع logout المتعدد إذا كان المستخدم مسجل خروج بالفعل
        if (!currentState.isAuthenticated && !currentState.token) {
          console.log('🔄 المستخدم مسجل خروج بالفعل');
          return;
        }
        
        console.log('🚪 تسجيل خروج...');
        console.log('🔍 Current auth state before logout:', {
          isAuthenticated: currentState.isAuthenticated,
          hasToken: !!currentState.token,
          user: currentState.user?.email
        });
        
        try {
          // محاولة إعلام الخادم بتسجيل الخروج (اختياري)
          if (currentState.token) {
            try {
              await authApi.logout();
              console.log('✅ تم إعلام الخادم بتسجيل الخروج');
            } catch (error: any) {
              console.error('⚠️ خطأ في إعلام الخادم بتسجيل الخروج:', error?.message || 'خطأ غير معروف');
              // لا توقف عملية تسجيل الخروج بسبب خطأ في الخادم
            }
          }
        } finally {
          // مسح حالة المصادقة محلياً
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            error: null,
            isLoading: false
          });
          
          // مسح البيانات من localStorage
          if (typeof window !== 'undefined') {
            // مسح جميع البيانات المتعلقة بالمصادقة
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('auth-storage-persist');
            
            // مسح أي بيانات أخرى قد تكون مخزنة
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.includes('auth') || key.includes('user') || key.includes('token'))) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            console.log('🗑️ تم مسح جميع بيانات الجلسة');
            
            // إعادة توجيه إلى صفحة تسجيل الدخول
            // استخدام replace بدلاً من href لتجنب إضافة صفحة جديدة للتاريخ
            window.location.replace('/login');
          }
        }
      },
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
      checkAuth: () => {
        const state = get();
        const isValid = state.isAuthenticated && state.user !== null && state.token !== null && state.token.trim() !== '';
        console.log('🔍 checkAuth result:', { 
          isAuthenticated: state.isAuthenticated, 
          hasUser: !!state.user, 
          hasToken: !!state.token,
          tokenLength: state.token?.length,
          isValid 
        });
        
        // التحقق من localStorage كبديل
        if (!isValid && typeof window !== 'undefined') {
          try {
            const storedAuth = localStorage.getItem('auth-storage');
            if (storedAuth) {
              const parsed = JSON.parse(storedAuth);
              if (parsed.token && parsed.user && parsed.isAuthenticated) {
                console.log('🔄 Found valid auth data in localStorage, updating store');
                set({
                  user: parsed.user,
                  token: parsed.token,
                  isAuthenticated: parsed.isAuthenticated,
                  isRehydrated: true
                });
                return true;
              }
            }
          } catch (error) {
            console.warn('⚠️ Error checking localStorage:', error);
          }
        }
        
        return isValid;
      },
      validateToken: () => {
        const state = get();
        const token = state.token;
        
        if (!token || token.trim() === '') {
          console.warn('⚠️ No token found');
          return false;
        }
        
        // التحقق من صيغة JWT
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.warn('⚠️ Invalid JWT format');
          return false;
        }
        
        try {
          // محاولة فك تشفير الرمز للتحقق من صحة الصيغة
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < now) {
            console.warn('⚠️ Token expired');
            return false;
          }
          
          console.log('✅ Token is valid');
          return true;
        } catch (error) {
          console.warn('⚠️ Invalid token format:', error);
          return false;
        }
      },
      clearError: () => set({ error: null }),
      resetAuth: () => {
        console.log('🔄 Resetting auth state...');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isRehydrated: true
        });
        if (typeof window !== 'undefined') {
          // مسح جميع البيانات المتعلقة بالمصادقة
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('auth-storage-persist');
          
          // مسح أي بيانات أخرى قد تكون مخزنة
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('auth') || key.includes('user') || key.includes('token'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          console.log('🗑️ تم مسح جميع بيانات المصادقة');
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          try {
            const item = localStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          } catch (error) {
            console.error('❌ Error reading auth storage:', error);
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('❌ Error writing auth storage:', error);
          }
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('❌ Error removing auth storage:', error);
          }
        },
      },
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Auth store rehydrated:', {
          isAuthenticated: state?.isAuthenticated,
          hasUser: !!state?.user,
          hasToken: !!state?.token
        });
        
        // التحقق من صحة البيانات المستعادة
        if (state?.token && state?.user && state?.isAuthenticated) {
          console.log('✅ تم استعادة بيانات الجلسة بنجاح');
          console.log('✅ Token length:', state.token.length);
          console.log('✅ User email:', state.user.email);
          
          // التحقق من صحة الرمز بعد الاستعادة - بدون مسح البيانات
          try {
            const parts = state.token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              const now = Math.floor(Date.now() / 1000);
              
              if (payload.exp && payload.exp < now) {
                console.warn('⚠️ Token expired during rehydration - but keeping data for now');
                // لا نمسح البيانات هنا - نترك للمستخدم أن يقرر
                return;
              }
            }
          } catch (error) {
            console.warn('⚠️ Invalid token during rehydration - but keeping data for now');
            // لا نمسح البيانات هنا - نترك للمستخدم أن يقرر
            return;
          }
        } else {
          console.warn('⚠️ لم يتم استعادة بيانات الجلسة بشكل صحيح');
          console.warn('⚠️ State:', state);
        }
      },
    }
  )
);

