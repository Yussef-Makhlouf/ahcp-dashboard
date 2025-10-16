"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

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

// الأشهر بالعربية
const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

// أيام الأسبوع بالعربية
const ARABIC_DAYS_SHORT = ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"];

// دالة لتوليد قائمة السنين (من 1900 إلى 2024)
const generateYearOptions = () => {
  const years = [];
  for (let i = 2024; i >= 1900; i--) {
    years.push(i);
  }
  return years;
};

// دالة لتوليد أيام الشهر
const generateDaysInMonth = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};

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
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  // قائمة السنين المتاحة
  const availableYears = generateYearOptions();

  React.useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        const parsedDate = parseISO(value);
        if (isValid(parsedDate)) {
          setSelectedDate(parsedDate);
          setCurrentYear(parsedDate.getFullYear());
          setCurrentMonth(parsedDate.getMonth());
          setSelectedDay(parsedDate.getDate());
        }
      } else if (value instanceof Date && isValid(value)) {
        setSelectedDate(value);
        setCurrentYear(value.getFullYear());
        setCurrentMonth(value.getMonth());
        setSelectedDay(value.getDate());
      }
    } else {
      setSelectedDate(null);
      setSelectedDay(null);
    }
  }, [value]);

  const handleDateSelect = () => {
    if (selectedDay && currentYear && currentMonth !== null) {
      const newDate = new Date(currentYear, currentMonth, selectedDay);
      if (isValid(newDate)) {
        setSelectedDate(newDate);
        onChange?.(newDate);
        setOpen(false);
      }
    }
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const handleYearChange = (year: string) => {
    setCurrentYear(parseInt(year));
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(parseInt(month));
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

  const daysInMonth = generateDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

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
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-80 p-4 shadow-lg border-0" 
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <div className="space-y-4">
            {/* اختيار السنة والشهر */}
            <div className="flex gap-2">
              <Select
                value={currentYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-24 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={currentMonth.toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-32 h-8 text-sm">
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
              {/* أيام فارغة من الشهر السابق */}
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} className="h-9 w-9" />
              ))}
              
              {/* أيام الشهر */}
              {daysInMonth.map((day) => {
                const isSelected = selectedDay === day;
                const isToday = new Date().getDate() === day && 
                               new Date().getMonth() === currentMonth && 
                               new Date().getFullYear() === currentYear;
                
                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "h-9 w-9 text-sm rounded-md transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                      {
                        "bg-blue-600 text-white font-semibold hover:bg-blue-700": isSelected,
                        "bg-blue-100 text-blue-600 font-semibold": isToday && !isSelected,
                        "text-gray-900": !isSelected && !isToday,
                        "cursor-pointer": true
                      }
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-2 justify-center pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setCurrentYear(today.getFullYear());
                  setCurrentMonth(today.getMonth());
                  setSelectedDay(today.getDate());
                }}
                className="text-xs"
              >
                اليوم
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={handleDateSelect}
                disabled={!selectedDay}
                className="text-xs"
              >
                تأكيد
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedDay(null);
                  onChange?.(null);
                  setOpen(false);
                }}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                مسح
              </Button>
            </div>
          </div>
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
