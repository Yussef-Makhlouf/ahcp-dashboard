# بيانات مدير النظام - AHCP

## 👤 **بيانات المدير الافتراضي:**

### **للتطوير:**
- **البريد الإلكتروني:** `admin@ahcp.gov.sa`
- **كلمة المرور:** `Admin@123456`
- **الاسم:** `مدير النظام`
- **الدور:** `super_admin`
- **القسم:** `إدارة النظام`

### **JWT Secret Key:**
```
JWT_SECRET=ahcp_super_secret_key_2024_development_only_change_in_production_123456789
```

### **MongoDB Connection:**
```
MONGODB_URI=mongodb://localhost:27017/ahcp_database
```

## 🔧 **إعدادات .env للخادم الخلفي:**

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/ahcp_database

# JWT Configuration
JWT_SECRET=ahcp_super_secret_key_2024_development_only_change_in_production_123456789
JWT_EXPIRES_IN=24h

# API Documentation
API_DOCS_ENABLED=true

# CORS Settings
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
```

## 🔧 **إعدادات .env للفرونت إند:**

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development
NODE_ENV=development
```

## ⚠️ **تحذيرات أمنية:**

1. **هذه البيانات للتطوير فقط**
2. **يجب تغيير كلمة المرور في الإنتاج**
3. **يجب تغيير JWT_SECRET في الإنتاج**
4. **استخدم HTTPS في الإنتاج**

---
**تاريخ الإنشاء:** 2025-01-05
**الحالة:** للتطوير فقط
