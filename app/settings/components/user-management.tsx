"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionSelect } from "@/components/ui/section-select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  UserPlus,
  Shield,
  UserCog,
  Briefcase,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { api } from "@/lib/api/base-api";
import { useAuthStore } from "@/lib/store/auth-store";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  roleNameAr: string;
  section?: string;
  supervisorCode?: string;
  vehicleNo?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Section interface is now handled by SectionSelect component

interface UserManagementProps {
  onRefresh?: () => void;
}

export function UserManagement({ onRefresh }: UserManagementProps) {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'admin' | 'supervisor' | 'worker'>('supervisor');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    section: "",
    vehicleNo: ""
  });

  // Load data
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.get('/users');
      if ((data as any)?.success) {
        setUsers((data as any).data?.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('حدث خطأ أثناء تحميل المستخدمين');
    }
  };

  // Sections are now handled by SectionSelect component

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!editingUser && !userForm.password) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }

    if ((userType === 'supervisor' || userType === 'worker') && !userForm.section) {
      toast.error("يرجى اختيار القسم");
      return;
    }

    setIsLoading(true);
    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          name: userForm.name,
          email: userForm.email,
        };
        
        if (userForm.password) {
          updateData.password = userForm.password;
        }
        
        if (userForm.section) {
          updateData.section = userForm.section;
        }

        const response = await api.put(`/users/${editingUser._id}`, updateData);

        if ((response as any)?.success) {
          toast.success("تم تحديث المستخدم بنجاح");
          setDialogOpen(false);
          resetForm();
          loadUsers();
          onRefresh?.();
        } else {
          toast.error((response as any)?.message || "حدث خطأ أثناء تحديث المستخدم");
        }
      } else {
        // Create new user
        const endpoint = userType === 'admin' ? '/users/admins' : 
                        userType === 'supervisor' ? '/users/supervisors' : 
                        '/users/workers';

        const response = await api.post(endpoint, userForm);

        if ((response as any)?.success) {
          toast.success("تم إنشاء المستخدم بنجاح");
          setDialogOpen(false);
          resetForm();
          loadUsers();
          onRefresh?.();
        } else {
          toast.error((response as any)?.message || "حدث خطأ أثناء إنشاء المستخدم");
        }
      }
    } catch (error) {
      toast.error(editingUser ? "حدث خطأ أثناء تحديث المستخدم" : "حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsLoading(false);
    }
  };


  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      section: user.section || "",
      vehicleNo: user.vehicleNo || ""
    });
    setUserType(user.role === 'super_admin' ? 'admin' : 
                user.role === 'section_supervisor' ? 'supervisor' : 'worker');
    setDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await api.delete(`/users/${userToDelete._id}`);

      if ((response as any)?.success) {
        toast.success("تم حذف المستخدم بنجاح");
        loadUsers();
        onRefresh?.();
      } else {
        toast.error("حدث خطأ أثناء حذف المستخدم");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف المستخدم");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const canEditUser = (user: User) => {
    if (!currentUser) return false;
    
    // Super admin can edit anyone
    if (currentUser.role === 'super_admin') return true;
    
    // Section supervisor can only edit users in their section
    if (currentUser.role === 'section_supervisor') {
      return user.section === currentUser.section;
    }
    
    return false;
  };

  const canDeleteUser = (user: User) => {
    if (!currentUser) return false;
    
    // Only super admin can delete users
    if (currentUser.role === 'super_admin') return true;
    
    return false;
  };

  const resetForm = () => {
    setUserForm({
      name: "",
      email: "",
      password: "",
      section: "",
      vehicleNo: ""
    });
    setEditingUser(null);
  };

  const openCreateDialog = (type: 'admin' | 'supervisor' | 'worker') => {
    setUserType(type);
    resetForm();
    setDialogOpen(true);
  };

  // Table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "الاسم",
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "البريد الإلكتروني",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "roleNameAr",
      header: "الدور",
      cell: ({ row }) => {
        const role = row.original.role;
        const roleNameAr = row.getValue("roleNameAr") as string;
        const variant = role === 'super_admin' ? 'destructive' : 
                      role === 'section_supervisor' ? 'secondary' : 'secondary';
        
        return (
          <Badge variant={variant} className="text-right">
            {roleNameAr}
          </Badge>
        );
      },
    },
    {
      accessorKey: "section",
      header: "القسم",
      cell: ({ row }) => {
        const section = row.getValue("section") as string;
        return (
          <div className="text-right">
            {section || "غير محدد"}
          </div>
        );
      },
    },
    {
      accessorKey: "supervisorCode",
      header: "رمز المشرف",
      cell: ({ row }) => {
        const supervisorCode = row.original.supervisorCode;
        const role = row.original.role;
        
        if (role !== 'section_supervisor' || !supervisorCode) {
          return <div className="text-right text-gray-400">-</div>;
        }
        
        // Get color based on code prefix
        const getCodeColor = (code: string) => {
          const prefix = code.charAt(0);
          switch (prefix) {
            case 'P': return 'bg-green-500 text-white';
            case 'V': return 'bg-blue-500 text-white';
            case 'C': return 'bg-purple-500 text-white';
            case 'L': return 'bg-yellow-500 text-white';
            case 'E': return 'bg-orange-500 text-white';
            default: return 'bg-gray-500 text-white';
          }
        };
        
        return (
          <div className="text-right">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${getCodeColor(supervisorCode)}`}>
              {supervisorCode}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "vehicleNo",
      header: "رقم المركبة",
      cell: ({ row }) => {
        const vehicleNo = row.original.vehicleNo;
        const role = row.original.role;
        
        if (role !== 'section_supervisor' || !vehicleNo) {
          return <div className="text-right text-gray-400">-</div>;
        }
        
        return (
          <div className="text-right">
            <span className="text-blue-600 font-medium">{vehicleNo}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        const canEdit = canEditUser(user);
        const canDelete = canDeleteUser(user);
        
        return (
          <div className="flex items-center gap-2 justify-end">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditUser(user)}
                title="تعديل المستخدم"
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteUser(user)}
                title="حذف المستخدم"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const getRoleIcon = (type: 'admin' | 'supervisor' | 'worker') => {
    switch (type) {
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'supervisor':
        return <UserCog className="h-5 w-5" />;
      case 'worker':
        return <Briefcase className="h-5 w-5" />;
    }
  };

  const getRoleTitle = (type: 'admin' | 'supervisor' | 'worker') => {
    switch (type) {
      case 'admin':
        return 'إضافة مدير نظام';
      case 'supervisor':
        return 'إضافة مشرف قسم';
      case 'worker':
        return 'إضافة عامل ميداني عام';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={() => openCreateDialog('admin')} variant="outline">
            <Shield className="mr-2 h-4 w-4" />
            مدير نظام
          </Button>
          <Button onClick={() => openCreateDialog('supervisor')} variant="outline">
            <UserCog className="mr-2 h-4 w-4" />
            مشرف قسم
          </Button>
          <Button onClick={() => openCreateDialog('worker')}>
            <Briefcase className="mr-2 h-4 w-4" />
            عامل ميداني
          </Button>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          <p className="text-muted-foreground">إنشاء وإدارة مستخدمي النظام</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => openCreateDialog('admin')}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-red-100 rounded-full">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-right">
              <h3 className="font-semibold">إضافة مدير نظام</h3>
              <p className="text-sm text-muted-foreground">صلاحيات كاملة</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow " 
              onClick={() => openCreateDialog('supervisor')}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <UserCog className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <h3 className="font-semibold">إضافة مشرف قسم</h3>
              <p className="text-sm text-muted-foreground">إدارة قسم محدد</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow " 
              onClick={() => openCreateDialog('worker')}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-green-100 rounded-full">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <h3 className="font-semibold">إضافة عامل ميداني</h3>
              <p className="text-sm text-muted-foreground">عامل ميداني في قسم محدد</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة المستخدمين</CardTitle>
          <CardDescription className="text-right">
            إدارة جميع مستخدمي النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            searchKey="name"
          />
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              {getRoleIcon(userType)}
              {editingUser ? `تعديل ${editingUser.name}` : getRoleTitle(userType)}
            </DialogTitle>
            <DialogDescription className="text-right">
              {editingUser ? "تعديل بيانات المستخدم" : "أدخل بيانات المستخدم الجديد"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right">الاسم الكامل</Label>
              <Input
                id="name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="أدخل الاسم الكامل"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="أدخل البريد الإلكتروني"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-right">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="أدخل كلمة المرور"
                className="text-right"
              />
            </div>

            {(userType === 'supervisor' || userType === 'worker') && (
              <div className="space-y-2">
                <Label htmlFor="section" className="text-right">القسم</Label>
                <SectionSelect
                  value={userForm.section}
                  onValueChange={(value) => setUserForm({ ...userForm, section: value })}
                  placeholder="اختر القسم"
                  className="text-right"
                />
              </div>
            )}

            {userType === 'supervisor' && (
              <div className="space-y-2">
                <Label htmlFor="vehicleNo" className="text-right">رقم المركبة</Label>
                <Input
                  id="vehicleNo"
                  value={userForm.vehicleNo}
                  onChange={(e) => setUserForm({ ...userForm, vehicleNo: e.target.value })}
                  placeholder="مثال: أحمد-P1 أو محمد-C2"
                  className="text-right"
                />
                <p className="text-xs text-gray-500 text-right">
                  سيتم استخدام هذا الرقم تلقائياً في النماذج عند اختيار هذا المشرف
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateUser} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingUser ? "جاري التحديث..." : "جاري الإنشاء..."}
                </>
              ) : (
                <>
                  {editingUser ? (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      تحديث المستخدم
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      إنشاء المستخدم
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} >
          <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف المستخدم <strong>{userToDelete?.name}</strong>؟
              <br />
              <span className="text-red-600 font-medium">هذا الإجراء لا يمكن التراجع عنه.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف المستخدم
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
