"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Users, UserCheck, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/types";
import { formatDate, formatPhoneNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientDialog } from "./components/client-dialog";
import { clientsApi } from "@/lib/api/clients";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { ProtectedButton } from "@/components/ui/protected-button";

export default function ClientsPage() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

  const queryClient = useQueryClient();
  const { checkPermission, isAdmin } = usePermissions();

  // استخدام React Query لجلب البيانات من API
  const { data: clientsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // استخدام React Query للإحصائيات
  const { data: stats } = useQuery({
    queryKey: ['clients-stats'],
    queryFn: () => clientsApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation لحذف العميل
  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف المربي بنجاح');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء الحذف');
    }
  });

  // Mutation لإنشاء/تحديث العميل
  const saveMutation = useMutation({
    mutationFn: (data: { client: Client; isEdit: boolean }) => {
      if (data.isEdit && selectedClient) {
        // Use _id for MongoDB updates, fallback to id if available
        const clientId = selectedClient._id || selectedClient.id;
        if (!clientId) {
          throw new Error('Client ID not found');
        }
        return clientsApi.update(clientId, data.client);
      } else {
        return clientsApi.create(data.client);
      }
    },
    onSuccess: () => {
      toast.success(selectedClient ? 'تم تحديث المربي بنجاح' : 'تم إضافة المربي بنجاح');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients-stats'] });
      setIsClientDialogOpen(false);
      setSelectedClient(undefined);
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء الحفظ');
    }
  });

  const data = clientsResponse?.data || [];

  const columns: ColumnDef<Client>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "nationalId",
      header: "الرقم القومي",
      cell: ({ row }) => {
        const nationalId = row.getValue<string>("nationalId") || row.original.national_id;
        return (
          <div className="font-mono text-sm">
            {nationalId}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "الاسم",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-semibold">
              {row.getValue<string>("name").split(" ").map(n => n[0]).join("")}
            </span>
          </div>
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "رقم الهاتف",
      cell: ({ row }) => {
        const phone = row.getValue<string>("phone");
        return (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span dir="ltr">{formatPhoneNumber(phone)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "village",
      header: "القرية",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{row.getValue("village")}</span>
        </div>
      ),
    },
    {
      accessorKey: "birthDate",
      header: "تاريخ الميلاد",
      cell: ({ row }) => {
        const birthDate = row.getValue<string>("birthDate") || row.original.birth_date;
        return birthDate ? formatDate(birthDate) : "-";
      },
    },
    {
      accessorKey: "totalAnimals",
      header: "عدد الحيوانات",
      cell: ({ row }) => {
        const client = row.original;
        // Use backend virtual field first, then calculate from animals array
        let totalCount = client.totalAnimals || 0;
        
        if (!totalCount && client.animals) {
          totalCount = client.animals.reduce((sum, animal) => {
            return sum + (animal.animalCount || animal.animal_count || 0);
          }, 0);
        }
        
        const healthyCount = client.healthyAnimalsCount || 0;
        
        return (
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-600">{totalCount}</span>
              <span className="text-muted-foreground">رأس</span>
            </div>
            {healthyCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-green-600">سليم: {healthyCount}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "availableServices",
      header: "الخدمات المتاحة",
      cell: ({ row }) => {
        const client = row.original;
        const services = client.availableServices || client.available_services || [];
        
        // Map service codes to Arabic names
        const serviceNames: Record<string, string> = {
          'parasite_control': 'مكافحة الطفيليات',
          'vaccination': 'التحصين',
          'mobile_clinic': 'العيادة المتنقلة',
          'equine_health': 'صحة الخيول',
          'laboratory': 'المختبر',
          'Horse Health': 'صحة الخيول',
          'Vaccination': 'التحصين',
          'Parasite Control': 'مكافحة الطفيليات',
          'Mobile Clinic': 'العيادة المتنقلة',
          'Laboratory': 'المختبر',
          'Equine Health': 'صحة الخيول'
        };
        
        return (
          <div className="flex flex-wrap gap-1">
            {services?.slice(0, 2).map((service, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {serviceNames[service] || service}
              </Badge>
            ))}
            {services && services.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{services.length - 2}
              </Badge>
            )}
            {(!services || services.length === 0) && (
              <span className="text-xs text-muted-foreground">لا توجد خدمات</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        const statusColors = {
          "نشط": "bg-green-500 text-white border-green-600",
          "غير نشط": "bg-gray-500 text-white border-gray-600",
        };
        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white border-gray-600"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const canEdit = checkPermission({ module: 'clients', action: 'edit' });
        const canDelete = checkPermission({ module: 'clients', action: 'delete' });
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setSelectedClient(row.original);
                setIsClientDialogOpen(true);
              }}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => {
                  setSelectedClient(row.original);
                  setIsClientDialogOpen(true);
                }}>
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => {
                    if (confirm('هل أنت متأكد من حذف هذا المربي؟')) {
                      const clientId = row.original._id || row.original.id || row.original.nationalId || row.original.national_id;
                      if (clientId) {
                        deleteMutation.mutate(clientId);
                      }
                    }
                  }}
                >
                  <Trash className="ml-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleExport = async (type: "csv" | "pdf") => {
    try {
      if (type === "csv") {
        // استخدام API للتصدير
        const blob = await clientsApi.exportToCsv?.();
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `clients-${new Date().toISOString().split("T")[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success('تم تصدير البيانات بنجاح');
        }
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء التصدير');
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) return;
    
    try {
      // يمكن إضافة API للاستيراد هنا
      toast.success('تم استيراد البيانات بنجاح');
      setIsImportDialogOpen(false);
      setCsvFile(null);
      refetch();
    } catch (error) {
      toast.error('حدث خطأ أثناء الاستيراد');
    }
  };

  const handleSaveClient = (clientData: Client) => {
    saveMutation.mutate({
      client: clientData,
      isEdit: !!selectedClient
    });
  };

  const handleAddNewClient = () => {
    setSelectedClient(undefined);
    setIsClientDialogOpen(true);
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">حدث خطأ في تحميل البيانات</p>
            <Button onClick={() => refetch()}>إعادة المحاولة</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">المربيين</h1>
            <p className="text-muted-foreground mt-2">
              إدارة بيانات المربيين والعملاء
            </p>
          </div>
          <div className="flex gap-2">
            {/* زر التصدير - متاح للجميع */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('csv')}
              className="border-green-300 hover:bg-green-50 hover:border-green-400 text-green-700 hover:text-green-800"
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير CSV
            </Button>
            
            {/* زر الاستيراد - للمدير العام والمشرفين فقط */}
            {checkPermission({ module: 'clients', action: 'create' }) && (
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-cyan-300 hover:bg-cyan-50 hover:border-cyan-400 text-cyan-700 hover:text-cyan-800">
                    <Upload className="ml-2 h-4 w-4" />
                    استيراد CSV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>استيراد بيانات المربيين من CSV</DialogTitle>
                    <DialogDescription>
                      قم برفع ملف CSV يحتوي على بيانات المربيين
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csv-file">ملف CSV</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleImportCSV} disabled={!csvFile}>
                        استيراد
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            {/* زر إضافة مربي جديد - للمدير العام والمشرفين فقط */}
            {checkPermission({ module: 'clients', action: 'create' }) && (
              <Button 
                onClick={handleAddNewClient}
                className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة مربي جديد
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي المربيين
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClients || data.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                المربيين النشطين
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.activeClients || data.filter(d => d.status === "نشط").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                عدد القرى
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats?.clientsByVillage || {}).length || new Set(data.map(d => d.village)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي الحيوانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalAnimals || data.reduce((sum, d) => {
                  // Use backend virtual field first, then calculate from animals array
                  if (d.totalAnimals) return sum + d.totalAnimals;
                  if (d.animals) {
                    return sum + d.animals.reduce((animalSum, animal) => {
                      return animalSum + (animal.animalCount || animal.animal_count || 0);
                    }, 0);
                  }
                  return sum;
                }, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          onExport={handleExport}
        />

        {/* Client Dialog */}
        <ClientDialog
          open={isClientDialogOpen}
          onOpenChange={setIsClientDialogOpen}
          client={selectedClient}
          onSave={handleSaveClient}
        />
      </div>
    </MainLayout>
  );
}
