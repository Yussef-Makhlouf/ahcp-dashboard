"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { KeyRound, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

import { Button, LoadingButton } from "@/components/ui/button-modern";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-modern";
import { authApi } from "@/lib/api/auth";
import { entityToasts } from "@/lib/utils/toast-utils";

const formSchema = z.object({
  password: z.string().min(8, { message: "يجب أن تكون كلمة المرور 8 أحرف على الأقل." }),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["passwordConfirm"],
});

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<{ email: string; name: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await authApi.verifyResetToken(token);
        setIsTokenValid(true);
        setUserInfo(response.data || null);
      } catch (error: any) {
        console.error("Token verification error:", error);
        setIsTokenValid(false);
        entityToasts.client.error("الرمز غير صحيح أو منتهي الصلاحية.");
      }
    };

    verifyToken();
  }, [token]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, values.password);
      setIsSuccess(true);
      entityToasts.client.create("تم تغيير كلمة المرور بنجاح!");
    } catch (error: any) {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.message || "فشل في إعادة تعيين كلمة المرور.";
      entityToasts.client.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading state
  if (isTokenValid === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-blue-100 rounded-full p-3 w-fit">
              <KeyRound className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="mt-4">جاري التحقق من الرمز...</CardTitle>
            <CardDescription>
              يرجى الانتظار بينما نتحقق من صحة الرمز.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Invalid token
  if (isTokenValid === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-red-100 rounded-full p-3 w-fit">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="mt-4">الرمز غير صحيح</CardTitle>
            <CardDescription>
              الرمز غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/forgot-password">
              <Button variant="default" className="w-full">
                طلب رابط جديد
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                العودة إلى تسجيل الدخول
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="mt-4">تم تغيير كلمة المرور بنجاح</CardTitle>
            <CardDescription>
              يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button variant="default" className="w-full">
                الانتقال إلى صفحة تسجيل الدخول
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>تعيين كلمة مرور جديدة</CardTitle>
          <CardDescription>
            {userInfo ? (
              <>أدخل كلمة المرور الجديدة لـ <strong>{userInfo.name}</strong> ({userInfo.email})</>
            ) : (
              "أدخل كلمة المرور الجديدة الخاصة بك."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور الجديدة"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأكيد كلمة المرور</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPasswordConfirm ? "text" : "password"}
                          placeholder="أعد إدخال كلمة المرور"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        >
                          {showPasswordConfirm ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <LoadingButton 
                type="submit" 
                className="w-full" 
                loading={isSubmitting} 
                loadingText="جاري الحفظ..."
              >
                حفظ كلمة المرور الجديدة
              </LoadingButton>
            </form>
          </Form>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start space-x-2 space-x-reverse">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">متطلبات كلمة المرور:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>8 أحرف على الأقل</li>
                  <li>يُنصح بدمج الأحرف والأرقام والرموز</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
