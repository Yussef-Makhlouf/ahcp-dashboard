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
  onDelete: (id: string) => void;
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
      accessorKey: "client.name",
      header: "اسم العميل",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.client.name}</div>
      ),
    },
    {
      accessorKey: "farmLocation",
      header: "موقع المزرعة",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={row.getValue("farmLocation")}>
          {row.getValue("farmLocation")}
        </div>
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
          "Clinical Examination": "bg-blue-500 text-white border-blue-600",
          "Surgical Operation": "bg-red-500 text-white border-red-600",
          "Ultrasonography": "bg-green-500 text-white border-green-600",
          "Lab Analysis": "bg-purple-500 text-white border-purple-600",
          "Farriery": "bg-orange-500 text-white border-orange-600",
          "Routine": "bg-teal-500 text-white border-teal-600",
        };

        return (
          <Badge className={categoryColors[category] || "bg-gray-500 text-white border-gray-600"}>
            {category === "Clinical Examination" && "فحص سريري"}
            {category === "Surgical Operation" && "عملية جراحية"}
            {category === "Ultrasonography" && "موجات فوق صوتية"}
            {category === "Lab Analysis" && "تحليل مخبري"}
            {category === "Farriery" && "حداء وعلاج الحوافر"}
            {category === "Routine" && "روتيني"}
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
          "Open": "bg-green-500 text-white border-green-600",
          "Closed": "bg-blue-500 text-white border-blue-600",
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
              onClick={() => onDelete(row.original._id || row.original.id || row.original.serialNo)}
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
