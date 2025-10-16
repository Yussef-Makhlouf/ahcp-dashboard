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
import { Edit, MoreHorizontal, Trash2, Eye, Calendar } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";
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
  const { checkPermission } = usePermissions();
  return [
    {
      accessorKey: "serialNo",
      header: "Serial No",
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("serialNo")}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return date.toLocaleDateString("ar-EG");
      },
    },
    {
      accessorKey: "client.name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.client?.name || 'غير محدد'}</div>
      ),
    },
    {
      accessorKey: "client.nationalId",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.client?.nationalId || 'غير محدد'}</div>
      ),
    },
    {
      accessorKey: "client.phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.client?.phone || 'غير محدد'}</div>
      ),
    },
    // Birth Date
    {
      accessorKey: "client.birthDate",
      header: "Birth Date",
      cell: ({ row }) => {
        const client = row.original.client as any;
        const birthDate = client?.birthDate;
        if (!birthDate) return <span className="text-muted-foreground">غير محدد</span>;
        const date = new Date(birthDate);
        return (
          <div className="text-sm flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date.toLocaleDateString("ar-EG")}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "farmLocation",
      header: "Location",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={row.getValue("farmLocation")}>
          {row.getValue("farmLocation") || 'غير محدد'}
        </div>
      ),
    },
    {
      accessorKey: "coordinates.latitude",
      header: "N Coordinate",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.original.coordinates?.latitude?.toFixed(4) || '0'}</div>
      ),
    },
    {
      accessorKey: "coordinates.longitude",
      header: "E Coordinate",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.original.coordinates?.longitude?.toFixed(4) || '0'}</div>
      ),
    },
    {
      accessorKey: "diagnosis",
      header: "Diagnosis",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("diagnosis")}>
          {row.getValue("diagnosis")}
        </div>
      ),
    },
    {
      accessorKey: "interventionCategory",
      header: "Intervention Category",
      cell: ({ row }) => {
        const category = row.getValue("interventionCategory") as string;
        const categoryColors: Record<string, string> = {
          "Emergency": "bg-red-500 text-white border-red-600",
          "Routine": "bg-blue-500 text-white border-blue-600",
          "Preventive": "bg-green-500 text-white border-green-600",
          "Follow-up": "bg-yellow-500 text-white border-yellow-600",
          "Breeding": "bg-purple-500 text-white border-purple-600",
          "Performance": "bg-orange-500 text-white border-orange-600",
        };

        const categoryLabels: Record<string, string> = {
          "Emergency": "طوارئ",
          "Routine": "روتيني",
          "Preventive": "وقائي",
          "Follow-up": "متابعة",
          "Breeding": "تربية",
          "Performance": "أداء",
        };

        return (
          <Badge className={categoryColors[category] || "bg-gray-500 text-white border-gray-600"}>
            {categoryLabels[category] || category}
          </Badge>
        );
      },
    },
    {
      accessorKey: "treatment",
      header: "Treatment",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("treatment")}>
          {row.getValue("treatment")}
        </div>
      ),
    },
    {
      accessorKey: "request.date",
      header: "Request Date",
      cell: ({ row }) => {
        const requestDate = row.original.request?.date;
        if (!requestDate) return 'غير محدد';
        const date = new Date(requestDate);
        return date.toLocaleDateString("ar-EG");
      },
    },
    {
      accessorKey: "request.situation",
      header: "Request Status",
      cell: ({ row }) => {
        const status = row.original.request?.situation || 'Open';
        const statusColors = {
          "Open": "bg-green-500 text-white border-green-600",
          "Closed": "bg-blue-500 text-white border-blue-600",
          "Pending": "bg-yellow-500 text-white border-yellow-600",
        };

        const statusLabels = {
          "Open": "مفتوح",
          "Closed": "مغلق",
          "Pending": "معلق",
        };

        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white border-gray-600"}>
            {statusLabels[status as keyof typeof statusLabels] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "request.fulfillingDate",
      header: "Request Fulfilling Date",
      cell: ({ row }) => {
        const fulfillingDate = row.original.request?.fulfillingDate;
        if (!fulfillingDate) return 'غير محدد';
        const date = new Date(fulfillingDate);
        return date.toLocaleDateString("ar-EG");
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={row.getValue("remarks")}>
          {row.getValue("remarks") || 'لا توجد ملاحظات'}
        </div>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const canEdit = checkPermission({ module: 'equine-health', action: 'edit' });
        const canDelete = checkPermission({ module: 'equine-health', action: 'delete' });
        
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
                  onClick={() => onDelete(row.original._id || row.original.serialNo)}
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
