"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, Eye } from "lucide-react";
import type { ParasiteControl } from "@/types";

interface GetColumnsProps {
  onEdit: (item: ParasiteControl) => void;
  onDelete: (id: string | number) => void;
  onView?: (item: ParasiteControl) => void;
}

export function getColumns({
  onEdit,
  onDelete,
  onView
}: GetColumnsProps): ColumnDef<ParasiteControl>[] {
  return [
    {
      accessorKey: "serialNo",
      header: "رقم التسلسل",
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("serialNo")}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "التاريخ",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return date.toLocaleDateString("ar-EG");
      },
    },
    {
      accessorKey: "owner.name",
      header: "اسم المربي",
      cell: ({ row }) => {
        const name = row.original.owner?.name || '-';
        const nationalId = row.original.owner?.nationalId || '';
        const phone = row.original.owner?.phone || '';
        
        return (
          <div className="space-y-1">
            <div className="font-medium">{name}</div>
            {nationalId && (
              <div className="text-xs text-gray-500">هوية: {nationalId}</div>
            )}
            {phone && (
              <div className="text-xs text-gray-500">{phone}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "supervisor",
      header: "المشرف",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("supervisor")}</div>
      ),
    },
    {
      accessorKey: "vehicleNo",
      header: "رقم المركبة",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("vehicleNo")}</Badge>
      ),
    },
    {
      accessorKey: "herdLocation",
      header: "موقع القطيع",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("herdLocation")}</div>
      ),
    },
    {
      id: "animals",
      header: "عدد الحيوانات",
      cell: ({ row }) => {
        // Use virtual field from backend first
        const totalFromBackend = row.original.totalHerdCount;
        
        // Calculate from herdCounts if available
        let totalFromHerdCounts = 0;
        if (row.original.herdCounts) {
          const counts = row.original.herdCounts;
          totalFromHerdCounts = 
            (counts.sheep?.total || 0) + 
            (counts.goats?.total || 0) + 
            (counts.camel?.total || 0) + 
            (counts.cattle?.total || 0) + 
            (counts.horse?.total || 0);
        }
        
        // Fallback to legacy herd structure
        let totalFromHerd = 0;
        if (row.original.herd) {
          const herd = row.original.herd;
          totalFromHerd = 
            (herd.sheep?.total || 0) + 
            (herd.goats?.total || 0) + 
            (herd.camel?.total || 0) + 
            (herd.cattle?.total || 0);
        }
        
        const total = totalFromBackend || totalFromHerdCounts || totalFromHerd;
        const treated = row.original.totalTreated || 0;
        
        return (
          <div className="space-y-1">
            <Badge variant="secondary">المجموع: {total}</Badge>
            {treated > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                المعالج: {treated}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "insecticide.status",
      header: "حالة الرش",
      cell: ({ row }) => {
        const status = row.original.insecticide.status;
        const statusColors = {
          "Sprayed": "bg-green-500 text-white border-green-600",
          "Not Sprayed": "bg-red-500 text-white border-red-600",
        };
        const labels = {
          "Sprayed": "تم الرش",
          "Not Sprayed": "لم يتم الرش",
        };
        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white border-gray-600"}>
            {labels[status as keyof typeof labels] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "parasiteControlStatus",
      header: "حالة مكافحة الطفيليات",
      cell: ({ row }) => {
        const status = row.getValue("parasiteControlStatus") as string;
        const statusColors = {
          "مكتمل": "bg-green-500 text-white border-green-600",
          "جاري": "bg-blue-500 text-white border-blue-600",
          "معلق": "bg-yellow-500 text-white border-yellow-600",
          "ملغي": "bg-red-500 text-white border-red-600",
        };
        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white border-gray-600"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "herdHealthStatus",
      header: "الحالة الصحية",
      cell: ({ row }) => {
        const status = row.getValue("herdHealthStatus") as string;
        const statusColors = {
          "Healthy": "bg-green-500 text-white border-green-600",
          "Sick": "bg-red-500 text-white border-red-600",
          "Under Treatment": "bg-yellow-500 text-white border-yellow-600",
        };
        const labels = {
          "Healthy": "صحي",
          "Sick": "مريض",
          "Under Treatment": "تحت العلاج",
        };
        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white border-gray-600"}>
            {labels[status as keyof typeof labels] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "request.situation",
      header: "حالة الطلب",
      cell: ({ row }) => {
        const status = row.original.request.situation;
        const statusColors = {
          "Open": "bg-blue-500 text-white border-blue-600",
          "Closed": "bg-green-500 text-white border-green-600",
          "Pending": "bg-yellow-500 text-white border-yellow-600",
        };

        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white border-gray-600"}>
            {status === "Open" && "مفتوح"}
            {status === "Closed" && "مغلق"}
            {status === "Pending" && "معلق"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">فتح القائمة</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                عرض
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original._id || row.original.serialNo)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
