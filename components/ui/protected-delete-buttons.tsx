import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { usePermissions, PermissionConfig } from '@/lib/hooks/usePermissions';

interface ProtectedDeleteButtonsProps {
  module: 'parasite-control' | 'vaccination' | 'mobile-clinics' | 'laboratories' | 'equine-health' | 'clients';
  selectedRowsCount: number;
  onDeleteSelected: () => void;
  onDeleteAll?: () => void;
  isDeleting?: boolean;
  showToast?: boolean;
}

export const ProtectedDeleteButtons: React.FC<ProtectedDeleteButtonsProps> = ({
  module,
  selectedRowsCount,
  onDeleteSelected,
  onDeleteAll,
  isDeleting = false,
  showToast = true
}) => {
  const { checkPermission, checkPermissionWithToast } = usePermissions();

  const deletePermission: PermissionConfig = { module, action: 'delete' };
  const hasDeletePermission = checkPermission(deletePermission);

  const handleDeleteSelected = () => {
    if (showToast) {
      const allowed = checkPermissionWithToast(deletePermission);
      if (allowed) {
        onDeleteSelected();
      }
    } else {
      if (hasDeletePermission) {
        onDeleteSelected();
      }
    }
  };

  const handleDeleteAll = () => {
    if (showToast) {
      const allowed = checkPermissionWithToast(deletePermission);
      if (allowed && onDeleteAll) {
        onDeleteAll();
      }
    } else {
      if (hasDeletePermission && onDeleteAll) {
        onDeleteAll();
      }
    }
  };

  // إذا لم تكن هناك صلاحية حذف، لا تظهر الأزرار
  if (!hasDeletePermission) {
    return null;
  }

  return (
    <>
      {/* زر حذف المحدد - يظهر فقط عند وجود عناصر محددة */}
      {selectedRowsCount > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteSelected}
          disabled={isDeleting}
        >
          <Trash2 className="ml-2 h-4 w-4" />
          حذف المحدد ({selectedRowsCount})
        </Button>
      )}
      
      {/* زر حذف الكل - يظهر فقط إذا كان متوفراً */}
      {onDeleteAll && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteAll}
          disabled={isDeleting}
        >
          <AlertTriangle className="ml-2 h-4 w-4" />
          حذف الكل
        </Button>
      )}
    </>
  );
};

// مكون منفصل لزر حذف المحدد فقط
interface ProtectedDeleteSelectedButtonProps {
  module: 'parasite-control' | 'vaccination' | 'mobile-clinics' | 'laboratories' | 'equine-health' | 'clients';
  selectedRowsCount: number;
  onDeleteSelected: () => void;
  isDeleting?: boolean;
  showToast?: boolean;
}

export const ProtectedDeleteSelectedButton: React.FC<ProtectedDeleteSelectedButtonProps> = ({
  module,
  selectedRowsCount,
  onDeleteSelected,
  isDeleting = false,
  showToast = true
}) => {
  const { checkPermission, checkPermissionWithToast } = usePermissions();

  const deletePermission: PermissionConfig = { module, action: 'delete' };
  const hasDeletePermission = checkPermission(deletePermission);

  const handleDeleteSelected = () => {
    if (showToast) {
      const allowed = checkPermissionWithToast(deletePermission);
      if (allowed) {
        onDeleteSelected();
      }
    } else {
      if (hasDeletePermission) {
        onDeleteSelected();
      }
    }
  };

  // إذا لم تكن هناك صلاحية حذف أو لا توجد عناصر محددة، لا تظهر الزر
  if (!hasDeletePermission || selectedRowsCount === 0) {
    return null;
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDeleteSelected}
      disabled={isDeleting}
    >
      <Trash2 className="ml-2 h-4 w-4" />
      حذف المحدد ({selectedRowsCount})
    </Button>
  );
};

// مكون منفصل لزر حذف الكل فقط
interface ProtectedDeleteAllButtonProps {
  module: 'parasite-control' | 'vaccination' | 'mobile-clinics' | 'laboratories' | 'equine-health' | 'clients';
  onDeleteAll: () => void;
  isDeleting?: boolean;
  showToast?: boolean;
}

export const ProtectedDeleteAllButton: React.FC<ProtectedDeleteAllButtonProps> = ({
  module,
  onDeleteAll,
  isDeleting = false,
  showToast = true
}) => {
  const { checkPermission, checkPermissionWithToast } = usePermissions();

  const deletePermission: PermissionConfig = { module, action: 'delete' };
  const hasDeletePermission = checkPermission(deletePermission);

  const handleDeleteAll = () => {
    if (showToast) {
      const allowed = checkPermissionWithToast(deletePermission);
      if (allowed) {
        onDeleteAll();
      }
    } else {
      if (hasDeletePermission) {
        onDeleteAll();
      }
    }
  };

  // إذا لم تكن هناك صلاحية حذف، لا تظهر الزر
  if (!hasDeletePermission) {
    return null;
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDeleteAll}
      disabled={isDeleting}
    >
      <AlertTriangle className="ml-2 h-4 w-4" />
      حذف الكل
    </Button>
  );
};
