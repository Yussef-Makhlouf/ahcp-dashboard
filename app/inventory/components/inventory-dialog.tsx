"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { CalendarIcon, Package, AlertCircle, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from "@/components/ui/card-modern";
import { Badge, StatusBadge } from "@/components/ui/badge-modern";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    onSave({
      ...formData,
      status,
      expiryDate: formData.expiryDate ? format(formData.expiryDate, "yyyy-MM-dd") : undefined,
      lastRestocked: formData.lastRestocked ? format(formData.lastRestocked, "yyyy-MM-dd") : "",
    });
    onOpenChange(false);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-400 shadow-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? "تعديل بيانات الصنف" : "إضافة صنف جديد"}
          </DialogTitle>
          <DialogDescription>
            {item ? "قم بتعديل بيانات الصنف في المخزون" : "أدخل بيانات الصنف الجديد"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6 bg-white/80 border-2 border-gray-300 rounded-lg p-1">
              <TabsTrigger value="basic" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-medium text-sm">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="stock" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-medium text-sm">المخزون</TabsTrigger>
              <TabsTrigger value="movement" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-medium text-sm">حركة المخزون</TabsTrigger>
              <TabsTrigger value="additional" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-medium text-sm">بيانات إضافية</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الصنف *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="أدخل اسم الصنف"
                  />
                </div>

                <div className="space-y-2">
                  <Label>الفئة *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
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

              <div className="grid grid-cols-2 gap-4">
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
            </TabsContent>

            <TabsContent value="stock" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">مستويات المخزون</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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

            <TabsContent value="movement" className="space-y-4 mt-4">
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

            <TabsContent value="additional" className="space-y-4 mt-4">
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

          <DialogFooter className="mt-6 flex gap-3 pt-4 border-t border-orange-200 bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-gray-800 transition-all duration-200 font-medium"
            >
              إلغاء
            </Button>
            <Button 
              type="submit"
              className="h-11 px-6 bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              {item ? "حفظ التعديلات" : "إضافة الصنف"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
