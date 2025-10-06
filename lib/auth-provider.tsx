"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from './store/auth-store';
import { authApi } from './api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, login, logout, initializeAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تهيئة المصادقة من localStorage
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth from localStorage...');
        // تحميل البيانات من localStorage إلى Zustand state
        initializeAuth();
        setLoading(false);
        console.log('✅ Auth system ready');
      } catch (error) {
        console.error('❌ خطأ في تهيئة المصادقة:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, [initializeAuth]);

  const handleLogin = async (credentials: any) => {
    try {
      setLoading(true);
      await login(credentials);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login: handleLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
