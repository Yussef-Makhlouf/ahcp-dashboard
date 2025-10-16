# دليل إعداد النظام للإنتاج

## متطلبات النظام

### 1. الخادم الخلفي (Backend)
```bash
cd ahcp-backend
npm install
```

### 2. الواجهة الأمامية (Frontend)
```bash
cd ahcp-dashboard
npm install
```

## إعداد قاعدة البيانات

### 1. تثبيت MongoDB
- تأكد من تثبيت MongoDB على الخادم
- تشغيل MongoDB service

### 2. إنشاء قاعدة البيانات
```bash
cd ahcp-backend
node src/scripts/seed.js
```

## إعداد متغيرات البيئة

### 1. الخادم الخلفي
انسخ `production.env` إلى `.env`:
```bash
cp production.env .env
```

### 2. الواجهة الأمامية
انسخ `production.env` إلى `.env.local`:
```bash
cp production.env .env.local
```

## تشغيل النظام

### 1. تشغيل الخادم الخلفي
```bash
cd ahcp-backend
npm start
```

### 2. تشغيل الواجهة الأمامية
```bash
cd ahcp-dashboard
npm run build
npm start
```

## بيانات تسجيل الدخول

### المستخدمين المتاحين:
- **مدير النظام**: `admin@ahcp.gov.sa` / `Admin@123456`
- **مشرف مكافحة الطفيليات**: `parasite@ahcp.gov.sa` / `parasite123`
- **مشرف التحصينات**: `vaccination@ahcp.gov.sa` / `vaccination123`
- **مشرف العيادة المتنقلة**: `clinic@ahcp.gov.sa` / `clinic123`
- **مشرف المختبرات**: `laboratory@ahcp.gov.sa` / `lab123`
- **مشرف صحة الخيول**: `equine@ahcp.gov.sa` / `equine123`
- **عامل ميداني**: `field@ahcp.gov.sa` / `field123`

## أمان النظام

### 1. تغيير كلمات المرور الافتراضية
```bash
# تسجيل الدخول كمدير النظام
# الذهاب إلى إعدادات المستخدمين
# تغيير كلمات المرور لجميع المستخدمين
```

### 2. تغيير JWT Secret
```bash
# في ملف .env
JWT_SECRET=your_very_secure_secret_key_here
```

### 3. إعداد HTTPS
- تأكد من استخدام HTTPS في الإنتاج
- تحديث CORS_ORIGIN في ملف .env

## مراقبة النظام

### 1. سجلات الخادم
```bash
# مراقبة سجلات الخادم الخلفي
tail -f logs/app.log
```

### 2. مراقبة قاعدة البيانات
```bash
# مراقبة اتصالات MongoDB
mongostat
```

## النسخ الاحتياطي

### 1. نسخ احتياطي لقاعدة البيانات
```bash
mongodump --db ahcp_database --out backup/
```

### 2. استعادة النسخ الاحتياطي
```bash
mongorestore --db ahcp_database backup/ahcp_database/
```

## استكشاف الأخطاء

### 1. مشاكل الاتصال
- تأكد من تشغيل MongoDB
- تأكد من تشغيل الخادم الخلفي على المنفذ 3001
- تحقق من إعدادات CORS

### 2. مشاكل المصادقة
- تحقق من JWT_SECRET
- تأكد من صحة بيانات المستخدمين في قاعدة البيانات

### 3. مشاكل الواجهة الأمامية
- تحقق من NEXT_PUBLIC_API_URL
- تأكد من بناء المشروع بشكل صحيح
