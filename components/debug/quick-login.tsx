"use client";

import React from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function QuickLogin() {
  const { login, isLoading } = useAuthStore();

  const handleQuickLogin = async () => {
    try {
      await login({
        email: 'admin@ahcp.gov.sa',
        password: 'Admin@123456'
      });
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('فشل في تسجيل الدخول: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button 
        onClick={handleQuickLogin}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        {isLoading ? '🔄 جاري تسجيل الدخول...' : '🔑 تسجيل دخول سريع'}
      </Button>
    </div>
  );
}
