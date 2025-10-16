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
  Users,
  ToggleLeft,
  ToggleRight,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { api } from "@/lib/api/base-api";

// Types
interface Village {
  _id: string;
  name: string;
  nameEn?: string;
  code: string;
  region?: string;
  description?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  population?: number;
  isActive: boolean;
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

  const [villageForm, setVillageForm] = useState({
    name: "",
    nameEn: "",
    code: "",
    region: "",
    description: "",
    coordinates: {
      latitude: "",
      longitude: ""
    },
    population: ""
  });

  // Load data
  useEffect(() => {
    loadVillages();
  }, []);

  const loadVillages = async () => {
    try {
      const data = await api.get('/villages');
      if ((data as any)?.success) {
        setVillages((data as any).data?.villages || []);
      }
    } catch (error) {
      console.error('Error loading villages:', error);
      toast.error('حدث خطأ أثناء تحميل القرى');
    }
  };

  const handleCreateVillage = async () => {
    if (!villageForm.name || !villageForm.code) {
      toast.error("يرجى ملء الحقول المطلوبة (الاسم والرمز)");
      return;
    }

    setIsLoading(true);
    try {
      const formData: any = {
        ...villageForm,
        population: villageForm.population ? parseInt(villageForm.population) : undefined
      };

      // Add coordinates only if they have values
      if (villageForm.coordinates.latitude || villageForm.coordinates.longitude) {
        formData.coordinates = {
          latitude: villageForm.coordinates.latitude ? parseFloat(villageForm.coordinates.latitude) : undefined,
          longitude: villageForm.coordinates.longitude ? parseFloat(villageForm.coordinates.longitude) : undefined
        };
      }

      let response;
      if (editingVillage) {
        response = await api.put(`/villages/${editingVillage._id}`, formData);
      } else {
        response = await api.post('/villages', formData);
      }

      if ((response as any)?.success) {
        toast.success(editingVillage ? "تم تحديث القرية بنجاح" : "تم إنشاء القرية بنجاح");
        setDialogOpen(false);
        resetForm();
        loadVillages();
        onRefresh?.();
      } else {
        toast.error((response as any)?.message || "حدث خطأ أثناء حفظ القرية");
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
      name: village.name,
      nameEn: village.nameEn || "",
      code: village.code,
      region: village.region || "",
      description: village.description || "",
      coordinates: {
        latitude: village.coordinates?.latitude?.toString() || "",
        longitude: village.coordinates?.longitude?.toString() || ""
      },
      population: village.population?.toString() || ""
    });
    setDialogOpen(true);
  };

  const handleToggleStatus = async (villageId: string) => {
    try {
      const response = await api.put(`/villages/${villageId}/toggle-status`);

      if ((response as any)?.success) {
        toast.success("تم تحديث حالة القرية بنجاح");
        loadVillages();
      } else {
        toast.error("حدث خطأ أثناء تحديث حالة القرية");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة القرية");
    }
  };

  const handleDeleteVillage = async (villageId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القرية؟")) {
      return;
    }

    try {
      const response = await api.delete(`/villages/${villageId}`);

      if ((response as any)?.success) {
        toast.success("تم حذف القرية بنجاح");
        loadVillages();
      } else {
        toast.error((response as any)?.message || "حدث خطأ أثناء حذف القرية");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف القرية");
    }
  };

  const resetForm = () => {
    setVillageForm({
      name: "",
      nameEn: "",
      code: "",
      region: "",
      description: "",
      coordinates: {
        latitude: "",
        longitude: ""
      },
      population: ""
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
      accessorKey: "name",
      header: "اسم القرية",
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
      accessorKey: "region",
      header: "المنطقة",
      cell: ({ row }) => {
        const region = row.getValue("region") as string;
        return (
          <div className="text-right">
            {region || "غير محدد"}
          </div>
        );
      },
    },
    {
      accessorKey: "population",
      header: "عدد السكان",
      cell: ({ row }) => {
        const population = row.getValue("population") as number;
        return (
          <div className="text-right">
            {population ? population.toLocaleString('ar-SA') : "غير محدد"}
          </div>
        );
      },
    },
    {
      id: "clientCount",
      header: "العملاء",
      cell: ({ row }) => {
        const village = row.original;
        return (
          <div className="text-right flex items-center gap-2 justify-end">
            <Users className="h-4 w-4" />
            <span className="text-sm">
              {village.clientCount || 0}
            </span>
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
        const village = row.original;
        return (
          <div className="flex items-center gap-2 justify-end">
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
              onClick={() => handleToggleStatus(village._id)}
            >
              {village.isActive ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
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
        <div className="text-right">
          <h2 className="text-2xl font-bold">إدارة القرى</h2>
          <p className="text-muted-foreground">إنشاء وإدارة قرى النظام</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة قرية جديدة
          </Button>
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
          <DataTable
            columns={columns}
            data={villages}
            searchKey="name"
          />
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
                <Label htmlFor="name" className="text-right">اسم القرية (عربي) *</Label>
                <Input
                  id="name"
                  value={villageForm.name}
                  onChange={(e) => setVillageForm({ ...villageForm, name: e.target.value })}
                  placeholder="أدخل اسم القرية بالعربية"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameEn" className="text-right">اسم القرية (إنجليزي)</Label>
                <Input
                  id="nameEn"
                  value={villageForm.nameEn}
                  onChange={(e) => setVillageForm({ ...villageForm, nameEn: e.target.value })}
                  placeholder="Enter village name in English"
                  className="text-left"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-right">رمز القرية *</Label>
                <Input
                  id="code"
                  value={villageForm.code}
                  onChange={(e) => setVillageForm({ ...villageForm, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: VILLAGE_001"
                  className="text-left font-mono"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground text-right">
                  رمز فريد للقرية (أحرف إنجليزية كبيرة وأرقام فقط)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region" className="text-right">المنطقة</Label>
                <Input
                  id="region"
                  value={villageForm.region}
                  onChange={(e) => setVillageForm({ ...villageForm, region: e.target.value })}
                  placeholder="أدخل اسم المنطقة أو المحافظة"
                  className="text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">الوصف</Label>
              <Textarea
                id="description"
                value={villageForm.description}
                onChange={(e) => setVillageForm({ ...villageForm, description: e.target.value })}
                placeholder="أدخل وصف القرية ومعلومات إضافية"
                className="text-right"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-right">خط العرض</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={villageForm.coordinates.latitude}
                  onChange={(e) => setVillageForm({ 
                    ...villageForm, 
                    coordinates: { ...villageForm.coordinates, latitude: e.target.value }
                  })}
                  placeholder="مثال: 24.7136"
                  className="text-left"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-right">خط الطول</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={villageForm.coordinates.longitude}
                  onChange={(e) => setVillageForm({ 
                    ...villageForm, 
                    coordinates: { ...villageForm.coordinates, longitude: e.target.value }
                  })}
                  placeholder="مثال: 46.6753"
                  className="text-left"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="population" className="text-right">عدد السكان التقديري</Label>
              <Input
                id="population"
                type="number"
                value={villageForm.population}
                onChange={(e) => setVillageForm({ ...villageForm, population: e.target.value })}
                placeholder="أدخل عدد السكان التقديري"
                className="text-right"
              />
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
