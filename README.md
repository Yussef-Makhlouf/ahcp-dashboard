# AHCP Dashboard - مشروع صحة الحيوان

نظام إدارة متكامل لخدمات الصحة الحيوانية يشمل مكافحة الطفيليات، التحصينات، العيادات المتنقلة، والمختبرات.

## المميزات

- **واجهة عربية كاملة** مع دعم RTL
- **لوحة تحكم تفاعلية** مع إحصائيات ورسوم بيانية
- **إدارة شاملة** لجميع أقسام الصحة الحيوانية
- **جداول بيانات متقدمة** مع البحث والفلترة والترتيب
- **تصدير البيانات** إلى CSV و PDF
- **استيراد البيانات** من ملفات CSV
- **نماذج ديناميكية** مع التحقق من صحة البيانات
- **تصميم متجاوب** يعمل على جميع الأجهزة

### متغيرات البيئة (Environment Variables)

قم بإنشاء ملف `.env.local` في جذر المشروع وضع فيه المتغيرات التالية:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://ahcp-backend-production.up.railway.app/api

# Database Configuration (for future backend integration)
# DATABASE_URL=postgresql://username:password@localhost:5432/ahcp_db

# Authentication (for future backend integration)
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-secret-key

# Email Configuration (for notifications)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# File Upload (for images and documents)
# MAX_FILE_SIZE=5242880
# UPLOAD_DIR=./uploads

# Development Settings
NODE_ENV=development
```

## التثبيت

1. استنساخ المشروع:
```bash
git clone https://github.com/your-repo/ahcp-dashboard.git
cd ahcp-dashboard
```
2. تثبيت الحزم:
```bash
npm install
```
3. تشغيل بيئة التطوير:
```bash
npm run dev
```
4. فتح المتصفح على:
```
http://localhost:3000
```
## هيكل المشروع

```
ahcp-dashboard/
├── app/                      # صفحات التطبيق (App Router)
│   ├── page.tsx             # الصفحة الرئيسية (Dashboard)
│   ├── parasite-control/    # صفحة مكافحة الطفيليات
│   ├── vaccination/         # صفحة التحصينات
│   ├── mobile-clinics/      # صفحة العيادات المتنقلة
│   ├── equine-health/       # صفحة صحة الخيول
│   ├── laboratories/        # صفحة المختبرات
│   ├── clients/            # صفحة المربيين
│   ├── reports/            # صفحة التقارير
│   ├── profile/            # الملف الشخصي
│   └── settings/           # الإعدادات
├── components/              # المكونات القابلة لإعادة الاستخدام
│   ├── layout/             # مكونات Layout (Sidebar, Navbar)
│   ├── data-table/         # مكون الجدول العام
│   ├── ui/                 # مكونات Shadcn UI
│   └── providers.tsx       # موفرو السياق (Context Providers)
├── lib/                    # المكتبات والوظائف المساعدة
│   ├── api/               # خدمات API
│   ├── mock/              # بيانات تجريبية
│   ├── store/             # إدارة الحالة (Zustand)
│   └── utils.ts           # وظائف مساعدة
├── types/                  # تعريفات TypeScript
└── public/                 # الملفات الثابتة
