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
import type { Vaccination } from "@/types";

interface GetColumnsProps {
  onEdit: (item: Vaccination) => void;
  onDelete: (item: Vaccination) => void;
  onView?: (item: Vaccination) => void;
}

export function getColumns({
  onEdit,
  onDelete,
  onView
}: GetColumnsProps): ColumnDef<Vaccination>[] {
  return [
    {
      accessorKey: "serialNo",
      header: "الرقم المسلسل",
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
      header: "اسم المالك",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.owner.name}</div>
      ),
    },
    {
      accessorKey: "vaccineType",
      header: "نوع المصل",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("vaccineType")}</Badge>
      ),
    },
    {
      accessorKey: "herdHealth",
      header: "حالة القطيع",
      cell: ({ row }) => {
        const status = row.getValue("herdHealth") as string;
        const statusColors = {
          "Healthy": "bg-green-100 text-green-800",
          "Sick": "bg-red-100 text-red-800",
          "Under Treatment": "bg-yellow-100 text-yellow-800",
        };

        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
            {status === "Healthy" && "صحي"}
            {status === "Sick" && "مريض"}
            {status === "Under Treatment" && "قيد العلاج"}
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
          "Open": "bg-blue-100 text-blue-800",
          "Closed": "bg-green-100 text-green-800",
          "Pending": "bg-yellow-100 text-yellow-800",
        };

        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
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
                <Eye className="ml-2 h-4 w-4" />
                عرض
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="ml-2 h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="text-red-600"
            >
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
