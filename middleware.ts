import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // الحصول على المسار الحالي
  const { pathname } = request.nextUrl;
  
  // المسارات التي لا تحتاج إلى حماية
  const publicPaths = ['/login'];
  
  // التحقق من أن المسار الحالي ليس من المسارات العامة
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // في بيئة التطوير، نسمح بالوصول للصفحات المحمية
  // في بيئة الإنتاج، يجب التحقق من JWT token أو session
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }
  
  // التحقق من وجود بيانات المصادقة في cookies
  const authToken = request.cookies.get('auth-storage');
  
  // إذا لم يكن هناك token، أعد التوجيه إلى صفحة تسجيل الدخول
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    // إضافة معامل returnUrl لإعادة التوجيه بعد تسجيل الدخول
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // التحقق من صحة البيانات المخزنة
  try {
    const authData = JSON.parse(authToken.value);
    if (!authData.state?.isAuthenticated || !authData.state?.user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    // إذا فشل تحليل البيانات، أعد التوجيه إلى تسجيل الدخول
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
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
