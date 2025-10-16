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
import { Edit, MoreHorizontal, Trash2, Eye, MapPin, Phone, Calendar, User } from "lucide-react";
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
        const birthDate = typeof client === 'object' && client?.birthDate ? new Date(client.birthDate).toLocaleDateString("en-US") : '';
        
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
    // Size, Volume, Status
    {
      id: "facility",
      header: "Facility",
      cell: ({ row }) => {
        const barnSize = row.original.animalBarnSizeSqM;
        const controlVolume = row.original.parasiteControlVolume;
        const controlStatus = row.original.parasiteControlStatus;
        
        return (
          <div className="text-xs space-y-1">
            <div>Size: {barnSize || 0} sqM</div>
            <div>Volume: {controlVolume || 0}</div>
            <div>Status: {controlStatus || '-'}</div>
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
        const compliance = row.original.complyingToInstructions;
        
        const statusColors = {
          "Healthy": "bg-green-500 text-white",
          "Sick": "bg-red-500 text-white",
          "Under Treatment": "bg-yellow-500 text-white",
        };
        
        return (
          <div className="space-y-1">
            <Badge className={statusColors[healthStatus as keyof typeof statusColors] || "bg-gray-500 text-white"}>
              {healthStatus}
            </Badge>
            <div className="text-xs">
              Complying: {compliance ? 'Yes' : 'No'}
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
          "Open": "bg-blue-500 text-white",
          "Closed": "bg-green-500 text-white",
          "Pending": "bg-yellow-500 text-white",
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
      header: "الإجراءات",
      cell: ({ row }) => {
        const canEdit = checkPermission({ module: 'parasite-control', action: 'edit' });
        const canDelete = checkPermission({ module: 'parasite-control', action: 'delete' });
        
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
