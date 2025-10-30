import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  itemCount?: number;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "حذف",
  cancelText = "إلغاء",
  isDestructive = true,
  isLoading = false,
  itemCount
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-right">
            {isDestructive ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <Trash2 className="h-5 w-5 text-red-600" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            {description}
            {itemCount && itemCount > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <span className="text-red-700 font-medium">
                  سيتم حذف {itemCount} عنصر
                </span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={isDestructive ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                جاري الحذف...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                {confirmText}
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// مكون خاص للحذف المحدد
interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedCount: number;
  isLoading?: boolean;
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  selectedCount,
  isLoading = false
}) => {
  return (
    <DeleteConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="حذف العناصر المحددة"
      description={`هل أنت متأكد من حذف ${selectedCount} عنصر؟ هذا الإجراء لا يمكن التراجع عنه.`}
      confirmText="حذف المحدد"
      itemCount={selectedCount}
      isLoading={isLoading}
    />
  );
};

// مكون خاص للحذف الكلي
interface DeleteAllDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  entityName: string;
  isLoading?: boolean;
}

export const DeleteAllDialog: React.FC<DeleteAllDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  entityName,
  isLoading = false
}) => {
  return (
    <DeleteConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={`حذف جميع ${entityName}`}
      description={`هل أنت متأكد من حذف جميع ${entityName}؟ هذا الإجراء لا يمكن التراجع عنه وسيؤثر على جميع السجلات المرتبطة.`}
      confirmText="حذف الكل"
      isLoading={isLoading}
    />
  );
};

// مكون خاص للحذف الفردي
interface SingleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  isLoading?: boolean;
}

export const SingleDeleteDialog: React.FC<SingleDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  isLoading = false
}) => {
  return (
    <DeleteConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="حذف العنصر"
      description={`هل أنت متأكد من حذف "${itemName}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      confirmText="حذف"
      isLoading={isLoading}
    />
  );
};
