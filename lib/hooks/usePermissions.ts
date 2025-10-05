import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';

export interface PermissionConfig {
  module: 'parasite-control' | 'vaccination' | 'mobile-clinics' | 'laboratories' | 'clients';
  action: 'view' | 'create' | 'edit' | 'delete';
}

export const usePermissions = () => {
  const { user } = useAuthStore();

  // تحديد الأقسام لكل مشرف بناءً على القسم الخاص به
  const getSupervisorModule = (section: string): string | null => {
    const sectionModuleMap: Record<string, string> = {
      'مكافحة الطفيليات': 'parasite-control',
      'التطعيمات': 'vaccination', 
      'العيادات المتنقلة': 'mobile-clinics',
      'المختبرات': 'laboratories',
      'الإدارة العامة': 'all' // المدير العام يمكنه الوصول لكل شيء
    };
    
    return sectionModuleMap[section] || null;
  };

  // التحقق من الصلاحيات
  const checkPermission = ({ module, action }: PermissionConfig): boolean => {
    if (!user) return false;

    // المدير العام (super_admin) له صلاحيات كاملة
    if (user.role === 'super_admin') {
      return true;
    }

    // العملاء: يمكن للجميع التعديل عليهم
    if (module === 'clients') {
      return true;
    }

    // مشرف القسم (section_supervisor)
    if (user.role === 'section_supervisor') {
      const supervisorModule = getSupervisorModule(user.section || '');
      
      // يمكن للمشرف رؤية جميع الأقسام
      if (action === 'view') {
        return true;
      }
      
      // يمكن للمشرف التعديل/الإضافة/الحذف فقط في قسمه
      if (['create', 'edit', 'delete'].includes(action)) {
        return supervisorModule === module || supervisorModule === 'all';
      }
    }

    // العامل (field_worker) يمكنه فقط الرؤية
    if (user.role === 'field_worker') {
      return action === 'view';
    }

    return false;
  };

  // التحقق من الصلاحية مع إظهار تحذير
  const checkPermissionWithToast = ({ module, action }: PermissionConfig): boolean => {
    const hasPermission = checkPermission({ module, action });
    
    if (!hasPermission && action !== 'view') {
      const moduleNames: Record<string, string> = {
        'parasite-control': 'مكافحة الطفيليات',
        'vaccination': 'التطعيمات',
        'mobile-clinics': 'العيادات المتنقلة',
        'laboratories': 'المختبرات',
        'clients': 'العملاء'
      };
      
      const actionNames: Record<string, string> = {
        'create': 'الإضافة',
        'edit': 'التعديل',
        'delete': 'الحذف'
      };
      
      toast.error(
        `ليس لديك صلاحية ${actionNames[action]} في قسم ${moduleNames[module]}`,
        {
          description: 'يمكنك فقط التعديل في قسمك المخصص',
          duration: 4000,
        }
      );
    }
    
    return hasPermission;
  };

  // الحصول على القسم الذي يشرف عليه المستخدم
  const getUserModule = (): string | null => {
    if (!user) return null;
    return getSupervisorModule(user.section || '');
  };

  // التحقق من إمكانية الوصول للقسم
  const canAccessModule = (module: string): boolean => {
    return checkPermission({ module: module as any, action: 'view' });
  };

  // التحقق من إمكانية التعديل في القسم
  const canEditInModule = (module: string): boolean => {
    return checkPermission({ module: module as any, action: 'edit' });
  };

  return {
    checkPermission,
    checkPermissionWithToast,
    getUserModule,
    canAccessModule,
    canEditInModule,
    user,
    isAdmin: user?.role === 'super_admin',
    isSupervisor: user?.role === 'section_supervisor',
    isWorker: user?.role === 'field_worker'
  };
};

export default usePermissions;
