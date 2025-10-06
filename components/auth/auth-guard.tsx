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
      
      console.log('🔐 AuthGuard check:', { 
        isAuth, 
        hasUser: !!user, 
        hasToken: !!token,
        hasUserInLocalStorage: !!userStr,
        userName: user?.name,
        userRole: user?.role,
        currentPath: window.location.pathname 
      });
      
      // التحقق من كل من Zustand state و localStorage
      if ((!isAuth || !user) && (!token || !userStr)) {
        console.log('❌ Not authenticated (no state and no localStorage), redirecting to login');
        // حفظ الصفحة الحالية للعودة إليها بعد تسجيل الدخول
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          router.replace(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
        }
        return;
      }
      
      // إذا كانت البيانات موجودة في localStorage لكن ليس في state، حاول تحميلها
      if ((!isAuth || !user) && token && userStr) {
        console.log('⚠️ Data in localStorage but not in state, initializing...');
        try {
          const userData = JSON.parse(userStr);
          useAuthStore.setState({
            user: userData,
            token,
            refreshToken: localStorage.getItem('refreshToken'),
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          console.log('✅ State initialized from localStorage');
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
        }
      }
      
      console.log('✅ Authenticated, allowing access');
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
