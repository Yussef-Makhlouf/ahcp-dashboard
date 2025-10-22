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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Hash,
  Plus,
  Edit,
  Trash2,
  MapPin,
  
} from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { holdingCodesApi, HoldingCode } from "@/lib/api/holding-codes";
import { villagesApi } from "@/lib/api/villages";

interface Village {
  _id: string;
  nameArabic: string;
  nameEnglish: string;
}

interface HoldingCodeManagementProps {
  onRefresh?: () => void;
}

export function HoldingCodeManagement({ onRefresh }: HoldingCodeManagementProps) {
  const [holdingCodes, setHoldingCodes] = useState<HoldingCode[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<HoldingCode | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [selectedVillage, setSelectedVillage] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const [codeForm, setCodeForm] = useState({
    code: "",
    village: "",
    description: "",
    isActive: true
  });

  // Load data
  useEffect(() => {
    loadHoldingCodes();
    loadVillages();
  }, [currentPage, pageSize, selectedVillage, activeFilter]);

  const loadHoldingCodes = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: pageSize
      };
      
      if (selectedVillage && selectedVillage !== "all") params.village = selectedVillage;
      if (activeFilter !== "all") params.active = activeFilter === "active";

      const response = await holdingCodesApi.getList(params);
      if (response.success) {
        setHoldingCodes(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
          setTotalCount(response.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error loading holding codes:', error);
      toast.error('حدث خطأ أثناء تحميل رموز الحيازة');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVillages = async () => {
    try {
      const response = await villagesApi.getList({});
      if (response.success) {
        setVillages(response.data || []);
      }
    } catch (error) {
      console.error('Error loading villages:', error);
    }
  };

  const handleCreateCode = async () => {
    if (!codeForm.code || !codeForm.village) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      const formData: any = {
        code: codeForm.code.trim().toUpperCase(),
        village: codeForm.village,
        description: codeForm.description || `رمز حيازة ${codeForm.code}`,
        isActive: codeForm.isActive
      };

      let response;
      if (editingCode) {
        response = await holdingCodesApi.update(editingCode._id!, formData);
      } else {
        response = await holdingCodesApi.create(formData);
      }

      if (response.success) {
        toast.success(editingCode ? "تم تحديث رمز الحيازة بنجاح" : "تم إنشاء رمز الحيازة بنجاح");
        setDialogOpen(false);
        resetForm();
        loadHoldingCodes();
        onRefresh?.();
      } else {
        toast.error(response.message || "حدث خطأ أثناء حفظ رمز الحيازة");
      }
    } catch (error: any) {
      console.error('Holding code error:', error);
      
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes('already has a holding code')) {
          toast.error(`القرية المحددة لديها رمز حياة مسبقاً. لا يمكن إضافة أكثر من رمز حياة واحد لنفس القرية.`);
        } else if (errorMessage.includes('already exists')) {
          toast.error(`رمز الحياة موجود مسبقاً. يرجى استخدام رمز آخر.`);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("حدث خطأ أثناء حفظ رمز الحيازة");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCode = (code: HoldingCode) => {
    setEditingCode(code);
    setCodeForm({
      code: code.code,
      village: code.village,
      description: code.description || "",
      isActive: code.isActive !== false
    });
    setDialogOpen(true);
  };



  const handleDeleteCode = async (codeId: string) => {
    if (!confirm("هل أنت متأكد من حذف رمز الحيازة؟ قد يؤثر هذا على السجلات المرتبطة به.")) {
      return;
    }

    try {
      const response = await holdingCodesApi.delete(codeId);
      if (response.success) {
        toast.success("تم حذف رمز الحيازة بنجاح");
        loadHoldingCodes();
        onRefresh?.();
      } else {
        toast.error(response.message || "حدث خطأ أثناء حذف رمز الحيازة");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف رمز الحيازة");
    }
  };

  const resetForm = () => {
    setCodeForm({
      code: "",
      village: "",
      description: "",
      isActive: true
    });
    setEditingCode(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Table columns
  const columns: ColumnDef<HoldingCode>[] = [
    {
      accessorKey: "code",
      header: "رمز الحيازة",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-blue-500" />
          <span className="font-mono font-medium">{row.getValue("code")}</span>
        </div>
      ),
    },
    {
      accessorKey: "village",
      header: "القرية",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-500" />
          <span>{row.getValue("village")}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "الوصف",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <span className="text-sm text-gray-600">
            {description || "لا يوجد وصف"}
          </span>
        );
      },
    },


    {
      accessorKey: "createdAt",
      header: "تاريخ الإنشاء",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return date ? new Date(date).toLocaleDateString("ar-EG") : "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const code = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditCode(code)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
   
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteCode(code._id!)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                إدارة رموز الحيازة
              </CardTitle>
              <CardDescription>
                إدارة رموز الحيازة المرتبطة بالقرى والمربين
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة رمز حيازة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label>تصفية حسب القرية</Label>
              <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع القرى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع القرى</SelectItem>
                  {villages.map((village) => (
                    <SelectItem key={village._id} value={village.nameArabic}>
                      {village.nameArabic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
       
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={holdingCodes}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              <Hash className="h-5 w-5" />
              {editingCode ? "تعديل رمز الحيازة" : "إضافة رمز حيازة جديد"}
            </DialogTitle>
            <DialogDescription className="text-right">
              {editingCode ? "تعديل بيانات رمز الحيازة" : "أدخل بيانات رمز الحيازة الجديد"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-right">رمز الحيازة *</Label>
                <Input
                  id="code"
                  value={codeForm.code}
                  onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: HC001"
                  className="text-left font-mono"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground text-right">
                  رمز فريد للحيازة (أحرف وأرقام)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="village" className="text-right">القرية *</Label>
                <Select value={codeForm.village} onValueChange={(value) => setCodeForm({ ...codeForm, village: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القرية" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village._id} value={village.nameArabic}>
                        {village.nameArabic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">الوصف</Label>
              <Textarea
                id="description"
                value={codeForm.description}
                onChange={(e) => setCodeForm({ ...codeForm, description: e.target.value })}
                placeholder="وصف اختياري لرمز الحيازة"
                className="text-right"
                rows={3}
              />
            </div>

       
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateCode} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingCode ? "جاري التحديث..." : "جاري الإنشاء..."}
                </>
              ) : (
                <>
                  {editingCode ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      تحديث
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      إنشاء
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
