"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilteredExportButtonProps {
  // API endpoint for export
  exportEndpoint: string;
  // Current filters applied to the table
  filters?: Record<string, any>;
  // Date range filter
  dateRange?: { from?: Date; to?: Date };
  // File name prefix
  filename?: string;
  // Button text
  buttonText?: string;
  // Button variant
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  // Size
  size?: "default" | "sm" | "lg" | "icon";
  // Disabled state
  disabled?: boolean;
}

export function FilteredExportButton({
  exportEndpoint,
  filters = {},
  dateRange,
  filename = "export",
  buttonText = "تصدير",
  variant = "outline",
  size = "default",
  disabled = false,
}: FilteredExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Build query parameters from filters
  const buildQueryParams = (format: string = 'csv') => {
    const params = new URLSearchParams();
    
    // Add format
    params.append('format', format);
    
    // Add date range if provided
    if (dateRange?.from && dateRange?.to) {
      params.append('startDate', dateRange.from.toISOString().split('T')[0]);
      params.append('endDate', dateRange.to.toISOString().split('T')[0]);
    }
    
    // Add other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== '__all__') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    return params.toString();
  };

  // Handle export with specific format
  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      console.log('🔍 Starting export with filters:', filters);
      console.log('📅 Date range:', dateRange);
      
      const queryParams = buildQueryParams(format);
      const url = `${exportEndpoint}?${queryParams}`;
      
      console.log('📤 Export URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let blob: Blob;
      let fileExtension: string;
      
      if (format === 'csv') {
        blob = await response.blob();
        fileExtension = 'csv';
      } else {
        const data = await response.json();
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        fileExtension = 'json';
      }

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const hasFilters = Object.keys(filters).length > 0 || (dateRange?.from && dateRange?.to);
      const filterSuffix = hasFilters ? '-filtered' : '';
      link.download = `${filename}${filterSuffix}-${timestamp}.${fileExtension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      const recordCount = format === 'csv' ? 'البيانات المفلترة' : 'البيانات';
      toast.success(`تم تصدير ${recordCount} بنجاح`);
      
    } catch (error: any) {
      console.error('❌ Export failed:', error);
      toast.error(error.message || 'حدث خطأ أثناء التصدير');
    } finally {
      setIsExporting(false);
    }
  };

  // Check if there are active filters
  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key] !== undefined && 
    filters[key] !== null && 
    filters[key] !== '' && 
    filters[key] !== '__all__'
  ) || (dateRange?.from && dateRange?.to);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          disabled={disabled || isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {buttonText}
          {hasActiveFilters && (
            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              مفلتر
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          تصدير CSV
          {hasActiveFilters && <span className="text-xs text-muted-foreground mr-1">(مفلتر)</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          تصدير JSON
          {hasActiveFilters && <span className="text-xs text-muted-foreground mr-1">(مفلتر)</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default FilteredExportButton;
