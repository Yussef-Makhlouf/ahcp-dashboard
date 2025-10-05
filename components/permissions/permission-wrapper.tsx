import React from 'react';
import { usePermissions, PermissionConfig } from '@/lib/hooks/usePermissions';

interface PermissionWrapperProps {
  permission: PermissionConfig;
  fallback?: React.ReactNode;
  showToast?: boolean;
  children: React.ReactNode;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  permission,
  fallback = null,
  showToast = false,
  children,
}) => {
  const { checkPermission, checkPermissionWithToast } = usePermissions();

  const hasPermission = showToast 
    ? checkPermissionWithToast(permission)
    : checkPermission(permission);

  if (!hasPermission) {
    return fallback as React.ReactElement;
  }

  return <>{children}</>;
};

// مكون للتحكم في الأزرار بناءً على الصلاحيات
interface ConditionalRenderProps {
  condition: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  condition,
  fallback = null,
  children,
}) => {
  if (!condition) {
    return fallback as React.ReactElement;
  }

  return <>{children}</>;
};

// مكون للتحكم في عرض المحتوى بناءً على الدور
interface RoleBasedRenderProps {
  allowedRoles: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleBasedRender: React.FC<RoleBasedRenderProps> = ({
  allowedRoles,
  fallback = null,
  children,
}) => {
  const { user } = usePermissions();

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback as React.ReactElement;
  }

  return <>{children}</>;
};
