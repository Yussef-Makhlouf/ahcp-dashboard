"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Users,
  Building,
  Moon,
  Sun,
  Globe,
  BarChart3,
  MapPin,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { UserManagement } from "./components/user-management";
import { SectionManagement } from "./components/section-management";
import { VillageManagement } from "./components/village-management";
import { api } from "@/lib/api/base-api";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("users");
  
  // Language State
  const [language, setLanguage] = useState("ar");
  
  // Statistics State
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    supervisors: 0,
    workers: 0,
    totalSections: 0,
    activeSections: 0,
    totalVillages: 0,
    activeVillages: 0
  });

  const loadStats = async () => {
    try {
      const [usersData, sectionsData, villagesData] = await Promise.all([
        api.get('/users/stats'),
        api.get('/sections'),
        api.get('/villages/stats')
      ]);
      
      if ((usersData as any)?.success) {
        setStats(prev => ({ ...prev, ...(usersData as any).data }));
      }
      
      if ((sectionsData as any)?.success) {
        const sections = (sectionsData as any).data?.sections || [];
        setStats(prev => ({
          ...prev,
          totalSections: sections.length,
          activeSections: sections.filter((s: any) => s.isActive).length
        }));
      }
      
      if ((villagesData as any)?.success) {
        setStats(prev => ({ ...prev, ...(villagesData as any).data }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('حدث خطأ أثناء تحميل الإحصائيات');
    }
  };

  const handleRefresh = () => {
    loadStats();
  };

  // Load initial data
  useEffect(() => {
    loadStats();
  }, []);

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

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-sm text-muted-foreground">المستخدمين النشطين</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-purple-100 rounded-full">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.totalSections}</p>
                <p className="text-sm text-muted-foreground">إجمالي الأقسام</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.admins + stats.supervisors + stats.workers}</p>
                <p className="text-sm text-muted-foreground">المستخدمين حسب الدور</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-teal-100 rounded-full">
                <MapPin className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.totalVillages}</p>
                <p className="text-sm text-muted-foreground">إجمالي القرى</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="sections">الأقسام</TabsTrigger>
            <TabsTrigger value="villages">القرى</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <UserManagement onRefresh={handleRefresh} />
          </TabsContent>

          {/* Sections Management */}
          <TabsContent value="sections" className="space-y-6">
            <SectionManagement onRefresh={handleRefresh} />
          </TabsContent>

          {/* Villages Management */}
          <TabsContent value="villages" className="space-y-6">
            <VillageManagement onRefresh={handleRefresh} />
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
  );
}