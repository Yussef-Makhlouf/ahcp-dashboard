"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Users, UserCheck, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Owner } from "@/types";
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

interface Client extends Owner {
  village?: string;
  totalAnimals?: number;
  lastVisit?: string;
  status?: "active" | "inactive";
}

// Mock data for clients
const mockClientsData: Client[] = [
  {
    id: "C001",
    name: "إبراهيم محمد",
    birthDate: "1978-01-01",
    phone: "+201011234567",
    village: "قرية النور",
    totalAnimals: 90,
    lastVisit: "2025-09-07",
    status: "active"
  },
  {
    id: "C002",
    name: "أحمد عبدالله",
    birthDate: "1985-05-12",
    phone: "+201015987654",
    village: "قرية السلام",
    totalAnimals: 93,
    lastVisit: "2025-09-08",
    status: "active"
  },
  {
    id: "C003",
    name: "محمود سيد",
    birthDate: "1990-03-20",
    phone: "01098765432",
    village: "قرية الأمل",
    totalAnimals: 57,
    lastVisit: "2025-09-09",
    status: "inactive"
  },
  {
    id: "C004",
    name: "سعيد أحمد",
    birthDate: "1982-07-15",
    phone: "01234567890",
    village: "قرية النور",
    totalAnimals: 138,
    lastVisit: "2025-09-10",
    status: "active"
  },
  {
    id: "C005",
    name: "فاطمة علي",
    birthDate: "1975-11-30",
    phone: "+201555123456",
    village: "قرية الخير",
    totalAnimals: 102,
    lastVisit: "2025-09-11",
    status: "active"
  },
  {
    id: "C006",
    name: "خالد محمد",
    birthDate: "1980-02-15",
    phone: "+201012345678",
    village: "قرية السلام",
    totalAnimals: 92,
    lastVisit: "2025-09-07",
    status: "active"
  }
];

export default function ClientsPage() {
  const [data, setData] = useState(mockClientsData);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

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
      accessorKey: "id",
      header: "رقم الهوية",
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
      cell: ({ row }) => formatDate(row.getValue("birthDate")),
    },
    {
      accessorKey: "totalAnimals",
      header: "عدد الحيوانات",
      cell: ({ row }) => {
        const count = row.getValue<number>("totalAnimals");
        return (
          <div className="text-sm">
            <span className="font-medium">{count || 0}</span>
            <span className="text-muted-foreground"> رأس</span>
          </div>
        );
      },
    },
    {
      accessorKey: "lastVisit",
      header: "آخر زيارة",
      cell: ({ row }) => {
        const date = row.getValue<string>("lastVisit");
        return date ? formatDate(date) : "-";
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status === "active" ? "نشط" : "غير نشط"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
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
              <DropdownMenuItem onClick={() => {
                setSelectedClient(row.original);
                setIsClientDialogOpen(true);
              }}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash className="ml-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleExport = async (type: "csv" | "pdf") => {
    if (type === "csv") {
      // Create CSV content
      const headers = ["رقم الهوية", "الاسم", "رقم الهاتف", "القرية", "تاريخ الميلاد", "عدد الحيوانات"];
      const rows = data.map(client => [
        client.id,
        client.name,
        client.phone,
        client.village || "",
        client.birthDate,
        client.totalAnimals || 0
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
      
      // Add BOM for UTF-8
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clients-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  const handleImportCSV = () => {
    if (!csvFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",");
      
      // Parse CSV and add to data
      const newClients: Client[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",");
          newClients.push({
            id: values[0],
            name: values[1],
            phone: values[2],
            birthDate: values[4],
            village: values[3],
            totalAnimals: parseInt(values[5]) || 0,
            status: "active"
          });
        }
      }
      
      // Check for duplicates
      const existingIds = new Set(data.map(c => c.id));
      const uniqueClients = newClients.filter(c => !existingIds.has(c.id));
      
      if (uniqueClients.length < newClients.length) {
        alert(`تم العثور على ${newClients.length - uniqueClients.length} مربي مكرر وتم تجاهلهم`);
      }
      
      setData([...data, ...uniqueClients]);
      setIsImportDialogOpen(false);
      setCsvFile(null);
    };
    
    reader.readAsText(csvFile);
  };

  const handleSaveClient = (clientData: any) => {
    if (selectedClient) {
      // Update existing client
      setData(data.map(c => c.id === selectedClient.id ? { ...clientData, lastVisit: selectedClient.lastVisit } : c));
    } else {
      // Add new client
      setData([...data, { ...clientData, lastVisit: new Date().toISOString().split("T")[0] }]);
    }
    setSelectedClient(undefined);
  };

  const handleAddNewClient = () => {
    setSelectedClient(undefined);
    setIsClientDialogOpen(true);
  };

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
            <Button 
              onClick={handleAddNewClient}
              className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة مربي جديد
            </Button>
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
              <div className="text-2xl font-bold">{data.length}</div>
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
                {data.filter(d => d.status === "active").length}
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
                {new Set(data.map(d => d.village)).size}
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
                {data.reduce((sum, d) => sum + (d.totalAnimals || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data}
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
