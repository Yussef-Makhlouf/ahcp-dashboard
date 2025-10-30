import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';

export interface PermissionConfig {
  module: 'parasite-control' | 'vaccination' | 'mobile-clinics' | 'laboratories' | 'equine-health' | 'clients' | 'holding-codes';
  action: 'view' | 'create' | 'edit' | 'delete';
}

export const usePermissions = () => {
  const { user } = useAuthStore();

  // تحديد الأقسام لكل مشرف بناءً على القسم الخاص به
  const getSupervisorModule = (section: string): string | null => {
    const sectionModuleMap: Record<string, string> = {
      // الأقسام باللغة العربية
      'مكافحة الطفيليات': 'parasite-control',
      'التطعيمات': 'vaccination',
      'التحصينات': 'vaccination',
      'العيادات المتنقلة': 'mobile-clinics',
      'العيادة المتنقلة': 'mobile-clinics',
      'المختبرات': 'laboratories',
      'صحة الخيول': 'equine-health',
      'الإدارة العامة': 'all',
      
      // الأقسام بالرموز الإنجليزية (من قاعدة البيانات)
      'PARA': 'parasite-control',           // مكافحة الطفيليات
      'VACC': 'vaccination',               // التطعيمات
      'CLINIC': 'mobile-clinics',          // العيادات المتنقلة
      'LAB': 'laboratories',               // المختبرات
      'EQUINE': 'equine-health',           // صحة الخيول
      'VET': 'parasite-control',           // الطب البيطري (مكافحة الطفيليات)
      'ADMIN': 'all'                       // الإدارة العامة
    };
    
    const result = sectionModuleMap[section] || null;
    console.log(`getSupervisorModule: section="${section}", result="${result}"`);
    return result;
  };

  // التحقق من الصلاحيات
  const checkPermission = ({ module, action }: PermissionConfig): boolean => {
    if (!user) {
      console.log('No user found');
      return false;
    }

    console.log(`Checking permission for user: ${user.email}, role: ${user.role}, section: ${user.section}, module: ${module}, action: ${action}`);

    // المدير العام (super_admin) له صلاحيات كاملة
    if (user.role === 'super_admin') {
      console.log('User is super_admin, granting permission');
      return true;
    }

    // العملاء: يمكن للجميع التعديل عليهم
    if (module === 'clients') {
      console.log(`Module is ${module}, granting permission`);
      return true;
    }

    // رموز الحيازة: الحذف للمدير العام فقط، باقي العمليات للجميع
    if (module === 'holding-codes') {
      if (action === 'delete') {
        // الحذف متاح للمدير العام فقط (تم التحقق منه أعلاه)
        console.log(`Holding codes delete permission check: role=${user.role}, hasPermission=false (not super_admin)`);
        return false;
      }
      // باقي العمليات (view, create, edit) متاحة للجميع
      console.log(`Module is ${module}, action is ${action}, granting permission`);
      return true;
    }

    // مشرف القسم (section_supervisor)
    if (user.role === 'section_supervisor') {
      const supervisorModule = getSupervisorModule(user.section || '');
      console.log(`Supervisor module: ${supervisorModule} for section: ${user.section}`);
      
      // يمكن للمشرف رؤية جميع الأقسام
      if (action === 'view') {
        console.log('Action is view, granting permission');
        return true;
      }
      
      // يمكن للمشرف التعديل/الإضافة/الحذف فقط في قسمه
      if (['create', 'edit', 'delete'].includes(action)) {
        const hasPermission = supervisorModule === module || supervisorModule === 'all';
        console.log(`Permission check: user.section="${user.section}", supervisorModule="${supervisorModule}", module="${module}", action="${action}", hasPermission=${hasPermission}`);
        
        // إضافة تشخيص إضافي
        if (supervisorModule === module) {
          console.log(`✅ User has permission for their own module: ${module}`);
        } else if (supervisorModule === 'all') {
          console.log(`✅ User has permission for all modules`);
        } else {
          console.log(`❌ User does not have permission for module: ${module}`);
        }
        
        return hasPermission;
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
        'equine-health': 'صحة الخيول',
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
