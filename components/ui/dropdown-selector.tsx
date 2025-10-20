"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw } from 'lucide-react';
import { dropdownListsApi, type DropdownOption } from '@/lib/api/dropdown-lists';
import { toast } from 'sonner';

interface DropdownSelectorProps {
  category: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  allowAdd?: boolean;
  onAddNew?: () => void;
  className?: string;
}

export function DropdownSelector({
  category,
  value,
  onValueChange,
  placeholder = "اختر خيار",
  disabled = false,
  required = false,
  error,
  allowAdd = false,
  onAddNew,
  className
}: DropdownSelectorProps) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      loadOptions();
    }
  }, [category]);

  const loadOptions = async () => {
    if (!category) return;
    
    setLoading(true);
    try {
      const response = await dropdownListsApi.getAll({
        category,
        limit: 1000 // Get all options for this category
      });
      
      const optionsData = Array.isArray(response.data) ? response.data : [];
      setOptions(optionsData);
    } catch (error) {
      console.error('Error loading dropdown options:', error);
      toast.error(`فشل في تحميل خيارات ${category}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadOptions();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select 
            value={value} 
            onValueChange={onValueChange}
            disabled={disabled || loading}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={loading ? "جاري التحميل..." : placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.length === 0 ? (
                <SelectItem value="no-options" disabled>
                  {loading ? "جاري التحميل..." : "لا توجد خيارات متاحة"}
                </SelectItem>
              ) : (
                options.map((option) => (
                  <SelectItem key={option._id} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.labelAr || option.label}</span>
                      {option.value !== option.labelAr && (
                        <code className="text-xs text-muted-foreground ml-2">
                          {option.value}
                        </code>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>

        {allowAdd && onAddNew && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddNew}
            className="shrink-0 gap-1"
          >
            <Plus className="h-4 w-4" />
            إضافة
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {options.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {options.length} خيار متاح
          </Badge>
          {required && (
            <span className="text-red-500">مطلوب</span>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for easy usage
export function useDropdownOptions(category: string) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOptions = async () => {
    if (!category) return;
    
    setLoading(true);
    try {
      const response = await dropdownListsApi.getAll({
        category,
        limit: 1000
      });
      
      const optionsData = Array.isArray(response.data) ? response.data : [];
      setOptions(optionsData);
    } catch (error) {
      console.error('Error loading dropdown options:', error);
      toast.error(`فشل في تحميل خيارات ${category}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, [category]);

  return {
    options,
    loading,
    refresh: loadOptions
  };
}
