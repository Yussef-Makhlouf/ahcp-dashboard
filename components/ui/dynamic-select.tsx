'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dropdownListsApi, DropdownOption, DROPDOWN_CATEGORIES } from '@/lib/api/dropdown-lists';

interface DynamicSelectProps {
  category: keyof typeof DROPDOWN_CATEGORIES;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  showLabel?: boolean;
  activeOnly?: boolean;
  allowEmpty?: boolean;
  emptyText?: string;
  language?: 'ar' | 'en'; // إضافة خاصية اللغة
}

export function DynamicSelect({
  category,
  value,
  onValueChange,
  placeholder = "اختر من القائمة",
  label,
  required = false,
  disabled = false,
  error,
  className,
  showLabel = true,
  activeOnly = true,
  allowEmpty = false,
  emptyText = "لا يوجد",
  language = 'ar' // القيمة الافتراضية العربية
}: DynamicSelectProps) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load options when category changes
  useEffect(() => {
    loadOptions();
  }, [category, activeOnly]);

  const loadOptions = async () => {
    if (!category) return;

    setLoading(true);
    setLoadError(null);
    
    try {
      const categoryValue = DROPDOWN_CATEGORIES[category];
      console.log(`🔍 Loading options for category: ${category} -> ${categoryValue}`);
      
      const response = await dropdownListsApi.getByCategory(categoryValue, activeOnly);
      console.log(`✅ Received response for ${categoryValue}:`, response);
      
      // Ensure response.data is an array
      const optionsData = Array.isArray(response.data) ? response.data : [];
      console.log(`📋 Options data for ${categoryValue}:`, optionsData);
      setOptions(optionsData);
    } catch (error: any) {
      console.error(`❌ Error loading dropdown options for ${category}:`, error);
      setLoadError('فشل في تحميل الخيارات');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  // Get the selected option for display
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && label && (
        <Label className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
          {label}
        </Label>
      )}
      
      <Select
        value={value || ""}
        onValueChange={handleValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger 
          className={cn(
            error && "border-red-500 focus:border-red-500",
            loading && "opacity-50"
          )}
        >
          <SelectValue placeholder={loading ? "جاري التحميل..." : placeholder}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التحميل...
              </div>
            ) : selectedOption ? (
              language === 'en' ? (selectedOption.label || selectedOption.labelAr) : (selectedOption.labelAr || selectedOption.label)
            ) : (
              placeholder
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {loadError ? (
            <div className="flex items-center gap-2 p-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{loadError}</span>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">جاري التحميل...</span>
            </div>
          ) : options.length === 0 ? (
            <div className="p-2 text-center text-gray-500 text-sm">
              {emptyText}
            </div>
          ) : (
            <>
              {allowEmpty && (
                <SelectItem value="">
                  <span className="text-gray-500">{emptyText}</span>
                </SelectItem>
              )}
              {options.map((option) => (
                <SelectItem 
                  key={option._id || option.value} 
                  value={option.value}
                  disabled={!option.isActive}
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {language === 'en' ? (option.label || option.labelAr) : (option.labelAr || option.label)}
                    </span>
                    {!option.isActive && (
                      <span className="text-xs text-gray-400">
                        {language === 'en' ? '(inactive)' : '(غير نشط)'}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
      
      {error && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}

// Hook for using dynamic select options
export function useDynamicSelectOptions(category: keyof typeof DROPDOWN_CATEGORIES, activeOnly: boolean = true) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      if (!category) return;

      setLoading(true);
      setError(null);
      
      try {
        const categoryValue = DROPDOWN_CATEGORIES[category];
        const response = await dropdownListsApi.getByCategory(categoryValue, activeOnly);
        
        // Ensure response.data is an array
        const optionsData = Array.isArray(response.data) ? response.data : [];
        setOptions(optionsData);
      } catch (err: any) {
        console.error('Error loading dropdown options:', err);
        setError('فشل في تحميل الخيارات');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [category, activeOnly]);

  return { options, loading, error, reload: () => loadOptions() };
}

// Utility function to get option label by value
export function getOptionLabel(options: DropdownOption[], value: string, language: 'ar' | 'en' = 'ar'): string {
  const option = options.find(opt => opt.value === value);
  if (!option) return value;
  
  return language === 'en' ? (option.label || option.labelAr) : (option.labelAr || option.label);
}

// Utility function to get option by value
export function getOption(options: DropdownOption[], value: string): DropdownOption | undefined {
  return options.find(opt => opt.value === value);
}
