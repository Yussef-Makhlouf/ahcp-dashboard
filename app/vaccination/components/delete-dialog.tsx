"use client";

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
import { Trash2, AlertTriangle } from "lucide-react";
import type { Vaccination } from "@/types";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Vaccination | null;
  onConfirm: (id: number) => void;
  isLoading?: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading = false,
}: DeleteDialogProps) {
  const handleConfirm = () => {
    if (item) {
      onConfirm(parseInt(item.serialNo));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-right">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl">تأكيد الحذف</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-right text-muted-foreground">
            {item ? (
              <>
                هل أنت متأكد من أنك تريد حذف سجل التحصين الخاص بـ{" "}
                <span className="font-semibold text-gray-900">
                  {item.owner?.name}
                </span>{" "}
                بتاريخ{" "}
                <span className="font-semibold text-gray-900">
                  {new Date(item.date).toLocaleDateString("ar-EG")}
                </span>
                ؟
                <br />
                <span className="text-sm text-red-600 mt-2 block">
                  ⚠️ هذا الإجراء لا يمكن التراجع عنه
                </span>
              </>
            ) : (
              "هل أنت متأكد من أنك تريد حذف هذا السجل؟"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel disabled={isLoading} className="flex-1">
            إلغاء
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
