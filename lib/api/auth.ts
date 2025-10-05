import { api } from './base-api';
import type { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: User['role'];
  section?: string;
}

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return await api.post<LoginResponse>('/auth/login', credentials);
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    return await api.post<LoginResponse>('/auth/register', userData);
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    return await api.post<LoginResponse>('/auth/refresh', { refreshToken });
  },

  // Logout user
  logout: async (): Promise<{ success: boolean; message: string }> => {
    return await api.post('/auth/logout');
  },

  // Get current user profile
  getProfile: async (): Promise<{ success: boolean; data: User }> => {
    return await api.get('/auth/profile');
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<{ success: boolean; data: User }> => {
    return await api.put('/auth/profile', userData);
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    return await api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return await api.post('/auth/reset-password', {
      token,
      newPassword
    });
  }
};

export default authApi;
