"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Package, 
  AlertTriangle, 
  TrendingDown,
  ShoppingCart,
  Archive,
  BarChart3,
  Filter,
  Download,
  Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Eye, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InventoryDialog } from "./components/inventory-dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  expiryDate?: string;
  batchNumber?: string;
  supplier: string;
  lastRestocked: string;
  price: number;
  status: "in_stock" | "low_stock" | "out_of_stock" | "expired";
  location: string;
  notes?: string;
}

// Mock data
const mockInventoryData: InventoryItem[] = [
  {
    id: "INV001",
    name: "لقاح الحمى القلاعية",
    category: "لقاحات",
    quantity: 250,
    unit: "جرعة",
    minStock: 100,
    maxStock: 500,
    expiryDate: "2026-03-15",
    batchNumber: "FMD2025-001",
    supplier: "شركة الأدوية البيطرية",
    lastRestocked: "2025-09-01",
    price: 15,
    status: "in_stock",
    location: "المخزن الرئيسي - الثلاجة A",
  },
  {
    id: "INV002",
    name: "مضاد حيوي أموكسيسيلين",
    category: "أدوية",
    quantity: 45,
    unit: "زجاجة",
    minStock: 50,
    maxStock: 200,
    expiryDate: "2025-12-31",
    batchNumber: "AMX2025-012",
    supplier: "مستودع الأدوية المركزي",
    lastRestocked: "2025-08-15",
    price: 35,
    status: "low_stock",
    location: "المخزن الرئيسي - الرف B3",
  },
  {
    id: "INV003",
    name: "مضاد الطفيليات الداخلية",
    category: "أدوية",
    quantity: 180,
    unit: "عبوة",
    minStock: 100,
    maxStock: 300,
    expiryDate: "2026-06-30",
    batchNumber: "APD2025-005",
    supplier: "شركة فارما للأدوية",
    lastRestocked: "2025-09-05",
    price: 25,
    status: "in_stock",
    location: "المخزن الرئيسي - الرف C2",
  },
  {
    id: "INV004",
    name: "محاقن بلاستيكية 10مل",
    category: "مستلزمات طبية",
    quantity: 0,
    unit: "قطعة",
    minStock: 200,
    maxStock: 1000,
    supplier: "موردي المستلزمات الطبية",
    lastRestocked: "2025-07-20",
    price: 2,
    status: "out_of_stock",
    location: "المخزن الرئيسي - الدرج D1",
  },
  {
    id: "INV005",
    name: "قفازات طبية",
    category: "مستلزمات طبية",
    quantity: 500,
    unit: "زوج",
    minStock: 300,
    maxStock: 1500,
    supplier: "شركة المستلزمات الطبية",
    lastRestocked: "2025-09-10",
    price: 1,
    status: "in_stock",
    location: "المخزن الرئيسي - الخزانة E",
  },
  {
    id: "INV006",
    name: "فيتامينات متعددة",
    category: "مكملات",
    quantity: 120,
    unit: "عبوة",
    minStock: 80,
    maxStock: 250,
    expiryDate: "2025-10-15",
    batchNumber: "VIT2025-008",
    supplier: "شركة التغذية الحيوانية",
    lastRestocked: "2025-08-25",
    price: 18,
    status: "expired",
    location: "المخزن الرئيسي - الرف F4",
  },
];

// Category distribution data
const categoryData = [
  { name: "لقاحات", value: 35, color: "#3B82F6" },
  { name: "أدوية", value: 40, color: "#10B981" },
  { name: "مستلزمات طبية", value: 15, color: "#F59E0B" },
  { name: "مكملات", value: 10, color: "#8B5CF6" },
];

// Stock levels data
const stockLevelsData = [
  { category: "لقاحات", current: 250, min: 100, max: 500 },
  { category: "أدوية", current: 225, min: 150, max: 500 },
  { category: "مستلزمات", current: 500, min: 500, max: 2500 },
  { category: "مكملات", current: 120, min: 80, max: 250 },
];

export default function InventoryPage() {
  const [data, setData] = useState(mockInventoryData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");

  const columns: ColumnDef<InventoryItem>[] = [
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
      header: "الرمز",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "اسم الصنف",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "الفئة",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "quantity",
      header: "الكمية المتاحة",
      cell: ({ row }) => {
        const quantity = row.getValue<number>("quantity");
        const unit = row.original.unit;
        const minStock = row.original.minStock;
        const status = row.original.status;
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${
                status === "out_of_stock" ? "text-red-600" :
                status === "low_stock" ? "text-yellow-600" :
                "text-green-600"
              }`}>
                {quantity}
              </span>
              <span className="text-muted-foreground text-sm">{unit}</span>
            </div>
            {quantity < minStock && (
              <div className="text-xs text-yellow-600">
                أقل من الحد الأدنى ({minStock})
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "expiryDate",
      header: "تاريخ الانتهاء",
      cell: ({ row }) => {
        const date = row.getValue<string>("expiryDate");
        if (!date) return "-";
        
        const expiryDate = new Date(date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div className="space-y-1">
            <div className="text-sm">{date}</div>
            {daysUntilExpiry < 30 && daysUntilExpiry > 0 && (
              <Badge variant="destructive" className="text-xs">
                ينتهي خلال {daysUntilExpiry} يوم
              </Badge>
            )}
            {daysUntilExpiry <= 0 && (
              <Badge variant="destructive" className="text-xs">
                منتهي الصلاحية
              </Badge>
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
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          in_stock: "default",
          low_stock: "secondary",
          out_of_stock: "destructive",
          expired: "destructive",
        };
        const labels: Record<string, string> = {
          in_stock: "متوفر",
          low_stock: "مخزون منخفض",
          out_of_stock: "نفذ المخزون",
          expired: "منتهي الصلاحية",
        };
        return (
          <Badge variant={variants[status]}>
            {labels[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "supplier",
      header: "المورد",
    },
    {
      accessorKey: "price",
      header: "السعر",
      cell: ({ row }) => {
        const price = row.getValue<number>("price");
        return (
          <div className="font-medium">
            {price} ج.م
          </div>
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
                setSelectedItem(row.original);
                setIsDialogOpen(true);
              }}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedItem(row.original);
                setIsDialogOpen(true);
              }}>
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History className="ml-2 h-4 w-4" />
                سجل الحركات
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
    console.log("Exporting as", type);
  };

  const handleSaveItem = (itemData: any) => {
    if (selectedItem) {
      setData(data.map(item => item.id === selectedItem.id ? itemData : item));
    } else {
      setData([...data, { ...itemData, id: `INV${String(data.length + 1).padStart(3, '0')}` }]);
    }
    setSelectedItem(undefined);
  };

  // Calculate statistics
  const totalItems = data.length;
  const lowStockItems = data.filter(item => item.status === "low_stock").length;
  const outOfStockItems = data.filter(item => item.status === "out_of_stock").length;
  const expiredItems = data.filter(item => item.status === "expired").length;
  const totalValue = data.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Filter data based on active tab
  const filteredData = activeTab === "all" ? data :
    activeTab === "low_stock" ? data.filter(item => item.status === "low_stock") :
    activeTab === "out_of_stock" ? data.filter(item => item.status === "out_of_stock") :
    activeTab === "expired" ? data.filter(item => item.status === "expired") :
    data;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">المخزون</h1>
            <p className="text-muted-foreground mt-2">
              إدارة المخزون والأدوية واللقاحات والمستلزمات الطبية
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="ml-2 h-4 w-4" />
              استيراد
            </Button>
            <Button variant="outline" size="sm">
              <ShoppingCart className="ml-2 h-4 w-4" />
              طلب شراء
            </Button>
            <Button onClick={() => {
              setSelectedItem(undefined);
              setIsDialogOpen(true);
            }}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة صنف جديد
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {(lowStockItems > 0 || outOfStockItems > 0 || expiredItems > 0) && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              تنبيه: يوجد {lowStockItems} صنف بمخزون منخفض، 
              {outOfStockItems > 0 && ` و ${outOfStockItems} صنف نفذ من المخزون،`}
              {expiredItems > 0 && ` و ${expiredItems} صنف منتهي الصلاحية`}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي الأصناف
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                مخزون منخفض
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                نفذ المخزون
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                منتهي الصلاحية
              </CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiredItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                قيمة المخزون
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalValue.toLocaleString()} ج.م
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الفئات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>مستويات المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockLevelsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#3B82F6" name="المخزون الحالي" />
                  <Bar dataKey="min" fill="#F59E0B" name="الحد الأدنى" />
                  <Bar dataKey="max" fill="#10B981" name="الحد الأقصى" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Data Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">جميع الأصناف</TabsTrigger>
            <TabsTrigger value="low_stock">مخزون منخفض</TabsTrigger>
            <TabsTrigger value="out_of_stock">نفذ المخزون</TabsTrigger>
            <TabsTrigger value="expired">منتهي الصلاحية</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <DataTable
              columns={columns}
              data={filteredData}
              onExport={handleExport}
            />
          </TabsContent>
        </Tabs>

        {/* Inventory Dialog */}
        <InventoryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={selectedItem}
          onSave={handleSaveItem}
        />
      </div>
    </MainLayout>
  );
}
