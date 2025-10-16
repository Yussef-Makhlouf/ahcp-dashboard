"use client";

import { useEffect } from "react";
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
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Phone,
  AlertCircle,
  Bell,
  Repeat,
  User,
  Heart,
  Shield,
  Activity,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { validateSaudiPhone } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMobileTabs } from "@/components/ui/mobile-tabs";
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from "@/components/ui/card-modern";
import { Badge, StatusBadge } from "@/components/ui/badge-modern";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { entityToasts } from "@/lib/utils/toast-utils";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedSelect } from "@/components/ui/validated-select";
import { ValidatedTextarea } from "@/components/ui/validated-textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: any;
  onSave: (data: any) => void;
}

const eventTypes = [
  { value: "vaccination", label: "تحصين", icon: "💉" },
  { value: "parasite_control", label: "مكافحة طفيليات", icon: "🦟" },
  { value: "clinic", label: "عيادة متنقلة", icon: "🏥" },
  { value: "lab", label: "مختبر", icon: "🔬" },
  { value: "meeting", label: "اجتماع", icon: "👥" },
  { value: "other", label: "أخرى", icon: "📌" },
];

const villages = [
  "قرية النور",
  "قرية السلام",
  "قرية الأمل",
  "قرية الخير",
  "قرية الفردوس",
  "قرية الرحمة",
  "قرية البركة",
];

const teamMembers = [
  "د. محمد علي",
  "د. سارة محمود",
  "د. أحمد حسن",
  "د. فاطمة عبدالله",
  "د. خالد إبراهيم",
];

const timeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

export function ScheduleDialog({ open, onOpenChange, event, onSave }: ScheduleDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");

  // Validation rules for unified system
  const validationRules = {
    'title': { required: true, minLength: 2 },
    'type': { required: true },
    'date': { required: true },
    'time': { required: true },
    'location': { required: true },
    'clientName': { required: true, minLength: 2 },
    'clientPhone': { required: true, phone: true },
    'animalCount': { required: true },
    'status': { required: true },
    'priority': { required: true },
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
    title: "",
    type: "vaccination",
    date: undefined as Date | undefined,
    time: "",
    duration: 60,
    location: "",
    village: "",
    assignedTo: [] as string[],
    clientName: "",
    clientPhone: "",
    animalCount: 0,
    status: "scheduled" as "scheduled" | "in_progress" | "completed" | "cancelled",
    priority: "medium" as "high" | "medium" | "low",
    notes: "",
    reminder: false,
    reminderTime: 30, // minutes before
    recurring: false,
    recurringType: "daily" as "daily" | "weekly" | "monthly",
    recurringEnd: undefined as Date | undefined,
    equipment: [] as string[],
    vaccines: [] as string[],
    expectedCost: 0,
  });

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        date: event.date ? new Date(event.date) : undefined,
        assignedTo: event.assignedTo || [],
        equipment: [],
        vaccines: [],
        expectedCost: 0,
        reminderTime: 30,
        recurring: false,
        recurringType: "daily",
        recurringEnd: undefined,
      });
      setSelectedMembers(event.assignedTo || []);
    } else {
      setFormData({
        title: "",
        type: "vaccination",
        date: new Date(),
        time: "09:00",
        duration: 60,
        location: "",
        village: "",
        assignedTo: [],
        clientName: "",
        clientPhone: "",
        animalCount: 0,
        status: "scheduled",
        priority: "medium",
        notes: "",
        reminder: true,
        reminderTime: 30,
        recurring: false,
        recurringType: "daily",
        recurringEnd: undefined,
        equipment: [],
        vaccines: [],
        expectedCost: 0,
      });
      setSelectedMembers([]);
    }
  }, [event]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.title.trim()) {
      newErrors.title = "عنوان الموعد مطلوب";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "عنوان الموعد يجب أن يكون أكثر من 3 أحرف";
    }
    
    if (!formData.date) {
      newErrors.date = "التاريخ مطلوب";
    } else if (formData.date < new Date()) {
      newErrors.date = "التاريخ لا يمكن أن يكون في الماضي";
    }
    
    if (!formData.time) {
      newErrors.time = "الوقت مطلوب";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "الموقع مطلوب";
    } else if (formData.location.trim().length < 3) {
      newErrors.location = "الموقع يجب أن يكون أكثر من 3 أحرف";
    }
    
    if (selectedMembers.length === 0) {
      newErrors.assignedTo = "يجب اختيار عضو واحد على الأقل";
    }
    
    // Validate client info for certain event types
    if ((formData.type === "vaccination" || formData.type === "parasite_control" || formData.type === "clinic")) {
      if (formData.clientName && formData.clientName.trim().length < 2) {
        newErrors.clientName = "اسم العميل يجب أن يكون أكثر من حرفين";
      }
      
      if (formData.clientPhone && !validateSaudiPhone(formData.clientPhone)) {
        newErrors.clientPhone = "رقم الهاتف غير صحيح. يجب أن يبدأ بـ +966 أو 05";
      }
      
      if (formData.animalCount && formData.animalCount < 0) {
        newErrors.animalCount = "عدد الحيوانات لا يمكن أن يكون سالب";
      }
      
      if (formData.expectedCost && formData.expectedCost < 0) {
        newErrors.expectedCost = "التكلفة المتوقعة لا يمكن أن تكون سالبة";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show field-specific errors directly in the form
      // The validateForm function already sets errors in the errors state
      // which will be displayed by FormMessage components
      return;
    }
    
    try {
      if (event) {
        entityToasts.schedule.update();
      } else {
        entityToasts.schedule.create();
      }
      
      onSave({
        ...formData,
        assignedTo: selectedMembers,
        date: formData.date,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
      entityToasts.schedule.error(event ? 'update' : 'create');
    }
  };

  const toggleMember = (member: string) => {
    if (selectedMembers.includes(member)) {
      setSelectedMembers(selectedMembers.filter(m => m !== member));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 lg:p-6">
        <DialogHeader>
          <DialogTitle>
            {event ? "تعديل الموعد" : "إضافة موعد جديد"}
          </DialogTitle>
          <DialogDescription>
            {event ? "قم بتعديل تفاصيل الموعد" : "أدخل تفاصيل الموعد الجديد"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form id="schedule-form" onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-modern" dir="rtl">
              <EnhancedMobileTabs
                value={activeTab}
                onValueChange={setActiveTab}
                tabs={[
                  {
                    value: "basic",
                    label: "البيانات الأساسية",
                    shortLabel: "أساسية",
                    icon: <User className="w-4 h-4" />
                  },
                  {
                    value: "team",
                    label: "الفريق",
                    shortLabel: "فريق",
                    icon: <Heart className="w-4 h-4" />
                  },
                  {
                    value: "details",
                    label: "التفاصيل",
                    shortLabel: "تفاصيل",
                    icon: <Shield className="w-4 h-4" />
                  },
                  {
                    value: "reminders",
                    label: "التذكيرات",
                    shortLabel: "تذكيرات",
                    icon: <Activity className="w-4 h-4" />
                  }
                ]}
              />

            <TabsContent value="basic" className="tabs-content-modern">
              <div className="space-y-2">
                <Label>عنوان الموعد *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="أدخل عنوان الموعد"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع الموعد *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الأولوية</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "high" | "medium" | "low") => 
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        <span className="text-red-600">عالية</span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="text-yellow-600">متوسطة</span>
                      </SelectItem>
                      <SelectItem value="low">
                        <span className="text-green-600">منخفضة</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>التاريخ *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {formData.date ? (
                          format(formData.date, "PPP", { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date as Date | undefined}
                        onSelect={(date: Date | undefined) => setFormData({ ...formData, date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>الوقت *</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => setFormData({ ...formData, time: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الوقت" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>المدة (بالدقائق)</Label>
                  <Input
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">مجدول</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الموقع *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="أدخل الموقع"
                    className={errors.location ? "border-red-500" : ""}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>القرية</Label>
                  <Select
                    value={formData.village}
                    onValueChange={(value) => setFormData({ ...formData, village: value })}
                  >
                    <SelectTrigger>
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="tabs-content-modern">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">أعضاء الفريق المكلفين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member}
                        className={cn(
                          "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedMembers.includes(member) 
                            ? "bg-blue-100 border-blue-500" 
                            : "hover:bg-muted"
                        )}
                        onClick={() => toggleMember(member)}
                      >
                        <Checkbox
                          checked={selectedMembers.includes(member)}
                          onCheckedChange={() => toggleMember(member)}
                        />
                        <label className="flex-1 cursor-pointer mr-2">
                          {member}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {selectedMembers.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-muted">
                      <div className="text-sm font-medium mb-2">الفريق المختار:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMembers.map((member) => (
                          <Badge key={member} variant="secondary">
                            {member}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.assignedTo && (
                    <p className="text-sm text-red-500 mt-2">{errors.assignedTo}</p>
                  )}
                </CardContent>
              </Card>

              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  يمكنك اختيار أكثر من عضو للمشاركة في هذا الموعد
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="details" className="tabs-content-modern">
              {(formData.type === "vaccination" || formData.type === "parasite_control" || formData.type === "clinic") && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>اسم العميل</Label>
                      <Input
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="اسم المربي أو صاحب المزرعة"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>رقم الهاتف</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={formData.clientPhone}
                          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                          placeholder="+966501234567 أو 0501234567"
                          className="pr-10"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>عدد الحيوانات المتوقع</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.animalCount}
                      onChange={(e) => setFormData({ ...formData, animalCount: parseInt(e.target.value) || 0 })}
                      placeholder="العدد التقريبي للحيوانات"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>التكلفة المتوقعة (ج.م)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.expectedCost}
                      onChange={(e) => setFormData({ ...formData, expectedCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية"
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="reminders" className="tabs-content-modern">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إعدادات التذكير</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تفعيل التذكير</Label>
                      <div className="text-sm text-muted-foreground">
                        سيتم إرسال تذكير قبل الموعد
                      </div>
                    </div>
                    <Switch
                      checked={formData.reminder}
                      onCheckedChange={(checked) => setFormData({ ...formData, reminder: checked })}
                    />
                  </div>

                  {formData.reminder && (
                    <div className="space-y-2">
                      <Label>وقت التذكير</Label>
                      <Select
                        value={formData.reminderTime.toString()}
                        onValueChange={(value) => setFormData({ ...formData, reminderTime: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">قبل 15 دقيقة</SelectItem>
                          <SelectItem value="30">قبل 30 دقيقة</SelectItem>
                          <SelectItem value="60">قبل ساعة</SelectItem>
                          <SelectItem value="120">قبل ساعتين</SelectItem>
                          <SelectItem value="1440">قبل يوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الموعد المتكرر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>موعد متكرر</Label>
                      <div className="text-sm text-muted-foreground">
                        تكرار هذا الموعد بشكل دوري
                      </div>
                    </div>
                    <Switch
                      checked={formData.recurring}
                      onCheckedChange={(checked) => setFormData({ ...formData, recurring: checked })}
                    />
                  </div>

                  {formData.recurring && (
                    <>
                      <div className="space-y-2">
                        <Label>نوع التكرار</Label>
                        <Select
                          value={formData.recurringType}
                          onValueChange={(value: any) => setFormData({ ...formData, recurringType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">يومي</SelectItem>
                            <SelectItem value="weekly">أسبوعي</SelectItem>
                            <SelectItem value="monthly">شهري</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>تاريخ انتهاء التكرار</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-right",
                                !formData.recurringEnd && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {formData.recurringEnd ? (
                                format(formData.recurringEnd, "PPP", { locale: ar })
                              ) : (
                                <span>اختر تاريخ الانتهاء</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.recurringEnd}
                              onSelect={(date) => setFormData({ ...formData, recurringEnd: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <LoadingButton 
            type="submit"
            form="schedule-form"
            variant="default"
            leftIcon={<Activity className="w-4 h-4" />}
          >
            {event ? "حفظ التعديلات" : "إضافة الموعد"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
