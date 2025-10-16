"use client";

import * as React from "react";
import { format, isValid, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// الأشهر بالعربية
const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

// أيام الأسبوع بالعربية
const ARABIC_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const ARABIC_DAYS_SHORT = ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"];

// دالة لتوليد قائمة السنين
const generateYearOptions = (currentYear: number, range: number = 10) => {
  const years = [];
  for (let i = currentYear - range; i <= currentYear + range; i++) {
    years.push(i);
  }
  return years;
};

interface ModernCalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  mode?: "single" | "range";
  selectedRange?: DateRange | null;
  onSelectRange?: (range: DateRange | null) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

function ModernCalendar({
  selected,
  onSelect,
  mode = "single",
  selectedRange,
  onSelectRange,
  minDate,
  maxDate,
  className
}: ModernCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());
  const [rangeStart, setRangeStart] = React.useState<Date | null>(null);
  
  // قائمة السنين المتاحة
  const availableYears = generateYearOptions(new Date().getFullYear(), 15);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // إضافة أيام من الشهر السابق والتالي لملء الشبكة
  const startDate = new Date(monthStart);
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const endDate = new Date(monthEnd);
  const endDayOfWeek = endDate.getDay();
  endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDateClick = (date: Date) => {
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;

    if (mode === "single") {
      onSelect?.(date);
    } else if (mode === "range") {
      if (!rangeStart || (rangeStart && selectedRange?.to)) {
        // بداية نطاق جديد
        setRangeStart(date);
        onSelectRange?.({ from: date, to: undefined });
      } else {
        // إكمال النطاق
        const range = rangeStart <= date 
          ? { from: rangeStart, to: date }
          : { from: date, to: rangeStart };
        onSelectRange?.(range);
        setRangeStart(null);
      }
    }
  };

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(parseInt(monthIndex));
    setCurrentMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(year));
    setCurrentMonth(newDate);
  };

  const isDateSelected = (date: Date) => {
    if (mode === "single") {
      return selected && isSameDay(date, selected);
    } else if (mode === "range" && selectedRange) {
      if (selectedRange.from && selectedRange.to) {
        return date >= selectedRange.from && date <= selectedRange.to;
      } else if (selectedRange.from) {
        return isSameDay(date, selectedRange.from);
      }
    }
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (mode === "range" && selectedRange?.from && selectedRange?.to) {
      return date > selectedRange.from && date < selectedRange.to;
    }
    return false;
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className={cn("p-4 bg-white rounded-lg border shadow-sm", className)}>
      {/* رأس التقويم */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          {/* قائمة الشهور */}
          <Select
            value={currentMonth.getMonth().toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARABIC_MONTHS.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* قائمة السنين */}
          <Select
            value={currentMonth.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* أيام الأسبوع */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {ARABIC_DAYS_SHORT.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* أيام الشهر */}
      <div className="grid grid-cols-7 gap-1">
        {allDays.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = isDateSelected(date);
          const isInRange = isDateInRange(date);
          const isDisabled = isDateDisabled(date);
          const isTodayDate = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={cn(
                "h-9 w-9 text-sm rounded-md transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                {
                  // الشهر الحالي
                  "text-gray-900": isCurrentMonth,
                  "text-gray-400": !isCurrentMonth,
                  
                  // اليوم الحالي
                  "bg-blue-100 text-blue-600 font-semibold": isTodayDate && !isSelected,
                  
                  // محدد
                  "bg-blue-600 text-white font-semibold hover:bg-blue-700": isSelected,
                  
                  // في النطاق
                  "bg-blue-50 text-blue-600": isInRange && !isSelected,
                  
                  // معطل
                  "opacity-50 cursor-not-allowed hover:bg-transparent": isDisabled,
                  
                  // غير معطل
                  "cursor-pointer": !isDisabled
                }
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* أزرار سريعة للتاريخ الحالي */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              if (mode === "single") {
                onSelect?.(today);
              } else {
                onSelectRange?.({ from: today, to: today });
              }
            }}
            className="text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            اليوم
          </Button>
          
          {mode === "single" && selected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect?.(null)}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-3 w-3 mr-1" />
              مسح
            </Button>
          )}
          
          {mode === "range" && selectedRange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectRange?.(null)}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-3 w-3 mr-1" />
              مسح النطاق
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface ModernDatePickerProps {
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

export function ModernDatePicker({
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
}: ModernDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

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

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    onChange?.(date);
    setOpen(false);
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

  const formatDisplayDate = (date: Date) => {
    return format(date, "dd MMMM yyyy", { locale: ar });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between text-right font-normal transition-all duration-200",
              sizeClasses[size],
              variantClasses[variant],
              !selectedDate && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500 focus:ring-red-200",
              disabled && "opacity-50 cursor-not-allowed",
              "hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            )}
          >
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
                {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
              </span>
            </div>
            
            {selectedDate && !disabled && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                محدد
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-auto p-0 shadow-lg border-0" 
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <ModernCalendar
            selected={selectedDate}
            onSelect={handleDateSelect}
            minDate={minDate}
            maxDate={maxDate}
            className="border-0 shadow-none"
          />
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}

export interface ModernDateRangePickerProps {
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
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "modern";
}

export function ModernDateRangePicker({
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
  size = "md",
  variant = "modern"
}: ModernDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<DateRange | null>(null);

  React.useEffect(() => {
    setSelectedRange(value || null);
  }, [value]);

  const handleRangeSelect = (range: DateRange | null) => {
    setSelectedRange(range);
    onChange?.(range);
    
    if (range?.from && range?.to) {
      setOpen(false);
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

  const formatDisplayRange = (range: DateRange) => {
    if (range.from && range.to) {
      if (isSameDay(range.from, range.to)) {
        return format(range.from, "dd MMMM yyyy", { locale: ar });
      }
      return `${format(range.from, "dd MMM", { locale: ar })} - ${format(range.to, "dd MMM yyyy", { locale: ar })}`;
    } else if (range.from) {
      return format(range.from, "dd MMMM yyyy", { locale: ar });
    }
    return "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between text-right font-normal transition-all duration-200",
              sizeClasses[size],
              variantClasses[variant],
              !selectedRange && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500 focus:ring-red-200",
              disabled && "opacity-50 cursor-not-allowed",
              "hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            )}
          >
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className={selectedRange ? "text-gray-900" : "text-gray-500"}>
                {selectedRange ? formatDisplayRange(selectedRange) : placeholder}
              </span>
            </div>
            
            {selectedRange && !disabled && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                نطاق محدد
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-auto p-0 shadow-lg border-0" 
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <ModernCalendar
            mode="range"
            selectedRange={selectedRange}
            onSelectRange={handleRangeSelect}
            minDate={minDate}
            maxDate={maxDate}
            className="border-0 shadow-none"
          />
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}
