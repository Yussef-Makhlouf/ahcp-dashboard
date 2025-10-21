"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, Download, Users, UserCheck, MapPin, Phone, Search, X } from "lucide-react";
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
import { ClientDialog } from "./components/client-dialog";

import { clientsApi } from "@/lib/api/clients";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { ProtectedButton } from "@/components/ui/protected-button";
import { ImportExportManager } from "@/components/import-export";
import { ResponsiveActions, createActions } from "@/components/ui/responsive-actions";
import { apiConfig } from "@/lib/api-config";

export default function ClientsPage() {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();
  const queryClient = useQueryClient();
  const { checkPermission, isAdmin } = usePermissions();

  // استخدام React Query لجلب البيانات من API مع الترقيم والبحث
  const { data: clientsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['clients', currentPage, pageSize, searchTerm],
    queryFn: () => clientsApi.getList({
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined,
    }),
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

  // Handle bulk delete selected records
  const handleBulkDelete = async (selectedRows: Client[]) => {
    console.log('🗑️ handleBulkDelete called with:', selectedRows.length, 'rows');
    try {
      const ids = selectedRows.map(row => row._id || row.id || row.nationalId || row.national_id).filter((id): id is string => id !== undefined);
      console.log('🔍 IDs to delete:', ids);
      const result = await clientsApi.bulkDelete(ids);
      console.log('✅ Bulk delete result:', result);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients-stats'] });
      toast.success(`تم حذف ${result.deletedCount || ids.length} سجل بنجاح`);
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      toast.error('فشل في حذف السجلات المحددة');
    }
  };

  // Handle delete all records
  const handleDeleteAll = async () => {
    try {
      const result = await clientsApi.deleteAll();
      console.log('✅ Delete all result:', result);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients-stats'] });
      toast.success(`تم حذف ${result.deletedCount || 'جميع'} السجلات بنجاح`);
    } catch (error) {
      console.error('❌ Delete all failed:', error);
      toast.error('فشل في حذف جميع السجلات');
    }
  };

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
  const totalCount = clientsResponse?.total || 0;
  const totalPages = clientsResponse?.totalPages || 0;

  const columns: ColumnDef<Client>[] = [
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
        const client = row.original;
        // Priority: birthDateFromForms (from other forms) > birthDate (from client form)
        const birthDate = client.birthDateFromForms || client.birthDate || client.birth_date;
        const source = client.birthDateFromForms ? "من النماذج" : "من المربي";
        
        return (
          <div className="text-sm">
            {birthDate ? (
              <div>
                <div className="font-medium">{formatDate(birthDate)}</div>
                <div className="text-xs text-muted-foreground">{source}</div>
              </div>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "servicesReceived",
      header: "الخدمات المستلمة",
      cell: ({ row }) => {
        const client = row.original;
        // Priority: servicesReceived (from aggregation) > availableServices (from client form)
        const services = client.servicesReceived || client.availableServices || client.available_services || [];
        
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
        
        // Get unique services
        const uniqueServices = [...new Set(services)];
        
        return (
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1">
              {uniqueServices?.slice(0, 2).map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {serviceNames[service] || service}
                </Badge>
              ))}
              {uniqueServices && uniqueServices.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{uniqueServices.length - 2}
                </Badge>
              )}
              {(!uniqueServices || uniqueServices.length === 0) && (
                <span className="text-xs text-muted-foreground">لا توجد خدمات</span>
              )}
            </div>
            {client.totalVisits && client.totalVisits > 0 && (
              <div className="text-xs text-muted-foreground">
                {client.totalVisits} زيارة
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "lastServiceDate",
      header: "آخر خدمة",
      cell: ({ row }) => {
        const client = row.original;
        const lastServiceDate = client.lastServiceDate;
        
        return (
          <div className="text-sm">
            {lastServiceDate ? (
              <div>
                <div className="font-medium">{formatDate(lastServiceDate)}</div>
                <div className="text-xs text-muted-foreground">آخر زيارة</div>
              </div>
            ) : (
              <span className="text-muted-foreground">-</span>
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
                const clientId = row.original._id || row.original.id || row.original.nationalId;
                if (clientId) {
                  router.push(`/clients/${clientId}`);
                } else {
                  alert('لا يمكن العثور على معرف العميل');
                }
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
          <ResponsiveActions
            primaryAction={checkPermission({ module: 'clients', action: 'create' }) ? 
              createActions.add(handleAddNewClient, "إضافة مربي جديد") : undefined
            }
            actions={[]}
            maxVisibleActions={2}
          />
          
          {/* ImportExportManager - Now visible for file upload */}
          <ImportExportManager
            exportEndpoint={apiConfig.endpoints.clients.export}
            importEndpoint={apiConfig.endpoints.clients.import}
            templateEndpoint={apiConfig.endpoints.clients.template}
            title="العملاء"
            queryKey="clients"
            acceptedFormats={[".csv", ".xlsx"]}
            maxFileSize={10}
            onImportSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['clients'] });
              queryClient.invalidateQueries({ queryKey: ['clients-stats'] });
            }}
            onExportSuccess={() => {
              toast.success('تم تصدير البيانات بنجاح');
            }}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['clients'] });
              queryClient.invalidateQueries({ queryKey: ['clients-stats'] });
            }}
          />
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
          enableBulkDelete={true}
          onDeleteSelected={handleBulkDelete}
          onDeleteAll={handleDeleteAll}
          module="clients"
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          showPagination={true}
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
