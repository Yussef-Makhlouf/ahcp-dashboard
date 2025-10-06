import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi, type LoginRequest } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => boolean;
  clearError: () => void;
  initializeAuth: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          console.log(' Attempting login to backend API...');
          
          const response = await authApi.login(credentials);
          
          if (response.success && response.data) {
            const { user, token, refreshToken } = response.data;
            
            // حفظ البيانات في localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(user));
              if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
              }
            }
            
            set({
              user,
              token,
              refreshToken: refreshToken || null,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            
            console.log(' Login successful:', { 
              userName: user.name, 
              role: user.role, 
              section: user.section 
            });
          } else {
            const errorMsg = response.message || 'فشل في تسجيل الدخول';
            set({
              error: errorMsg,
              isLoading: false,
              isAuthenticated: false
            });
            throw new Error(errorMsg);
          }
        } catch (error: any) {
          console.error('Login error:', error);
          const errorMsg = error.response?.data?.message || error.message || 'حدث خطأ أثناء تسجيل الدخول';
          set({
            error: errorMsg,
            isLoading: false,
            isAuthenticated: false
          });
          throw error;
        }
      },
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null 
          });
          // مسح البيانات من localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
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
      initializeAuth: () => {
        // تحميل البيانات من localStorage عند بدء التطبيق
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              set({
                user,
                token,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
              console.log('✅ Auth initialized from localStorage');
            } catch (error) {
              console.error('Failed to parse user from localStorage:', error);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('refreshToken');
            }
          }
        }
      },
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
    email: 'ibrahim@ahcp.gov.eg',
    password: 'admin123'
  };
  
  try {
    await useAuthStore.getState().login(mockCredentials);
  } catch (error) {
    // If API login fails, use local mock data
    const mockUser: User = {
      id: '1',
      name: 'إبراهيم أحمد',
      email: 'ibrahim@ahcp.gov.eg',
      role,
      section: role === 'section_supervisor' ? 'Parasite Control' : undefined,
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
