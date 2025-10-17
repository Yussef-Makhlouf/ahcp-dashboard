# إعداد متغيرات البيئة للواجهة الأمامية

## إنشاء ملف .env.local

أنشئ ملف `.env.local` في مجلد `ahcp-dashboard` مع المحتوى التالي:

```env
# Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=https://ahcp-backend-production.up.railway.app/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development Settings
NEXT_PUBLIC_DEV_MODE=true
```

## ملاحظات مهمة

1. **ملف .env.local** غير مدرج في Git للأمان
2. **NODE_ENV** يتم ضبطه تلقائياً بواسطة Next.js
3. **NEXT_PUBLIC_** مطلوب للمتغيرات المكشوفة للمتصفح

## التحقق من الإعدادات

بعد إنشاء الملف، أعد تشغيل الخادم:

```bash
npm run dev
```
