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
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = (rows: any[]) => {
    setPreviewData(rows);
    setShowPreview(true);
  };

  const handleSuccess = (response: any) => {
    console.log('Import successful:', response);
    setShowPreview(false);
    setPreviewData([]);
    onImportSuccess();
    onOpenChange(false);
  };

  const handleError = (error: any) => {
    console.error('Import error:', error);
    // الأخطاء يتم التعامل معها في ImportUploader
  };

  const handleClose = () => {
    setShowPreview(false);
    setPreviewData([]);
    onOpenChange(false);
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
              onClick={handleClose}
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
            onPreview={handlePreview}
            onSuccess={handleSuccess}
            onError={handleError}
          />

          {/* معاينة البيانات */}
          {showPreview && previewData.length > 0 && (
            <div className="border-t pt-6">
              <ImportPreview
                data={previewData}
                tableType={tableType}
                maxRows={5}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
