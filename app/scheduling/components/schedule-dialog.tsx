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
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Phone,
  AlertCircle,
  Bell,
  Repeat
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from "@/components/ui/card-modern";
import { Badge, StatusBadge } from "@/components/ui/badge-modern";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      assignedTo: selectedMembers,
      date: formData.date,
    });
    onOpenChange(false);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-pink-400 shadow-2xl">
        <DialogHeader>
          <DialogTitle>
            {event ? "تعديل الموعد" : "إضافة موعد جديد"}
          </DialogTitle>
          <DialogDescription>
            {event ? "قم بتعديل تفاصيل الموعد" : "أدخل تفاصيل الموعد الجديد"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6 bg-white/80 border-2 border-gray-300 rounded-lg p-1">
              <TabsTrigger value="basic" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white font-medium text-sm">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white font-medium text-sm">الفريق</TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white font-medium text-sm">التفاصيل</TabsTrigger>
              <TabsTrigger value="reminders" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white font-medium text-sm">التذكيرات</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>عنوان الموعد *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="أدخل عنوان الموعد"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                        selected={formData.date}
                        onSelect={(date) => setFormData({ ...formData, date })}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الموقع *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="أدخل الموقع"
                  />
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

            <TabsContent value="team" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">أعضاء الفريق المكلفين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
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
                </CardContent>
              </Card>

              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  يمكنك اختيار أكثر من عضو للمشاركة في هذا الموعد
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              {(formData.type === "vaccination" || formData.type === "parasite_control" || formData.type === "clinic") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
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
                          placeholder="+201234567890"
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

            <TabsContent value="reminders" className="space-y-4 mt-4">
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

          <DialogFooter className="mt-6 flex gap-3 pt-4 border-t border-pink-200 bg-white/50 backdrop-blur-sm rounded-lg p-4">
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
              className="h-11 px-6 bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              {event ? "حفظ التعديلات" : "إضافة الموعد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
