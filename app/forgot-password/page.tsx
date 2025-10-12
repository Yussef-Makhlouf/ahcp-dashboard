"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

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
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح." }),
});

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string>("");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await authApi.forgotPassword(values.email);
      setIsSuccess(true);
      if (response.data?.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
      entityToasts.client.create(response.message);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const errorMessage = error.response?.data?.message || "فشل في إرسال رابط إعادة تعيين كلمة المرور.";
      entityToasts.client.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="mt-4">تم إرسال رابط إعادة التعيين</CardTitle>
            <CardDescription>
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
              {resetUrl && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium mb-2">رابط إعادة التعيين:</p>
                  <a 
                    href={resetUrl} 
                    className="text-blue-600 underline break-all text-xs"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetUrl}
                  </a>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button variant="default" className="w-full">
                العودة إلى تسجيل الدخول
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setIsSuccess(false);
                form.reset();
              }}
            >
              إرسال رابط آخر
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2 space-x-reverse mb-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle>نسيان كلمة المرور</CardTitle>
          </div>
          <CardDescription>
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="أدخل بريدك الإلكتروني"
                          className="pl-10"
                        />
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
                loadingText="جاري الإرسال..."
              >
                إرسال رابط إعادة التعيين
              </LoadingButton>
            </form>
          </Form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2 space-x-reverse">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">ملاحظة:</p>
                <p>إذا لم تجد الرسالة في صندوق الوارد، تحقق من مجلد الرسائل المزعجة.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
