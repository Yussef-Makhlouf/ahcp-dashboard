"use client";

import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  FileArchive
} from "lucide-react";
import { toast } from "sonner";
import { api } from '@/lib/api/base-api';

interface ImportExportManagerProps {
  // API endpoints
  exportEndpoint: string;
  importEndpoint: string;
  templateEndpoint?: string;
  
  // Configuration
  title: string;
  queryKey: string;
  
  // File settings
  acceptedFormats: string[];
  maxFileSize?: number; // in MB
  
  // Export options
  exportFormats?: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  
  // Import validation
  requiredColumns?: string[];
  
  // Callbacks
  onImportSuccess?: (result: any) => void;
  onExportSuccess?: () => void;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  importedRecords?: any[]; // البيانات المستوردة الجديدة
}

export function ImportExportManager({
  exportEndpoint,
  importEndpoint,
  templateEndpoint,
  title,
  queryKey,
  acceptedFormats,
  maxFileSize = 10,
  exportFormats = [
    { value: 'csv', label: 'CSV', icon: <FileText className="h-4 w-4" /> },
    { value: 'excel', label: 'Excel', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { value: 'pdf', label: 'PDF', icon: <FileArchive className="h-4 w-4" /> }
  ],
  requiredColumns = [],
  onImportSuccess,
  onExportSuccess
}: ImportExportManagerProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportFormat, setExportFormat] = useState('csv');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const queryClient = useQueryClient();

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return api.post(importEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        },
      });
    },
    onSuccess: (response: any) => {
      // Handle response structure: { success: true, data: {...} } or direct result
      const result = response?.data || response;
      setImportResult(result);
      if (result.success) {
        toast.success(`تم استيراد ${result.successRows} سجل بنجاح`);
        
        // إضافة البيانات الجديدة إلى الكاش مباشرة بدلاً من invalidate
        if (result.importedRecords && result.importedRecords.length > 0) {
          queryClient.setQueryData([queryKey], (oldData: any) => {
            if (!oldData) return oldData;
            
            // إضافة السجلات الجديدة في بداية القائمة
            const newData = {
              ...oldData,
              data: [...result.importedRecords, ...(oldData.data || [])],
              total: (oldData.total || 0) + result.successRows
            };
            return newData;
          });
          
          // إشعار إضافي بعرض البيانات الجديدة
          setTimeout(() => {
            toast.success(`تم عرض ${result.importedRecords.length} سجل جديد في الجدول`, {
              description: 'يمكنك رؤية السجلات الجديدة في أعلى الجدول'
            });
          }, 1000);
        } else {
          // إذا لم تكن البيانات متوفرة، استخدم invalidate كما هو
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
        
        onImportSuccess?.(result);
      } else {
        toast.error(`فشل في استيراد ${result.errorRows} سجل`);
      }
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء الاستيراد');
      setUploadProgress(0);
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (format: string) => {
      const response = await api.get(`${exportEndpoint}?format=${format}`, {
        responseType: 'blob'
      });
      return { blob: response as Blob, format };
    },
    onSuccess: ({ blob, format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const extension = format === 'excel' ? 'xlsx' : format;
      a.download = `${queryKey}-export-${new Date().toISOString().split('T')[0]}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('تم تصدير البيانات بنجاح');
      onExportSuccess?.();
      setExportDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء التصدير');
    }
  });

  // Download template
  const downloadTemplate = useCallback(async () => {
    if (!templateEndpoint) return;
    
    try {
      const response = await api.get(templateEndpoint, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(response as Blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${queryKey}-template.csv`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('تم تحميل القالب بنجاح');
    } catch (error: any) {
      toast.error('حدث خطأ أثناء تحميل القالب');
    }
  }, [templateEndpoint, queryKey]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(`حجم الملف يجب أن يكون أقل من ${maxFileSize} ميجابايت`);
      return;
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(`.${fileExtension}`)) {
      toast.error(`نوع الملف غير مدعوم. الأنواع المدعومة: ${acceptedFormats.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
  };

  const handleImport = () => {
    if (!selectedFile) return;
    importMutation.mutate(selectedFile);
  };

  const handleExport = (format: string) => {
    exportMutation.mutate(format);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setUploadProgress(0);
  };

  return (
    <div className="flex gap-2">
      {/* Export Button */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 px-3">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-semibold">تصدير {title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground text-center">
              اختر تنسيق التصدير المطلوب
            </p>
            
            <div className="grid gap-3">
              {exportFormats ? (
                exportFormats.map((format) => (
                  <Button
                    key={format.value}
                    onClick={() => exportMutation.mutate(format.value)}
                    disabled={exportMutation.isPending}
                    variant="outline"
                    className="justify-center h-12 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {format.icon && <span className="ml-2 text-lg">{format.icon}</span>}
                    <FileText className="ml-2 h-4 w-4" />
                    تصدير كملف {format.label}
                  </Button>
                ))
              ) : (
                <>
                  <Button
                    onClick={() => exportMutation.mutate('csv')}
                    disabled={exportMutation.isPending}
                    variant="outline"
                    className="justify-center h-12 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <span className="ml-2 text-lg">📄</span>
                    <FileText className="ml-2 h-4 w-4" />
                    تصدير كملف CSV
                  </Button>
                  
                  <Button
                    onClick={() => exportMutation.mutate('excel')}
                    disabled={exportMutation.isPending}
                    variant="outline"
                    className="justify-center h-12 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <span className="ml-2 text-lg">📊</span>
                    <FileSpreadsheet className="ml-2 h-4 w-4" />
                    تصدير كملف Excel
                  </Button>
                </>
              )}
            </div>
            
            {exportMutation.isPending && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="mr-2 text-sm text-muted-foreground">جاري التصدير...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Button */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 px-3">
            <Upload className="h-4 w-4 mr-2" />
            استيراد
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold text-right">
              استيراد {title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 px-1">

            {/* File Upload */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-base font-medium mb-2">اختر ملف للاستيراد</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  الأنواع المدعومة: {acceptedFormats.join(', ')} | الحد الأقصى: {maxFileSize} ميجابايت
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-blue-500" />
                  </div>
                  
                  <div>
                    <Input
                      type="file"
                      accept={acceptedFormats.join(',')}
                      onChange={handleFileSelect}
                      disabled={importMutation.isPending}
                      className="hidden"
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload" 
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      اختر ملف
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    أو اسحب الملف وأفلته هنا
                  </p>
                </div>
              </div>
              
              {selectedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} ميجابايت
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      جاهز للرفع
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {importMutation.isPending && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="h-4 w-4 text-blue-600 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-blue-800">جاري رفع الملف...</span>
                        <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 text-center">
                    يرجى عدم إغلاق النافذة أثناء الرفع
                  </p>
                </div>
              </div>
            )}

            {/* Import Results */}
            {importResult && (
              <div className={`rounded-lg border p-4 ${importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    {importResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <h3 className="font-medium text-base">
                      {importResult.success ? 'تم الاستيراد بنجاح!' : 'نتائج الاستيراد'}
                    </h3>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-xl font-bold text-gray-700">{importResult.totalRows}</div>
                      <div className="text-xs text-gray-500 mt-1">إجمالي السجلات</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-xl font-bold text-green-600">{importResult.successRows}</div>
                      <div className="text-xs text-gray-500 mt-1">نجح</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-xl font-bold text-red-600">{importResult.errorRows}</div>
                      <div className="text-xs text-gray-500 mt-1">فشل</div>
                    </div>
                  </div>

                  {/* عرض السجلات المستوردة بنجاح */}
                  {importResult.importedRecords && importResult.importedRecords.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        السجلات المستوردة بنجاح ({importResult.importedRecords.length})
                      </h4>
                      <div className="max-h-40 overflow-y-auto space-y-2 bg-green-50 p-3 rounded-lg border border-green-200">
                        {importResult.importedRecords.slice(0, 5).map((record: any, index: number) => (
                          <div key={index} className="text-sm p-2 bg-white rounded border border-green-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                  {record.serialNo || `#${index + 1}`}
                                </Badge>
                                <span className="font-medium">
                                  {record.client?.name || record.clientName || 'غير محدد'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.date ? new Date(record.date).toLocaleDateString('ar-EG') : ''}
                              </div>
                            </div>
                            {record.client?.nationalId && (
                              <div className="text-xs text-gray-600 mt-1">
                                هوية: {record.client.nationalId}
                              </div>
                            )}
                          </div>
                        ))}
                        {importResult.importedRecords.length > 5 && (
                          <div className="text-sm text-green-600 text-center font-medium">
                            ... و {importResult.importedRecords.length - 5} سجلات أخرى تم استيرادها بنجاح
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        الأخطاء ({importResult.errors.length})
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1 bg-white rounded-lg p-3 border">
                        {importResult.errors.slice(0, 10).map((error, index) => (
                          <div key={index} className="text-sm p-2 bg-red-50 rounded border-l-2 border-red-300">
                            <span className="font-medium text-red-800">السطر {error.row}:</span>
                            <span className="mr-2 text-red-600">{error.field} - {error.message}</span>
                          </div>
                        ))}
                        {importResult.errors.length > 10 && (
                          <div className="text-sm text-red-500 text-center font-medium">
                            ... و {importResult.errors.length - 10} أخطاء أخرى
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              {!importResult ? (
                <>
                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile || importMutation.isPending}
                    className="flex-1 h-12 text-base font-medium"
                    size="lg"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    {importMutation.isPending ? 'جاري الاستيراد...' : 'بدء الاستيراد'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setImportDialogOpen(false)}
                    className="h-12 px-6"
                    size="lg"
                  >
                    إلغاء
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={resetImport} 
                    className="flex-1 h-12 text-base font-medium"
                    size="lg"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    استيراد ملف آخر
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImportDialogOpen(false);
                      // إذا كان الاستيراد ناجحاً، أظهر رسالة تأكيد
                      if (importResult.success && importResult.importedRecords && importResult.importedRecords.length > 0) {
                        setTimeout(() => {
                          toast.success('تم إغلاق نافذة الاستيراد', {
                            description: `تم استيراد ${importResult.successRows} سجل بنجاح وعرضها في الجدول`
                          });
                        }, 300);
                      }
                    }}
                    className="h-12 px-6"
                    size="lg"
                  >
                    إغلاق
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ImportExportManager;
