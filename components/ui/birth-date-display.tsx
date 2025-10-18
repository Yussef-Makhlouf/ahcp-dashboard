"use client";

import { Calendar, AlertCircle } from "lucide-react";
import { parseFlexibleDate, formatDateShort } from "@/lib/utils/date-utils";

interface BirthDateDisplayProps {
  birthDate: string | Date | null | undefined;
  className?: string;
  showIcon?: boolean;
  showAge?: boolean;
  emptyText?: string;
}

/**
 * مكون متخصص لعرض تاريخ الميلاد مع حساب العمر
 */
export function BirthDateDisplay({ 
  birthDate, 
  className = "", 
  showIcon = true,
  showAge = false,
  emptyText = "غير محدد" 
}: BirthDateDisplayProps) {
  const parsedDate = parseFlexibleDate(birthDate);
  
  if (!parsedDate) {
    return (
      <span className={`text-muted-foreground ${className}`}>
        {showIcon && <AlertCircle className="h-3 w-3 inline mr-1" />}
        {emptyText}
      </span>
    );
  }
  
  // حساب العمر
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const age = calculateAge(parsedDate);
  const formattedDate = formatDateShort(parsedDate);
  
  return (
    <div className={`text-sm flex items-center gap-1 ${className}`}>
      {showIcon && <Calendar className="h-3 w-3 text-blue-500" />}
      <span>{formattedDate}</span>
      {showAge && age >= 0 && (
        <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
          ({age} سنة)
        </span>
      )}
    </div>
  );
}

/**
 * مكون مبسط لتاريخ الميلاد مع العمر
 */
export function BirthDateWithAge({ 
  birthDate, 
  className = "" 
}: { 
  birthDate: string | Date | null | undefined; 
  className?: string 
}) {
  return (
    <BirthDateDisplay 
      birthDate={birthDate} 
      className={className} 
      showAge={true} 
      showIcon={true} 
    />
  );
}

/**
 * مكون مضغوط لتاريخ الميلاد بدون أيقونة
 */
export function BirthDateCompact({ 
  birthDate, 
  className = "" 
}: { 
  birthDate: string | Date | null | undefined; 
  className?: string 
}) {
  return (
    <BirthDateDisplay 
      birthDate={birthDate} 
      className={className} 
      showAge={false} 
      showIcon={false} 
    />
  );
}
