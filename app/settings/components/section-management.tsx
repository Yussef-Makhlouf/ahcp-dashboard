"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Users,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { api } from "@/lib/api/base-api";

// Types
interface Section {
  _id: string;
  name: string;
  nameEn?: string;
  code: string;
  description?: string;
  isActive: boolean;
  supervisorCount?: number;
  workerCount?: number;
  totalUsers?: number;
  createdAt: string;
}

interface SectionManagementProps {
  onRefresh?: () => void;
}

export function SectionManagement({ onRefresh }: SectionManagementProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const [sectionForm, setSectionForm] = useState({
    name: "",
    nameEn: "",
    code: "",
    description: ""
  });

  // Load data
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const data = await api.get('/sections');
      if ((data as any)?.success) {
        setSections((data as any).data?.sections || []);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('حدث خطأ أثناء تحميل الأقسام');
    }
  };

  const handleCreateSection = async () => {
    if (!sectionForm.name || !sectionForm.code) {
      toast.error("يرجى ملء الحقول المطلوبة (الاسم والرمز)");
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (editingSection) {
        response = await api.put(`/sections/${editingSection._id}`, sectionForm);
      } else {
        response = await api.post('/sections', sectionForm);
      }

      if ((response as any)?.success) {
        toast.success(editingSection ? "تم تحديث القسم بنجاح" : "تم إنشاء القسم بنجاح");
        setDialogOpen(false);
        resetForm();
        loadSections();
        onRefresh?.();
      } else {
        toast.error((response as any)?.message || "حدث خطأ أثناء حفظ القسم");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ القسم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setSectionForm({
      name: section.name,
      nameEn: section.nameEn || "",
      code: section.code,
      description: section.description || ""
    });
    setDialogOpen(true);
  };

  const handleToggleStatus = async (sectionId: string) => {
    try {
      const response = await api.put(`/sections/${sectionId}/toggle-status`);

      if ((response as any)?.success) {
        toast.success("تم تحديث حالة القسم بنجاح");
        loadSections();
      } else {
        toast.error("حدث خطأ أثناء تحديث حالة القسم");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة القسم");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) {
      return;
    }

    try {
      const response = await api.delete(`/sections/${sectionId}`);

      if ((response as any)?.success) {
        toast.success("تم حذف القسم بنجاح");
        loadSections();
      } else {
        toast.error((response as any)?.message || "حدث خطأ أثناء حذف القسم");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف القسم");
    }
  };

  const resetForm = () => {
    setSectionForm({
      name: "",
      nameEn: "",
      code: "",
      description: ""
    });
    setEditingSection(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSeedSections = async () => {
    setIsSeeding(true);
    try {
      const response = await api.post('/seed/sections');

      if ((response as any)?.success) {
        toast.success((response as any).message);
        loadSections();
        onRefresh?.();
      } else {
        toast.error((response as any)?.message || "حدث خطأ أثناء إنشاء الأقسام");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء الأقسام");
    } finally {
      setIsSeeding(false);
    }
  };

  // Table columns
  const columns: ColumnDef<Section>[] = [
    {
      accessorKey: "name",
      header: "اسم القسم",
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">{row.getValue("name")}</div>
          {row.original.nameEn && (
            <div className="text-sm text-muted-foreground">{row.original.nameEn}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: "الرمز",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-right font-mono">
          {row.getValue("code")}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: "الوصف",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="text-right max-w-[200px] truncate">
            {description || "لا يوجد وصف"}
          </div>
        );
      },
    },
    {
      id: "userCounts",
      header: "المستخدمين",
      cell: ({ row }) => {
        const section = row.original;
        return (
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                {(section.supervisorCount || 0) + (section.workerCount || 0)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {section.supervisorCount || 0} مشرف، {section.workerCount || 0} عامل
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "secondary" : "secondary"} className="text-right">
            {isActive ? "نشط" : "غير نشط"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const section = row.original;
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection(section)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleStatus(section._id)}
            >
              {section.isActive ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteSection(section._id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 ">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div className="text-right">
          <h2 className="text-2xl font-bold">إدارة الأقسام</h2>
          <p className="text-muted-foreground">إنشاء وإدارة أقسام النظام</p>
        </div>
        <div className="flex gap-2">
          {sections.length === 0 && (
            <Button 
              onClick={handleSeedSections} 
              disabled={isSeeding}
              variant="outline"
            >
              {isSeeding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Building className="mr-2 h-4 w-4" />
                  إنشاء الأقسام الأساسية
                </>
              )}
            </Button>
          )}
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة قسم جديد
          </Button>
        </div>
      </div>

      {/* Sections Table */}
      <Card dir="rtl">
        <CardHeader>
          <CardTitle className="text-right">قائمة الأقسام</CardTitle>
          <CardDescription className="text-right">
            إدارة جميع أقسام النظام ومستخدميها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={sections}
            searchKey="name"
          />
        </CardContent>
      </Card>

      {/* Create/Edit Section Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              <Building className="h-5 w-5" />
              {editingSection ? "تعديل القسم" : "إضافة قسم جديد"}
            </DialogTitle>
            <DialogDescription className="text-right">
              {editingSection ? "تعديل بيانات القسم" : "أدخل بيانات القسم الجديد"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right">اسم القسم (عربي) *</Label>
              <Input
                id="name"
                value={sectionForm.name}
                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                placeholder="أدخل اسم القسم بالعربية"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameEn" className="text-right">اسم القسم (إنجليزي)</Label>
              <Input
                id="nameEn"
                value={sectionForm.nameEn}
                onChange={(e) => setSectionForm({ ...sectionForm, nameEn: e.target.value })}
                placeholder="Enter section name in English"
                className="text-left"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-right">رمز القسم *</Label>
              <Input
                id="code"
                value={sectionForm.code}
                onChange={(e) => setSectionForm({ ...sectionForm, code: e.target.value.toUpperCase() })}
                placeholder="مثال: VET, FARM, LAB"
                className="text-left font-mono"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground text-right">
                رمز فريد للقسم (أحرف إنجليزية كبيرة وأرقام فقط)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">الوصف</Label>
              <Textarea
                id="description"
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                placeholder="أدخل وصف القسم ومهامه"
                className="text-right"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateSection} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingSection ? "جاري التحديث..." : "جاري الإنشاء..."}
                </>
              ) : (
                <>
                  {editingSection ? (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      تحديث القسم
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      إنشاء القسم
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
