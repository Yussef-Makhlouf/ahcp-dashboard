"use client";

import { Calendar } from "lucide-react";
import { formatDateShort } from "@/lib/utils/date-utils";

interface DateCellProps {
  date: string | Date | null | undefined;
  showIcon?: boolean;
  className?: string;
  emptyText?: string;
}

/**
 * مكون لعرض التاريخ في خلايا الجدول مع دعم صيغ مختلفة
 */
export function DateCell({ 
  date, 
  showIcon = false, 
  className = "", 
  emptyText = "غير محدد" 
}: DateCellProps) {
  const formattedDate = formatDateShort(date);
  
  if (formattedDate === 'غير محدد') {
    return <span className={`text-muted-foreground ${className}`}>{emptyText}</span>;
  }
  
  if (showIcon) {
    return (
      <div className={`text-sm flex items-center gap-1 ${className}`}>
        <Calendar className="h-3 w-3 text-blue-500" />
        {formattedDate}
      </div>
    );
  }
  
  return <span className={className}>{formattedDate}</span>;
}

/**
 * مكون مخصص لتاريخ الميلاد مع أيقونة ومعالجة محسنة
 */
export function BirthDateCell({ date, className = "" }: { date: string | Date | null | undefined; className?: string }) {
  // تسجيل للتشخيص
  if (date && typeof date === 'string') {
    console.log(`🔍 BirthDateCell received: "${date}"`);
  }
  
  return <DateCell date={date} showIcon={true} className={className} emptyText="غير محدد" />;
}

/**
 * مكون مخصص للتواريخ العادية بدون أيقونة
 */
export function SimpleDateCell({ date, className = "" }: { date: string | Date | null | undefined; className?: string }) {
  return <DateCell date={date} showIcon={false} className={className} />;
}
