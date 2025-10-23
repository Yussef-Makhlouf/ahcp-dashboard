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
import type { ParasiteControl } from "@/types";
import { usePermissions } from "@/lib/hooks/usePermissions";

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
        const date = new Date(row.getValue("date"));
        return date.toLocaleDateString("en-US");
      },
    },
    // Name, ID, Date of Birth, Phone
    {
      id: "clientInfo",
      header: "Client Info",
      cell: ({ row }) => {
        const client = row.original.client;
        const name = typeof client === 'object' && client ? client.name || '-' : '-';
        const nationalId = typeof client === 'object' && client ? client.nationalId || '' : '';
        const phone = typeof client === 'object' && client ? client.phone || '' : '';
        const birthDate = typeof client === 'object' && client?.birthDate ? new Date(client.birthDate).toLocaleDateString("en-GB", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '';
        
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
                DOB: {birthDate}
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
        const birthDate = typeof client === 'object' && client ? client.birthDate : undefined;
        if (!birthDate) return <span className="text-muted-foreground">غير محدد</span>;
        const date = new Date(birthDate);
        // Format as dd/mm/yyyy
        const formattedDate = date.toLocaleDateString("en-GB", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        return (
          <div className="text-sm flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </div>
        );
      },
      size: 120,
    },
    // E, N (Coordinates)
    {
      id: "coordinates",
      header: "E, N",
      cell: ({ row }) => {
        const coords = row.original.coordinates;
        if (!coords?.latitude || !coords?.longitude) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>E: {coords.latitude.toFixed(4)}</span>
            </div>
            <div>N: {coords.longitude.toFixed(4)}</div>
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
    // Vehicle No.
    {
      accessorKey: "vehicleNo",
      header: "Vehicle No.",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("vehicleNo")}</Badge>
      ),
    },
    // Herd Location (Village)
    {
      id: "village",
      header: "Village",
      cell: ({ row }) => {
        const parasiteControl = row.original as ParasiteControl;
        const client = parasiteControl.client;
        
        // استخراج اسم القرية من بيانات المربي
        let village = 'غير محدد';
        
        // Debug logging (can be removed in production)
        // console.log('🔍 Village Column Debug:', {
        //   client,
        //   clientType: typeof client,
        //   hasVillage: client?.village,
        //   villageType: typeof client?.village,
        //   isVillageObject: client?.village && typeof client.village === 'object',
        //   villageName: client?.village?.nameArabic || client?.village?.nameEnglish,
        //   herdLocation: parasiteControl.herdLocation
        // });
        
        if (client) {
          // إذا كان client عبارة عن object (populated)
          if (typeof client === 'object' && client !== null && 'village' in client) {
            // فحص village object أولاً (populated village)
            if (client.village && typeof client.village === 'object' && client.village !== null) {
              village = (client.village as any).nameArabic || (client.village as any).nameEnglish || 'غير محدد';
            }
            // فحص holdingCode كـ fallback
            else if (client.holdingCode && typeof client.holdingCode === 'object' && client.holdingCode !== null && 'village' in client.holdingCode) {
              village = client.holdingCode.village || 'غير محدد';
            }
            // إذا كان village مجرد string (legacy data)
            else if (typeof client.village === 'string') {
              village = client.village || 'غير محدد';
            }
          }
          // إذا كان client مجرد ID، استخدم herdLocation كـ fallback
          else {
            const location = parasiteControl.herdLocation || 'غير محدد';
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
    // Animal Counts - Sheep
    {
      id: "sheep",
      header: "Sheep",
      cell: ({ row }) => {
        const sheep = row.original.herdCounts?.sheep;
        if (!sheep) return <span className="text-gray-400">-</span>;
        return (
          <div className="text-xs space-y-1">
            <div>Total: {sheep.total || 0}</div>
            <div>Young: {sheep.young || 0}</div>
            <div>Female: {sheep.female || 0}</div>
            <div className="text-green-600">Treated: {sheep.treated || 0}</div>
          </div>
        );
      },
    },
    // Animal Counts - Goats
    {
      id: "goats",
      header: "Goats",
      cell: ({ row }) => {
        const goats = row.original.herdCounts?.goats;
        if (!goats) return <span className="text-gray-400">-</span>;
        return (
          <div className="text-xs space-y-1">
            <div>Total: {goats.total || 0}</div>
            <div>Young: {goats.young || 0}</div>
            <div>Female: {goats.female || 0}</div>
            <div className="text-green-600">Treated: {goats.treated || 0}</div>
          </div>
        );
      },
    },
    // Animal Counts - Camel
    {
      id: "camel",
      header: "Camel",
      cell: ({ row }) => {
        const camel = row.original.herdCounts?.camel;
        if (!camel) return <span className="text-gray-400">-</span>;
        return (
          <div className="text-xs space-y-1">
            <div>Total: {camel.total || 0}</div>
            <div>Young: {camel.young || 0}</div>
            <div>Female: {camel.female || 0}</div>
            <div className="text-green-600">Treated: {camel.treated || 0}</div>
          </div>
        );
      },
    },
    // Animal Counts - Cattle
    {
      id: "cattle",
      header: "Cattle",
      cell: ({ row }) => {
        const cattle = row.original.herdCounts?.cattle;
        if (!cattle) return <span className="text-gray-400">-</span>;
        return (
          <div className="text-xs space-y-1">
            <div>Total: {cattle.total || 0}</div>
            <div>Young: {cattle.young || 0}</div>
            <div>Female: {cattle.female || 0}</div>
            <div className="text-green-600">Treated: {cattle.treated || 0}</div>
          </div>
        );
      },
    },
    // Total Herd Summary
    {
      id: "totals",
      header: "Total Herd",
      cell: ({ row }) => {
        const herdCounts = row.original.herdCounts;
        if (!herdCounts) return <span className="text-gray-400">-</span>;
        
        const totalHerd = row.original.totalHerdCount || 0;
        const totalYoung = (herdCounts.sheep?.young || 0) + (herdCounts.goats?.young || 0) + 
                          (herdCounts.camel?.young || 0) + (herdCounts.cattle?.young || 0);
        const totalFemale = (herdCounts.sheep?.female || 0) + (herdCounts.goats?.female || 0) + 
                           (herdCounts.camel?.female || 0) + (herdCounts.cattle?.female || 0);
        const totalTreated = row.original.totalTreated || 0;
        
        return (
          <div className="text-xs space-y-1">
            <Badge variant="secondary">Total: {totalHerd}</Badge>
            <div>Young: {totalYoung}</div>
            <div>Female: {totalFemale}</div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Treated: {totalTreated}
            </Badge>
          </div>
        );
      },
    },
    // Insecticide Info
    {
      id: "insecticide",
      header: "Insecticide",
      cell: ({ row }) => {
        const insecticide = row.original.insecticide;
        if (!insecticide) return <span className="text-gray-400">-</span>;
        
        return (
          <div className="text-xs space-y-1">
            <div className="font-medium">{insecticide.type || '-'}</div>
            <div>Method: {insecticide.method || '-'}</div>
            <div>Volume: {insecticide.volumeMl || 0} ml</div>
            <div>Category: {insecticide.category || '-'}</div>
            <Badge className={insecticide.status === 'Sprayed' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
              {insecticide.status === 'Sprayed' ? 'Sprayed' : 'Not Sprayed'}
            </Badge>
          </div>
        );
      },
    },
    // Holding Code
    {
      id: "holdingCode",
      header: "Holding Code",
      cell: ({ row }) => {
        const holdingCode = row.original.holdingCode;
        
        // Debug logging for development
        console.log('🔍 Holding Code Column Debug:', {
          recordId: row.original._id,
          serialNo: row.original.serialNo,
          holdingCode,
          type: typeof holdingCode,
          isObject: typeof holdingCode === 'object' && holdingCode !== null,
          hasCode: typeof holdingCode === 'object' && holdingCode !== null ? (holdingCode as any).code : holdingCode,
          hasVillage: typeof holdingCode === 'object' && holdingCode !== null ? (holdingCode as any).village : '',
        });
        
        // Handle null, undefined, or empty holding code
        if (!holdingCode || holdingCode === null || holdingCode === undefined || holdingCode === '') {
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
        const code = typeof holdingCode === 'object' && holdingCode !== null ? holdingCode.code : holdingCode;
        const village = typeof holdingCode === 'object' && holdingCode !== null ? holdingCode.village : '';
        const isActive = typeof holdingCode === 'object' && holdingCode !== null ? (holdingCode as any).isActive !== false : true;
        
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
    // Size, Volume, Status
    {
      id: "facility",
      header: "Facility",
      cell: ({ row }) => {
        const barnSize = row.original.animalBarnSizeSqM;
        
        return (
          <div className="text-xs space-y-1">
            <div>Size: {barnSize || 0} sqM</div>
          </div>
        );
      },
    },
    // Health Status & Compliance
    {
      id: "health",
      header: "Health & Compliance",
      cell: ({ row }) => {
        const healthStatus = row.original.herdHealthStatus;
        const compliance = row.original.complyingToInstructions as unknown as string;
        
        const statusColors = {
          "Healthy": "bg-green-500 text-white",
          "Sick": "bg-red-500 text-white",
          "Under Treatment": "bg-yellow-500 text-white",
        };
        
        const complianceColors = {
          "Comply": "bg-green-500 text-white",
          "Not Comply": "bg-red-500 text-white", 
          "Partially Comply": "bg-yellow-500 text-white",
        };
        
        return (
          <div className="space-y-1">
            <Badge className={statusColors[healthStatus as keyof typeof statusColors] || "bg-gray-500 text-white"}>
              {healthStatus}
            </Badge>
            <div className="text-xs">
              <Badge className={complianceColors[compliance as keyof typeof complianceColors] || "bg-gray-500 text-white"}>
                {compliance || 'غير محدد'}
              </Badge>
            </div>
          </div>
        );
      },
    },
    // Request Info
    {
      id: "request",
      header: "Request",
      cell: ({ row }) => {
        const request = row.original.request;
        if (!request) return <span className="text-gray-400">-</span>;
        
        const requestDate = request.date ? new Date(request.date).toLocaleDateString("en-US") : '';
        const fulfillingDate = request.fulfillingDate ? new Date(request.fulfillingDate).toLocaleDateString("en-US") : '';
        
        const statusColors = {
          "Ongoing": "bg-blue-500 text-white",
          "Closed": "bg-green-500 text-white",
        };
        
        return (
          <div className="text-xs space-y-1">
            <div>Date: {requestDate}</div>
            <Badge className={statusColors[request.situation as keyof typeof statusColors] || "bg-gray-500 text-white"}>
              {request.situation}
            </Badge>
            {fulfillingDate && (
              <div>Fulfilled: {fulfillingDate}</div>
            )}
          </div>
        );
      },
    },
    // Remarks
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const remarks = row.getValue("remarks") as string;
        if (!remarks) return <span className="text-gray-400">-</span>;
        return (
          <div className="text-xs max-w-[150px] truncate" title={remarks}>
            {remarks}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const canEdit = checkPermission({ module: 'parasite-control', action: 'edit' });
        const canDelete = checkPermission({ module: 'parasite-control', action: 'delete' });
        
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
                <MoreHorizontal className="h-5 w-5 text-blue-700 font-bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-2 border-blue-200 shadow-xl rounded-lg">
              <div className="px-3 py-2 border-b border-blue-100">
                <span className="text-sm font-semibold text-blue-800">الإجراءات</span>
              </div>
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
