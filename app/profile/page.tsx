"use client";

import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Settings,
  Camera,
  Save,
  Edit,
  Key,
  Bell,
  Activity,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/lib/auth-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    section: user?.role === 'super_admin' ? 'super admin' : (user?.section || ''),
    bio: user?.bio || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // تحديث بيانات النموذج عند تغيير بيانات المستخدم
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        section: user.role === 'super_admin' ? 'super admin' : (user.section || ''),
        bio: user.bio || '',
      });
    }
  }, [user]);

  // جلب بيانات المستخدم
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    enabled: !!user,
  });

  // جلب إحصائيات النشاط
  const { data: activityStats } = useQuery({
    queryKey: ['user-activity'],
    queryFn: () => authApi.getUserActivity?.() || Promise.resolve({
      totalActions: 156,
      thisMonth: 42,
      lastLogin: new Date().toISOString(),
      recentActions: [
        { action: 'إضافة مربي جديد', date: '2024-01-15', module: 'العملاء' },
        { action: 'تحديث سجل تحصين', date: '2024-01-14', module: 'التحصينات' },
        { action: 'تصدير تقرير', date: '2024-01-13', module: 'التقارير' },
      ]
    }),
  });

  // تحديث الملف الشخصي
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: () => {
      toast.success('تم تحديث الملف الشخصي بنجاح');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء التحديث');
    }
  });

  // تغيير كلمة المرور
  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => authApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setIsUploadingImage(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate upload (you can replace this with actual upload logic)
    setTimeout(() => {
      setIsUploadingImage(false);
      toast.success('تم رفع الصورة بنجاح');
    }, 2000);
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      'super_admin': 'مدير عام',
      'section_supervisor': 'مشرف قسم',
      'field_worker': 'عامل ميداني'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      'super_admin': 'default',
      'section_supervisor': 'secondary',
      'field_worker': 'outline'
    };
    return variants[role] || 'outline';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>جاري تحميل الملف الشخصي...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الملف الشخصي</h1>
            <p className="text-muted-foreground mt-2">
              إدارة معلوماتك الشخصية وإعدادات الحساب
            </p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'إلغاء التعديل' : 'تعديل الملف'}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar 
                  className="h-24 w-24 cursor-pointer transition-opacity hover:opacity-80" 
                  onClick={handleImageClick}
                >
                  <AvatarImage src={avatarPreview || user?.avatar} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                      onClick={handleImageClick}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </>
                )}
                {isEditing && (
                  <p className="text-xs text-muted-foreground mt-2">
                    انقر على الصورة لتغييرها
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                <Badge variant={getRoleBadgeVariant(user?.role || '')}>
                  {getRoleLabel(user?.role || '')}
                </Badge>
                {user?.section && (
                  <p className="text-sm text-muted-foreground">
                    قسم: {user.section}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    انضم في {formatDate(user?.createdAt || new Date().toISOString())}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    آخر نشاط: {formatDate(activityStats?.lastLogin || new Date().toISOString())}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-2" />
                  المعلومات
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  الأمان
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  النشاط
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  الإعدادات
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>المعلومات الشخصية</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!isEditing}
                          placeholder="+966501234567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="section">القسم</Label>
                        <Input
                          id="section"
                          value={formData.section}
                          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                          disabled={!isEditing || user?.role === 'super_admin'}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">نبذة شخصية</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={!isEditing}
                        placeholder="اكتب نبذة مختصرة عنك..."
                        rows={3}
                      />
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isLoading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateProfileMutation.isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>الأمان وكلمة المرور</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </div>
                    <Button 
                      onClick={handleChangePassword}
                      disabled={changePasswordMutation.isLoading}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {changePasswordMutation.isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{activityStats?.totalActions || 0}</p>
                            <p className="text-sm text-muted-foreground">إجمالي الأنشطة</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{activityStats?.thisMonth || 0}</p>
                            <p className="text-sm text-muted-foreground">هذا الشهر</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">آخر نشاط</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(activityStats?.lastLogin || new Date().toISOString())}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>الأنشطة الأخيرة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activityStats?.recentActions?.map((activity, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.action}</p>
                              <p className="text-sm text-muted-foreground">{activity.module}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(activity.date)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات الحساب</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">الإشعارات</p>
                        <p className="text-sm text-muted-foreground">تلقي إشعارات عن التحديثات</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Bell className="h-4 w-4 mr-2" />
                        إدارة الإشعارات
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">اللغة</p>
                        <p className="text-sm text-muted-foreground">العربية</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        تغيير اللغة
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">المنطقة الزمنية</p>
                        <p className="text-sm text-muted-foreground">توقيت الرياض (GMT+3)</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        تغيير المنطقة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
