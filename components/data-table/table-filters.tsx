"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateFilter, DateFilterProps } from "./date-filter";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

// تعريف أنواع الفلاتر المختلفة
export interface FilterOption {
  value: string;
  label: string;
  color?: "default" | "secondary" | "destructive" | "outline";
}

export interface FieldFilter {
  key: string;
  label: string;
  type: "select" | "multiselect";
  options: FilterOption[];
  placeholder?: string;
}

export interface TableFiltersProps {
  // فلتر التاريخ
  dateFilter?: {
    enabled: boolean;
    label?: string;
    onDateChange?: (dateRange: DateRange | null) => void;
    value?: DateRange | null;
  };
  
  // فلاتر الحقول المخصصة
  fieldFilters?: FieldFilter[];
  
  // قيم الفلاتر الحالية
  filterValues?: Record<string, string | string[]>;
  
  // دالة تغيير الفلاتر
  onFiltersChange?: (filters: Record<string, any>) => void;
  
  // إعدادات العرض
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showActiveCount?: boolean;
}

export function TableFilters({
  dateFilter,
  fieldFilters = [],
  filterValues = {},
  onFiltersChange,
  className,
  collapsible = true,
  defaultExpanded = false,
  showActiveCount = true,
}: TableFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [currentFilters, setCurrentFilters] = React.useState<Record<string, any>>(filterValues);

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    
    // فحص فلتر التاريخ
    if (dateFilter?.value?.from || dateFilter?.value?.to) {
      count++;
    }
    
    // فحص فلاتر الحقول
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && (
        (typeof value === 'string' && value.trim() !== '') ||
        (Array.isArray(value) && value.length > 0)
      )) {
        count++;
      }
    });
    
    return count;
  }, [dateFilter?.value, currentFilters]);

  // تحديث الفلاتر
  const updateFilters = React.useCallback((key: string, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    setCurrentFilters(newFilters);
    
    // إرسال التحديث للمكون الأب
    if (onFiltersChange) {
      const allFilters = { ...newFilters };
      if (dateFilter?.value) {
        allFilters.dateRange = dateFilter.value;
      }
      onFiltersChange(allFilters);
    }
  }, [currentFilters, onFiltersChange, dateFilter?.value]);

  // مسح جميع الفلاتر
  const clearAllFilters = React.useCallback(() => {
    setCurrentFilters({});
    if (onFiltersChange) {
      onFiltersChange({});
    }
    // مسح فلتر التاريخ
    if (dateFilter?.onDateChange) {
      dateFilter.onDateChange(null);
    }
  }, [onFiltersChange, dateFilter]);

  // معالجة تغيير فلتر التاريخ
  const handleDateChange = React.useCallback((dateRange: DateRange | null) => {
    if (dateFilter?.onDateChange) {
      dateFilter.onDateChange(dateRange);
    }
    
    if (onFiltersChange) {
      const allFilters = { ...currentFilters };
      if (dateRange) {
        allFilters.dateRange = dateRange;
      } else {
        delete allFilters.dateRange;
      }
      onFiltersChange(allFilters);
    }
  }, [dateFilter, onFiltersChange, currentFilters]);

  // معالجة فلتر متعدد الاختيارات
  const handleMultiSelectChange = (key: string, value: string) => {
    const currentValues = (currentFilters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilters(key, newValues.length > 0 ? newValues : undefined);
  };

  // عرض قيمة الفلتر كـ Badge
  const renderFilterBadge = (filter: FieldFilter, value: any) => {
    if (!value) return null;

    if (Array.isArray(value)) {
      return value.map(v => {
        const option = filter.options.find(opt => opt.value === v);
        return (
          <Badge 
            key={v} 
            variant={option?.color || "secondary"} 
            className="text-xs"
          >
            {option?.label || v}
          </Badge>
        );
      });
    } else {
      const option = filter.options.find(opt => opt.value === value);
      return (
        <Badge 
          variant={option?.color || "secondary"} 
          className="text-xs"
        >
          {option?.label || value}
        </Badge>
      );
    }
  };

  const hasFilters = dateFilter?.enabled || fieldFilters.length > 0;

  if (!hasFilters) return null;

  return (
    <Card className={cn("w-full", className)} dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            <span>الفلاتر</span>
            {showActiveCount && activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-red-500"
              >
                <X className="h-4 w-4 ml-1" />
                مسح الكل
              </Button>
            )}
            
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {(!collapsible || isExpanded) && (
        <CardContent className="space-y-4">
          {/* فلتر التاريخ */}
          {dateFilter?.enabled && (
            <div className="space-y-2">
              <DateFilter
                label={dateFilter.label || "فلترة بالتاريخ"}
                value={dateFilter.value}
                onChange={handleDateChange}
                showPresets={true}
                showClearAll={false}
                className="w-full"
              />
            </div>
          )}

          {/* فلاتر الحقول */}
          {fieldFilters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fieldFilters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-sm font-medium text-right block">
                    {filter.label}
                  </label>
                  
                  {filter.type === "select" ? (
                    <Select
                      value={currentFilters[filter.key] || "__all__"}
                      onValueChange={(value) => 
                        updateFilters(filter.key, value === "__all__" ? undefined : value)
                      }
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder={filter.placeholder || "اختر..."} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">الكل</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    // Multi-select as buttons
                    <div className="flex flex-wrap gap-2">
                      {filter.options.map((option) => {
                        const isSelected = (currentFilters[filter.key] as string[] || []).includes(option.value);
                        return (
                          <Button
                            key={option.value}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleMultiSelectChange(filter.key, option.value)}
                            className="text-xs"
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* عرض القيم المحددة */}
                  {currentFilters[filter.key] && (
                    <div className="flex flex-wrap gap-1">
                      {renderFilterBadge(filter, currentFilters[filter.key])}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ملخص الفلاتر النشطة */}
          {activeFiltersCount > 0 && (
            <div className="pt-3 border-t">
              <div className="text-sm text-muted-foreground text-center">
                تم تطبيق {activeFiltersCount} فلتر
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Hook لاستخدام الفلاتر مع الجداول
export function useTableFilters(
  initialFilters: Record<string, any> = {},
  onFiltersChange?: (filters: Record<string, any>) => void
) {
  const [filters, setFilters] = React.useState(initialFilters);
  const [dateRange, setDateRange] = React.useState<DateRange | null>(null);

  const updateFilters = React.useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  }, [onFiltersChange]);

  const updateDateRange = React.useCallback((range: DateRange | null) => {
    setDateRange(range);
    const updatedFilters = { ...filters };
    if (range) {
      updatedFilters.dateRange = range;
    } else {
      delete updatedFilters.dateRange;
    }
    updateFilters(updatedFilters);
  }, [filters, updateFilters]);

  const clearFilters = React.useCallback(() => {
    setFilters({});
    setDateRange(null);
    if (onFiltersChange) {
      onFiltersChange({});
    }
  }, [onFiltersChange]);

  const hasActiveFilters = React.useMemo(() => {
    return Object.keys(filters).length > 0 || dateRange !== null;
  }, [filters, dateRange]);

  return {
    filters,
    dateRange,
    updateFilters,
    updateDateRange,
    clearFilters,
    hasActiveFilters,
  };
}
