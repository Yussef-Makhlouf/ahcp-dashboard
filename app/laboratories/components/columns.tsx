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
import type { Laboratory } from "@/types";

interface GetColumnsProps {
  onEdit: (item: Laboratory) => void;
  onDelete: (item: Laboratory) => void;
  onView?: (item: Laboratory) => void;
}

export function getColumns({
  onEdit,
  onDelete,
  onView
}: GetColumnsProps): ColumnDef<Laboratory>[] {
  
  return [
    {
      accessorKey: "sampleCode",
      header: "رمز العينة",
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("sampleCode")}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "تاريخ الجمع",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return date.toLocaleDateString("ar-EG");
      },
    },
    {
      accessorKey: "client.name",
      header: "اسم المالك",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.client?.name || 'غير محدد'}</div>
      ),
    },
    {
      accessorKey: "farmLocation",
      header: "موقع المزرعة",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("farmLocation") || 'غير محدد'}</div>
      ),
    },
    {
      accessorKey: "collector",
      header: "جامع العينة",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("collector") || 'غير محدد'}</div>
      ),
    },
    {
      accessorKey: "sampleType",
      header: "نوع العينة",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("sampleType") || 'غير محدد'}</Badge>
      ),
    },
    {
      accessorKey: "testType",
      header: "نوع الفحص",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("testType") || 'غير محدد'}</Badge>
      ),
    },
    {
      accessorKey: "testStatus",
      header: "حالة الفحص",
      cell: ({ row }) => {
        const status = row.getValue("testStatus") as string;
        const statusColors = {
          "Pending": "bg-yellow-500 text-white border-yellow-600",
          "In Progress": "bg-blue-500 text-white border-blue-600",
          "Completed": "bg-green-500 text-white border-green-600",
          "Failed": "bg-red-500 text-white border-red-600",
        };
        const labels = {
          "Pending": "معلق",
          "In Progress": "قيد التنفيذ",
          "Completed": "مكتمل",
          "Failed": "فاشل",
        };
        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white border-gray-600"}>
            {labels[status as keyof typeof labels] || status || 'غير محدد'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "result",
      header: "النتيجة",
      cell: ({ row }) => {
        const result = row.getValue("result") as string;
        const resultColors = {
          "Positive": "bg-red-500 text-white border-red-600",
          "Negative": "bg-green-500 text-white border-green-600",
          "Inconclusive": "bg-yellow-500 text-white border-yellow-600",
        };
        const labels = {
          "Positive": "إيجابي",
          "Negative": "سلبي",
          "Inconclusive": "غير حاسم",
        };
        
        if (!result) {
          return <Badge variant="outline">غير متوفر</Badge>;
        }
        
        return (
          <Badge className={resultColors[result as keyof typeof resultColors] || "bg-gray-500 text-white border-gray-600"}>
            {labels[result as keyof typeof labels] || result}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "الأولوية",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const priorityColors = {
          "High": "bg-red-500 text-white border-red-600",
          "Medium": "bg-yellow-500 text-white border-yellow-600",
          "Low": "bg-green-500 text-white border-green-600",
        };
        const labels = {
          "High": "عالية",
          "Medium": "متوسطة",
          "Low": "منخفضة",
        };
        return (
          <Badge className={priorityColors[priority as keyof typeof priorityColors] || "bg-gray-500 text-white border-gray-600"}>
            {labels[priority as keyof typeof labels] || priority || 'غير محدد'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "laboratoryTechnician",
      header: "فني المختبر",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("laboratoryTechnician") || 'غير محدد'}</div>
      ),
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
              onClick={() => onDelete(row.original)}
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
