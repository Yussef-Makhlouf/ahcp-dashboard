"use client";

import {  useEffect } from "react";
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
import { CalendarIcon, Plus, Trash2, AlertCircle, CheckCircle2, User, Heart, Shield, Activity } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { validateSaudiPhone } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedMobileTabs } from "@/components/ui/mobile-tabs";
import { Card, CardContent, CardHeader, CardTitle, StatsCard } from "@/components/ui/card-modern";
import { Badge, StatusBadge } from "@/components/ui/badge-modern";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import type { Laboratory } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LaboratoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laboratory?: Laboratory;
  onSave: (data: any) => void;
}

const sampleTypes = [
  "دم",
  "براز",
  "بول",
  "مسحة",
  "أنسجة",
  "لعاب",
  "حليب",
  "سائل نخاعي",
  "سائل مفصلي",
];

const collectors = [
  "د. محمد علي",
  "د. سارة محمود",
  "د. أحمد حسن",
  "د. فاطمة عبدالله",
  "د. خالد إبراهيم",
];

const testTypes = [
  "فحص بكتيري",
  "فحص فيروسي",
  "فحص طفيليات",
  "فحص فطريات",
  "فحص دم شامل",
  "فحص كيمياء حيوية",
  "فحص هرمونات",
  "فحص مناعي",
  "زراعة بكتيرية",
  "فحص جيني",
];

interface TestResult {
  id: string;
  animalId: string;
  animalType: string;
  testType: string;
  result: "positive" | "negative" | "pending";
  notes: string;
}

export function LaboratoryDialog({ open, onOpenChange, laboratory, onSave }: LaboratoryDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    sampleCode: "",
    sampleType: "",
    collector: "",
    date: undefined as Date | undefined,
    speciesCounts: {
      sheep: 0,
      goats: 0,
      camel: 0,
      cattle: 0,
      horse: 0,
    },
    positiveCases: 0,
    negativeCases: 0,
    remarks: "",
    testType: "",
    labTechnician: "",
    receivedDate: undefined as Date | undefined,
    completedDate: undefined as Date | undefined,
    priority: "normal" as "urgent" | "normal" | "low",
    testResults: [] as TestResult[],
    recommendations: "",
  });

  const [newTestResult, setNewTestResult] = useState<TestResult>({
    id: "",
    animalId: "",
    animalType: "sheep",
    testType: "",
    result: "pending",
    notes: "",
  });

  useEffect(() => {
    if (laboratory) {
      setFormData({
        ...laboratory,
        date: laboratory.date ? new Date(laboratory.date) : undefined,
        testType: "",
        labTechnician: "",
        receivedDate: undefined,
        completedDate: undefined,
        priority: "normal",
        testResults: [],
        recommendations: "",
      });
    } else {
      // Generate new sample code
      const newCode = `LAB${String(Math.floor(Math.random() * 10000)).padStart(3, '0')}`;
      setFormData({
        sampleCode: newCode,
        sampleType: "",
        collector: "",
        date: new Date(),
        speciesCounts: {
          sheep: 0,
          goats: 0,
          camel: 0,
          cattle: 0,
          horse: 0,
        },
        positiveCases: 0,
        negativeCases: 0,
        remarks: "",
        testType: "",
        labTechnician: "",
        receivedDate: new Date(),
        completedDate: undefined,
        priority: "normal",
        testResults: [],
        recommendations: "",
      });
    }
  }, [laboratory]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.sampleCode.trim()) {
      newErrors.sampleCode = "رمز العينة مطلوب";
    } else if (formData.sampleCode.trim().length < 3) {
      newErrors.sampleCode = "رمز العينة يجب أن يكون أكثر من 3 أحرف";
    }
    
    if (!formData.sampleType) {
      newErrors.sampleType = "نوع العينة مطلوب";
    }
    
    if (!formData.collector) {
      newErrors.collector = "جامع العينة مطلوب";
    }
    
    if (!formData.date) {
      newErrors.date = "تاريخ جمع العينة مطلوب";
    }
    
    if (!formData.testType) {
      newErrors.testType = "نوع الفحص مطلوب";
    }
    
    // Validate species counts
    const totalSamples = getTotalSamples();
    if (totalSamples === 0) {
      newErrors.speciesCounts = "يجب إدخال عدد العينات";
    }
    
    // Validate test results
    if (formData.testResults.length === 0) {
      newErrors.testResults = "يجب إدخال نتائج الفحص";
    }
    
    // Validate positive and negative cases
    if (formData.positiveCases < 0) {
      newErrors.positiveCases = "الحالات الإيجابية لا يمكن أن تكون سالبة";
    }
    
    if (formData.negativeCases < 0) {
      newErrors.negativeCases = "الحالات السلبية لا يمكن أن تكون سالبة";
    }
    
    const totalCases = formData.positiveCases + formData.negativeCases;
    if (totalCases > totalSamples) {
      newErrors.positiveCases = "مجموع الحالات الإيجابية والسلبية لا يمكن أن يكون أكبر من إجمالي العينات";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Calculate positive and negative cases from test results
    const positive = formData.testResults.filter(r => r.result === "positive").length;
    const negative = formData.testResults.filter(r => r.result === "negative").length;
    
    onSave({
      ...formData,
      date: formData.date ? format(formData.date, "yyyy-MM-dd") : "",
      positiveCases: positive > 0 ? positive : formData.positiveCases,
      negativeCases: negative > 0 ? negative : formData.negativeCases,
    });
    onOpenChange(false);
  };

  const addTestResult = () => {
    if (newTestResult.animalId && newTestResult.testType) {
      setFormData({
        ...formData,
        testResults: [...formData.testResults, { ...newTestResult, id: Date.now().toString() }],
      });
      setNewTestResult({
        id: "",
        animalId: "",
        animalType: "sheep",
        testType: "",
        result: "pending",
        notes: "",
      });
    }
  };

  const removeTestResult = (id: string) => {
    setFormData({
      ...formData,
      testResults: formData.testResults.filter(t => t.id !== id),
    });
  };

  const getTotalSamples = () => {
    const counts = formData.speciesCounts;
    return counts.sheep + counts.goats + counts.camel + counts.cattle + counts.horse;
  };

  const getPositivePercentage = () => {
    const total = formData.positiveCases + formData.negativeCases;
    return total > 0 ? (formData.positiveCases / total) * 100 : 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 lg:p-6">
        <DialogHeader>
          <DialogTitle>
            {laboratory ? "تعديل نتائج الفحص المخبري" : "إضافة فحص مخبري جديد"}
          </DialogTitle>
          <DialogDescription>
            {laboratory ? "قم بتعديل بيانات الفحص المخبري" : "أدخل بيانات الفحص المخبري الجديد"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form id="laboratory-form" onSubmit={handleSubmit}>
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
                    value: "samples",
                    label: "العينات",
                    shortLabel: "عينات",
                    icon: <Heart className="w-4 h-4" />
                  },
                  {
                    value: "results",
                    label: "النتائج",
                    shortLabel: "نتائج",
                    icon: <Shield className="w-4 h-4" />
                  },
                  {
                    value: "report",
                    label: "التقرير",
                    shortLabel: "تقرير",
                    icon: <Activity className="w-4 h-4" />
                  }
                ]}
              />

            <TabsContent value="basic" className="tabs-content-modern">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رمز العينة *</Label>
                  <Input
                    value={formData.sampleCode}
                    onChange={(e) => setFormData({ ...formData, sampleCode: e.target.value })}
                    required
                    disabled={!!laboratory}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>نوع العينة *</Label>
                  <Select
                    value={formData.sampleType}
                    onValueChange={(value) => setFormData({ ...formData, sampleType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع العينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>جامع العينة *</Label>
                  <Select
                    value={formData.collector}
                    onValueChange={(value) => setFormData({ ...formData, collector: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر جامع العينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectors.map((collector) => (
                        <SelectItem key={collector} value={collector}>
                          {collector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>تاريخ جمع العينة *</Label>
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
                  <Label>نوع الفحص *</Label>
                  <Select
                    value={formData.testType}
                    onValueChange={(value) => setFormData({ ...formData, testType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الفحص" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الأولوية</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "urgent" | "normal" | "low") => 
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">عاجل</SelectItem>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="low">منخفض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>فني المختبر</Label>
                  <Input
                    value={formData.labTechnician}
                    onChange={(e) => setFormData({ ...formData, labTechnician: e.target.value })}
                    placeholder="اسم فني المختبر"
                  />
                </div>

                <div className="space-y-2">
                  <Label>تاريخ الاستلام</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right",
                          !formData.receivedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {formData.receivedDate ? (
                          format(formData.receivedDate, "PPP", { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.receivedDate}
                        onSelect={(date) => setFormData({ ...formData, receivedDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="samples" className="tabs-content-modern">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">عدد العينات حسب النوع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>أغنام</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.speciesCounts.sheep}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, sheep: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ماعز</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.speciesCounts.goats}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, goats: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>إبل</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.speciesCounts.camel}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, camel: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>أبقار</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.speciesCounts.cattle}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, cattle: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>خيول</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.speciesCounts.horse}
                        onChange={(e) => setFormData({
                          ...formData,
                          speciesCounts: { ...formData.speciesCounts, horse: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>المجموع</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                        <span className="font-bold text-lg">{getTotalSamples()}</span>
                        <span className="mr-2 text-muted-foreground">عينة</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  تأكد من إدخال العدد الصحيح للعينات لكل نوع من الحيوانات
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="results" className="tabs-content-modern">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">النتائج الإجمالية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الحالات الإيجابية</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.positiveCases}
                        onChange={(e) => setFormData({ ...formData, positiveCases: parseInt(e.target.value) || 0 })}
                        className="border-red-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الحالات السلبية</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.negativeCases}
                        onChange={(e) => setFormData({ ...formData, negativeCases: parseInt(e.target.value) || 0 })}
                        className="border-green-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>نسبة الإيجابية</span>
                      <span className="font-bold">{getPositivePercentage().toFixed(1)}%</span>
                    </div>
                    <Progress value={getPositivePercentage()} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">نتائج تفصيلية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>رقم الحيوان</Label>
                      <Input
                        value={newTestResult.animalId}
                        onChange={(e) => setNewTestResult({ ...newTestResult, animalId: e.target.value })}
                        placeholder="مثال: A001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>نوع الحيوان</Label>
                      <Select
                        value={newTestResult.animalType}
                        onValueChange={(value) => setNewTestResult({ ...newTestResult, animalType: value })}
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
                      <Label>نوع الفحص</Label>
                      <Select
                        value={newTestResult.testType}
                        onValueChange={(value) => setNewTestResult({ ...newTestResult, testType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الفحص" />
                        </SelectTrigger>
                        <SelectContent>
                          {testTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>النتيجة</Label>
                      <Select
                        value={newTestResult.result}
                        onValueChange={(value: "positive" | "negative" | "pending") => 
                          setNewTestResult({ ...newTestResult, result: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">إيجابي</SelectItem>
                          <SelectItem value="negative">سلبي</SelectItem>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ملاحظات</Label>
                    <Input
                      value={newTestResult.notes}
                      onChange={(e) => setNewTestResult({ ...newTestResult, notes: e.target.value })}
                      placeholder="ملاحظات إضافية"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={addTestResult}
                    variant="secondary"
                    className="w-full"
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة نتيجة
                  </Button>

                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    {formData.testResults.length === 0 ? (
                      <p className="text-center text-muted-foreground">لا توجد نتائج مضافة</p>
                    ) : (
                      <div className="space-y-2">
                        {formData.testResults.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{result.animalId}</Badge>
                              <span className="text-sm">{result.testType}</span>
                              {result.result === "positive" && (
                                <Badge variant="danger">إيجابي</Badge>
                              )}
                              {result.result === "negative" && (
                                <Badge variant="default">سلبي</Badge>
                              )}
                              {result.result === "pending" && (
                                <Badge variant="secondary">قيد الانتظار</Badge>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTestResult(result.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="report" className="tabs-content-modern">
              <div className="space-y-2">
                <Label>التوصيات</Label>
                <Textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  placeholder="أدخل التوصيات بناءً على نتائج الفحص"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>ملاحظات عامة</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="أي ملاحظات إضافية عن الفحص"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>تاريخ إكمال الفحص</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right",
                        !formData.completedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {formData.completedDate ? (
                        format(formData.completedDate, "PPP", { locale: ar })
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.completedDate}
                      onSelect={(date) => setFormData({ ...formData, completedDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {formData.positiveCases > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    تم اكتشاف {formData.positiveCases} حالة إيجابية. يجب اتخاذ الإجراءات الوقائية اللازمة.
                  </AlertDescription>
                </Alert>
              )}

              {formData.negativeCases > 0 && formData.positiveCases === 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    جميع النتائج سلبية. الحيوانات في حالة صحية جيدة.
                  </AlertDescription>
                </Alert>
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
          >
            إلغاء
          </Button>
          <LoadingButton 
            type="submit"
            form="laboratory-form"
            variant="default"
            leftIcon={<Activity className="w-4 h-4" />}
          >
            {laboratory ? "حفظ التعديلات" : "إضافة الفحص"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
