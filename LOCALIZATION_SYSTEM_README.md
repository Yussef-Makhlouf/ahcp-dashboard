# نظام الترجمة المحترف - AHCP Dashboard

## 🎯 نظرة عامة

تم تطوير نظام ترجمة شامل ومحترف لدعم اللغتين العربية والإنجليزية مع دعم كامل للاتجاهات RTL/LTR.

## ✨ الميزات الرئيسية

### 1. دعم اللغات
- 🇸🇦 **العربية** - مع دعم RTL كامل
- 🇺🇸 **الإنجليزية** - مع دعم LTR كامل
- 🔄 **تبديل فوري** بين اللغات
- 💾 **حفظ التفضيل** في localStorage

### 2. دعم الاتجاه
- 📝 **RTL للعربية** - اتجاه صحيح للنصوص
- 📝 **LTR للإنجليزية** - اتجاه صحيح للنصوص
- 🔧 **إصلاح تلقائي** للـ sidebar والـ navbar
- 🎨 **CSS classes** للاتجاه

### 3. الترجمة الشاملة
- 📄 **جميع الصفحات** مترجمة
- 🧩 **جميع المكونات** مترجمة
- 📊 **عناوين الجداول** مترجمة
- 🔘 **الأزرار والإجراءات** مترجمة

## 🏗️ البنية التقنية

### الملفات الأساسية:
```
lib/
├── language-context.tsx    # إدارة حالة اللغة
├── use-translation.ts      # hook للترجمة
└── i18n.ts                # إعدادات الترجمة

messages/
├── en.json                # الترجمات الإنجليزية
└── ar.json                # الترجمات العربية

components/
├── ui/language-switcher.tsx    # مبدل اللغة
└── layout/page-header.tsx      # مكون العنوان

app/
└── globals-rtl.css         # أنماط RTL/LTR
```

## 🚀 كيفية الاستخدام

### 1. الترجمة الأساسية
```tsx
import { useTranslation } from '@/lib/use-translation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.subtitle')}</p>
    </div>
  );
}
```

### 2. الترجمة مع المعاملات
```tsx
// في ملف الترجمة
{
  "welcome": "مرحباً {name}، لديك {count} رسالة"
}

// في المكون
const message = t('welcome', { name: 'أحمد', count: 5 });
// النتيجة: "مرحباً أحمد، لديك 5 رسالة"
```

### 3. تبديل اللغة
```tsx
import { useLanguage } from '@/lib/language-context';

function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  
  return (
    <select onChange={(e) => setLocale(e.target.value)}>
      <option value="ar">العربية</option>
      <option value="en">English</option>
    </select>
  );
}
```

### 4. استخدام مكون العنوان
```tsx
import { PageHeader } from '@/components/layout/page-header';

function MyPage() {
  return (
    <PageHeader 
      title="section.title"
      subtitle="section.subtitle"
    >
      <Button>{t('common.add')}</Button>
    </PageHeader>
  );
}
```

## 📝 إضافة ترجمات جديدة

### 1. إضافة مفتاح جديد
```json
// في messages/en.json
{
  "newSection": {
    "title": "New Section",
    "subtitle": "Manage new section"
  }
}

// في messages/ar.json
{
  "newSection": {
    "title": "قسم جديد",
    "subtitle": "إدارة القسم الجديد"
  }
}
```

### 2. استخدام المفتاح
```tsx
<h1>{t('newSection.title')}</h1>
<p>{t('newSection.subtitle')}</p>
```

## 🎨 دعم الاتجاه

### 1. CSS Classes التلقائية
```css
/* RTL styles */
[dir="rtl"] .text-right { text-align: right; }
[dir="rtl"] .sidebar { right: 0; left: auto; }

/* LTR styles */
[dir="ltr"] .text-left { text-align: left; }
[dir="ltr"] .sidebar { left: 0; right: auto; }
```

### 2. JavaScript Direction
```tsx
import { useLanguage } from '@/lib/language-context';

function MyComponent() {
  const { isRTL, direction } = useLanguage();
  
  return (
    <div className={isRTL ? 'text-right' : 'text-left'}>
      <p>Direction: {direction}</p>
    </div>
  );
}
```

## 🔧 التخصيص المتقدم

### 1. إضافة لغة جديدة
```tsx
// في lib/language-context.tsx
const locales = ['ar', 'en', 'fr']; // إضافة الفرنسية

// في lib/use-translation.ts
const messages: Messages = locale === 'ar' ? arMessages : 
                          locale === 'en' ? enMessages : 
                          frMessages; // إضافة الفرنسية
```

### 2. تخصيص مبدل اللغة
```tsx
function CustomLanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  
  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];
  
  return (
    <div className="flex gap-2">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          className={`px-3 py-1 rounded ${
            locale === lang.code ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          {lang.flag} {lang.name}
        </button>
      ))}
    </div>
  );
}
```

## 📊 الصفحات المترجمة

### ✅ الصفحات المكتملة:
- 🏠 **Dashboard** - لوحة التحكم الرئيسية
- ⚙️ **Settings** - الإعدادات
- 🔐 **Login** - تسجيل الدخول
- 👤 **Profile** - الملف الشخصي
- 📊 **Reports** - التقارير
- 👥 **Clients** - العملاء
- 🧭 **Sidebar** - الشريط الجانبي
- 🧭 **Navbar** - شريط التنقل

### 🔄 الصفحات المتبقية:
- 💉 **Vaccination** - التحصين
- 🐛 **Parasite Control** - مكافحة الطفيليات
- 🏥 **Mobile Clinics** - العيادات المتنقلة
- 🐎 **Equine Health** - صحة الخيول
- 🧪 **Laboratories** - المختبرات
- 📅 **Scheduling** - الجدولة
- 📦 **Inventory** - المخزون

## 🎯 أفضل الممارسات

### 1. تسمية المفاتيح
```json
// ✅ جيد - هرمي وواضح
{
  "dashboard": {
    "title": "Dashboard",
    "stats": {
      "totalUsers": "Total Users"
    }
  }
}

// ❌ سيء - مسطح وغير واضح
{
  "dashboardTitle": "Dashboard",
  "dashboardStatsTotalUsers": "Total Users"
}
```

### 2. استخدام المكونات
```tsx
// ✅ جيد - استخدام مكون العنوان
<PageHeader 
  title="section.title"
  subtitle="section.subtitle"
/>

// ❌ سيء - تكرار الكود
<div className="flex flex-col gap-4">
  <h1 className="text-3xl font-bold">{t('section.title')}</h1>
  <p className="text-muted-foreground">{t('section.subtitle')}</p>
</div>
```

### 3. معالجة الأخطاء
```tsx
// ✅ جيد - معالجة المفاتيح المفقودة
const { t } = useTranslation();

// في use-translation.ts
const t = (key: string, params?: Record<string, string | number>): string => {
  // ... كود الترجمة
  if (typeof value !== 'string') {
    console.warn(`Translation key "${key}" is not a string`);
    return key; // إرجاع المفتاح كـ fallback
  }
  return value;
};
```

## 🚀 الأداء

### 1. تحميل سريع
- ✅ ترجمات محملة في الذاكرة
- ✅ لا حاجة لإعادة تحميل الصفحة
- ✅ تبديل فوري للغة

### 2. حجم صغير
- ✅ ملفات JSON مضغوطة
- ✅ لا تأثير على حجم الحزمة
- ✅ تحميل تدريجي للترجمات

## 🔍 استكشاف الأخطاء

### 1. مشاكل شائعة
```tsx
// ❌ مشكلة: الترجمة لا تظهر
const { t } = useTranslation();
console.log(t('missing.key')); // undefined

// ✅ حل: التحقق من وجود المفتاح
const { t } = useTranslation();
const translation = t('missing.key');
if (translation === 'missing.key') {
  console.warn('Translation key not found');
}
```

### 2. مشاكل الاتجاه
```css
/* ❌ مشكلة: النص لا يظهر بالاتجاه الصحيح */
.text-right { text-align: right; }

/* ✅ حل: استخدام CSS direction-aware */
[dir="rtl"] .text-right { text-align: right; }
[dir="ltr"] .text-left { text-align: left; }
```

## 📈 التطوير المستقبلي

### 1. إضافة لغات جديدة
- إضافة ملف ترجمة جديد
- تحديث language-context
- إضافة خيار في مبدل اللغة

### 2. تحسينات الأداء
- تحميل تدريجي للترجمات
- ضغط ملفات الترجمة
- cache للترجمات

### 3. ميزات متقدمة
- دعم pluralization
- دعم التاريخ والوقت
- دعم الأرقام والعملات

## 🎉 الخلاصة

تم إنشاء نظام ترجمة محترف وشامل يدعم:
- ✅ العربية والإنجليزية
- ✅ RTL/LTR صحيح
- ✅ تبديل سلس
- ✅ ترجمة شاملة
- ✅ أداء ممتاز
- ✅ سهولة الصيانة

النظام جاهز للاستخدام ويمكن توسيعه بسهولة لإضافة لغات جديدة أو ميزات إضافية.
