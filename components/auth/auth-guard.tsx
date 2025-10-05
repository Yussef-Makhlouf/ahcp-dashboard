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
    // في بيئة التطوير، نسمح بالوصول مباشرة
    if (process.env.NODE_ENV === 'development') {
      setIsLoading(false);
      return;
    }

    const checkAuthentication = () => {
      const isAuth = checkAuth();
      
      if (!isAuth || !user) {
        router.push('/login');
        return;
      }
      
      setIsLoading(false);
    };

    // تأخير قصير للتأكد من تحميل البيانات
    const timer = setTimeout(checkAuthentication, 100);
    
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

  // في بيئة التطوير، نسمح بالوصول بدون مصادقة
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }

  if (!isAuthenticated || !user) {
    return null; // سيتم إعادة التوجيه في useEffect
  }

  return <>{children}</>;
}
