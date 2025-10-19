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
import type { Laboratory } from "@/types";

interface GetColumnsProps {
  onEdit: (item: Laboratory) => void;
  onDelete: (item: Laboratory) => void;
  onView?: (item: Laboratory) => void;
}

export function getColumns({
  onEdit,
  onDelete,

}: GetColumnsProps): ColumnDef<Laboratory>[] {
  const { checkPermission } = usePermissions();
  
  return [
    // Serial Number
    {
      accessorKey: "serialNo",
      header: "Serial",
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("serialNo")}</div>
      ),
      size: 80,
    },
    // Date
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        return <SimpleDateCell date={row.getValue("date")} className="text-sm" />;
      },
      size: 100,
    },
    // Sample Code
    {
      accessorKey: "sampleCode",
      header: "Sample Code",
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">{row.getValue("sampleCode")}</div>
      ),
      size: 120,
    },
    // Client Info (Name, ID, Birth Date, Phone) - Enhanced to support both flat and nested structures
    {
      id: "clientInfo",
      header: "Client Info",
      cell: ({ row }) => {
        // Support both flat client fields and nested client object
        const name = row.original.clientName || row.original.client?.name || '-';
        const nationalId = row.original.clientId || row.original.client?.nationalId || '';
        const phone = row.original.clientPhone || row.original.client?.phone || '';
        const birthDate = row.original.clientBirthDate || row.original.client?.birthDate;
        
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
    // Birth Date - Enhanced to support both flat and nested structures
    {
      accessorKey: "clientBirthDate",
      header: "Birth Date", 
      cell: ({ row }) => {
        // Support both flat client fields and nested client object
        const birthDate = row.original.clientBirthDate || row.original.client?.birthDate;
        
        // Debug logging
        console.log(`🔍 Birth Date Column - Row data:`, {
          clientBirthDate: row.original.clientBirthDate,
          clientBirthDateType: typeof row.original.clientBirthDate,
          nestedBirthDate: row.original.client?.birthDate,
          nestedBirthDateType: typeof row.original.client?.birthDate,
          finalValue: birthDate,
          finalType: typeof birthDate
        });
        
        return <BirthDateCell date={birthDate} className="text-sm" />;
      },
      size: 120,
    },
    // Phone - Enhanced to support both flat and nested structures
    {
      accessorKey: "clientPhone",
      header: "Phone",
      cell: ({ row }) => {
        // Support both flat client fields and nested client object
        const phone = row.original.clientPhone || row.original.client?.phone || '';
        return (
          <div className="font-mono text-sm">{phone}</div>
        );
      },
      size: 120,
    },
    // Location
    {
      accessorKey: "farmLocation",
      header: "Location",
      cell: ({ row }) => (
        <div className="max-w-[120px] truncate" title={row.getValue("farmLocation")}>
          {row.getValue("farmLocation")}
        </div>
      ),
      size: 120,
    },
    // N (North Coordinate)
    {
      accessorKey: "coordinates.latitude",
      header: "N",
      cell: ({ row }) => {
        const coords = row.original.coordinates;
        return (
          <div className="font-mono text-xs">
            {coords?.latitude ? coords.latitude.toFixed(4) : '0'}
          </div>
        );
      },
      size: 80,
    },
    // E (East Coordinate)
    {
      accessorKey: "coordinates.longitude",
      header: "E",
      cell: ({ row }) => {
        const coords = row.original.coordinates;
        return (
          <div className="font-mono text-xs">
            {coords?.longitude ? coords.longitude.toFixed(4) : '0'}
          </div>
        );
      },
      size: 80,
    },
    // Sheep
    {
      accessorKey: "speciesCounts.sheep",
      header: "Sheep",
      cell: ({ row }) => {
        const counts = row.original.speciesCounts;
        return (
          <div className="text-sm font-medium text-center">
            {counts?.sheep || 0}
          </div>
        );
      },
      size: 70,
    },
    // Goats
    {
      accessorKey: "speciesCounts.goats",
      header: "Goats",
      cell: ({ row }) => {
        const counts = row.original.speciesCounts;
        return (
          <div className="text-sm font-medium text-center">
            {counts?.goats || 0}
          </div>
        );
      },
      size: 70,
    },
    // Camel
    {
      accessorKey: "speciesCounts.camel",
      header: "Camel",
      cell: ({ row }) => {
        const counts = row.original.speciesCounts;
        return (
          <div className="text-sm font-medium text-center">
            {counts?.camel || 0}
          </div>
        );
      },
      size: 70,
    },
    // Horse
    {
      accessorKey: "speciesCounts.horse",
      header: "Horse",
      cell: ({ row }) => {
        const counts = row.original.speciesCounts;
        return (
          <div className="text-sm font-medium text-center">
            {counts?.horse || 0}
          </div>
        );
      },
      size: 70,
    },
    // Cattle
    {
      accessorKey: "speciesCounts.cattle",
      header: "Cattle",
      cell: ({ row }) => {
        const counts = row.original.speciesCounts;
        return (
          <div className="text-sm font-medium text-center">
            {counts?.cattle || 0}
          </div>
        );
      },
      size: 70,
    },
    // Other (Species)
    {
      accessorKey: "speciesCounts.other",
      header: "Other (Species)",
      cell: ({ row }) => {
        const counts = row.original.speciesCounts;
        return (
          <div className="max-w-[100px] truncate text-sm" title={counts?.other}>
            {counts?.other || 'لا يوجد'}
          </div>
        );
      },
      size: 120,
    },
    // Sample Collector
    {
      accessorKey: "collector",
      header: "Sample Collector",
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.getValue("collector")}</div>
      ),
      size: 140,
    },
    // Holding Code
    {
      id: "holdingCode",
      header: "Holding Code",
      cell: ({ row }) => {
        const holdingCode = row.original.holdingCode;
        
        if (!holdingCode) {
          return <span className="text-gray-400 text-xs">-</span>;
        }
        
        // Handle both string and object types
        const code = typeof holdingCode === 'object' ? holdingCode.code : holdingCode;
        const village = typeof holdingCode === 'object' ? holdingCode.village : '';
        
        return (
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1 font-medium">
              <Hash className="h-3 w-3 text-blue-500" />
              <span>{code}</span>
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
    // Sample Type
    {
      accessorKey: "sampleType",
      header: "Sample Type",
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
      size: 110,
    },
    // Samples Number (رمز جامع العينة)
    {
      accessorKey: "sampleNumber",
      header: "Samples Number",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("sampleNumber")}</div>
      ),
      size: 130,
    },
    // Positive Cases
    {
      accessorKey: "positiveCases",
      header: "Positive Cases",
      cell: ({ row }) => {
        const positive = row.getValue("positiveCases") as number;
        return (
          <Badge className={positive > 0 ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}>
            {positive}
          </Badge>
        );
      },
      size: 120,
    },
    // Negative Cases
    {
      accessorKey: "negativeCases",
      header: "Negative Cases",
      cell: ({ row }) => {
        const negative = row.getValue("negativeCases") as number;
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {negative}
          </Badge>
        );
      },
      size: 120,
    },
    // Remarks
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const remarks = row.getValue("remarks") as string;
        return (
          <div className="max-w-[150px] truncate" title={remarks}>
            {remarks || 'لا توجد ملاحظات'}
          </div>
        );
      },
      size: 150,
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const canEdit = checkPermission({ module: 'laboratories', action: 'edit' });
        const canDelete = checkPermission({ module: 'laboratories', action: 'delete' });
        
        return (
          <div className="flex items-center gap-2">
      
            {/* Show dropdown only if user has edit or delete permissions */}
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">فتح القائمة</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
            )}
          </div>
        );
      },
      size: 100,
    },
  ];
}
