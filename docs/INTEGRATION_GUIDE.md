# دليل التكامل الشامل - نظام إدارة صحة الحيوان (AHCP)

## نظرة عامة على التكامل المكتمل

تم تطوير نظام متكامل بالكامل يربط بين الخادم الخلفي (Backend) ولوحة التحكم (Frontend) بشكل سلس ومتقدم.

## 🚀 الميزات المكتملة

### 1. **مكونات البيانات المتكاملة**

#### **ApiDataTable** - جدول البيانات الذكي
- ✅ **جلب البيانات التلقائي** من APIs مع React Query
- ✅ **البحث المتقدم** والتصفية الذكية
- ✅ **الترقيم التلقائي** مع تحكم في عدد العناصر
- ✅ **التحديد المتعدد** للعناصر
- ✅ **الحذف الجماعي** مع تأكيد
- ✅ **التصدير المباشر** للبيانات المحددة
- ✅ **إعادة التحميل التلقائي** عند التغييرات
- ✅ **معالجة الأخطاء** المتقدمة
- ✅ **حالات التحميل** المرئية

#### **ApiForm** - نماذج ديناميكية متكاملة
- ✅ **التحقق التلقائي** من البيانات مع Zod
- ✅ **دعم جميع أنواع الحقول** (نص، تاريخ، اختيار، ملفات)
- ✅ **رفع الملفات** المتعددة
- ✅ **التحديث والإنشاء** في نموذج واحد
- ✅ **رسائل الخطأ** الذكية
- ✅ **حفظ تلقائي** للمسودات
- ✅ **واجهة مستخدم متجاوبة** مع جميع الأجهزة

#### **ImportExportManager** - إدارة الاستيراد والتصدير
- ✅ **استيراد ملفات CSV/Excel** مع التحقق
- ✅ **تصدير متعدد الصيغ** (CSV, Excel, PDF)
- ✅ **قوالب جاهزة** للاستيراد
- ✅ **معاينة الأخطاء** قبل الحفظ
- ✅ **شريط التقدم** المرئي
- ✅ **إحصائيات الاستيراد** التفصيلية

### 2. **الصفحات المتكاملة بالكامل**

#### **صفحة العملاء/المربيين**
```typescript
// مثال على الاستخدام
<ApiDataTable
  fetchData={clientsApi.getList}
  deleteItem={clientsApi.delete}
  exportData={clientsApi.exportToCsv}
  columns={clientColumns}
  title="المربيين"
  queryKey="clients"
  onAdd={handleAdd}
  onEdit={handleEdit}
  enableExport={true}
  enableDelete={true}
  filters={clientFilters}
/>
```

#### **صفحة مكافحة الطفيليات**
- ✅ **إحصائيات مباشرة** من API
- ✅ **فلترة متقدمة** حسب الحالة الصحية والامتثال
- ✅ **نماذج ديناميكية** لإدخال البيانات
- ✅ **تصدير واستيراد** البيانات

#### **صفحة التحصينات**
- ✅ **تتبع أنواع اللقاحات** المختلفة
- ✅ **إحصائيات التحصين** المفصلة
- ✅ **إدارة الفرق** والمشرفين
- ✅ **تقارير الامتثال** التلقائية

### 3. **خدمات API الشاملة**

#### **خدمات العملاء** (`clientsApi`)
```typescript
// جلب جميع العملاء مع الفلترة
const clients = await clientsApi.getList({
  page: 1,
  limit: 20,
  search: "أحمد",
  village: "قرية النور"
});

// إنشاء عميل جديد
const newClient = await clientsApi.create(clientData);

// تحديث عميل
const updatedClient = await clientsApi.update(id, clientData);

// حذف عميل
await clientsApi.delete(id);

// الحصول على الإحصائيات
const stats = await clientsApi.getStatistics();
```

#### **خدمات مكافحة الطفيليات** (`parasiteControlApi`)
```typescript
// جلب السجلات مع الفلترة المتقدمة
const records = await parasiteControlApi.getList({
  page: 1,
  limit: 50,
  filter: { 
    herdHealthStatus: "Healthy",
    complying: "Comply" 
  }
});

// تصدير البيانات
const csvBlob = await parasiteControlApi.exportToCsv([1, 2, 3]);

// الحصول على الإحصائيات
const stats = await parasiteControlApi.getStatistics();
```

#### **خدمات التحصينات** (`vaccinationApi`)
```typescript
// البحث حسب نوع اللقاح
const vaccinations = await vaccinationApi.getList({
  filter: { vaccineCategory: "Preventive" }
});

// إنشاء سجل تحصين جديد
const vaccination = await vaccinationApi.create(vaccinationData);
```

### 4. **إدارة الحالة المتقدمة**

#### **React Query Integration**
```typescript
// استخدام React Query للبيانات
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['clients'],
  queryFn: () => clientsApi.getList(),
  staleTime: 5 * 60 * 1000, // 5 دقائق
});

// Mutations للتحديثات
const mutation = useMutation({
  mutationFn: clientsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries(['clients']);
    toast.success('تم الحفظ بنجاح');
  }
});
```

#### **إدارة المصادقة** (`authStore`)
```typescript
// تسجيل الدخول
await useAuthStore.getState().login({
  email: 'user@example.com',
  password: 'password'
});

// التحقق من المصادقة
const isAuthenticated = useAuthStore.getState().checkAuth();

// تسجيل الخروج
await useAuthStore.getState().logout();
```

## 🛠️ كيفية الاستخدام

### 1. **تشغيل النظام**

#### تشغيل الخادم الخلفي:
```bash
cd ahcp-backend
npm install
npm run dev
```

#### تشغيل لوحة التحكم:
```bash
cd ahcp-dashboard
npm install
npm run dev
```

### 2. **إضافة موديول جديد**

#### إنشاء خدمة API:
```typescript
// lib/api/new-module.ts
import { api } from './base-api';
import type { NewModule, PaginatedResponse } from '@/types';

export const newModuleApi = {
  getList: async (params?: any): Promise<PaginatedResponse<NewModule>> => {
    return await api.get('/new-module', { params });
  },
  
  create: async (data: Omit<NewModule, 'id'>): Promise<NewModule> => {
    return await api.post('/new-module', data);
  },
  
  update: async (id: string, data: Partial<NewModule>): Promise<NewModule> => {
    return await api.put(`/new-module/${id}`, data);
  },
  
  delete: async (id: string): Promise<void> => {
    return await api.delete(`/new-module/${id}`);
  }
};
```

#### إنشاء صفحة متكاملة:
```typescript
// app/new-module/page.tsx
export default function NewModulePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  return (
    <MainLayout>
      <ApiDataTable
        fetchData={newModuleApi.getList}
        deleteItem={newModuleApi.delete}
        columns={columns}
        title="الموديول الجديد"
        queryKey="new-module"
        onAdd={() => setIsFormOpen(true)}
        onEdit={setEditingRecord}
      />
      
      <ApiForm
        createItem={newModuleApi.create}
        updateItem={newModuleApi.update}
        fields={formFields}
        title="الموديول الجديد"
        queryKey="new-module"
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editData={editingRecord}
      />
    </MainLayout>
  );
}
```

### 3. **تخصيص المكونات**

#### تخصيص الأعمدة:
```typescript
const columns = [
  {
    key: "name",
    title: "الاسم",
    render: (value: string, record: any) => (
      <div className="font-medium">{value}</div>
    ),
  },
  {
    key: "status",
    title: "الحالة",
    render: (value: string) => (
      <Badge variant={value === "active" ? "default" : "secondary"}>
        {value === "active" ? "نشط" : "غير نشط"}
      </Badge>
    ),
  }
];
```

#### تخصيص النماذج:
```typescript
const formFields = [
  {
    name: "name",
    label: "الاسم",
    type: "text" as const,
    required: true,
    placeholder: "أدخل الاسم",
  },
  {
    name: "category",
    label: "الفئة",
    type: "select" as const,
    required: true,
    options: [
      { value: "type1", label: "النوع الأول" },
      { value: "type2", label: "النوع الثاني" },
    ],
  }
];
```

## 🔧 الإعدادات المتقدمة

### 1. **إعدادات API**
```typescript
// lib/config.ts
export const config = {
  api: {
    baseUrl: 'http://localhost:3001/api',
    timeout: 30000,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  }
};
```

### 2. **إعدادات React Query**
```typescript
// components/providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // دقيقة واحدة
      refetchOnWindowFocus: false,
    },
  },
});
```

## 📊 الإحصائيات والتقارير

### 1. **لوحة التحكم الرئيسية**
- ✅ **إحصائيات مباشرة** من جميع الموديولات
- ✅ **رسوم بيانية تفاعلية** مع Recharts
- ✅ **النشاط الأخير** في الوقت الفعلي
- ✅ **توزيع البيانات** المرئي

### 2. **التقارير المتقدمة**
```typescript
// استخدام خدمة التقارير
const report = await reportsApi.generateReport({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  reportType: 'comprehensive',
  format: 'pdf'
});

// الحصول على إحصائيات اللوحة
const dashboardStats = await reportsApi.getDashboardStats();
```

## 🔐 الأمان والمصادقة

### 1. **JWT Tokens**
- ✅ **تجديد تلقائي** للرموز المميزة
- ✅ **تسجيل خروج تلقائي** عند انتهاء الصلاحية
- ✅ **حماية الطرق** المحمية

### 2. **CORS Configuration**
```javascript
// backend server.js
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
};
```

## 🚨 معالجة الأخطاء

### 1. **معالجة أخطاء API**
```typescript
// تلقائياً في ApiDataTable و ApiForm
try {
  const result = await apiCall();
  toast.success('تم بنجاح');
} catch (error) {
  toast.error(error.message || 'حدث خطأ');
}
```

### 2. **معالجة أخطاء الشبكة**
```typescript
// في base-api.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 📱 التجاوب والأجهزة المحمولة

- ✅ **تصميم متجاوب بالكامل** مع Tailwind CSS
- ✅ **تحسين للأجهزة المحمولة** مع تبويبات ذكية
- ✅ **لمسات تفاعلية** محسنة للشاشات اللمسية
- ✅ **تحميل تدريجي** للبيانات الكبيرة

## 🎯 أفضل الممارسات

### 1. **استخدام React Query**
```typescript
// استخدم useQuery للقراءة
const { data, isLoading } = useQuery({
  queryKey: ['data', filters],
  queryFn: () => api.getData(filters)
});

// استخدم useMutation للكتابة
const mutation = useMutation({
  mutationFn: api.createData,
  onSuccess: () => queryClient.invalidateQueries(['data'])
});
```

### 2. **إدارة الحالة**
```typescript
// استخدم Zustand للحالة العامة
const useStore = create((set) => ({
  data: [],
  setData: (data) => set({ data }),
}));

// استخدم useState للحالة المحلية
const [isOpen, setIsOpen] = useState(false);
```

## 🔄 التحديثات المستقبلية

### المخطط له:
- [ ] **إشعارات فورية** مع WebSockets
- [ ] **تحليلات متقدمة** مع AI
- [ ] **تطبيق محمول** مع React Native
- [ ] **تكامل مع أنظمة خارجية**

---

## 📞 الدعم الفني

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- 📧 البريد الإلكتروني: support@ahcp.gov.sa
- 📱 الهاتف: +966-11-1234567
- 🌐 الموقع: https://ahcp.gov.sa

---

**تم تطوير النظام بواسطة فريق AHCP Development Team**
**جميع الحقوق محفوظة © 2024**
