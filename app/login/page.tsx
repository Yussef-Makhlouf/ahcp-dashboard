'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { entityToasts } from '@/lib/utils/toast-utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  
  const { login, isAuthenticated, resetAuth } = useAuthStore();
  const router = useRouter();
  const [returnUrl, setReturnUrl] = useState('/');

  // الحصول على returnUrl من URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const url = urlParams.get('returnUrl') || '/';
      setReturnUrl(url);
      console.log('Return URL:', url);
    }
  }, []);

  // التحقق من حالة المصادقة
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User is authenticated, redirecting to:', returnUrl);
      console.log('Current pathname:', window.location.pathname);
      
      // إعادة توجيه فورية بدون تأخير
      router.replace(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  // دالة التحقق من صحة البريد الإلكتروني
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // دالة التحقق من صحة كلمة المرور
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // دالة التحقق من صحة النموذج
  const validateForm = () => {
    let isValid = true;
    const errors = { email: '', password: '' };

    // التحقق من البريد الإلكتروني
    if (!email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
      isValid = false;
    }

    // التحقق من كلمة المرور
    if (!password.trim()) {
      errors.password = 'كلمة المرور مطلوبة';
      isValid = false;
    } else if (!validatePassword(password)) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      isValid = false;
    }

    setEmailError(errors.email);
    setPasswordError(errors.password);
    return isValid;
  };

  // دالة معالجة تغيير البريد الإلكتروني
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError('');
    setSuccess('');
    
    if (touched.email) {
      if (!value.trim()) {
        setEmailError('البريد الإلكتروني مطلوب');
      } else if (!validateEmail(value)) {
        setEmailError('يرجى إدخال بريد إلكتروني صحيح');
      } else {
        setEmailError('');
      }
    }
  };

  // دالة معالجة تغيير كلمة المرور
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setError('');
    setSuccess('');
    
    if (touched.password) {
      if (!value.trim()) {
        setPasswordError('كلمة المرور مطلوبة');
      } else if (!validatePassword(value)) {
        setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      } else {
        setPasswordError('');
      }
    }
  };

  // دالة معالجة فقدان التركيز
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'email') {
      if (!email.trim()) {
        setEmailError('البريد الإلكتروني مطلوب');
      } else if (!validateEmail(email)) {
        setEmailError('يرجى إدخال بريد إلكتروني صحيح');
      } else {
        setEmailError('');
      }
    } else if (field === 'password') {
      if (!password.trim()) {
        setPasswordError('كلمة المرور مطلوبة');
      } else if (!validatePassword(password)) {
        setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // التحقق من صحة النموذج
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting login with:', { email, password: '***' });
      
      // اختبار الاتصال بالخادم أولاً
      try {
        const testResponse = await fetch('https://ahcp-backend.vercel.app/health');
        console.log('🏥 Server health check:', testResponse.status);
      } catch (testError) {
        console.warn('⚠️ Server health check failed:', testError);
      }
      
      // استدعاء API الحقيقي
      await login({ email, password });
      
      setSuccess('تم تسجيل الدخول بنجاح! جاري التوجيه...');
      entityToasts.auth.login();
      console.log('✅ Login successful, redirecting to:', returnUrl);
      
      // إعادة توجيه فورية بعد نجاح تسجيل الدخول
      setTimeout(() => {
        router.replace(returnUrl);
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // استخدام toast-utils الجديد لمعالجة الأخطاء
      entityToasts.auth.error(error);
      
      // معالجة أنواع مختلفة من الأخطاء للعرض في الصفحة
      if (error.response?.status === 401) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (error.response?.status === 403) {
        setError('الحساب غير مفعل أو محظور');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('خطأ في الاتصال بالخادم. تأكد من تشغيل الخادم الخلفي');
      } else {
        setError(error.response?.data?.message || error.message || 'حدث خطأ أثناء تسجيل الدخول');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      {/* خلفية ديكورية هادئة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* شعار الشركة */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl shadow-xl mb-6">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">AHCP</h1>
          <p className="text-slate-600 text-xl font-medium">مشروع صحة الحيوان</p>
          <p className="text-sm text-slate-500 mt-2">Animal Health Care Project</p>
        </div>

        {/* بطاقة تسجيل الدخول */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800 mb-2">تسجيل الدخول</CardTitle>
            <CardDescription className="text-slate-600 text-lg">
              أدخل بياناتك للوصول إلى لوحة التحكم
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* رسالة الخطأ العامة */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* رسالة النجاح */}
              {success && (
                <Alert className="border-green-200 bg-green-50 rounded-xl">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 font-medium">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="admin@ahcp.gov.sa"
                  className={`h-14 text-right text-lg rounded-xl border-2 transition-all duration-200 ${
                    emailError 
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'
                  }`}
                  required
                />
                {emailError && (
                  <div className="flex items-center space-x-2 space-x-reverse text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="أدخل كلمة المرور"
                    className={`h-14 text-right text-lg pr-14 rounded-xl border-2 transition-all duration-200 ${
                      passwordError 
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                        : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'
                    }`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-14 px-4 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </Button>
                </div>
                {passwordError && (
                  <div className="flex items-center space-x-2 space-x-reverse text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white font-semibold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !!emailError || !!passwordError}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>

              {/* رابط نسيان كلمة المرور */}
              <div className="text-center mt-4">
                <Link 
                  href="/forgot-password"
                  className="text-sm text-slate-600 hover:text-slate-800 hover:underline transition-colors duration-200"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </form>

            {/* معلومات تسجيل الدخول */}
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                <Shield className="w-4 h-4 ml-2 text-slate-600" />
                بيانات تسجيل الدخول المتاحة:
              </h4>
              <div className="text-sm text-slate-700 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                    <span className="font-medium text-slate-600">مدير النظام:</span>
                    <span className="text-slate-800 font-mono text-xs">admin@ahcp.gov.sa</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                    <span className="font-medium text-slate-600">مشرف مكافحة الطفيليات:</span>
                    <span className="text-slate-800 font-mono text-xs">parasite@ahcp.gov.sa</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                    <span className="font-medium text-slate-600">مشرف التحصينات:</span>
                    <span className="text-slate-800 font-mono text-xs">vaccination@ahcp.gov.sa</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                    <span className="font-medium text-slate-600">مشرف العيادة المتنقلة:</span>
                    <span className="text-slate-800 font-mono text-xs">clinic@ahcp.gov.sa</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium">💡 كلمة المرور الافتراضية: Admin@123456</p>
                  <p className="text-xs text-blue-600 mt-1">للمستخدمين الآخرين، كلمة المرور هي اسم القسم + 123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* حقوق النشر */}
        <div className="text-center mt-10 text-sm text-slate-500">
          <p>© 2024 AHCP - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}
