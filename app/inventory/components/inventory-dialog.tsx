"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { Button, LoadingButton } from "@/components/ui/button-modern";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Package, AlertCircle, Plus, Minus, Activity } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { validateSaudiPhone } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMobileTabs } from "@/components/ui/mobile-tabs";
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from "@/components/ui/card-modern";
import { Badge, StatusBadge } from "@/components/ui/badge-modern";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { entityToasts } from "@/lib/utils/toast-utils";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedSelect } from "@/components/ui/validated-select";
import { ValidatedTextarea } from "@/components/ui/validated-textarea";

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: any;
  onSave: (data: any) => void;
}

const categories = [
  "لقاحات",
  "أدوية",
  "مستلزمات طبية",
  "مكملات",
  "معدات",
  "أدوات جراحية",
  "مطهرات",
  "ضمادات",
];

const units = [
  "جرعة",
  "زجاجة",
  "عبوة",
  "قطعة",
  "زوج",
  "علبة",
  "كيس",
  "لتر",
  "كيلوجرام",
  "متر",
];

const suppliers = [
  "شركة الأدوية البيطرية",
  "مستودع الأدوية المركزي",
  "شركة فارما للأدوية",
  "موردي المستلزمات الطبية",
  "شركة المستلزمات الطبية",
  "شركة التغذية الحيوانية",
];

const locations = [
  "المخزن الرئيسي - الثلاجة A",
  "المخزن الرئيسي - الثلاجة B",
  "المخزن الرئيسي - الرف A1",
  "المخزن الرئيسي - الرف B2",
  "المخزن الرئيسي - الرف C3",
  "المخزن الرئيسي - الخزانة D",
  "المخزن الرئيسي - الدرج E1",
  "المخزن الفرعي",
  "العيادة المتنقلة 1",
  "العيادة المتنقلة 2",
];

export function InventoryDialog({ open, onOpenChange, item, onSave }: InventoryDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);

  // Validation rules for unified system
  const validationRules = {
    'name': { required: true, minLength: 2 },
    'category': { required: true },
    'quantity': { required: true },
    'unit': { required: true },
    'minStock': { required: true },
    'maxStock': { required: true },
    'batchNumber': { required: true },
    'supplier': { required: true },
    'price': { required: true },
    'location': { required: true },
  };

  const {
    errors,
    validateField,
    validateForm: validateFormData,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldError,
  } = useFormValidation(validationRules);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    minStock: 0,
    maxStock: 0,
    expiryDate: undefined as Date | undefined,
    batchNumber: "",
    supplier: "",
    lastRestocked: undefined as Date | undefined,
    price: 0,
    status: "in_stock" as "in_stock" | "low_stock" | "out_of_stock" | "expired",
    location: "",
    notes: "",
    requiresRefrigeration: false,
    temperature: "",
    manufacturer: "",
    barcode: "",
    reorderPoint: 0,
    reorderQuantity: 0,
  });

  const [stockMovement, setStockMovement] = useState({
    type: "add" as "add" | "remove",
    quantity: 0,
    reason: "",
    date: new Date(),
  });

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : undefined,
        requiresRefrigeration: false,
        temperature: "",
        manufacturer: "",
        barcode: "",
        reorderPoint: item.minStock || 0,
        reorderQuantity: 0,
      });
    } else {
      setFormData({
        name: "",
        category: "",
        quantity: 0,
        unit: "",
        minStock: 0,
        maxStock: 0,
        expiryDate: undefined,
        batchNumber: "",
        supplier: "",
        lastRestocked: new Date(),
        price: 0,
        status: "in_stock",
        location: "",
        notes: "",
        requiresRefrigeration: false,
        temperature: "",
        manufacturer: "",
        barcode: "",
        reorderPoint: 0,
        reorderQuantity: 0,
      });
    }
  }, [item]);


  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "اسم الصنف مطلوب";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "اسم الصنف يجب أن يكون أكثر من حرفين";
    }
    
    if (!formData.category) {
      newErrors.category = "الفئة مطلوبة";
    }
    
    if (!formData.supplier) {
      newErrors.supplier = "المورد مطلوب";
    }
    
    if (!formData.location) {
      newErrors.location = "الموقع مطلوب";
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = "الكمية لا يمكن أن تكون سالبة";
    }
    
    if (formData.minStock < 0) {
      newErrors.minStock = "الحد الأدنى لا يمكن أن يكون سالب";
    }
    
    if (formData.maxStock < 0) {
      newErrors.maxStock = "الحد الأقصى لا يمكن أن يكون سالب";
    }
    
    if (formData.minStock > formData.maxStock && formData.maxStock > 0) {
      newErrors.minStock = "الحد الأدنى لا يمكن أن يكون أكبر من الحد الأقصى";
    }
    
    if (formData.price < 0) {
      newErrors.price = "السعر لا يمكن أن يكون سالب";
    }
    
    // Email validation for manufacturer (if provided)
    if (formData.manufacturer && formData.manufacturer.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.manufacturer)) {
      newErrors.manufacturer = "البريد الإلكتروني غير صحيح";
    }
    
    // Expiry date validation
    if (formData.expiryDate && formData.expiryDate < new Date()) {
      newErrors.expiryDate = "تاريخ الانتهاء لا يمكن أن يكون في الماضي";
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Auto-calculate status based on quantity
    let status: "in_stock" | "low_stock" | "out_of_stock" | "expired" = "in_stock";
    if (formData.quantity === 0) {
      status = "out_of_stock";
    } else if (formData.quantity < formData.minStock) {
      status = "low_stock";
    }
    
    // Check if expired
    if (formData.expiryDate && new Date(formData.expiryDate) < new Date()) {
      status = "expired";
    }
    
    // Validate form data before sending
    if (!formData.name?.trim()) {
      console.error('❌ Item name is required');
      return;
    }
    
    if (!formData.category?.trim()) {
      console.error('❌ Category is required');
      return;
    }
    
    if (formData.quantity < 0) {
      console.error('❌ Quantity cannot be negative');
      return;
    }
    
    try {
      // Simulate API call - replace with actual API
      if (item) {
        entityToasts.inventory.update();
      } else {
        entityToasts.inventory.create();
      }
      
      onSave({
        ...formData,
        status,
        expiryDate: formData.expiryDate ? format(formData.expiryDate, "yyyy-MM-dd") : undefined,
        lastRestocked: formData.lastRestocked ? format(formData.lastRestocked, "yyyy-MM-dd") : "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving inventory:', error);
      entityToasts.inventory.error(item ? 'update' : 'create');
    }
  };

  const handleStockMovement = () => {
    if (stockMovement.type === "add") {
      setFormData({
        ...formData,
        quantity: formData.quantity + stockMovement.quantity,
        lastRestocked: stockMovement.date,
      });
    } else {
      setFormData({
        ...formData,
        quantity: Math.max(0, formData.quantity - stockMovement.quantity),
      });
    }
    setStockMovement({
      type: "add",
      quantity: 0,
      reason: "",
      date: new Date(),
    });
  };

  const getStockPercentage = () => {
    if (formData.maxStock === 0) return 0;
    return (formData.quantity / formData.maxStock) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 lg:p-6">
        <DialogHeader>
          <DialogTitle>
            {item ? "تعديل بيانات الصنف" : "إضافة صنف جديد"}
          </DialogTitle>
          <DialogDescription>
            {item ? "قم بتعديل بيانات الصنف في المخزون" : "أدخل بيانات الصنف الجديد"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form id="inventory-form" onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-modern" dir="rtl">
              <EnhancedMobileTabs
                value={activeTab}
                onValueChange={setActiveTab}
                tabs={[
                  {
                    value: "basic",
                    label: "البيانات الأساسية",
                    shortLabel: "أساسية",
                    icon: <Package className="w-4 h-4" />
                  },
                  {
                    value: "stock",
                    label: "المخزون",
                    shortLabel: "مخزون",
                    icon: <AlertCircle className="w-4 h-4" />
                  },
                  {
                    value: "movement",
                    label: "حركة المخزون",
                    shortLabel: "حركة",
                    icon: <Activity className="w-4 h-4" />
                  },
                  {
                    value: "additional",
                    label: "بيانات إضافية",
                    shortLabel: "إضافية",
                    icon: <Plus className="w-4 h-4" />
                  }
                ]}
              />

            <TabsContent value="basic" className="tabs-content-modern">
              <div className="section-modern">
                <div className="section-header-modern">
                  <h3 className="section-title-modern">معلومات الصنف</h3>
                  <p className="section-description-modern">أدخل البيانات الأساسية للصنف</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label>اسم الصنف *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="أدخل اسم الصنف"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>الفئة *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>رقم الدفعة</Label>
                  <Input
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="مثال: BATCH2025-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label>الباركود</Label>
                  <Input
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="رمز الباركود"
                  />
                </div>

                <div className="space-y-2">
                  <Label>المورد *</Label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) => setFormData({ ...formData, supplier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المورد" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الشركة المصنعة</Label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="اسم الشركة المصنعة"
                  />
                </div>

                <div className="space-y-2">
                  <Label>تاريخ الانتهاء</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right",
                          !formData.expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {formData.expiryDate ? (
                          format(formData.expiryDate, "PPP", { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expiryDate}
                        onSelect={(date) => setFormData({ ...formData, expiryDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>السعر (ج.م) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الموقع في المخزن *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموقع" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>يحتاج تبريد</Label>
                    <Switch
                      checked={formData.requiresRefrigeration}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, requiresRefrigeration: checked })
                      }
                    />
                  </div>
                  {formData.requiresRefrigeration && (
                    <Input
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      placeholder="درجة الحرارة المطلوبة"
                    />
                  )}
                </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stock" className="tabs-content-modern">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">مستويات المخزون</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الكمية الحالية *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>وحدة القياس *</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => setFormData({ ...formData, unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الوحدة" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الحد الأدنى للمخزون *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الحد الأقصى للمخزون *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.maxStock}
                        onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>نقطة إعادة الطلب</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.reorderPoint}
                        onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>كمية إعادة الطلب</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.reorderQuantity}
                        onChange={(e) => setFormData({ ...formData, reorderQuantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>مستوى المخزون</span>
                      <span className="font-bold">{getStockPercentage().toFixed(1)}%</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          getStockPercentage() > 50 ? "bg-green-500" :
                          getStockPercentage() > 20 ? "bg-yellow-500" :
                          "bg-red-500"
                        )}
                        style={{ width: `${getStockPercentage()}%` }}
                      />
                    </div>
                  </div>

                  {formData.quantity < formData.minStock && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        الكمية الحالية أقل من الحد الأدنى المطلوب
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>تاريخ آخر توريد</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right",
                        !formData.lastRestocked && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {formData.lastRestocked ? (
                        format(formData.lastRestocked, "PPP", { locale: ar })
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.lastRestocked}
                      onSelect={(date) => setFormData({ ...formData, lastRestocked: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            <TabsContent value="movement" className="tabs-content-modern">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">تسجيل حركة مخزون</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع الحركة</Label>
                      <Select
                        value={stockMovement.type}
                        onValueChange={(value: "add" | "remove") => 
                          setStockMovement({ ...stockMovement, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add">
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4 text-green-600" />
                              إضافة للمخزون
                            </div>
                          </SelectItem>
                          <SelectItem value="remove">
                            <div className="flex items-center gap-2">
                              <Minus className="h-4 w-4 text-red-600" />
                              سحب من المخزون
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الكمية</Label>
                      <Input
                        type="number"
                        min="0"
                        value={stockMovement.quantity}
                        onChange={(e) => setStockMovement({ 
                          ...stockMovement, 
                          quantity: parseInt(e.target.value) || 0 
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>السبب</Label>
                    <Textarea
                      value={stockMovement.reason}
                      onChange={(e) => setStockMovement({ ...stockMovement, reason: e.target.value })}
                      placeholder="سبب الحركة (اختياري)"
                      rows={2}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleStockMovement}
                    variant="secondary"
                    className="w-full"
                    disabled={stockMovement.quantity === 0}
                  >
                    <Package className="ml-2 h-4 w-4" />
                    تطبيق الحركة
                  </Button>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">الكمية بعد الحركة:</span>
                      <span className="text-lg font-bold">
                        {stockMovement.type === "add" 
                          ? formData.quantity + stockMovement.quantity
                          : Math.max(0, formData.quantity - stockMovement.quantity)
                        } {formData.unit}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="additional" className="tabs-content-modern">
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية عن الصنف"
                  rows={4}
                />
              </div>

              {item && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">معلومات إضافية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">رقم الصنف:</span>
                        <span className="font-mono">{item.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">القيمة الإجمالية:</span>
                        <span className="font-bold">
                          {(formData.quantity * formData.price).toLocaleString()} ج.م
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">الحالة:</span>
                        <Badge variant={
                          formData.quantity === 0 ? "danger" :
                          formData.quantity < formData.minStock ? "warning" :
                          "success"
                        }>
                          {formData.quantity === 0 ? "نفذ المخزون" :
                           formData.quantity < formData.minStock ? "مخزون منخفض" :
                           "متوفر"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            </Tabs>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            إلغاء
          </Button>
          <LoadingButton 
            type="submit"
            form="inventory-form"
            variant="default"
            loading={loading}
            loadingText="جاري الحفظ..."
            leftIcon={<Package className="w-4 h-4" />}
          >
            {item ? "حفظ التعديلات" : "إضافة الصنف"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
