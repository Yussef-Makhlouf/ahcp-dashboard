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
import { FormField, FormLabel, Input, FormError, FormHelp } from "@/components/ui/form-modern";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, StatsCard } from "@/components/ui/card-modern";
import { StatusBadge, Badge } from "@/components/ui/badge-modern";
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
import { 
  CalendarIcon, 
  MapPin, 
  Plus, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Home,
  Heart,
  Shield,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: any;
  onSave: (data: any) => void;
}

const villages = [
  "قرية النور",
  "قرية السلام",
  "قرية الأمل",
  "قرية الخير",
  "قرية الفردوس",
  "قرية الرحمة",
  "قرية البركة",
];

interface Animal {
  id: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  healthStatus: string;
  vaccinated: boolean;
  lastVaccination?: string;
  notes?: string;
}

export function ClientDialog({ open, onOpenChange, client, onSave }: ClientDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    phone: "",
    birthDate: undefined as Date | undefined,
    village: "",
    address: "",
    email: "",
    nationalId: "",
    status: "active",
    notes: "",
    animals: [] as Animal[],
    emergencyContact: "",
    preferredVet: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [newAnimal, setNewAnimal] = useState<Animal>({
    id: "",
    type: "sheep",
    breed: "",
    age: "",
    gender: "male",
    healthStatus: "healthy",
    vaccinated: false,
    notes: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        ...client,
        birthDate: client.birthDate ? new Date(client.birthDate) : undefined,
        animals: client.animals || [],
      });
    } else {
      setFormData({
        name: "",
        id: "",
        phone: "",
        birthDate: undefined,
        village: "",
        address: "",
        email: "",
        nationalId: "",
        status: "active",
        notes: "",
        animals: [],
        emergencyContact: "",
        preferredVet: "",
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "الاسم مطلوب";
    if (!formData.id.trim()) newErrors.id = "رقم الهوية مطلوب";
    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    if (!formData.village) newErrors.village = "القرية مطلوبة";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      onSave({
        ...formData,
        birthDate: formData.birthDate ? format(formData.birthDate, "yyyy-MM-dd") : "",
        totalAnimals: formData.animals.length,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving client:", error);
    } finally {
      setLoading(false);
    }
  };

  const addAnimal = () => {
    if (newAnimal.id && newAnimal.breed) {
      setFormData({
        ...formData,
        animals: [...formData.animals, { ...newAnimal, id: Date.now().toString() }],
      });
      setNewAnimal({
        id: "",
        type: "sheep",
        breed: "",
        age: "",
        gender: "male",
        healthStatus: "healthy",
        vaccinated: false,
        notes: "",
      });
    }
  };

  const removeAnimal = (id: string) => {
    setFormData({
      ...formData,
      animals: formData.animals.filter(a => a.id !== id),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2">
        <DialogHeader>
          <DialogTitle>
            {client ? "تعديل بيانات المربي" : "إضافة مربي جديد"}
          </DialogTitle>
          <DialogDescription>
            {client ? "قم بتعديل بيانات المربي" : "أدخل بيانات المربي الجديد"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form id="client-form" onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="tabs-modern" dir="rtl">
              <TabsList className="tabs-list-modern">
                <TabsTrigger value="basic" className="tabs-trigger-modern">
                  <User className="w-4 h-4 ml-2" />
                  البيانات الأساسية
                </TabsTrigger>
                <TabsTrigger value="animals" className="tabs-trigger-modern">
                  <Heart className="w-4 h-4 ml-2" />
                  الحيوانات
                </TabsTrigger>
                <TabsTrigger value="additional" className="tabs-trigger-modern">
                  <Shield className="w-4 h-4 ml-2" />
                  بيانات إضافية
                </TabsTrigger>
              </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-4 p-2">
              <div className="section-modern">
                <div className="section-header-modern">
                  <h3 className="section-title-modern">المعلومات الشخصية</h3>
                  <p className="section-description-modern">أدخل البيانات الأساسية للمربي</p>
                </div>
                
                <div className="grid-modern grid-cols-2-modern">
                  <FormField>
                    <FormLabel htmlFor="name" required>الاسم الكامل</FormLabel>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="أدخل الاسم الكامل"
                      variant="enhanced"
                      error={!!errors.name}
                      dir="rtl"
                    />
                    {errors.name && <FormError>{errors.name}</FormError>}
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="id" required>رقم الهوية</FormLabel>
                    <Input
                      id="id"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      placeholder="C001"
                      variant="enhanced"
                      error={!!errors.id}
                    />
                    {errors.id && <FormError>{errors.id}</FormError>}
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="nationalId">الرقم القومي</FormLabel>
                    <Input
                      id="nationalId"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      placeholder="أدخل الرقم القومي"
                      variant="enhanced"
                      maxLength={14}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="phone" required>رقم الهاتف</FormLabel>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+201234567890"
                      variant="enhanced"
                      error={!!errors.phone}
                      dir="ltr"
                    />
                    {errors.phone && <FormError>{errors.phone}</FormError>}
                  </FormField>

                  <FormField>
                    <FormLabel>تاريخ الميلاد</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right form-input-enhanced",
                            !formData.birthDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {formData.birthDate ? (
                            format(formData.birthDate, "PPP", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.birthDate}
                          onSelect={(date) => setFormData({ ...formData, birthDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="email">البريد الإلكتروني</FormLabel>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                      variant="enhanced"
                      dir="ltr"
                    />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="village" required>القرية</FormLabel>
                    <Select
                      value={formData.village}
                      onValueChange={(value) => setFormData({ ...formData, village: value })}
                    >
                      <SelectTrigger className="form-select-enhanced">
                        <SelectValue placeholder="اختر القرية" />
                      </SelectTrigger>
                      <SelectContent>
                        {villages.map((village) => (
                          <SelectItem key={village} value={village}>
                            {village}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.village && <FormError>{errors.village}</FormError>}
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="status">الحالة</FormLabel>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="form-select-enhanced">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <FormField>
                  <FormLabel htmlFor="address">العنوان التفصيلي</FormLabel>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="أدخل العنوان التفصيلي"
                    className="form-input-enhanced"
                    rows={2}
                  />
                </FormField>
              </div>
            </TabsContent>

            <TabsContent value="animals" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إضافة حيوان جديد</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 bg-white">
                      <Label>نوع الحيوان</Label>
                      <Select
                        value={newAnimal.type}
                        onValueChange={(value) => setNewAnimal({ ...newAnimal, type: value })}
                      
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sheep">أغنام</SelectItem>
                          <SelectItem value="goats">ماعز</SelectItem>
                          <SelectItem value="cattle">أبقار</SelectItem>
                          <SelectItem value="camel">إبل</SelectItem>
                          <SelectItem value="horse">خيول</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>السلالة</Label>
                      <Input
                        value={newAnimal.breed}
                        onChange={(e) => setNewAnimal({ ...newAnimal, breed: e.target.value })}
                        placeholder="أدخل السلالة"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>العمر</Label>
                      <Input
                        value={newAnimal.age}
                        onChange={(e) => setNewAnimal({ ...newAnimal, age: e.target.value })}
                        placeholder="مثال: 2 سنة"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الجنس</Label>
                      <Select
                        value={newAnimal.gender}
                        onValueChange={(value) => setNewAnimal({ ...newAnimal, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الحالة الصحية</Label>
                      <Select
                        value={newAnimal.healthStatus}
                        onValueChange={(value) => setNewAnimal({ ...newAnimal, healthStatus: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="healthy">سليم</SelectItem>
                          <SelectItem value="sick">مريض</SelectItem>
                          <SelectItem value="under_treatment">تحت العلاج</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>رقم التعريف</Label>
                      <Input
                        value={newAnimal.id}
                        onChange={(e) => setNewAnimal({ ...newAnimal, id: e.target.value })}
                        placeholder="رقم التعريف"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addAnimal}
                    className="mt-4"
                    variant="secondary"
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة الحيوان
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>قائمة الحيوانات ({formData.animals.length})</Label>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {formData.animals.length === 0 ? (
                    <p className="text-center text-muted-foreground">لا توجد حيوانات مضافة</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.animals.map((animal) => (
                        <div
                          key={animal.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {animal.type === "sheep" && "أغنام"}
                              {animal.type === "goats" && "ماعز"}
                              {animal.type === "cattle" && "أبقار"}
                              {animal.type === "camel" && "إبل"}
                              {animal.type === "horse" && "خيول"}
                            </Badge>
                            <span className="text-sm">{animal.breed}</span>
                            <Badge variant={animal.healthStatus === "healthy" ? "default" : "danger"}>
                              {animal.healthStatus === "healthy" && "سليم"}
                              {animal.healthStatus === "sick" && "مريض"}
                              {animal.healthStatus === "under_treatment" && "تحت العلاج"}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAnimal(animal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">رقم الطوارئ</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="+201234567890"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredVet">الطبيب البيطري المفضل</Label>
                  <Input
                    id="preferredVet"
                    value={formData.preferredVet}
                    onChange={(e) => setFormData({ ...formData, preferredVet: e.target.value })}
                    placeholder="اسم الطبيب البيطري"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  يمكن إضافة الموقع الجغرافي لاحقاً من خلال خرائط جوجل
                </span>
              </div>
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
            form="client-form"
            variant="default"
            loading={loading}
            loadingText="جاري الحفظ..."
            leftIcon={<User className="w-4 h-4" />}
          >
            {client ? "حفظ التعديلات" : "إضافة المربي"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
