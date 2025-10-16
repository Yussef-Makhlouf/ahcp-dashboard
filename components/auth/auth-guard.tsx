'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      // التحقق من localStorage مباشرة أيضاً
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const isAuth = checkAuth();
      
      console.log('🔍 AuthGuard - Checking authentication:', {
        isAuthenticated,
        isAuth,
        hasUser: !!user,
        userRole: user?.role
      });
      
      if (!isAuth || !user) {
        console.log('❌ AuthGuard - User not authenticated, redirecting to login');
        router.push('/login');
        return;
      }
      
      console.log('✅ AuthGuard - User authenticated, allowing access');
      setIsLoading(false);
    };

    // تأخير أطول قليلاً للتأكد من تحميل البيانات
    const timer = setTimeout(checkAuthentication, 200);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, checkAuth, router]);

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
