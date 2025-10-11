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
  UserPlus,
  Shield,
  UserCog,
  Briefcase,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { api } from "@/lib/api/base-api";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  roleNameAr: string;
  section?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Section {
  _id: string;
  name: string;
  code: string;
}

interface UserManagementProps {
  onRefresh?: () => void;
}

export function UserManagement({ onRefresh }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'admin' | 'supervisor' | 'worker'>('supervisor');

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    section: ""
  });

  // Load data
  useEffect(() => {
    loadUsers();
    loadSections();
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

  const loadSections = async () => {
    try {
      const data = await api.get('/sections/active');
      if ((data as any)?.success) {
        setSections((data as any).data || []);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('حدث خطأ أثناء تحميل الأقسام');
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (userType === 'supervisor' && !userForm.section) {
      toast.error("يرجى اختيار القسم للمشرف");
      return;
    }

    setIsLoading(true);
    try {
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
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await api.put(`/users/${userId}/toggle-status`);

      if ((response as any)?.success) {
        toast.success("تم تحديث حالة المستخدم بنجاح");
        loadUsers();
      } else {
        toast.error("حدث خطأ أثناء تحديث حالة المستخدم");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة المستخدم");
    }
  };

  const resetForm = () => {
    setUserForm({
      name: "",
      email: "",
      password: "",
      section: ""
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
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "secondary" : "secondary"} className="text-right">
            {isActive ? "نشط" : "غير نشط"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleStatus(user._id)}
            >
              {user.isActive ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
            </Button>
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
              <p className="text-sm text-muted-foreground">عامل عام بدون قسم محدد</p>
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
              {getRoleTitle(userType)}
            </DialogTitle>
            <DialogDescription className="text-right">
              أدخل بيانات المستخدم الجديد
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

            {userType === 'supervisor' && (
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateUser} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  إنشاء المستخدم
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
