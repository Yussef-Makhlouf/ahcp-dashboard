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
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => boolean;
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
      login: async (credentials: LoginRequest) => {
        try {
          console.log('🔐 محاولة تسجيل الدخول:', { email: credentials.email });
          set({ isLoading: true, error: null });
          
          const response = await authApi.login(credentials);
          console.log('📥 استجابة API:', response);
          
          if (response && response.success) {
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
          } else {
            console.error('❌ فشل في تسجيل الدخول:', response);
            set({
              error: response?.message || 'فشل في تسجيل الدخول',
              isLoading: false
            });
          }
        } catch (error: any) {
          console.error('❌ خطأ في تسجيل الدخول:', error);
          console.error('❌ تفاصيل الخطأ:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          
          // معالجة أنواع مختلفة من الأخطاء
          if (error.response?.status === 401) {
            set({
              error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
              isLoading: false
            });
          } else if (error.response?.status === 403) {
            set({
              error: 'الحساب غير مفعل أو محظور',
              isLoading: false
            });
          } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            set({
              error: 'خطأ في الاتصال بالخادم. تأكد من تشغيل الخادم الخلفي',
              isLoading: false
            });
          } else {
            set({
              error: error.response?.data?.message || error.message || 'حدث خطأ أثناء تسجيل الدخول',
              isLoading: false
            });
          }
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
        
        try {
          // محاولة إعلام الخادم بتسجيل الخروج (اختياري)
          if (currentState.token) {
            await authApi.logout();
          }
        } catch (error: any) {
          console.error('⚠️ خطأ في إعلام الخادم بتسجيل الخروج:', error?.message || 'خطأ غير معروف');
          // لا توقف عملية تسجيل الخروج بسبب خطأ في الخادم
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
            localStorage.removeItem('auth-storage');
            console.log('🗑️ تم مسح بيانات الجلسة');
          }
        }
      },
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
      checkAuth: () => {
        const state = get();
        const isValid = state.isAuthenticated && state.user !== null && state.token !== null;
        console.log('🔍 checkAuth result:', { 
          isAuthenticated: state.isAuthenticated, 
          hasUser: !!state.user, 
          hasToken: !!state.token, 
          isValid 
        });
        return isValid;
      },
      clearError: () => set({ error: null }),
      resetAuth: () => {
        console.log('🔄 Resetting auth state...');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
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
      },
    }
  )
);

