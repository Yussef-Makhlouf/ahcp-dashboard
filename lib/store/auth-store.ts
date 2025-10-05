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
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            error: null 
          });
          // مسح البيانات من localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
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
      section: role === 'section_supervisor' ? 'parasite_control' : undefined,
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
