"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, StatsCard } from "@/components/ui/card-modern"
import { Button, LoadingButton, IconButton, ButtonGroup } from "@/components/ui/button-modern"
import { FormField, FormLabel, Input, FormError, FormHelp } from "@/components/ui/form-modern"
import { StatusBadge, Badge, PriorityBadge, CountBadge } from "@/components/ui/badge-modern"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  Edit, 
  Trash2, 
  Plus,
  Heart,
  Star,
  Settings,
  Bell,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  MapPin,
  Activity
} from "lucide-react"

export function ModernUIShowcase() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setLoading(false)
  }

  return (
    <div className="p-8 space-y-12 bg-light min-h-screen">
      {/* Header */}
      <div className="section-modern">
        <div className="section-header-modern">
          <h1 className="section-title-modern">Modern UI Components Showcase</h1>
          <p className="section-description-modern">
            عرض شامل للمكونات الحديثة في نظام AHCP Dashboard
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="section-modern">
        <div className="section-header-modern">
          <h2 className="section-title-modern">بطاقات الإحصائيات</h2>
          <p className="section-description-modern">بطاقات إحصائيات حديثة مع تأثيرات بصرية</p>
        </div>
        
        <div className="grid-modern grid-cols-4-modern">
          <StatsCard
            title="إجمالي المستخدمين"
            value="1,234"
            change="+12%"
            trend="up"
            icon={<User className="h-5 w-5" />}
            description="مقارنة بالشهر الماضي"
          />
          <StatsCard
            title="المشاريع النشطة"
            value="56"
            change="+8%"
            trend="up"
            icon={<Activity className="h-5 w-5" />}
            description="مقارنة بالشهر الماضي"
          />
          <StatsCard
            title="المبيعات"
            value="$12,345"
            change="-3%"
            trend="down"
            icon={<Heart className="h-5 w-5" />}
            description="مقارنة بالشهر الماضي"
          />
          <StatsCard
            title="التقييمات"
            value="4.8"
            change="+0.2"
            trend="up"
            icon={<Star className="h-5 w-5" />}
            description="من أصل 5 نجوم"
          />
        </div>
      </div>

      {/* Modern Cards Section */}
      <div className="section-modern">
        <div className="section-header-modern">
          <h2 className="section-title-modern">البطاقات الحديثة</h2>
          <p className="section-description-modern">بطاقات مع تصميم حديث وتأثيرات تفاعلية</p>
        </div>
        
        <div className="grid-modern grid-cols-3-modern">
          <Card variant="modern" hover>
            <CardHeader variant="modern" accent>
              <CardTitle variant="modern" icon={<Settings className="h-5 w-5" />}>
                إعدادات النظام
              </CardTitle>
            </CardHeader>
            <CardContent variant="modern">
              <p className="text-secondary mb-4">
                إدارة إعدادات النظام والتحكم في الصلاحيات
              </p>
              <div className="flex gap-2">
                <StatusBadge status="active" />
                <PriorityBadge priority="high" />
              </div>
            </CardContent>
          </Card>

          <Card variant="modern" hover>
            <CardHeader variant="modern" accent>
              <CardTitle variant="modern" icon={<Bell className="h-5 w-5" />}>
                الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent variant="modern">
              <p className="text-secondary mb-4">
                إدارة الإشعارات والتنبيهات
              </p>
              <div className="flex gap-2">
                <CountBadge count={12} />
                <Badge variant="info" icon={<Bell className="h-3 w-3" />}>
                  جديد
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="modern" hover>
            <CardHeader variant="modern" accent>
              <CardTitle variant="modern" icon={<MapPin className="h-5 w-5" />}>
                المواقع
              </CardTitle>
            </CardHeader>
            <CardContent variant="modern">
              <p className="text-secondary mb-4">
                إدارة المواقع الجغرافية
              </p>
              <div className="flex gap-2">
                <StatusBadge status="pending" />
                <PriorityBadge priority="medium" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modern Buttons Section */}
      <div className="section-modern">
        <div className="section-header-modern">
          <h2 className="section-title-modern">الأزرار الحديثة</h2>
          <p className="section-description-modern">أزرار مع تأثيرات حديثة وحالات مختلفة</p>
        </div>
        
        <div className="space-y-6">
          {/* Primary Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-4">الأزرار الأساسية</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="default" leftIcon={<Save className="h-4 w-4" />}>
                حفظ
              </Button>
              <Button variant="secondary" leftIcon={<Edit className="h-4 w-4" />}>
                تعديل
              </Button>
              <Button variant="success" leftIcon={<Plus className="h-4 w-4" />}>
                إضافة
              </Button>
              <Button variant="warning" leftIcon={<Download className="h-4 w-4" />}>
                تحميل
              </Button>
              <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />}>
                حذف
              </Button>
            </div>
          </div>

          {/* Loading Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-4">أزرار التحميل</h3>
            <div className="flex flex-wrap gap-4">
              <LoadingButton 
                loading={loading} 
                loadingText="جاري الحفظ..."
                leftIcon={<Save className="h-4 w-4" />}
                onClick={() => {
                  setLoading(true)
                  setTimeout(() => setLoading(false), 3000)
                }}
              >
                حفظ البيانات
              </LoadingButton>
              <LoadingButton 
                variant="secondary"
                loading={false}
                leftIcon={<Upload className="h-4 w-4" />}
              >
                رفع ملف
              </LoadingButton>
            </div>
          </div>

          {/* Icon Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-4">أزرار الأيقونات</h3>
            <div className="flex flex-wrap gap-4">
              <IconButton icon={<Search className="h-4 w-4" />} label="بحث" />
              <IconButton icon={<Filter className="h-4 w-4" />} label="تصفية" variant="secondary" />
              <IconButton icon={<Settings className="h-4 w-4" />} label="إعدادات" variant="outline" />
              <IconButton icon={<Bell className="h-4 w-4" />} label="إشعارات" variant="ghost" />
            </div>
          </div>

          {/* Button Groups */}
          <div>
            <h3 className="text-lg font-semibold mb-4">مجموعات الأزرار</h3>
            <ButtonGroup>
              <Button variant="outline">الكل</Button>
              <Button variant="outline">نشط</Button>
              <Button variant="outline">معطل</Button>
            </ButtonGroup>
          </div>
        </div>
      </div>

      {/* Modern Forms Section */}
      <div className="section-modern">
        <div className="section-header-modern">
          <h2 className="section-title-modern">النماذج الحديثة</h2>
          <p className="section-description-modern">نماذج مع تصميم حديث وتحقق من الأخطاء</p>
        </div>
        
        <Card variant="modern">
          <CardHeader variant="modern">
            <CardTitle variant="modern" icon={<User className="h-5 w-5" />}>
              نموذج المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent variant="modern">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid-modern grid-cols-2-modern">
                <FormField>
                  <FormLabel htmlFor="name" required>الاسم الكامل</FormLabel>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل الاسم الكامل"
                    variant="enhanced"
                    error={!!errors.name}
                  />
                  {errors.name && <FormError>{errors.name}</FormError>}
                  <FormHelp>يجب أن يكون الاسم مكون من حرفين على الأقل</FormHelp>
                </FormField>

                <FormField>
                  <FormLabel htmlFor="email" required>البريد الإلكتروني</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@domain.com"
                    variant="enhanced"
                    error={!!errors.email}
                  />
                  {errors.email && <FormError>{errors.email}</FormError>}
                </FormField>
              </div>

              <FormField>
                <FormLabel htmlFor="phone">رقم الهاتف</FormLabel>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966 50 123 4567"
                  variant="enhanced"
                />
                <FormHelp>اختياري - يمكن إضافته لاحقاً</FormHelp>
              </FormField>

              <div className="flex gap-4 pt-4">
                <LoadingButton 
                  type="submit"
                  loading={loading}
                  loadingText="جاري الحفظ..."
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  حفظ البيانات
                </LoadingButton>
                <Button type="button" variant="secondary">
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <div className="section-modern">
        <div className="section-header-modern">
          <h2 className="section-title-modern">الشارات والمؤشرات</h2>
          <p className="section-description-modern">شارات حديثة لعرض الحالات والأولويات</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">شارات الحالة</h3>
            <div className="flex flex-wrap gap-4">
              <StatusBadge status="active" />
              <StatusBadge status="inactive" />
              <StatusBadge status="pending" />
              <StatusBadge status="completed" />
              <StatusBadge status="cancelled" />
              <StatusBadge status="draft" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">شارات الأولوية</h3>
            <div className="flex flex-wrap gap-4">
              <PriorityBadge priority="low" />
              <PriorityBadge priority="medium" />
              <PriorityBadge priority="high" />
              <PriorityBadge priority="urgent" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">شارات العد</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CountBadge count={5} />
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CountBadge count={99} />
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <CountBadge count={150} max={99} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">شارات مخصصة</h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant="success" icon={<Heart className="h-3 w-3" />}>
                مفضل
              </Badge>
              <Badge variant="info" icon={<Star className="h-3 w-3" />}>
                مميز
              </Badge>
              <Badge variant="warning" removable onRemove={() => console.log('removed')}>
                قابل للإزالة
              </Badge>
              <Badge variant="outline" dot={false}>
                بدون نقطة
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Example */}
      <div className="section-modern">
        <div className="section-header-modern">
          <h2 className="section-title-modern">النوافذ المنبثقة</h2>
          <p className="section-description-modern">نوافذ حديثة مع تصميم محسن</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              فتح النافذة المنبثقة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>نافذة حديثة</DialogTitle>
              <DialogDescription>
                مثال على النافذة المنبثقة الحديثة مع التصميم المحسن
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-4">
                <p className="text-secondary">
                  هذا مثال على المحتوى داخل النافذة المنبثقة الحديثة.
                </p>
                <div className="flex gap-2">
                  <StatusBadge status="active" />
                  <Badge variant="info">معلومات</Badge>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary">إلغاء</Button>
              <Button leftIcon={<Save className="h-4 w-4" />}>حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
