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
    // Serial No
    {
      accessorKey: "serialNo",
      header: "Serial No",
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("serialNo")}</div>
      ),
    },
    // Date
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        return <SimpleDateCell date={row.getValue("date")} />;
      },
    },
    // Client Info (Name, ID, Birth Date, Phone)
    {
      id: "clientInfo",
      header: "Client Info",
      cell: ({ row }) => {
        const client = row.original.client;
        const name = client?.name || '-';
        const nationalId = client?.nationalId || '';
        const phone = client?.phone || '';
        const birthDate = (client as any)?.birthDate;
        
        return (
          <div className="space-y-1 min-w-[200px]">
            <div className="font-medium flex items-center gap-1">
              <User className="h-3 w-3" />
              {name}
            </div>
            {nationalId && (
              <div className="text-xs text-gray-500">ID: {nationalId}</div>
            )}
            {birthDate && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                DOB: <SimpleDateCell date={birthDate} className="text-xs" />
              </div>
            )}
            {phone && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {phone}
              </div>
            )}
          </div>
        );
      },
    },
    // Birth Date
    {
      accessorKey: "client.birthDate",
      header: "Birth Date",
      cell: ({ row }) => {
        const client = row.original.client;
        const birthDate = client?.birthDate;
        return <BirthDateCell date={birthDate} className="text-sm" />;
      },
      size: 120,
    },

    // Village
    {
      id: "village",
      header: "Village",
      cell: ({ row }) => {
        const mobileClinic = row.original as MobileClinic;
        const client = mobileClinic.client;
        
        // استخراج اسم القرية من بيانات المربي
        let village = 'غير محدد';
        
        if (client) {
          // إذا كان client عبارة عن object (populated)
          if (typeof client === 'object' && client !== null && 'village' in client) {
            // فحص village object أولاً (populated village)
            if (client.village && typeof client.village === 'object' && client.village !== null) {
              village = (client.village as any).nameArabic || (client.village as any).nameEnglish || 'غير محدد';
            }
            // فحص holdingCode كـ fallback
            else if ((client as any).holdingCode && typeof (client as any).holdingCode === 'object' && (client as any).holdingCode !== null && 'village' in (client as any).holdingCode) {
              village = ((client as any).holdingCode as any).village || 'غير محدد';
            }
            // إذا كان village مجرد string (legacy data)
            else if (typeof client.village === 'string') {
              village = client.village || 'غير محدد';
            }
          }
          // إذا كان client مجرد ID، استخدم location كـ fallback
          else {
            const location = (mobileClinic as any).farmLocation || (mobileClinic as any).location || 'غير محدد';
            village = location;
          }
        }
        
        return (
          <div className="max-w-[150px] truncate" title={village}>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{village}</span>
            </div>
          </div>
        );
      },
      size: 150,
    },
    // N Coordinate, E Coordinate
    {
      id: "coordinates",
      header: "N, E Coordinates",
      cell: ({ row }) => {
        const coords = row.original.coordinates;
        if (!coords?.latitude || !coords?.longitude) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>N: {coords.latitude.toFixed(4)}</span>
            </div>
            <div>E: {coords.longitude.toFixed(4)}</div>
          </div>
        );
      },
    },
    // Supervisor
    {
      accessorKey: "supervisor",
      header: "Supervisor",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("supervisor")}</div>
      ),
    },
    // Vehicle No
    {
      accessorKey: "vehicleNo",
      header: "Vehicle No.",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("vehicleNo")}</div>
      ),
    },
    // Holding Code
    {
      id: "holdingCode",
      header: "Holding Code",
      cell: ({ row }) => {
        const holdingCode = row.original.holdingCode;
        
        if (!holdingCode) {
          return (
            <div className="text-xs">
              <div className="flex items-center gap-1 text-amber-600">
                <Hash className="h-3 w-3" />
                <span>لا يوجد رمز حيازة</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                يرجى إضافة رمز حيازة
              </div>
            </div>
          );
        }
        
        // Handle both string and object types
        const code = typeof holdingCode === 'object' ? holdingCode.code : holdingCode;
        const village = typeof holdingCode === 'object' ? holdingCode.village : '';
        const isActive = typeof holdingCode === 'object' ? (holdingCode as any).isActive !== false : true;
        
        return (
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1 font-medium">
              <Hash className="h-3 w-3 text-blue-500" />
              <span className={isActive ? 'text-blue-700' : 'text-gray-500'}>{code}</span>
              {!isActive && (
                <span className="text-xs text-red-500">(غير نشط)</span>
              )}
            </div>
            {village && (
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>{village}</span>
              </div>
            )}
          </div>
        );
      },
    },
    // Animal Counts
    {
      id: "animalCounts",
      header: "Animal Counts",
      cell: ({ row }) => {
        const counts = row.original.animalCounts;
        if (!counts) return <span className="text-gray-400">-</span>;
        
        const totalAnimals = (counts.sheep || 0) + (counts.goats || 0) + 
                           (counts.camel || 0) + (counts.horse || 0) + (counts.cattle || 0);
        
        return (
          <div className="text-xs space-y-1">
            <Badge variant="secondary">Total: {totalAnimals}</Badge>
            {counts.sheep > 0 && <div>Sheep: {counts.sheep}</div>}
            {counts.goats > 0 && <div>Goats: {counts.goats}</div>}
            {counts.camel > 0 && <div>Camel: {counts.camel}</div>}
            {counts.horse > 0 && <div>Horse: {counts.horse}</div>}
            {counts.cattle > 0 && <div>Cattle: {counts.cattle}</div>}
          </div>
        );
      },
    },
    // Diagnosis & Treatment
    {
      id: "medical",
      header: "Medical Info",
      cell: ({ row }) => {
        const diagnosis = row.original.diagnosis;
        const treatment = row.original.treatment;
        const category = row.original.interventionCategory;
        
        const categoryColors = {
          "Emergency": "bg-red-500 text-white",
          "Routine": "bg-blue-500 text-white",
          "Preventive": "bg-green-500 text-white",
          "Follow-up": "bg-yellow-500 text-white",
        };
        
        return (
          <div className="text-xs space-y-1 max-w-[200px]">
            <Badge className={categoryColors[category as keyof typeof categoryColors] || "bg-gray-500 text-white"}>
              {category}
            </Badge>
            {diagnosis && (
              <div className="truncate" title={diagnosis}>
                <strong>Diagnosis:</strong> {diagnosis}
              </div>
            )}
            {treatment && (
              <div className="truncate" title={treatment}>
                <strong>Treatment:</strong> {treatment}
              </div>
            )}
          </div>
        );
      },
    },
    // Request Info
    {
      id: "request",
      header: "Request Info",
      cell: ({ row }) => {
        const request = row.original.request;
        if (!request) return <span className="text-gray-400">-</span>;
        
        const requestDate = request.date;
        const fulfillingDate = request.fulfillingDate;
        
        const statusColors = {
          "Open": "bg-blue-500 text-white",
          "Closed": "bg-green-500 text-white",
          "Pending": "bg-yellow-500 text-white",
        };
        
        return (
          <div className="text-xs space-y-1">
            <div>Date: <SimpleDateCell date={requestDate} className="inline" /></div>
            <Badge className={statusColors[request.situation as keyof typeof statusColors] || "bg-gray-500 text-white"}>
              {request.situation}
            </Badge>
            {fulfillingDate && (
              <div>Fulfilled: <SimpleDateCell date={fulfillingDate} className="inline" /></div>
            )}
          </div>
        );
      },
    },
    // Category & Remarks
    {
      id: "additional",
      header: "Additional Info",
      cell: ({ row }) => {
        const category = (row.original as any).category;
        const remarks = row.original.remarks;
        
        return (
          <div className="text-xs space-y-1 max-w-[150px]">
            {category && (
              <Badge variant="outline">{category}</Badge>
            )}
            {remarks && (
              <div className="truncate" title={remarks}>
                <strong>Remarks:</strong> {remarks}
              </div>
            )}
          </div>
        );
      },
    },
    // Actions
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const canEdit = checkPermission({ module: 'mobile-clinics', action: 'edit' });
        const canDelete = checkPermission({ module: 'mobile-clinics', action: 'delete' });
        
        // إذا لم يكن لديه صلاحيات التعديل أو الحذف، لا تظهر خانة Actions
        if (!canEdit && !canDelete) {
          return null;
        }
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="h-9 w-9 p-0 border-2 border-gray-400 bg-white hover:bg-gray-50 hover:border-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-5 w-5 text-gray-800 font-bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
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
