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
import { usePermissions } from "@/lib/hooks/usePermissions";
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
  const { checkPermission } = usePermissions();
  
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
      accessorKey: "sampleCode",
      header: "رمز العينة",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("sampleCode")}</div>
      ),
    },
    {
      accessorKey: "clientName",
      header: "اسم العميل",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("clientName")}</div>
      ),
    },
    {
      accessorKey: "clientId",
      header: "رقم الهوية",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("clientId")}</div>
      ),
    },
    {
      accessorKey: "clientPhone",
      header: "رقم الهاتف",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("clientPhone")}</div>
      ),
    },
    {
      accessorKey: "farmLocation",
      header: "الموقع",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={row.getValue("farmLocation")}>
          {row.getValue("farmLocation")}
        </div>
      ),
    },
    {
      accessorKey: "collector",
      header: "جامع العينة",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("collector")}</div>
      ),
    },
    {
      accessorKey: "sampleType",
      header: "نوع العينة",
      cell: ({ row }) => {
        const type = row.getValue("sampleType") as string;
        const typeColors: Record<string, string> = {
          "Blood": "bg-red-100 text-red-800 border-red-200",
          "Serum": "bg-blue-100 text-blue-800 border-blue-200",
          "Urine": "bg-yellow-100 text-yellow-800 border-yellow-200",
          "Feces": "bg-green-100 text-green-800 border-green-200",
          "Milk": "bg-purple-100 text-purple-800 border-purple-200",
          "Tissue": "bg-orange-100 text-orange-800 border-orange-200",
          "Swab": "bg-pink-100 text-pink-800 border-pink-200",
          "Hair": "bg-gray-100 text-gray-800 border-gray-200",
          "Skin": "bg-indigo-100 text-indigo-800 border-indigo-200",
        };
        return (
          <Badge className={typeColors[type] || "bg-gray-100 text-gray-800 border-gray-200"}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "sampleNumber",
      header: "رمز جامع العينة",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("sampleNumber")}</div>
      ),
    },
    {
      accessorKey: "speciesCounts",
      header: "عدد العينات",
      cell: ({ row }) => {
        const counts = row.getValue("speciesCounts") as any;
        const total = (counts?.sheep || 0) + (counts?.goats || 0) + (counts?.camel || 0) + 
                     (counts?.cattle || 0) + (counts?.horse || 0);
        return (
          <div className="text-sm font-medium">
            {total} عينة
          </div>
        );
      },
    },
    {
      accessorKey: "positiveCases",
      header: "الحالات الإيجابية",
      cell: ({ row }) => {
        const positive = row.getValue("positiveCases") as number;
        return (
          <Badge className={positive > 0 ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}>
            {positive}
          </Badge>
        );
      },
    },
    {
      accessorKey: "negativeCases",
      header: "الحالات السلبية",
      cell: ({ row }) => {
        const negative = row.getValue("negativeCases") as number;
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {negative}
          </Badge>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "ملاحظات",
      cell: ({ row }) => {
        const remarks = row.getValue("remarks") as string;
        return (
          <div className="max-w-[150px] truncate" title={remarks}>
            {remarks || 'لا توجد ملاحظات'}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const canEdit = checkPermission({ module: 'laboratories', action: 'edit' });
        const canDelete = checkPermission({ module: 'laboratories', action: 'delete' });
        
        // إذا لم يكن لديه صلاحيات التعديل أو الحذف، لا تظهر خانة الإجراءات
        if (!canEdit && !canDelete) {
          return null;
        }
        
        return (
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
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <Edit className="mr-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(row.original)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
