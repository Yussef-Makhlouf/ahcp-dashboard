import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals-new.css";

export const metadata: Metadata = {
  title: "AHCP Dashboard - مشروع صحة الحيوان",
  description: "لوحة تحكم إدارة تقارير خدمات الصحة الحيوانية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
