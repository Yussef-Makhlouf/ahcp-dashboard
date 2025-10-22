"use client";

import * as React from "react";
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar, Filter, X, Clock } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Removed ModernDateRangePicker import - using simple date inputs instead

export interface DateFilterProps {
  className?: string;
  value?: DateRange | null;
  onChange?: (dateRange: DateRange | null) => void;
  onApiCall?: (params: { startDate?: string; endDate?: string }) => void;
  placeholder?: string;
  label?: string;
  showPresets?: boolean;
  showClearAll?: boolean;
  disabled?: boolean;
}

const DATE_PRESETS = [
  {
    label: "اليوم",
    value: "today",
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date())
    })
  },
  {
    label: "أمس",
    value: "yesterday", 
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1))
    })
  },
  {
    label: "آخر 7 أيام",
    value: "last7days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date())
    })
  },
  {
    label: "آخر 30 يوم",
    value: "last30days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date())
    })
  },
  {
    label: "هذا الأسبوع",
    value: "thisWeek",
    getRange: () => ({
      from: startOfDay(subWeeks(new Date(), 0)),
      to: endOfDay(new Date())
    })
  },
  {
    label: "هذا الشهر",
    value: "thisMonth",
    getRange: () => ({
      from: startOfDay(subMonths(new Date(), 0)),
      to: endOfDay(new Date())
    })
  },
  {
    label: "آخر 3 أشهر",
    value: "last3months",
    getRange: () => ({
      from: startOfDay(subMonths(new Date(), 3)),
      to: endOfDay(new Date())
    })
  },
  {
    label: "آخر 6 أشهر",
    value: "last6months",
    getRange: () => ({
      from: startOfDay(subMonths(new Date(), 6)),
      to: endOfDay(new Date())
    })
  }
];

export function DateFilter({
  className,
  value,
  onChange,
  onApiCall,
  placeholder = "فلترة بالتاريخ",
  label,
  showPresets = true,
  showClearAll = true,
  disabled = false
}: DateFilterProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | null>(value || null);
  const [activePreset, setActivePreset] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelectedRange(value || null);
  }, [value]);

  const handleRangeChange = (range: DateRange | null) => {
    setSelectedRange(range);
    setActivePreset(null);
    onChange?.(range);
    
    if (onApiCall && range) {
      onApiCall({
        startDate: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
        endDate: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
      });
    }
  };

  const handlePresetSelect = (preset: typeof DATE_PRESETS[0]) => {
    const range = preset.getRange();
    setSelectedRange(range);
    setActivePreset(preset.value);
    onChange?.(range);
    
    if (onApiCall) {
      onApiCall({
        startDate: format(range.from, "yyyy-MM-dd"),
        endDate: format(range.to, "yyyy-MM-dd"),
      });
    }
  };

  const handleClear = () => {
    setSelectedRange(null);
    setActivePreset(null);
    onChange?.(null);
    
    if (onApiCall) {
      onApiCall({});
    }
  };

  const formatDisplayRange = (range: DateRange) => {
    if (range.from && range.to) {
      if (format(range.from, "yyyy-MM-dd") === format(range.to, "yyyy-MM-dd")) {
        return format(range.from, "dd/MM/yyyy", { locale: ar });
      }
      return `${format(range.from, "dd/MM/yyyy")} - ${format(range.to, "dd/MM/yyyy")}`;
    } else if (range.from) {
      return format(range.from, "dd/MM/yyyy", { locale: ar });
    }
    return "";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label}:
        </span>
      )}
      
      <div className="flex items-center gap-2">
        {/* مكون اختيار التاريخ */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <input
            type="date"
            value={selectedRange?.from ? format(selectedRange.from, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const fromDate = e.target.value ? new Date(e.target.value) : null;
              const toDate = selectedRange?.to || null;
              handleRangeChange({ from: fromDate, to: toDate });
            }}
            disabled={disabled}
            className="h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="من"
          />
          <span className="text-gray-500">إلى</span>
          <input
            type="date"
            value={selectedRange?.to ? format(selectedRange.to, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const toDate = e.target.value ? new Date(e.target.value) : null;
              const fromDate = selectedRange?.from || null;
              handleRangeChange({ from: fromDate, to: toDate });
            }}
            disabled={disabled}
            className="h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="إلى"
          />
        </div>

        {/* قائمة الإعدادات المسبقة */}
        {showPresets && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                className="h-8 px-2"
              >
                <Clock className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>فترات سريعة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DATE_PRESETS.map((preset) => (
                <DropdownMenuItem
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    "cursor-pointer",
                    activePreset === preset.value && "bg-accent"
                  )}
                >
                  <span className="flex-1 text-right">{preset.label}</span>
                  {activePreset === preset.value && (
                    <Badge variant="secondary" className="mr-2">
                      نشط
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* زر المسح */}
        {showClearAll && (selectedRange || activePreset) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="h-8 px-2 text-muted-foreground hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* عرض النطاق المحدد */}
      {selectedRange && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDisplayRange(selectedRange)}
          </Badge>
        </div>
      )}
    </div>
  );
}

// Hook لاستخدام فلتر التاريخ مع الجداول
export function useDateTableFilter(
  onFilterChange?: (params: { startDate?: string; endDate?: string }) => void
) {
  const [dateRange, setDateRange] = React.useState<DateRange | null>(null);
  const [isFiltering, setIsFiltering] = React.useState(false);

  const handleDateChange = React.useCallback(async (range: DateRange | null) => {
    setDateRange(range);
    
    if (onFilterChange) {
      setIsFiltering(true);
      try {
        if (range?.from && range?.to) {
          await onFilterChange({
            startDate: format(range.from, "yyyy-MM-dd"),
            endDate: format(range.to, "yyyy-MM-dd"),
          });
        } else {
          await onFilterChange({});
        }
      } catch (error) {
        console.error("Error applying date filter:", error);
      } finally {
        setIsFiltering(false);
      }
    }
  }, [onFilterChange]);

  const clearFilter = React.useCallback(() => {
    handleDateChange(null);
  }, [handleDateChange]);

  return {
    dateRange,
    setDateRange: handleDateChange,
    clearFilter,
    isFiltering,
    hasActiveFilter: !!dateRange,
  };
}

// مكون فلتر التاريخ المدمج للجداول
export interface TableDateFilterProps {
  onFilterChange?: (params: { startDate?: string; endDate?: string }) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  showPresets?: boolean;
  disabled?: boolean;
}

export function TableDateFilter({
  onFilterChange,
  className,
  label = "فلترة بالتاريخ",
  placeholder = "اختر نطاق التاريخ",
  showPresets = true,
  disabled = false
}: TableDateFilterProps) {
  const {
    dateRange,
    setDateRange,
    clearFilter,
    isFiltering,
    hasActiveFilter
  } = useDateTableFilter(onFilterChange);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DateFilter
        value={dateRange}
        onChange={setDateRange}
        label={label}
        placeholder={placeholder}
        showPresets={showPresets}
        disabled={disabled || isFiltering}
      />
      
      {isFiltering && (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-xs text-muted-foreground">جاري التطبيق...</span>
        </div>
      )}
    </div>
  );
}
