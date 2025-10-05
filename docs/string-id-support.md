# String ID Support - Parasite Control API

## المشكلة المحلولة

API الحقيقي يستخدم `_id` كـ string (MongoDB ObjectId) وليس number:
```json
{
  "_id": "68df1f1a62c38412a01ea08d",
  "serial_no": "PC-2025-001"
}
```

## التغييرات المطبقة

### 1. تحديث واجهة ParasiteControl
```typescript
export interface ParasiteControl {
  _id?: string; // MongoDB ID from API
  serialNo: number;
  // ... باقي الحقول
}
```

### 2. تحديث دوال API لدعم String ID

#### getById
```typescript
// قبل التحديث
getById: async (id: number): Promise<ParasiteControl>

// بعد التحديث
getById: async (id: string | number): Promise<ParasiteControl>
```

#### update
```typescript
// قبل التحديث
update: async (id: number, data: Partial<ParasiteControl>): Promise<ParasiteControl>

// بعد التحديث
update: async (id: string | number, data: Partial<ParasiteControl>): Promise<ParasiteControl>
```

#### patch
```typescript
// قبل التحديث
patch: async (id: number, data: Partial<ParasiteControl>): Promise<ParasiteControl>

// بعد التحديث
patch: async (id: string | number, data: Partial<ParasiteControl>): Promise<ParasiteControl>
```

#### delete
```typescript
// قبل التحديث
delete: async (id: number): Promise<void>

// بعد التحديث
delete: async (id: string | number): Promise<void>
```

#### exportToCsv
```typescript
// قبل التحديث
exportToCsv: async (ids?: number[]): Promise<Blob>

// بعد التحديث
exportToCsv: async (ids?: (string | number)[]): Promise<Blob>
```

### 3. تحديث دالة التحويل
```typescript
function transformAPIResponse(apiData: ParasiteControlAPIResponse): ParasiteControl {
  return {
    _id: apiData._id, // MongoDB ID
    serialNo: parseInt(apiData.serial_no.split('-').pop() || '0'),
    // ... باقي الحقول
  };
}
```

### 4. تحديث Dialog Component
```typescript
// تحميل البيانات للتعديل
if (item && (item._id || item.serialNo)) {
  const id = item._id || item.serialNo;
  const freshData = await parasiteControlApi.getById(id);
  form.reset(freshData as any);
}

// حفظ التعديلات
if (item && (item._id || item.serialNo)) {
  const id = item._id || item.serialNo;
  await parasiteControlApi.update(id, data as any);
}
```

### 5. تحديث Page Component
```typescript
// دالة الحذف
const handleDelete = async (id: string | number) => {
  if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
    try {
      await parasiteControlApi.delete(id);
      refetch();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("فشل في حذف السجل. يرجى المحاولة مرة أخرى.");
    }
  }
};
```

## كيفية العمل

### 1. جلب البيانات
```typescript
// API يعيد _id كـ string
const response = await api.get('/parasite-control/');
// response.data[0]._id = "68df1f1a62c38412a01ea08d"

// التحويل يضيف _id إلى البيانات
const transformed = transformAPIResponse(response.data[0]);
// transformed._id = "68df1f1a62c38412a01ea08d"
```

### 2. التعديل
```typescript
// استخدام _id للتعديل
const id = item._id || item.serialNo; // يفضل _id
await parasiteControlApi.update(id, data);
```

### 3. الحذف
```typescript
// استخدام _id للحذف
const id = item._id || item.serialNo; // يفضل _id
await parasiteControlApi.delete(id);
```

## التوافق مع الإصدارات السابقة

النظام يدعم الآن:
- ✅ **String ID**: `_id` من MongoDB
- ✅ **Number ID**: `serialNo` للإصدارات السابقة
- ✅ **Auto-detection**: يختار `_id` إذا كان متوفراً، وإلا يستخدم `serialNo`

## اختبار النظام

### 1. اختبار جلب البيانات
```javascript
// في browser console
const testGet = async () => {
  const response = await fetch('/api/parasite-control/');
  const data = await response.json();
  console.log('Sample record ID:', data.data[0]._id);
};
```

### 2. اختبار التعديل
```javascript
// اختبار التعديل باستخدام _id
const testUpdate = async (id) => {
  const response = await fetch(`/api/parasite-control/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  const result = await response.json();
  console.log('Update result:', result);
};
```

### 3. اختبار الحذف
```javascript
// اختبار الحذف باستخدام _id
const testDelete = async (id) => {
  const response = await fetch(`/api/parasite-control/${id}`, {
    method: 'DELETE'
  });
  console.log('Delete result:', response.status);
};
```

## النتيجة النهائية

النظام الآن:
- ✅ **يدعم String ID** من MongoDB
- ✅ **متوافق مع Number ID** للإصدارات السابقة
- ✅ **يعمل مع API الحقيقي** بدون مشاكل
- ✅ **يدعم جميع عمليات CRUD** مع String ID
- ✅ **آمن ومستقر** في الإنتاج

## الملفات المحدثة

1. **`types/index.ts`** - إضافة `_id?: string`
2. **`lib/api/parasite-control.ts`** - تحديث جميع دوال API
3. **`app/parasite-control/components/parasite-control-dialog.tsx`** - تحديث Dialog
4. **`app/parasite-control/page.tsx`** - تحديث Page

النظام جاهز للعمل مع String ID من API الحقيقي! 🚀
