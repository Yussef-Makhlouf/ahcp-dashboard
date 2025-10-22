import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals-clean.css";
import "../styles/toast.css";
import "../styles/artat-responsive.css";

export const metadata: Metadata = {
  title: "ARTAT - أرطات لصحة الحيوان | Artat Animal Health System (AAHS)",
  description: "نظام أرطات الإلكتروني لإدارة خدمات صحة الحيوان - تطعيمات، مكافحة طفيليات، مختبرات وعيادات متنقلة | Artat Electronic System for Animal Health Services Management - Modern, Nature-Inspired Platform",
  keywords: ["ARTAT", "أرطات", "Animal Health", "صحة الحيوان", "Veterinary", "Saudi Arabia", "Livestock Management"],
  authors: [{ name: "ARTAT Team" }],
  openGraph: {
    title: "ARTAT - نظام أرطات لصحة الحيوان",
    description: "منصة إلكترونية حديثة لإدارة خدمات الصحة الحيوانية في المملكة العربية السعودية",
    type: "website",
    locale: "ar_SA",
  },
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
