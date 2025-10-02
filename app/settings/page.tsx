"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Users,
  MapPin,
  Moon,
  Sun,
  Globe,
  Save,
  Plus,
  UserPlus,
  Building,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("users");
  const [isLoading, setIsLoading] = useState(false);
  
  // User Management State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "supervisor",
    password: "",
  });

  // Village Management State
  const [newVillage, setNewVillage] = useState({
    name: "",
    governorate: "",
    description: "",
  });

  // Language State
  const [language, setLanguage] = useState("ar");

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("تم إضافة المستخدم بنجاح");
      setNewUser({ name: "", email: "", role: "supervisor", password: "" });
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة المستخدم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVillage = async () => {
    if (!newVillage.name || !newVillage.governorate) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("تم إضافة القرية بنجاح");
      setNewVillage({ name: "", governorate: "", description: "" });
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة القرية");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    toast.success(`تم تغيير اللغة إلى ${newLanguage === "ar" ? "العربية" : "English"}`);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`تم تغيير السمة إلى ${newTheme === "dark" ? "الوضع الداكن" : "الوضع الفاتح"}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-right">الإعدادات</h1>
            <p className="text-muted-foreground mt-2 text-right">
              إدارة النظام والإعدادات الأساسية
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="villages">القرى</TabsTrigger>
            <TabsTrigger value="appearance">المظهر</TabsTrigger>
            <TabsTrigger value="language">اللغة</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Users className="h-5 w-5" />
                  إدارة المستخدمين
                </CardTitle>
                <CardDescription className="text-right">
                  إضافة مستخدمين جدد وتعيين الأدوار
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="text-right">اسم المستخدم</Label>
                    <Input
                      id="userName"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="أدخل اسم المستخدم"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userEmail" className="text-right">البريد الإلكتروني</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="أدخل البريد الإلكتروني"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userRole" className="text-right">الدور</Label>
                    <Select value={newUser.role} onValueChange={(value) => 
                      setNewUser({ ...newUser, role: value })
                    }>
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">مدير</SelectItem>
                        <SelectItem value="supervisor">مشرف</SelectItem>
                        <SelectItem value="user">مستخدم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userPassword" className="text-right">كلمة المرور</Label>
                    <Input
                      id="userPassword"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="أدخل كلمة المرور"
                      className="text-right"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAddUser} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      إضافة مستخدم
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Villages Management */}
          <TabsContent value="villages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <MapPin className="h-5 w-5" />
                  إدارة القرى
                </CardTitle>
                <CardDescription className="text-right">
                  إضافة قرى جديدة إلى النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="villageName" className="text-right">اسم القرية</Label>
                    <Input
                      id="villageName"
                      value={newVillage.name}
                      onChange={(e) => setNewVillage({ ...newVillage, name: e.target.value })}
                      placeholder="أدخل اسم القرية"
                      className="text-right"
                    />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="villageGovernorate" className="text-right">المحافظة</Label>
                    <Select value={newVillage.governorate} onValueChange={(value) => 
                      setNewVillage({ ...newVillage, governorate: value })
                    }>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cairo">القاهرة</SelectItem>
                        <SelectItem value="giza">الجيزة</SelectItem>
                        <SelectItem value="alexandria">الإسكندرية</SelectItem>
                        <SelectItem value="sharqia">الشرقية</SelectItem>
                        <SelectItem value="dakahlia">الدقهلية</SelectItem>
                        <SelectItem value="kafr_el_sheikh">كفر الشيخ</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                    </div>

                <div className="space-y-2">
                  <Label htmlFor="villageDescription" className="text-right">وصف القرية (اختياري)</Label>
                  <Input
                    id="villageDescription"
                    value={newVillage.description}
                    onChange={(e) => setNewVillage({ ...newVillage, description: e.target.value })}
                    placeholder="أدخل وصف للقرية"
                    className="text-right"
                  />
                </div>

                <Button 
                  onClick={handleAddVillage} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      إضافة قرية
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Sun className="h-5 w-5" />
                  إعدادات المظهر
                </CardTitle>
                <CardDescription className="text-right">
                  تخصيص مظهر التطبيق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-0.5 text-right">
                      <Label className="flex items-center gap-2">
                        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        الوضع الداكن
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        تبديل بين الوضع الفاتح والداكن
                      </div>
                    </div>
                    <Switch 
                      checked={theme === "dark"} 
                      onCheckedChange={(checked) => handleThemeChange(checked ? "dark" : "light")}
                    />
                  </div>

                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription className="text-right">
                      تغيير السمة سيؤثر على جميع صفحات التطبيق
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Settings */}
          <TabsContent value="language" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Globe className="h-5 w-5" />
                  إعدادات اللغة
                </CardTitle>
                <CardDescription className="text-right">
                  تغيير لغة واجهة التطبيق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-right">اللغة</Label>
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertDescription className="text-right">
                      تغيير اللغة سيؤثر على جميع نصوص التطبيق
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}