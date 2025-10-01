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
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Database,
  HardDrive,
  Users,
  Building,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { Progress } from "@/components/ui/progress";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  const [settings, setSettings] = useState({
    language: "ar",
    timezone: "Africa/Cairo",
    dateFormat: "DD/MM/YYYY",
    currency: "EGP",
    autoSave: true,
    autoSaveInterval: 5,
    notifications: {
      desktop: true,
      sound: true,
      email: false,
    },
    backup: {
      automatic: true,
      frequency: "daily",
      retention: 30,
    },
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  const handleExportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settings-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">الإعدادات</h1>
            <p className="text-muted-foreground mt-2">
              إدارة إعدادات النظام والتطبيق
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSettings}>
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="appearance">المظهر</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="data">البيانات</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>
                  تخصيص الإعدادات الأساسية للنظام
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>اللغة</Label>
                    <Select value={settings.language} onValueChange={(value) => 
                      setSettings({ ...settings, language: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>المنطقة الزمنية</Label>
                    <Select value={settings.timezone} onValueChange={(value) => 
                      setSettings({ ...settings, timezone: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Cairo">القاهرة (GMT+2)</SelectItem>
                        <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>تنسيق التاريخ</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => 
                      setSettings({ ...settings, dateFormat: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>العملة</Label>
                    <Select value={settings.currency} onValueChange={(value) => 
                      setSettings({ ...settings, currency: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الحفظ التلقائي</Label>
                    <div className="text-sm text-muted-foreground">
                      حفظ التغييرات تلقائياً أثناء العمل
                    </div>
                  </div>
                  <Switch checked={settings.autoSave} onCheckedChange={(checked) => 
                    setSettings({ ...settings, autoSave: checked })
                  } />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>المظهر والواجهة</CardTitle>
                <CardDescription>
                  تخصيص مظهر التطبيق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>السمة</Label>
                  <RadioGroup value={theme} onValueChange={setTheme}>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">فاتح</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">داكن</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system">تلقائي (حسب النظام)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
                <CardDescription>
                  تحكم في كيفية تلقي الإشعارات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>إشعارات سطح المكتب</Label>
                      <div className="text-sm text-muted-foreground">
                        عرض إشعارات النظام على سطح المكتب
                      </div>
                    </div>
                    <Switch checked={settings.notifications.desktop} onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, desktop: checked }
                      })
                    } />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>الأصوات</Label>
                      <div className="text-sm text-muted-foreground">
                        تشغيل أصوات للإشعارات المهمة
                      </div>
                    </div>
                    <Switch checked={settings.notifications.sound} onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sound: checked }
                      })
                    } />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>إشعارات البريد الإلكتروني</Label>
                      <div className="text-sm text-muted-foreground">
                        إرسال إشعارات مهمة عبر البريد الإلكتروني
                      </div>
                    </div>
                    <Switch checked={settings.notifications.email} onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: checked }
                      })
                    } />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأمان</CardTitle>
                <CardDescription>
                  حماية حسابك وبياناتك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    آخر فحص أمني: اليوم الساعة 10:30 صباحاً - لم يتم العثور على مشاكل
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>المصادقة الثنائية</Label>
                      <div className="text-sm text-muted-foreground">
                        طبقة حماية إضافية لحسابك
                      </div>
                    </div>
                    <Badge variant="outline">مفعل</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تسجيل الخروج التلقائي</Label>
                      <div className="text-sm text-muted-foreground">
                        تسجيل الخروج بعد فترة من عدم النشاط
                      </div>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 دقيقة</SelectItem>
                        <SelectItem value="30">30 دقيقة</SelectItem>
                        <SelectItem value="60">ساعة</SelectItem>
                        <SelectItem value="never">أبداً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة البيانات</CardTitle>
                <CardDescription>
                  النسخ الاحتياطي والتخزين
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>استخدام التخزين</Label>
                      <span className="text-sm font-medium">2.8 GB / 5 GB</span>
                    </div>
                    <Progress value={56} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>النسخ الاحتياطي التلقائي</Label>
                      <div className="text-sm text-muted-foreground">
                        إنشاء نسخ احتياطية تلقائياً
                      </div>
                    </div>
                    <Switch checked={settings.backup.automatic} onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        backup: { ...settings.backup, automatic: checked }
                      })
                    } />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Database className="ml-2 h-4 w-4" />
                      نسخ احتياطي الآن
                    </Button>
                    <Button variant="outline">
                      <Upload className="ml-2 h-4 w-4" />
                      استعادة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reset Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إعادة تعيين الإعدادات</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من إعادة جميع الإعدادات إلى القيم الافتراضية؟
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={() => {
                setShowResetDialog(false);
              }}>
                <RotateCcw className="ml-2 h-4 w-4" />
                إعادة تعيين
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
