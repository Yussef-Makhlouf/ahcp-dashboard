"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface SimpleDatePickerProps {
  className?: string;
  placeholder?: string;
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "modern";
}

export function SimpleDatePicker({
  className,
  placeholder = "اختر التاريخ",
  value,
  onChange,
  disabled = false,
  error,
  label,
  required = false,
  minDate,
  maxDate,
  size = "md",
  variant = "modern"
}: SimpleDatePickerProps) {
  const [inputValue, setInputValue] = React.useState<string>("");

  // Convert value to input format (YYYY-MM-DD)
  React.useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        const parsedDate = parseISO(value);
        if (isValid(parsedDate)) {
          setInputValue(format(parsedDate, "yyyy-MM-dd"));
        } else {
          setInputValue(value);
        }
      } else if (value instanceof Date && isValid(value)) {
        setInputValue(format(value, "yyyy-MM-dd"));
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
    setInputValue(inputDate);
    
    if (inputDate) {
      const date = new Date(inputDate);
      if (isValid(date)) {
        onChange?.(date);
      }
    } else {
      onChange?.(null);
    }
  };

  const sizeClasses = {
    sm: "h-8 text-xs px-3",
    md: "h-10 text-sm px-4",
    lg: "h-12 text-base px-5"
  };

  const variantClasses = {
    default: "border-gray-300 bg-white",
    outline: "border-gray-300 bg-white",
    modern: "border-gray-200 bg-gradient-to-r from-white to-gray-50 shadow-sm"
  };

  const minDateStr = minDate ? format(minDate, "yyyy-MM-dd") : undefined;
  const maxDateStr = maxDate ? format(maxDate, "yyyy-MM-dd") : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <input
        type="date"
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled}
        min={minDateStr}
        max={maxDateStr}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border transition-all duration-200 text-right",
          sizeClasses[size],
          variantClasses[variant],
          error && "border-red-500 focus:border-red-500 focus:ring-red-200",
          disabled && "opacity-50 cursor-not-allowed",
          "hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        )}
      />
      
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}