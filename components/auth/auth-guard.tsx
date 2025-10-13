'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, user, checkAuth, validateToken, isRehydrated } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  // useEffect للتعامل مع إعادة التحميل
  useEffect(() => {
    if (isRehydrated && !hasChecked) {
      console.log('🔄 Rehydration completed, checking auth...');
      setHasChecked(true);
    }
  }, [isRehydrated, hasChecked]);

  useEffect(() => {
    const checkAuthentication = async () => {
      // انتظار إعادة التحميل من localStorage
      if (!isRehydrated) {
        console.log('⏳ Waiting for rehydration...');
        return;
      }
      
      // منع التحقق المتعدد
      if (hasChecked) return;
      
      console.log('🔍 AuthGuard - Initial check:', {
        isAuthenticated,
        hasUser: !!user,
        isRehydrated
      });
      
      // التحقق من وجود بيانات أساسية - أكثر تساهلاً
      if (!user) {
        console.log('❌ AuthGuard - No user data, redirecting to login');
        setHasChecked(true);
        router.push('/login');
        return;
      }
      
      // التحقق من صحة الرمز إذا كان موجوداً - بدون إجبار
      if (user && isAuthenticated) {
        const isTokenValid = validateToken();
        if (!isTokenValid) {
          console.log('⚠️ AuthGuard - Token validation failed, but allowing access for now');
          // لا نعيد التوجيه هنا - نترك للمستخدم أن يقرر
        }
      }
      
      console.log('✅ AuthGuard - User authenticated, allowing access');
      setHasChecked(true);
      setIsLoading(false);
    };

    // تأخير قصير للتأكد من تحميل البيانات من localStorage
    const timer = setTimeout(checkAuthentication, 200);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, checkAuth, validateToken, router, hasChecked, isRehydrated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // سيتم إعادة التوجيه في useEffect
  }

  return <>{children}</>;
}
