"use client";

import { useTranslation } from "@/lib/use-translation";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-right">{t(title)}</h1>
        <p className="text-muted-foreground mt-2 text-right">
          {t(subtitle)}
        </p>
      </div>
      {children}
    </div>
  );
}
