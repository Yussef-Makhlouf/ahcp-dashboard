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
        const totalYoung = row.original.totalYoung || 0;
        const totalFemale = row.original.totalFemale || 0;
        const totalTreated = row.original.totalTreated || 0;
        const treatmentEfficiency = row.original.treatmentEfficiency || 0;
        
        return (
          <div className="text-xs space-y-1 min-w-[120px]">
            <Badge variant="secondary" className="w-full justify-center">
              Total: {totalHerd}
            </Badge>
            <div className="flex justify-between">
              <span className="text-gray-500">Young:</span>
              <span className="font-medium">{totalYoung}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Female:</span>
              <span className="font-medium">{totalFemale}</span>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600 w-full justify-center">
              Treated: {totalTreated}
            </Badge>
            {treatmentEfficiency > 0 && (
              <div className={`text-center px-2 py-1 rounded text-xs font-medium ${
                treatmentEfficiency >= 80 ? 'bg-green-100 text-green-800' :
                treatmentEfficiency >= 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {treatmentEfficiency}% Efficiency
              </div>
            )}
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
        
        // Handle both object and string types
        let parsedInsecticide;
        try {
          if (typeof insecticide === 'string') {
            parsedInsecticide = JSON.parse(insecticide);
          } else if (typeof insecticide === 'object') {
            parsedInsecticide = insecticide;
          } else {
            return <span className="text-gray-400">-</span>;
          }
        } catch (error) {
          // If parsing fails, try to display the raw string
          return (
            <div className="text-xs">
              <div className="text-red-500">Invalid data format</div>
              <div className="text-gray-500 text-xs">{String(insecticide).substring(0, 50)}...</div>
            </div>
          );
        }
        
        return (
          <div className="text-xs space-y-1 min-w-[200px]">
            <div className="font-medium text-blue-600">{parsedInsecticide.type || 'N/A'}</div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Method:</span>
              <span className="font-medium">{parsedInsecticide.method || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Volume:</span>
              <span className="font-medium">{parsedInsecticide.volumeMl || parsedInsecticide.volume_ml || 0} ml</span>
            </div>
            {parsedInsecticide.concentration && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Concentration:</span>
                <span className="font-medium text-orange-600">{parsedInsecticide.concentration}</span>
              </div>
            )}
            {parsedInsecticide.manufacturer && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Manufacturer:</span>
                <span className="font-medium text-purple-600">{parsedInsecticide.manufacturer}</span>
              </div>
            )}
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              parsedInsecticide.status === 'Sprayed' ? 'bg-green-100 text-green-800' : 
              parsedInsecticide.status === 'Partially Sprayed' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {parsedInsecticide.status || 'N/A'}
            </div>
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
        
        // Handle populated object (when populate works)
        if (typeof holdingCode === 'object' && holdingCode !== null && (holdingCode as any).code) {
          const code = (holdingCode as any).code;
          const village = (holdingCode as any).village || '';
          const isActive = (holdingCode as any).isActive !== false;
          
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
        }
        
        // Handle string ObjectId (when populate doesn't work or manual input)
        if (typeof holdingCode === 'string') {
          // Check if it's a valid ObjectId
          if (/^[0-9a-fA-F]{24}$/.test(holdingCode)) {
            return (
              <div className="text-xs">
                <div className="flex items-center gap-1 text-orange-600">
                  <Hash className="h-3 w-3" />
                  <span>رمز حيازة: {holdingCode.slice(-6)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  (لم يتم تحميل التفاصيل)
                </div>
              </div>
            );
          } else {
            // Invalid string - probably manual input that wasn't converted to ObjectId
            return (
              <div className="text-xs">
                <div className="flex items-center gap-1 text-red-600">
                  <Hash className="h-3 w-3" />
                  <span>رمز غير صحيح: {holdingCode}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  يحتاج إلى تصحيح
                </div>
              </div>
            );
          }
        }
        
        // Fallback for any other case
        return (
          <div className="text-xs">
            <div className="flex items-center gap-1 text-gray-500">
              <Hash className="h-3 w-3" />
              <span>غير محدد</span>
            </div>
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
          "Sporadic cases": "bg-yellow-500 text-white",
          // Backward compatibility
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
