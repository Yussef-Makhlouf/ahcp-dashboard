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
import { ArrowUpDown, Edit, Eye, Trash2, User, Calendar, Phone, MapPin, Hash, MoreHorizontal } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { SimpleDateCell, BirthDateCell } from "@/components/ui/date-cell";
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
        return <SimpleDateCell date={row.getValue("date")} />;
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
    // Village
    {
      id: "village",
      header: "القرية",
      cell: ({ row }) => {
        const village = row.original.client?.village;
        
        if (!village || village === 'N/A') {
          return <span className="text-gray-400 text-xs">غير محدد</span>;
        }
        
        return (
          <div className="flex items-center gap-1 text-sm font-medium">
            <MapPin className="h-3 w-3 text-green-500" />
            <span>{village}</span>
          </div>
        );
      },
    },
    // Birth Date
    {
      accessorKey: "client.birthDate",
      header: "Birth Date",
      cell: ({ row }) => {
        const client = row.original.client as any;
        const birthDate = client?.birthDate;
        return <BirthDateCell date={birthDate} className="text-sm" />;
      },
      size: 120,
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
          "Clinical Examination": "bg-red-500 text-white border-red-600",
          "Surgical Operation": "bg-blue-500 text-white border-blue-600",
          "Ultrasonography": "bg-green-500 text-white border-green-600",
          "Preventive": "bg-yellow-500 text-white border-yellow-600",
          "Lab Analysis": "bg-purple-500 text-white border-purple-600",
          "Farriery": "bg-orange-500 text-white border-orange-600",
        };

        const categoryLabels: Record<string, string> = {
          "Clinical Examination": "طوارئ",
          "Surgical Operation": "روتيني",
          "Ultrasonography": "وقائي",
          "Preventive": "متابعة",
          "Lab Analysis": "تربية",
          "Farriery": "أداء",
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
        return <SimpleDateCell date={requestDate} />;
      },
    },
    {
      accessorKey: "request.situation",
      header: "Request Status",
      cell: ({ row }) => {
        const status = row.original.request?.situation || 'Ongoing';
        const statusColors = {
          "Ongoing": "bg-green-500 text-white border-green-600",
          "Closed": "bg-blue-500 text-white border-blue-600",
        };

        const statusLabels = {
          "Ongoing": "مفتوح",
          "Closed": "مغلق",
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
        return <SimpleDateCell date={fulfillingDate} />;
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
      header: "Actions",
      cell: ({ row }) => {
        const canEdit = checkPermission({ module: 'equine-health', action: 'edit' });
        const canDelete = checkPermission({ module: 'equine-health', action: 'delete' });
        
        // إذا لم يكن لديه صلاحيات التعديل أو الحذف، لا تظهر خانة Actions
        if (!canEdit && !canDelete) {
          return null;
        }
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="h-10 w-10 p-0 border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl rounded-full"
              >
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-5 w-5 text-blue-700 font-bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-2 border-blue-200 shadow-xl rounded-lg">
              <div className="px-3 py-2 border-b border-blue-100">
                <span className="text-sm font-semibold text-blue-800">الإجراءات</span>
              </div>
              {onView && (
                <DropdownMenuItem 
                  onClick={() => onView(row.original)}
                  className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                >
                  <Eye className="mr-3 h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">عرض</span>
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem 
                  onClick={() => onEdit(row.original)}
                  className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                >
                  <Edit className="mr-3 h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">تعديل</span>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(row.original._id || row.original.serialNo)}
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="mr-3 h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">حذف</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
