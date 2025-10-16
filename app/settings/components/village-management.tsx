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
  MapPin,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { villagesApi } from "@/lib/api/villages";

// Types
interface Village {
  _id: string;
  serialNumber: string;
  sector: string;
  nameArabic: string;
  nameEnglish: string;
  clientCount?: number;
  createdAt: string;
}

interface VillageManagementProps {
  onRefresh?: () => void;
}

export function VillageManagement({ onRefresh }: VillageManagementProps) {
  const [villages, setVillages] = useState<Village[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [villageForm, setVillageForm] = useState({
    serialNumber: "",
    sector: "",
    nameArabic: "",
    nameEnglish: ""
  });

  // Load data
  useEffect(() => {
    loadVillages();
  }, [currentPage, pageSize]);

  const loadVillages = async () => {
    try {
      setIsLoading(true);
      const response = await villagesApi.getList({
        page: currentPage,
        limit: pageSize
      });
      if (response.success) {
        setVillages(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
          setTotalCount(response.pagination.total);
        }
      }
    } catch (error) {
      console.error('Error loading villages:', error);
      toast.error('حدث خطأ أثناء تحميل القرى');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVillage = async () => {
    if (!villageForm.serialNumber || !villageForm.sector || !villageForm.nameArabic || !villageForm.nameEnglish) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      const formData: any = {
        ...villageForm
      };

      let response;
      if (editingVillage) {
        response = await villagesApi.update(editingVillage._id, formData);
      } else {
        response = await villagesApi.create(formData);
      }

      if (response.success) {
        toast.success(editingVillage ? "تم تحديث القرية بنجاح" : "تم إنشاء القرية بنجاح");
        setDialogOpen(false);
        resetForm();
        loadVillages();
        onRefresh?.();
      } else {
        toast.error(response.message || "حدث خطأ أثناء حفظ القرية");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ القرية");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditVillage = (village: Village) => {
    setEditingVillage(village);
    setVillageForm({
      serialNumber: village.serialNumber,
      sector: village.sector,
      nameArabic: village.nameArabic,
      nameEnglish: village.nameEnglish
    });
    setDialogOpen(true);
  };


  const handleDeleteVillage = async (villageId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القرية؟")) {
      return;
    }

    try {
      const response = await villagesApi.delete(villageId);

      if (response.success) {
        toast.success(response.message || "تم حذف القرية بنجاح");
        loadVillages();
        onRefresh?.();
      } else {
        toast.error(response.message || "حدث خطأ أثناء حذف القرية");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف القرية");
    }
  };

  // Handle bulk delete selected villages
  const handleBulkDelete = async (selectedVillages: Village[]) => {
    if (!confirm(`هل أنت متأكد من حذف ${selectedVillages.length} قرية محدد؟`)) {
      return;
    }

    try {
      setIsLoading(true);
      const deletePromises = selectedVillages.map(village => 
        villagesApi.delete(village._id)
      );
      
      await Promise.all(deletePromises);
      
      toast.success(`تم حذف ${selectedVillages.length} قرية بنجاح`);
      loadVillages();
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting villages:', error);
      toast.error('حدث خطأ أثناء حذف القرى');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete all villages
  const handleDeleteAll = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع القرى؟ هذا الإجراء لا يمكن التراجع عنه.")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await villagesApi.getList({ page: 1, limit: 1000 });
      
      if (response.success && response.data) {
        const deletePromises = response.data.map(village => 
          villagesApi.delete(village._id)
        );
        
        await Promise.all(deletePromises);
        
        toast.success("تم حذف جميع القرى بنجاح");
        loadVillages();
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error deleting all villages:', error);
      toast.error('حدث خطأ أثناء حذف جميع القرى');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setVillageForm({
      serialNumber: "",
      sector: "",
      nameArabic: "",
      nameEnglish: ""
    });
    setEditingVillage(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Table columns
  const columns: ColumnDef<Village>[] = [
    {
      accessorKey: "serialNumber",
      header: "الرقم التسلسلي",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-right font-mono">
          {row.getValue("serialNumber")}
        </Badge>
      ),
    },
    {
      accessorKey: "nameArabic",
      header: "اسم القرية (عربي)",
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">{row.getValue("nameArabic")}</div>
        </div>
      ),
    },
    {
      accessorKey: "nameEnglish",
      header: "اسم القرية (إنجليزي)",
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">{row.getValue("nameEnglish")}</div>
        </div>
      ),
    },
    {
      accessorKey: "sector",
      header: "القطاع",
      cell: ({ row }) => {
        const sector = row.getValue("sector") as string;
        return (
          <div className="text-right">
            {sector || "غير محدد"}
          </div>
        );
      },
    },

    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const village = row.original;
        return (
          <div className="flex items-center gap-2 justify-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditVillage(village)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteVillage(village._id)}
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
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة قرية جديدة
          </Button>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold">إدارة القرى</h2>
          <p className="text-muted-foreground">إنشاء وإدارة قرى النظام</p>
        </div>
      </div>

      {/* Villages Table */}
      <Card dir="rtl">
        <CardHeader>
          <CardTitle className="text-right">قائمة القرى</CardTitle>
          <CardDescription className="text-right">
            إدارة جميع قرى النظام وعملائها
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={villages}
              searchKey="nameArabic"
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              showPagination={true}
              enableBulkDelete={true}
              onDeleteSelected={handleBulkDelete}
              onDeleteAll={handleDeleteAll}
              module="clients"
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Village Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              <MapPin className="h-5 w-5" />
              {editingVillage ? "تعديل القرية" : "إضافة قرية جديدة"}
            </DialogTitle>
            <DialogDescription className="text-right">
              {editingVillage ? "تعديل بيانات القرية" : "أدخل بيانات القرية الجديدة"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="text-right">الرقم التسلسلي *</Label>
                <Input
                  id="serialNumber"
                  value={villageForm.serialNumber}
                  onChange={(e) => setVillageForm({ ...villageForm, serialNumber: e.target.value.toUpperCase() })}
                  placeholder="مثال: V001"
                  className="text-left font-mono"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground text-right">
                  رقم تسلسلي فريد للقرية
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector" className="text-right">القطاع *</Label>
                <Input
                  id="sector"
                  value={villageForm.sector}
                  onChange={(e) => setVillageForm({ ...villageForm, sector: e.target.value })}
                  placeholder="أدخل اسم القطاع"
                  className="text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameArabic" className="text-right">اسم القرية (عربي) *</Label>
                <Input
                  id="nameArabic"
                  value={villageForm.nameArabic}
                  onChange={(e) => setVillageForm({ ...villageForm, nameArabic: e.target.value })}
                  placeholder="أدخل اسم القرية بالعربية"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameEnglish" className="m-auto ">اسم القرية (إنجليزي) *</Label>
                <Input
                  id="nameEnglish"
                  value={villageForm.nameEnglish}
                  onChange={(e) => setVillageForm({ ...villageForm, nameEnglish: e.target.value })}
                  placeholder="Enter village name in English"
                  className="text-left"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateVillage} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingVillage ? "جاري التحديث..." : "جاري الإنشاء..."}
                </>
              ) : (
                <>
                  {editingVillage ? (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      تحديث القرية
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      إنشاء القرية
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
