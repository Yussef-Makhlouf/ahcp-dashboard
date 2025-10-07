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
import type { MobileClinic } from "@/types";

interface GetColumnsProps {
  onEdit: (item: MobileClinic) => void;
  onDelete: (item: MobileClinic) => void;
  onView?: (item: MobileClinic) => void;
}

export function getColumns({
  onEdit,
  onDelete,
  onView
}: GetColumnsProps): ColumnDef<MobileClinic>[] {
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
      accessorKey: "client.name",
      header: "اسم المربي",
      cell: ({ row }) => {
        const client = row.original.client;
        const ownerName = client?.name || row.original.owner?.name;
        return (
          <div className="space-y-1">
            <div className="font-medium">{ownerName || 'غير محدد'}</div>
            {client?.nationalId && (
              <div className="text-xs text-muted-foreground">
                هوية: {client.nationalId}
              </div>
            )}
            {client?.phone && (
              <div className="text-xs text-muted-foreground">
                {client.phone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "farmLocation",
      header: "موقع المزرعة",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("farmLocation") || 'غير محدد'}</div>
      ),
    },
    {
      accessorKey: "supervisor",
      header: "المشرف",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("supervisor") || 'غير محدد'}</div>
      ),
    },
    {
      accessorKey: "vehicleNo",
      header: "رقم المركبة",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("vehicleNo") || 'غير محدد'}</Badge>
      ),
    },
    {
      id: "totalAnimals",
      header: "عدد الحيوانات",
      cell: ({ row }) => {
        const record = row.original;
        // Use backend virtual field first, then calculate from animalCounts, then legacy fields
        let total = record.totalAnimals || 0;
        
        if (!total && record.animalCounts) {
          total = (record.animalCounts.sheep || 0) + 
                  (record.animalCounts.goats || 0) + 
                  (record.animalCounts.camel || 0) + 
                  (record.animalCounts.horse || 0) + 
                  (record.animalCounts.cattle || 0);
        }
        
        // Fallback to legacy fields
        if (!total) {
          total = (record.sheep || 0) + (record.goats || 0) + 
                  (record.camel || 0) + (record.horse || 0) + 
                  (record.cattle || 0);
        }
        
        return (
          <div className="text-sm space-y-1">
            <Badge variant="secondary" className="font-medium">
              {total} رأس
            </Badge>
            {record.animalCounts && (
              <div className="text-xs text-muted-foreground">
                {record.animalCounts.sheep > 0 && `أغنام: ${record.animalCounts.sheep} `}
                {record.animalCounts.goats > 0 && `ماعز: ${record.animalCounts.goats} `}
                {record.animalCounts.camel > 0 && `إبل: ${record.animalCounts.camel} `}
                {record.animalCounts.cattle > 0 && `أبقار: ${record.animalCounts.cattle} `}
                {record.animalCounts.horse > 0 && `خيول: ${record.animalCounts.horse}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "interventionCategory",
      header: "فئة التدخل",
      cell: ({ row }) => {
        const category = row.getValue("interventionCategory") as string;
        const categoryColors = {
          "Emergency": "bg-red-500 text-white border-red-600",
          "Routine": "bg-blue-500 text-white border-blue-600",
          "Preventive": "bg-green-500 text-white border-green-600",
          "Follow-up": "bg-yellow-500 text-white border-yellow-600",
        };
        const labels = {
          "Emergency": "طوارئ",
          "Routine": "روتيني",
          "Preventive": "وقائي",
          "Follow-up": "متابعة",
        };
        return (
          <Badge className={categoryColors[category as keyof typeof categoryColors] || "bg-gray-500 text-white border-gray-600"}>
            {labels[category as keyof typeof labels] || category || 'غير محدد'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "diagnosis",
      header: "التشخيص",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("diagnosis")}>
          {row.getValue("diagnosis") || 'غير محدد'}
        </div>
      ),
    },
    {
      accessorKey: "followUpRequired",
      header: "متابعة مطلوبة",
      cell: ({ row }) => {
        const required = row.getValue("followUpRequired");
        return (
          <Badge className={required ? "bg-orange-500 text-white border-orange-600" : "bg-green-500 text-white border-green-600"}>
            {required ? "نعم" : "لا"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "request.situation",
      header: "حالة الطلب",
      cell: ({ row }) => {
        const status = row.original.request?.situation;
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
            {!status && "غير محدد"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const canEdit = checkPermission({ module: 'mobile-clinics', action: 'edit' });
        const canDelete = checkPermission({ module: 'mobile-clinics', action: 'delete' });
        
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
