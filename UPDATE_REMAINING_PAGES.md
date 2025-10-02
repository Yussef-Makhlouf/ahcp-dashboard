# تحديث الصفحات المتبقية للترجمة

## الصفحات التي تم تحديثها:
✅ Dashboard (app/page.tsx)
✅ Settings (app/settings/page.tsx) 
✅ Login (app/login/page.tsx)
✅ Profile (app/profile/page.tsx)
✅ Reports (app/reports/page.tsx)
✅ Sidebar (components/layout/sidebar.tsx)
✅ Navbar (components/layout/navbar.tsx)

## الصفحات التي تحتاج تحديث:
- [ ] Clients (app/clients/page.tsx)
- [ ] Vaccination (app/vaccination/page.tsx)
- [ ] Parasite Control (app/parasite-control/page.tsx)
- [ ] Equine Health (app/equine-health/page.tsx)
- [ ] Mobile Clinics (app/mobile-clinics/page.tsx)
- [ ] Laboratories (app/laboratories/page.tsx)
- [ ] Scheduling (app/scheduling/page.tsx)
- [ ] Inventory (app/inventory/page.tsx)

## التحديثات المطلوبة لكل صفحة:

### 1. إضافة import للترجمة:
```tsx
import { useTranslation } from "@/lib/use-translation";
```

### 2. إضافة hook في المكون:
```tsx
const { t } = useTranslation();
```

### 3. تحديث العناوين والأوصاف:
```tsx
// بدلاً من:
<h1 className="text-3xl font-bold">العنوان</h1>
<p className="text-muted-foreground mt-2">الوصف</p>

// استخدم:
<h1 className="text-3xl font-bold">{t('pageName.title')}</h1>
<p className="text-muted-foreground mt-2">{t('pageName.subtitle')}</p>
```

### 4. تحديث الأزرار والنصوص:
```tsx
// بدلاً من:
<Button>إضافة</Button>

// استخدم:
<Button>{t('common.add')}</Button>
```

### 5. تحديث الجداول:
```tsx
// بدلاً من:
header: "الاسم"

// استخدم:
header: t('tables.name')
```

## الترجمات المضافة في ملفات JSON:

### English (messages/en.json):
- sections: عناوين الأقسام
- descriptions: أوصاف الأقسام
- جميع النصوص العامة

### Arabic (messages/ar.json):
- sections: عناوين الأقسام بالعربية
- descriptions: أوصاف الأقسام بالعربية
- جميع النصوص العامة بالعربية

## ملاحظات مهمة:
1. لا تترجم البيانات الفعلية في الجداول (مثل أسماء العملاء، التواريخ، إلخ)
2. ترجم فقط النصوص الثابتة والعناوين والأوصاف
3. استخدم نفس مفاتيح الترجمة في جميع الصفحات
4. تأكد من أن الترجمة تعمل في كلا الاتجاهين (RTL/LTR)
