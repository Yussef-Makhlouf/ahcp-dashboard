"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon, X, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface EnhancedDatePickerProps {
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
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export interface EnhancedDateRangePickerProps {
  className?: string;
  placeholder?: string;
  value?: DateRange | null;
  onChange?: (dateRange: DateRange | null) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  numberOfMonths?: number;
}

// مكون التقويم المفرد المحسن
export function EnhancedDatePicker({
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
  clearable = true,
  size = "md",
  variant = "outline",
}: EnhancedDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  // تحويل القيمة إلى Date object
  React.useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        const parsedDate = parseISO(value);
        setSelectedDate(isValid(parsedDate) ? parsedDate : null);
      } else if (value instanceof Date && isValid(value)) {
        setSelectedDate(value);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    const newDate = date || null;
    setSelectedDate(newDate);
    onChange?.(newDate);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange?.(null);
  };

  const sizeClasses = {
    sm: "h-8 text-xs px-2",
    md: "h-10 text-sm px-3",
    lg: "h-12 text-base px-4"
  };

  const formatDisplayDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ar });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={variant}
            disabled={disabled}
            className={cn(
              "w-full justify-between text-right font-normal",
              sizeClasses[size],
              !selectedDate && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {clearable && selectedDate && !disabled && (
                <X
                  className="h-4 w-4 hover:text-red-500 transition-colors"
                  onClick={handleClear}
                />
              )}
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={handleDateSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            locale={ar}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

// مكون نطاق التواريخ المحسن
export function EnhancedDateRangePicker({
  className,
  placeholder = "اختر نطاق التاريخ",
  value,
  onChange,
  disabled = false,
  error,
  label,
  required = false,
  minDate,
  maxDate,
  clearable = true,
  size = "md",
  variant = "outline",
  numberOfMonths = 2,
}: EnhancedDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>();

  React.useEffect(() => {
    setSelectedRange(value || undefined);
  }, [value]);

  const handleRangeSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    onChange?.(range || null);
    
    // إغلاق التقويم عند اختيار نطاق كامل
    if (range?.from && range?.to) {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRange(undefined);
    onChange?.(null);
  };

  const sizeClasses = {
    sm: "h-8 text-xs px-2",
    md: "h-10 text-sm px-3",
    lg: "h-12 text-base px-4"
  };

  const formatDisplayRange = (range: DateRange) => {
    if (range.from && range.to) {
      return `${format(range.from, "dd/MM/yyyy")} - ${format(range.to, "dd/MM/yyyy")}`;
    } else if (range.from) {
      return format(range.from, "dd/MM/yyyy");
    }
    return "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={variant}
            disabled={disabled}
            className={cn(
              "w-full justify-between text-right font-normal",
              sizeClasses[size],
              !selectedRange && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {selectedRange ? formatDisplayRange(selectedRange) : placeholder}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {clearable && selectedRange && !disabled && (
                <X
                  className="h-4 w-4 hover:text-red-500 transition-colors"
                  onClick={handleClear}
                />
              )}
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleRangeSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            numberOfMonths={numberOfMonths}
            initialFocus
            locale={ar}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

// مكون مدمج يدعم كلا النوعين
export interface SmartDatePickerProps {
  mode?: "single" | "range";
  className?: string;
  placeholder?: string;
  value?: Date | string | DateRange | null;
  onChange?: (value: Date | DateRange | null) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  numberOfMonths?: number;
  // خصائص API
  apiEndpoint?: string;
  apiParams?: Record<string, any>;
  onApiCall?: (params: { startDate?: string; endDate?: string; date?: string }) => void;
}

export function SmartDatePicker({
  mode = "single",
  apiEndpoint,
  apiParams,
  onApiCall,
  onChange,
  ...props
}: SmartDatePickerProps) {
  const handleDateChange = (value: Date | DateRange | null) => {
    onChange?.(value);
    
    // استدعاء API عند تغيير التاريخ
    if (onApiCall) {
      if (mode === "single" && value instanceof Date) {
        onApiCall({
          date: format(value, "yyyy-MM-dd"),
          ...apiParams
        });
      } else if (mode === "range" && value && typeof value === "object" && "from" in value) {
        const range = value as DateRange;
        onApiCall({
          startDate: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
          endDate: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
          ...apiParams
        });
      }
    }
  };

  if (mode === "range") {
    return (
      <EnhancedDateRangePicker
        {...props}
        value={props.value as DateRange}
        onChange={(range) => handleDateChange(range)}
      />
    );
  }

  return (
    <EnhancedDatePicker
      {...props}
      value={props.value as Date | string}
      onChange={(date) => handleDateChange(date)}
    />
  );
}

// Hook لاستخدام التقويم مع API
export function useDateFilter(
  initialValue?: Date | DateRange | null,
  apiCallback?: (params: any) => void
) {
  const [dateValue, setDateValue] = React.useState(initialValue || null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDateChange = React.useCallback(async (value: Date | DateRange | null) => {
    setDateValue(value);
    
    if (apiCallback && value) {
      setIsLoading(true);
      try {
        if (value instanceof Date) {
          await apiCallback({ date: format(value, "yyyy-MM-dd") });
        } else if (typeof value === "object" && "from" in value) {
          const range = value as DateRange;
          await apiCallback({
            startDate: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
            endDate: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
          });
        }
      } catch (error) {
        console.error("Error calling API:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [apiCallback]);

  return {
    dateValue,
    setDateValue: handleDateChange,
    isLoading,
  };
}
