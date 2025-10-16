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
import { usePermissions } from "@/lib/hooks/usePermissions";
import type { Vaccination } from "@/types";

interface GetColumnsProps {
  onEdit: (item: Vaccination) => void;
  onDelete: (item: Vaccination) => void;
  onView?: (item: Vaccination) => void;
}

export function getColumns({
  onEdit,
  onDelete,
  onView
}: GetColumnsProps): ColumnDef<Vaccination>[] {
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
    // Name, ID, Birth Date, Phone
    {
      id: "clientInfo",
      header: "Client Info",
      cell: ({ row }) => {
        const client = row.original.client;
        const name = client?.name || '-';
        const nationalId = client?.nationalId || '';
        const phone = client?.phone || '';
        const birthDate = client?.birthDate ? new Date(client.birthDate).toLocaleDateString("en-US") : '';
        
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
    // Location
    {
      accessorKey: "farmLocation",
      header: "Location",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("farmLocation") || 'غير محدد'}</div>
      ),
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
    // Team
    {
      accessorKey: "team",
      header: "Team",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("team")}</div>
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
            <div>Female: {sheep.female || 0}</div>
            <div className="text-green-600">Vaccinated: {sheep.vaccinated || 0}</div>
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
            <div>Female: {goats.female || 0}</div>
            <div className="text-green-600">Vaccinated: {goats.vaccinated || 0}</div>
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
            <div>Female: {camel.female || 0}</div>
            <div className="text-green-600">Vaccinated: {camel.vaccinated || 0}</div>
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
            <div>Female: {cattle.female || 0}</div>
            <div className="text-green-600">Vaccinated: {cattle.vaccinated || 0}</div>
          </div>
        );
      },
    },
    // Total Herd Summary
    {
      id: "totals",
      header: "Herd Summary",
      cell: ({ row }) => {
        const herdCounts = row.original.herdCounts;
        if (!herdCounts) return <span className="text-gray-400">-</span>;
        
        const totalHerd = (herdCounts.sheep?.total || 0) + (herdCounts.goats?.total || 0) + 
                         (herdCounts.camel?.total || 0) + (herdCounts.cattle?.total || 0);
        const totalFemales = (herdCounts.sheep?.female || 0) + (herdCounts.goats?.female || 0) + 
                           (herdCounts.camel?.female || 0) + (herdCounts.cattle?.female || 0);
        const totalVaccinated = (herdCounts.sheep?.vaccinated || 0) + (herdCounts.goats?.vaccinated || 0) + 
                               (herdCounts.camel?.vaccinated || 0) + (herdCounts.cattle?.vaccinated || 0);
        
        return (
          <div className="text-xs space-y-1">
            <Badge variant="secondary">Herd: {totalHerd}</Badge>
            <div>Females: {totalFemales}</div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Vaccinated: {totalVaccinated}
            </Badge>
          </div>
        );
      },
    },
    // Herd Health, Animals Handling, Labours, Reachable Location
    {
      id: "conditions",
      header: "Conditions",
      cell: ({ row }) => {
        const herdHealth = row.original.herdHealth;
        const animalsHandling = row.original.animalsHandling;
        const labours = row.original.labours;
        const reachableLocation = row.original.reachableLocation;
        
        return (
          <div className="text-xs space-y-1">
            <div>Health: {herdHealth || '-'}</div>
            <div>Handling: {animalsHandling || '-'}</div>
            <div>Labours: {labours || '-'}</div>
            <div>Location: {reachableLocation || '-'}</div>
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
    // Vaccine & Category
    {
      id: "vaccine",
      header: "Vaccine",
      cell: ({ row }) => {
        const vaccineType = row.original.vaccineType;
        const vaccineCategory = row.original.vaccineCategory;
        
        const categoryColors = {
          "Preventive": "bg-blue-500 text-white",
          "Emergency": "bg-red-500 text-white",
        };
        
        return (
          <div className="text-xs space-y-1">
            <div className="font-medium">{vaccineType || '-'}</div>
            <Badge className={categoryColors[vaccineCategory as keyof typeof categoryColors] || "bg-gray-500 text-white"}>
              {vaccineCategory}
            </Badge>
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
        const canEdit = checkPermission({ module: 'vaccination', action: 'edit' });
        const canDelete = checkPermission({ module: 'vaccination', action: 'delete' });
        
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