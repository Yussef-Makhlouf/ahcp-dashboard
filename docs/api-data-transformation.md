# API Data Transformation - Parasite Control

## المشكلة
API الحقيقي يعيد بيانات بتنسيق مختلف عن التنسيق المتوقع في التطبيق:

### تنسيق API الحقيقي:
```json
{
  "_id": "68df1f1a62c38412a01ea08d",
  "serial_no": "PC-2025-001",
  "owner_name": "أحمد محمد علي السعيد",
  "owner_id": "1234567890",
  "coordinate_e": 46.6753,
  "coordinate_n": 24.7136,
  "total_sheep": 150,
  "insecticide_status": "تم الرش بنجاح",
  "herd_health_status": "سليم",
  "complying_to_instructions": true,
  "request_situation": "Closed"
}
```

### تنسيق التطبيق المتوقع:
```json
{
  "serialNo": 1,
  "owner": {
    "name": "أحمد محمد علي السعيد",
    "id": "1234567890"
  },
  "location": {
    "e": 46.6753,
    "n": 24.7136
  },
  "herd": {
    "sheep": { "total": 150 }
  },
  "insecticide": {
    "status": "Sprayed"
  },
  "herdHealthStatus": "Healthy",
  "complying": "Comply",
  "request": {
    "situation": "Closed"
  }
}
```

## الحل المطبق

### 1. إضافة واجهة API Response
```typescript
export interface ParasiteControlAPIResponse {
  _id: string;
  serial_no: string;
  owner_name: string;
  owner_id: string;
  coordinate_e: number;
  coordinate_n: number;
  // ... جميع الحقول الأخرى
}
```

### 2. دالة التحويل من API إلى التطبيق
```typescript
function transformAPIResponse(apiData: ParasiteControlAPIResponse): ParasiteControl {
  return {
    serialNo: parseInt(apiData.serial_no.split('-').pop() || '0'),
    owner: {
      name: apiData.owner_name,
      id: apiData.owner_id,
    },
    location: {
      e: apiData.coordinate_e,
      n: apiData.coordinate_n,
    },
    // ... تحويل باقي الحقول
  };
}
```

### 3. دالة التحويل من التطبيق إلى API
```typescript
function transformToAPIFormat(appData: Partial<ParasiteControl>): any {
  return {
    serial_no: `PC-${new Date().getFullYear()}-${String(appData.serialNo || 0).padStart(3, '0')}`,
    owner_name: appData.owner?.name,
    owner_id: appData.owner?.id,
    coordinate_e: appData.location?.e,
    coordinate_n: appData.location?.n,
    // ... تحويل باقي الحقول
  };
}
```

### 4. تحديث دوال API
جميع دوال API تستخدم الآن التحويل:

#### GET List:
```typescript
getList: async (params) => {
  const response = await api.get<APIResponse>('/parasite-control/', { params });
  return {
    data: response.data.map(transformAPIResponse),
    total: response.total,
    page: response.page,
    totalPages: response.totalPages,
  };
}
```

#### GET By ID:
```typescript
getById: async (id: number) => {
  const response = await api.get<ParasiteControlAPIResponse>(`/parasite-control/${id}`);
  return transformAPIResponse(response);
}
```

#### CREATE:
```typescript
create: async (data) => {
  const apiData = transformToAPIFormat(data);
  const response = await api.post<ParasiteControlAPIResponse>('/parasite-control/', apiData);
  return transformAPIResponse(response);
}
```

#### UPDATE (PUT):
```typescript
update: async (id: number, data) => {
  const apiData = transformToAPIFormat(data);
  const response = await api.put<ParasiteControlAPIResponse>(`/parasite-control/${id}`, apiData);
  return transformAPIResponse(response);
}
```

## التحويلات المحددة

### 1. الحقول النصية
- `owner_name` → `owner.name`
- `owner_id` → `owner.id`
- `herd_location` → `herdLocation`
- `vehicle_no` → `vehicleNo`

### 2. الحقول الرقمية
- `coordinate_e` → `location.e`
- `coordinate_n` → `location.n`
- `total_sheep` → `herd.sheep.total`
- `animal_barn_size_sqm` → `animalBarnSizeSqM`

### 3. الحقول المنطقية
- `complying_to_instructions: true` → `complying: "Comply"`
- `complying_to_instructions: false` → `complying: "Not Comply"`

### 4. الحقول المترجمة
- `herd_health_status: "سليم"` → `herdHealthStatus: "Healthy"`
- `herd_health_status: "مريض"` → `herdHealthStatus: "Sick"`
- `insecticide_status: "تم الرش بنجاح"` → `insecticide.status: "Sprayed"`
- `request_situation: "Closed"` → `request.situation: "Closed"`

## النتيجة النهائية

النظام الآن:
- ✅ يتعامل مع تنسيق API الحقيقي
- ✅ يحول البيانات تلقائياً بين التنسيقين
- ✅ يحافظ على توافق مع واجهة التطبيق الموجودة
- ✅ يدعم جميع عمليات CRUD
- ✅ يعمل مع البيانات الحقيقية من API

## الملفات المحدثة

1. **`types/index.ts`** - إضافة `ParasiteControlAPIResponse`
2. **`lib/api/parasite-control.ts`** - إضافة دوال التحويل وتحديث جميع دوال API

## الاختبار

يمكن اختبار النظام الآن مع البيانات الحقيقية من API:
- جلب البيانات في الجدول
- تحميل البيانات في النماذج
- إنشاء سجلات جديدة
- تحديث السجلات
- حذف السجلات
