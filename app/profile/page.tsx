"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  Shield,
  Camera,
  Save,
  Key,
  Bell,
  Activity,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  bio: string;
  address: string;
  emergencyContact: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  languages: string[];
  certifications: string[];
}

interface UserStats {
  totalActivities: number;
  completedTasks: number;
  successRate: number;
  animalsTreated: number;
  villagesCovered: number;
  monthlyTarget: number;
  monthlyAchieved: number;
}

const mockProfile: UserProfile = {
  id: "USR001",
  name: "د. محمد علي",
  email: "mohamed.ali@ahcp.gov",
  phone: "+201234567890",
  role: "طبيب بيطري أول",
  department: "قسم الصحة الحيوانية",
  joinDate: "2020-03-15",
  bio: "طبيب بيطري متخصص في صحة الحيوانات الكبيرة مع خبرة تزيد عن 10 سنوات في مجال الرعاية البيطرية الميدانية.",
  address: "القاهرة، مصر",
  emergencyContact: "+201098765432",
  specialization: "طب الحيوانات الكبيرة",
  licenseNumber: "VET2020-1234",
  yearsOfExperience: 10,
  languages: ["العربية", "الإنجليزية"],
  certifications: [
    "شهادة البورد المصري في الطب البيطري",
    "دبلوم صحة الحيوان",
    "شهادة مكافحة الأوبئة الحيوانية",
  ],
};

const mockStats: UserStats = {
  totalActivities: 342,
  completedTasks: 318,
  successRate: 93,
  animalsTreated: 2847,
  villagesCovered: 12,
  monthlyTarget: 50,
  monthlyAchieved: 47,
};

const recentActivities = [
  {
    id: 1,
    type: "vaccination",
    title: "حملة تحصين - قرية النور",
    date: "2025-09-28",
    status: "completed",
  },
  {
    id: 2,
    type: "clinic",
    title: "عيادة متنقلة - قرية السلام",
    date: "2025-09-27",
    status: "completed",
  },
  {
    id: 3,
    type: "parasite",
    title: "مكافحة طفيليات - مزرعة أحمد",
    date: "2025-09-26",
    status: "completed",
  },
  {
    id: 4,
    type: "lab",
    title: "جمع عينات للفحص",
    date: "2025-09-25",
    status: "completed",
  },
];

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    weeklyReport: true,
    monthlyReport: false,
  });

  const handleSaveProfile = () => {
    // Save profile logic here
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // Change password logic here
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">الملف الشخصي</h1>
            <p className="text-muted-foreground mt-2">
              إدارة معلوماتك الشخصية وإعدادات الحساب
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveProfile}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ التغييرات
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                تعديل الملف الشخصي
              </Button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-2xl">
                    {profile.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm" className="mt-3">
                    <Camera className="ml-2 h-4 w-4" />
                    تغيير الصورة
                  </Button>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.role}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">
                      <Briefcase className="ml-1 h-3 w-3" />
                      {profile.department}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="ml-1 h-3 w-3" />
                      انضم في {new Date(profile.joinDate).toLocaleDateString("ar")}
                    </Badge>
                    <Badge variant="outline">
                      <Award className="ml-1 h-3 w-3" />
                      {profile.yearsOfExperience} سنوات خبرة
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm">{profile.bio}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-blue-600">{mockStats.totalActivities}</div>
                    <div className="text-xs text-muted-foreground">نشاط كلي</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-green-600">{mockStats.successRate}%</div>
                    <div className="text-xs text-muted-foreground">معدل النجاح</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-blue-600">{mockStats.animalsTreated}</div>
                    <div className="text-xs text-muted-foreground">حيوان معالج</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-purple-600">{mockStats.villagesCovered}</div>
                    <div className="text-xs text-muted-foreground">قرية مغطاة</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="personal">المعلومات الشخصية</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الاتصال</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm" dir="ltr">{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.address}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>المؤهلات والشهادات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">رقم الترخيص: {profile.licenseNumber}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>النشاط الأخير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{activity.title}</div>
                          <div className="text-xs text-muted-foreground">{activity.date}</div>
                        </div>
                      </div>
                      <Badge variant="default">مكتمل</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>الاسم الكامل</Label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing}
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الطوارئ</Label>
                    <Input
                      value={profile.emergencyContact}
                      onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                      disabled={!isEditing}
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>التخصص</Label>
                    <Input
                      value={profile.specialization}
                      onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>سنوات الخبرة</Label>
                    <Input
                      type="number"
                      value={profile.yearsOfExperience}
                      onChange={(e) => setProfile({ ...profile, yearsOfExperience: parseInt(e.target.value) })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>نبذة شخصية</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>الهدف الشهري</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">التقدم</span>
                      <span className="text-sm font-medium">
                        {mockStats.monthlyAchieved} / {mockStats.monthlyTarget}
                      </span>
                    </div>
                    <Progress value={(mockStats.monthlyAchieved / mockStats.monthlyTarget) * 100} />
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {((mockStats.monthlyAchieved / mockStats.monthlyTarget) * 100).toFixed(0)}% من الهدف محقق
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات الأداء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">المهام المكتملة</span>
                      <span className="font-medium">{mockStats.completedTasks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">معدل النجاح</span>
                      <Badge variant="default">{mockStats.successRate}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">الحيوانات المعالجة</span>
                      <span className="font-medium">{mockStats.animalsTreated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>الإنجازات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg border">
                    <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <div className="font-medium text-sm">أفضل أداء</div>
                    <div className="text-xs text-muted-foreground">شهر أغسطس</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="font-medium text-sm">100+ مهمة</div>
                    <div className="text-xs text-muted-foreground">في شهر واحد</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium text-sm">قائد فريق</div>
                    <div className="text-xs text-muted-foreground">3 مرات</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="font-medium text-sm">دقة المواعيد</div>
                    <div className="text-xs text-muted-foreground">98%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تغيير كلمة المرور</CardTitle>
                <CardDescription>
                  قم بتحديث كلمة المرور الخاصة بك بانتظام للحفاظ على أمان حسابك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>كلمة المرور الحالية</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور الجديدة</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>تأكيد كلمة المرور الجديدة</Label>
                  <Input type="password" />
                </div>
                <Button onClick={handleChangePassword}>
                  <Key className="ml-2 h-4 w-4" />
                  تغيير كلمة المرور
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المصادقة الثنائية</CardTitle>
                <CardDescription>
                  أضف طبقة إضافية من الأمان لحسابك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    المصادقة الثنائية غير مفعلة. قم بتفعيلها لحماية حسابك بشكل أفضل.
                  </AlertDescription>
                </Alert>
                <Button className="mt-4" variant="outline">
                  تفعيل المصادقة الثنائية
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تفضيلات الإشعارات</CardTitle>
                <CardDescription>
                  اختر كيف تريد أن تتلقى الإشعارات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات البريد الإلكتروني</Label>
                    <div className="text-sm text-muted-foreground">
                      تلقي إشعارات على بريدك الإلكتروني
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>رسائل SMS</Label>
                    <div className="text-sm text-muted-foreground">
                      تلقي رسائل نصية للتنبيهات المهمة
                    </div>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, sms: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الإشعارات الفورية</Label>
                    <div className="text-sm text-muted-foreground">
                      إشعارات داخل التطبيق
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>التقرير الأسبوعي</Label>
                    <div className="text-sm text-muted-foreground">
                      ملخص أسبوعي لنشاطاتك
                    </div>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, weeklyReport: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>التقرير الشهري</Label>
                    <div className="text-sm text-muted-foreground">
                      تقرير شامل شهري
                    </div>
                  </div>
                  <Switch
                    checked={notifications.monthlyReport}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, monthlyReport: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
