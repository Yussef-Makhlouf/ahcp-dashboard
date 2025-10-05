import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // في بيئة التطوير، نسمح بالوصول لجميع الصفحات بدون مصادقة
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }
  
  // الحصول على المسار الحالي
  const { pathname } = request.nextUrl;
  
  // المسارات التي لا تحتاج إلى حماية
  const publicPaths = ['/login', '/api'];
  
  // التحقق من أن المسار الحالي ليس من المسارات العامة
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // في بيئة الإنتاج، يمكن تفعيل المصادقة هنا
  // للآن نسمح بالوصول لجميع الصفحات
  return NextResponse.next();
}

// تحديد المسارات التي يجب تطبيق middleware عليها
export const config = {
  matcher: [
    /*
     * تطبيق middleware على جميع المسارات ما عدا:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
