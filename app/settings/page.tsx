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
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { UserManagement } from "./components/user-management";
import { SectionManagement } from "./components/section-management";
import { VillageManagement } from "./components/village-management";
import { HoldingCodeManagement } from "./components/holding-code-management";
import { DropdownListManagerV2 } from "@/components/dropdown-management/dropdown-list-manager-v2";
import { ApiConnectionTest } from "./components/api-connection-test";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("users");
  
  const handleRefresh = () => {
    // Refresh handled by individual components
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="sections">الأقسام</TabsTrigger>
            <TabsTrigger value="villages">القرى</TabsTrigger>
            <TabsTrigger value="holding-codes">رموز الحيازة</TabsTrigger>
            <TabsTrigger value="dropdown-lists">القوائم المنسدلة</TabsTrigger>
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

          {/* Holding Codes Management */}
          <TabsContent value="holding-codes" className="space-y-6">
            <HoldingCodeManagement onRefresh={handleRefresh} />
          </TabsContent>

          {/* Dropdown Lists Management */}
          <TabsContent value="dropdown-lists" className="space-y-6">
            <DropdownListManagerV2 />
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
  );
}