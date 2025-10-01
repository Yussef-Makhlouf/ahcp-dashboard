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
import type { EquineHealth } from "@/types";

interface GetColumnsProps {
  onEdit: (item: EquineHealth) => void;
  onDelete: (id: number) => void;
  onView?: (item: EquineHealth) => void;
}

export function getColumns({
  onEdit,
  onDelete,
  onView
}: GetColumnsProps): ColumnDef<EquineHealth>[] {
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
      header: "اسم المالك",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.owner.name}</div>
      ),
    },
    {
      accessorKey: "horseCount",
      header: "عدد الخيول",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("horseCount")}</Badge>
      ),
    },
    {
      accessorKey: "diagnosis",
      header: "التشخيص",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("diagnosis")}>
          {row.getValue("diagnosis")}
        </div>
      ),
    },
    {
      accessorKey: "interventionCategory",
      header: "فئة التدخل",
      cell: ({ row }) => {
        const category = row.getValue("interventionCategory") as string;
        const categoryColors: Record<string, string> = {
          "Clinical Examination": "bg-blue-100 text-blue-800",
          "Surgical Operation": "bg-red-100 text-red-800",
          "Ultrasonography": "bg-green-100 text-green-800",
          "Lab Analysis": "bg-purple-100 text-purple-800",
          "Farriery": "bg-orange-100 text-orange-800",
        };

        return (
          <Badge className={categoryColors[category] || "bg-gray-100 text-gray-800"}>
            {category === "Clinical Examination" && "فحص سريري"}
            {category === "Surgical Operation" && "عملية جراحية"}
            {category === "Ultrasonography" && "موجات فوق صوتية"}
            {category === "Lab Analysis" && "تحليل مخبري"}
            {category === "Farriery" && "حداء وعلاج الحوافر"}
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
          "Open": "bg-green-100 text-green-800",
          "Closed": "bg-blue-100 text-blue-800",
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
                <Eye className="mr-2 h-4 w-4" />
                عرض
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original.serialNo)}
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
