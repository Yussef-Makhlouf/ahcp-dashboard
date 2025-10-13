"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImportExportManagerProps {
  exportEndpoint: string;
  importEndpoint: string;
  templateEndpoint?: string;
  title: string;
  queryKey: string;
  acceptedFormats?: string[];
  maxFileSize?: number;
  onImportSuccess?: () => void;
  onExportSuccess?: () => void;
  onRefresh?: () => void;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
  importedRecords?: any[];
}

// Helper function to get token from auth-storage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // First try to get from Zustand store
    const { useAuthStore } = require('@/lib/store/auth-store');
    const { token, isAuthenticated } = useAuthStore.getState();
    
    if (token && isAuthenticated) {
      console.log('✅ Using token from Zustand store');
      return token;
    }
    
    // Fallback to localStorage
    const storedAuth = localStorage.getItem('auth-storage');
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      console.log('🔍 Stored auth:', { 
        hasToken: !!parsed.token, 
        isAuthenticated: parsed.isAuthenticated,
        user: parsed.user?.email 
      });
      
      if (parsed.token && parsed.isAuthenticated) {
        console.log('✅ Using token from localStorage');
        return parsed.token;
      }
    }
    
    console.warn('⚠️ No valid token found');
    return null;
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
    return null;
  }
};

export function ImportExportManager({
  exportEndpoint,
  importEndpoint,
  templateEndpoint,
  title,
  queryKey,
  acceptedFormats = ['.csv', '.xlsx'],
  maxFileSize = 10,
  onImportSuccess,
  onExportSuccess,
  onRefresh
}: ImportExportManagerProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportResult, setShowImportResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(`حجم الملف يجب أن يكون أقل من ${maxFileSize} ميجابايت`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      toast.error(`نوع الملف غير مدعوم. الأنواع المدعومة: ${acceptedFormats.join(', ')}`);
      return;
    }

    handleImport(file);
  };

  // Handle import
  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);
    setShowImportResult(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const token = getAuthToken();
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
      }

      const response = await fetch(importEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header - let browser set it with boundary for FormData
        }
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
        } else if (response.status === 403) {
          throw new Error('ليس لديك صلاحية للوصول إلى هذه البيانات.');
        } else if (response.status === 404) {
          throw new Error('المسار غير موجود. تحقق من إعدادات API.');
        } else {
          throw new Error(`خطأ في الخادم: ${response.status}`);
        }
      }

      const result: ImportResult = await response.json();
      setImportResult(result);
      setShowImportResult(true);

      if (result.success) {
        toast.success(`تم استيراد ${result.successRows} سجل بنجاح`);
        onImportSuccess?.();
      } else {
        toast.error(`تم استيراد ${result.successRows} من ${result.totalRows} سجل`);
      }

    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(`فشل في الاستيراد: ${error.message}`);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
      }

      const response = await fetch(exportEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, */*'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
        } else if (response.status === 403) {
          throw new Error('ليس لديك صلاحية للوصول إلى هذه البيانات.');
        } else if (response.status === 404) {
          throw new Error('المسار غير موجود. تحقق من إعدادات API.');
        } else {
          throw new Error(`خطأ في الخادم: ${response.status}`);
        }
      }

      const blob = await response.blob();
      
      // Check if blob is empty
      if (blob.size === 0) {
        throw new Error('الملف المُصدر فارغ. تحقق من وجود البيانات في النظام.');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Determine file extension based on content type
      const contentType = response.headers.get('content-type');
      let extension = 'xlsx';
      if (contentType?.includes('text/csv')) {
        extension = 'csv';
      }
      
      a.download = `${title}-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`تم تصدير البيانات بنجاح (${blob.size} بايت)`);
      onExportSuccess?.();

    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`فشل في التصدير: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle template download
  const handleTemplateDownload = async () => {
    if (!templateEndpoint) return;

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
      }

      const response = await fetch(templateEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
        } else if (response.status === 403) {
          throw new Error('ليس لديك صلاحية للوصول إلى هذه البيانات.');
        } else if (response.status === 404) {
          throw new Error('المسار غير موجود. تحقق من إعدادات API.');
        } else {
          throw new Error(`خطأ في الخادم: ${response.status}`);
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${title}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('تم تحميل القالب بنجاح');

    } catch (error: any) {
      console.error('Template download error:', error);
      toast.error(`فشل في تحميل القالب: ${error.message}`);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Import Button */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="h-9 px-3"
        >
          {isImporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          استيراد
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting}
        className="h-9 px-3"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        تصدير
      </Button>

      {/* Template Button */}
      {templateEndpoint && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleTemplateDownload}
          className="h-9 px-3"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          قالب
        </Button>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-9 px-3"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          تحديث
        </Button>
      )}

      {/* Import Progress Modal */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري الاستيراد...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={importProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {importProgress}% مكتمل
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Result Modal */}
      {showImportResult && importResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-96 overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {importResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                نتائج الاستيراد
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImportResult(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.successRows}
                  </div>
                  <div className="text-sm text-muted-foreground">نجح</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {importResult.errorRows}
                  </div>
                  <div className="text-sm text-muted-foreground">فشل</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">الأخطاء:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        <Badge variant="destructive" className="mr-1">
                          صف {error.row}
                        </Badge>
                        {error.message}
                      </div>
                    ))}
                    {importResult.errors.length > 5 && (
                      <div className="text-xs text-muted-foreground">
                        و {importResult.errors.length - 5} أخطاء أخرى...
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportResult(false)}
                  className="flex-1"
                >
                  إغلاق
                </Button>
                {importResult.success && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowImportResult(false);
                      onImportSuccess?.();
                    }}
                    className="flex-1"
                  >
                    تحديث البيانات
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
