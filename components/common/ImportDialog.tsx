"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImportUploader } from './ImportUploader';
import { ImportPreview } from './ImportPreview';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, X } from 'lucide-react';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableType: 'laboratory' | 'vaccination' | 'parasite_control' | 'mobile' | 'equine_health';
  templateKey: string;
  onImportSuccess: () => void;
}

// تسميات الجداول بالعربية
const tableLabels: Record<string, string> = {
  laboratory: 'المختبرات',
  vaccination: 'التطعيمات',
  parasite_control: 'مكافحة الطفيليات',
  mobile: 'العيادات المتنقلة',
  equine_health: 'صحة الخيول'
};

export const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onOpenChange,
  tableType,
  templateKey,
  onImportSuccess
}) => {
  const handleSuccess = (response: any) => {
    console.log('Import successful:', response);
    onImportSuccess();
    onOpenChange(false); // إغلاق Dialog بعد النجاح
  };

  const handleError = (error: any) => {
    console.error('Import error:', error);
    // الأخطاء يتم التعامل معها في ImportUploader
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            استيراد بيانات {tableLabels[tableType]}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="mr-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* مكون الاستيراد */}
          <ImportUploader
            templateKey={templateKey}
            tableType={tableType}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
