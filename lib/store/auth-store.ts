import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Mock login function for development
export const mockLogin = (role: User['role'] = 'super_admin') => {
  const mockUser: User = {
    id: '1',
    name: 'إبراهيم أحمد',
    email: 'ibrahim@ahcp.gov.eg',
    role,
    section: role === 'section_supervisor' ? 'parasite_control' : undefined,
  };
  
  useAuthStore.getState().login(mockUser);
  return mockUser;
};
