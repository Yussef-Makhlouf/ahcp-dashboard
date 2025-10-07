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
          set({ isLoading: true, error: null });
          const response = await authApi.login(credentials);
          
          if (response.success) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            set({
              error: response.message || 'فشل في تسجيل الدخول',
              isLoading: false
            });
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول',
            isLoading: false
          });
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
        return state.isAuthenticated && state.user !== null && state.token !== null;
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(name);
        },
      },
    }
  )
);

// Mock login function for development
export const mockLogin = async (role: User['role'] = 'super_admin') => {
  const mockCredentials: LoginRequest = {
    email: 'admin@ahcp.gov.sa',
    password: 'Admin@123456'
  };
  
  try {
    await useAuthStore.getState().login(mockCredentials);
  } catch (error) {
    // If API login fails, use local mock data
    const mockUser: User = {
      id: '1',
      name: 'مدير النظام',
      email: 'admin@ahcp.gov.sa',
      role,
      section: role === 'section_supervisor' ? 'parasite_control' : '',
      roleNameAr: role === 'super_admin' ? 'مدير عام' : 'مشرف قسم',
      isActive: true
    };
    
    useAuthStore.setState({
      user: mockUser,
      token: 'mock-token-' + Date.now(),
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
    
    return mockUser;
  }
};
