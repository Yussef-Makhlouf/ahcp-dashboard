"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { KeyRound, CheckCircle } from "lucide-react";

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
  const params = useParams();
  const token = params.token as string;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, values.password);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.message || "فشل في إعادة تعيين كلمة المرور.";
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
            <CardTitle className="mt-4">تم تغيير كلمة المرور بنجاح</CardTitle>
            <CardDescription>
              يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button variant="default" className="w-full">الانتقال إلى صفحة تسجيل الدخول</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>تعيين كلمة مرور جديدة</CardTitle>
          <CardDescription>أدخل كلمة المرور الجديدة الخاصة بك.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Form fields for password and passwordConfirm */}
              <LoadingButton type="submit" className="w-full" loading={isSubmitting} loadingText="جاري الحفظ...">حفظ كلمة المرور الجديدة</LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
