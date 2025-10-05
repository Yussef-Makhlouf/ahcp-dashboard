# Form Data Loading Debug - Parasite Control

## المشكلة المحددة

المستخدم يريد أن يتم تحميل البيانات في جميع حقول الإدخال عند فتح النموذج في وضع التعديل.

## التشخيص المطبق

### 1. إضافة Console Logs للتشخيص

#### في Dialog Component:
```typescript
useEffect(() => {
  const loadItemData = async () => {
    if (item && (item._id || item.serialNo)) {
      try {
        const id = item._id || item.serialNo;
        console.log("Loading data for ID:", id);
        const freshData = await parasiteControlApi.getById(id);
        console.log("Fresh data loaded:", freshData);
        console.log("Owner name:", freshData.owner?.name);
        console.log("Owner ID:", freshData.owner?.id);
        console.log("Date:", freshData.date);
        console.log("Supervisor:", freshData.supervisor);
        form.reset(freshData as any);
        console.log("Form reset with fresh data");
        console.log("Form values after reset:", form.getValues());
      } catch (error) {
        console.error("Error loading item data:", error);
        console.log("Using fallback data:", item);
        form.reset(item as any);
      }
    } else if (item) {
      console.log("Using item data directly:", item);
      form.reset(item as any);
    }
  };

  loadItemData();
}, [item, form]);
```

#### في API getById:
```typescript
getById: async (id: string | number): Promise<ParasiteControl> => {
  console.log("API getById called with ID:", id);
  const response = await api.get<ParasiteControlAPIResponse>(`/parasite-control/${id}`, {
    timeout: 30000,
  });
  console.log("API response received:", response);
  const transformed = transformAPIResponse(response);
  console.log("Transformed data:", transformed);
  return transformed;
},
```

### 2. إضافة مكون اختبار البيانات

#### FormDataTest Component:
```typescript
export function FormDataTest() {
  const form = useForm();

  useEffect(() => {
    const testDataLoading = async () => {
      try {
        console.log("Testing data loading...");
        const data = await parasiteControlApi.getList({ page: 1, limit: 1 });
        
        if (data.data.length > 0) {
          const firstRecord = data.data[0];
          console.log("First record from API:", firstRecord);
          
          form.reset(firstRecord as any);
          console.log("Form reset with data");
          console.log("Form values:", form.getValues());
          
          console.log("Owner name from form:", form.getValues('owner.name'));
          console.log("Date from form:", form.getValues('date'));
          console.log("Supervisor from form:", form.getValues('supervisor'));
        }
      } catch (error) {
        console.error("Error testing data loading:", error);
      }
    };

    testDataLoading();
  }, [form]);

  return (
    <div className="p-4 bg-blue-50 rounded-md">
      <h3 className="font-medium text-blue-800">Form Data Test</h3>
      <p className="text-sm text-blue-600">Check console for data loading test results</p>
    </div>
  );
}
```

## كيفية التشخيص

### 1. فتح Developer Tools
1. اضغط F12 في المتصفح
2. اذهب إلى Console tab
3. افتح صفحة Parasite Control

### 2. مراقبة Console Logs
ستظهر الرسائل التالية:
```
Testing data loading...
First record from API: {_id: "68df1f1a62c38412a01ea08d", ...}
Form reset with data
Form values: {owner: {name: "أحمد محمد علي السعيد", ...}, ...}
Owner name from form: "أحمد محمد علي السعيد"
Date from form: "2025-10-03"
Supervisor from form: "د. خالد أحمد"
```

### 3. اختبار التعديل
1. اضغط على زر "تعديل" لأي سجل
2. راقب Console للرسائل التالية:
```
Loading data for ID: 68df1f1a62c38412a01ea08d
API getById called with ID: 68df1f1a62c38412a01ea08d
API response received: {_id: "68df1f1a62c38412a01ea08d", ...}
Transformed data: {_id: "68df1f1a62c38412a01ea08d", owner: {...}, ...}
Fresh data loaded: {_id: "68df1f1a62c38412a01ea08d", ...}
Owner name: "أحمد محمد علي السعيد"
Owner ID: "1234567890"
Date: "2025-10-03"
Supervisor: "د. خالد أحمد"
Form reset with fresh data
Form values after reset: {owner: {name: "أحمد محمد علي السعيد", ...}, ...}
```

## التحقق من البيانات في الحقول

### 1. حقول المالك
- **اسم المربي**: `owner.name`
- **رقم الهوية**: `owner.id`
- **تاريخ الميلاد**: `owner.birthDate`
- **رقم الهاتف**: `owner.phone`

### 2. الحقول الأساسية
- **التاريخ**: `date`
- **المشرف**: `supervisor`
- **رقم المركبة**: `vehicleNo`
- **موقع القطيع**: `herdLocation`

### 3. حقول القطيع
- **الأغنام**: `herd.sheep.total`, `herd.sheep.young`, `herd.sheep.female`, `herd.sheep.treated`
- **الماعز**: `herd.goats.total`, `herd.goats.young`, `herd.goats.female`, `herd.goats.treated`
- **الإبل**: `herd.camel.total`, `herd.camel.young`, `herd.camel.female`, `herd.camel.treated`
- **الأبقار**: `herd.cattle.total`, `herd.cattle.young`, `herd.cattle.female`, `herd.cattle.treated`

### 4. حقول المبيد
- **نوع المبيد**: `insecticide.type`
- **كمية المبيد**: `insecticide.volume_ml`
- **فئة المبيد**: `insecticide.category`
- **حالة الرش**: `insecticide.status`

## حل المشاكل المحتملة

### 1. إذا لم تظهر البيانات في Console
- تحقق من اتصال API
- تحقق من وجود أخطاء في Network tab
- تحقق من أن API يعيد البيانات بالشكل الصحيح

### 2. إذا ظهرت البيانات في Console لكن لم تظهر في الحقول
- تحقق من أن `form.reset()` يتم استدعاؤه
- تحقق من أن `form.getValues()` يعيد البيانات الصحيحة
- تحقق من أن الحقول تستخدم `name` الصحيح

### 3. إذا ظهرت أخطاء في API
- تحقق من أن ID صحيح
- تحقق من أن API endpoint يعمل
- تحقق من أن البيانات يتم تحويلها بشكل صحيح

## الملفات المحدثة

1. **`app/parasite-control/components/parasite-control-dialog.tsx`** - إضافة console logs
2. **`lib/api/parasite-control.ts`** - إضافة console logs في getById
3. **`components/debug/form-data-test.tsx`** - مكون اختبار البيانات
4. **`app/parasite-control/page.tsx`** - إضافة مكون الاختبار

## النتيجة المتوقعة

بعد تطبيق هذه التغييرات، يجب أن تظهر البيانات في جميع حقول الإدخال عند فتح النموذج في وضع التعديل. يمكن مراقبة Console للتأكد من أن البيانات يتم تحميلها بشكل صحيح.
