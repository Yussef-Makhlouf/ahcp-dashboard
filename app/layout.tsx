import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals-clean.css";
import "./globals-mobile.css";
import "./globals-rtl.css";

export const metadata: Metadata = {
  title: "AHCP Dashboard - Animal Health Care Program",
  description: "Animal Health Care Program Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
