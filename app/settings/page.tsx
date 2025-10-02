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
import { useTranslation } from "@/lib/use-translation";
import { useLanguage } from "@/lib/language-context";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const { locale, setLocale } = useLanguage();
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

  // Language is now managed by the context

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error(t('settings.fillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('settings.userAddedSuccess'));
      setNewUser({ name: "", email: "", role: "supervisor", password: "" });
    } catch (error) {
      toast.error(t('settings.userAddError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVillage = async () => {
    if (!newVillage.name || !newVillage.governorate) {
      toast.error(t('settings.fillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('settings.villageAddedSuccess'));
      setNewVillage({ name: "", governorate: "", description: "" });
    } catch (error) {
      toast.error(t('settings.villageAddError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLocale(newLanguage);
    toast.success(`${t('settings.languageChanged')} ${newLanguage === "ar" ? "العربية" : "English"}`, {
      duration: 2000,
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`${t('settings.themeChanged')} ${newTheme === "dark" ? t('settings.darkMode') : "الوضع الفاتح"}`, {
      duration: 2000,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-right">{t('settings.title')}</h1>
            <p className="text-muted-foreground mt-2 text-right">
              {t('settings.subtitle')}
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">{t('settings.users')}</TabsTrigger>
            <TabsTrigger value="villages">{t('settings.villages')}</TabsTrigger>
            <TabsTrigger value="appearance">{t('settings.appearance')}</TabsTrigger>
            <TabsTrigger value="language">{t('settings.language')}</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Users className="h-5 w-5" />
                  {t('settings.userManagement')}
                </CardTitle>
                <CardDescription className="text-right">
                  {t('settings.userManagementDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="text-right">{t('settings.userName')}</Label>
                    <Input
                      id="userName"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder={t('forms.enterValue')}
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userEmail" className="text-right">{t('settings.userEmail')}</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder={t('forms.enterValue')}
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userRole" className="text-right">{t('settings.userRole')}</Label>
                    <Select value={newUser.role} onValueChange={(value) => 
                      setNewUser({ ...newUser, role: value })
                    }>
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t('settings.roles.admin')}</SelectItem>
                        <SelectItem value="supervisor">{t('settings.roles.supervisor')}</SelectItem>
                        <SelectItem value="user">{t('settings.roles.user')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userPassword" className="text-right">{t('settings.userPassword')}</Label>
                    <Input
                      id="userPassword"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder={t('forms.enterValue')}
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
                      {t('settings.adding')}
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t('settings.addUser')}
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
                  {t('settings.villageManagement')}
                </CardTitle>
                <CardDescription className="text-right">
                  {t('settings.villageManagementDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="villageName" className="text-right">{t('settings.villageName')}</Label>
                    <Input
                      id="villageName"
                      value={newVillage.name}
                      onChange={(e) => setNewVillage({ ...newVillage, name: e.target.value })}
                      placeholder={t('forms.enterValue')}
                      className="text-right"
                    />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="villageGovernorate" className="text-right">{t('settings.villageGovernorate')}</Label>
                    <Select value={newVillage.governorate} onValueChange={(value) => 
                      setNewVillage({ ...newVillage, governorate: value })
                    }>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder={t('forms.selectOption')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cairo">{t('settings.governorates.cairo')}</SelectItem>
                        <SelectItem value="giza">{t('settings.governorates.giza')}</SelectItem>
                        <SelectItem value="alexandria">{t('settings.governorates.alexandria')}</SelectItem>
                        <SelectItem value="sharqia">{t('settings.governorates.sharqia')}</SelectItem>
                        <SelectItem value="dakahlia">{t('settings.governorates.dakahlia')}</SelectItem>
                        <SelectItem value="kafr_el_sheikh">{t('settings.governorates.kafr_el_sheikh')}</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                    </div>

                <div className="space-y-2">
                  <Label htmlFor="villageDescription" className="text-right">{t('settings.villageDescription')}</Label>
                  <Input
                    id="villageDescription"
                    value={newVillage.description}
                    onChange={(e) => setNewVillage({ ...newVillage, description: e.target.value })}
                    placeholder={t('forms.enterValue')}
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
                      {t('settings.adding')}
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('settings.addVillage')}
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
                  {t('settings.appearanceSettings')}
                </CardTitle>
                <CardDescription className="text-right">
                  {t('settings.appearanceSettingsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-0.5 text-right">
                      <Label className="flex items-center gap-2">
                        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        {t('settings.darkMode')}
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        {t('settings.darkModeDesc')}
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
                      {t('settings.themeChangeWarning')}
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
                  {t('settings.languageSettings')}
                </CardTitle>
                <CardDescription className="text-right">
                  {t('settings.languageSettingsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-right">{t('settings.language')}</Label>
                    <Select value={locale} onValueChange={handleLanguageChange}>
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
                      {t('settings.languageChangeWarning')}
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