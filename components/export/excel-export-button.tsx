"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from '@/lib/api/base-api';

interface ExcelExportButtonProps {
  endpoint: string;
  filename?: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  filters?: Record<string, any>;
}

export function ExcelExportButton({
  endpoint,
  filename = 'export',
  label = 'Export to Excel',
  variant = "outline",
  size = "default",
  className = "",
  filters = {}
}: ExcelExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        format: 'csv',
        ...filters
      });

      // Make API request
      const response = await api.get(`${endpoint}?${queryParams.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response as any], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${filename}-${timestamp}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير البيانات بنجاح إلى Excel');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تصدير البيانات');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={`gap-2 ${className}`}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-4 w-4" />
      )}
      {isExporting ? 'جاري التصدير...' : label}
    </Button>
  );
}

export default ExcelExportButton;
