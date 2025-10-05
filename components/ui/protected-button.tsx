import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { usePermissions, PermissionConfig } from '@/lib/hooks/usePermissions';

interface ProtectedButtonProps extends ButtonProps {
  permission: PermissionConfig;
  showToast?: boolean;
  fallbackComponent?: React.ReactNode;
}

export const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  permission,
  showToast = true,
  fallbackComponent = null,
  onClick,
  children,
  ...buttonProps
}) => {
  const { checkPermission, checkPermissionWithToast } = usePermissions();

  const hasPermission = checkPermission(permission);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (showToast) {
      const allowed = checkPermissionWithToast(permission);
      if (allowed && onClick) {
        onClick(event);
      }
    } else {
      if (hasPermission && onClick) {
        onClick(event);
      }
    }
  };

  // إذا لم تكن هناك صلاحية، إظهار المكون البديل أو إخفاء الزر
  if (!hasPermission) {
    return fallbackComponent as React.ReactElement;
  }

  return (
    <Button {...buttonProps} onClick={handleClick}>
      {children}
    </Button>
  );
};

// مكون للأزرار التي تظهر فقط للمدير العام
interface AdminOnlyButtonProps extends ButtonProps {
  fallbackComponent?: React.ReactNode;
}

export const AdminOnlyButton: React.FC<AdminOnlyButtonProps> = ({
  fallbackComponent = null,
  children,
  ...buttonProps
}) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return fallbackComponent as React.ReactElement;
  }

  return <Button {...buttonProps}>{children}</Button>;
};

// مكون للأزرار التي تظهر للمدير العام والمشرفين فقط
interface SupervisorButtonProps extends ButtonProps {
  module: string;
  fallbackComponent?: React.ReactNode;
}

export const SupervisorButton: React.FC<SupervisorButtonProps> = ({
  module,
  fallbackComponent = null,
  children,
  ...buttonProps
}) => {
  const { canEditInModule, isAdmin } = usePermissions();

  if (!isAdmin && !canEditInModule(module)) {
    return fallbackComponent as React.ReactElement;
  }

  return <Button {...buttonProps}>{children}</Button>;
};
