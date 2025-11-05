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

const formatInterventionCategory = (value?: string | null) => {
  if (value === undefined || value === null) {
    return "غير محدد";
  }

  const stringValue = value.toString().trim();
  if (!stringValue) {
    return "غير محدد";
  }

  return stringValue;
};

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
        // دعم كلا من البنية المسطحة (الإدخال اليدوي) والمتداخلة (اختيار من القائمة)
        const client = row.original.client;
        const name = row.original.clientName || client?.name || '-';
        const nationalId = row.original.clientId || client?.nationalId || '';
        const phone = row.original.clientPhone || client?.phone || '';
        const birthDate = row.original.clientBirthDate || (client as any)?.birthDate;
        const village = row.original.clientVillage || 
          (typeof client?.village === 'object' && client.village !== null ? 
            (client.village as any).nameArabic || (client.village as any).nameEnglish : 
            client?.village) || '';
        
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
            {village && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {village}
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
      accessorKey: "clientBirthDate",
      header: "Birth Date",
      cell: ({ row }) => {
        // دعم كلا من البنية المسطحة والمتداخلة
        const client = row.original.client;
        const birthDate = row.original.clientBirthDate || client?.birthDate;
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
              const holdingCodeVillage = ((client as any).holdingCode as any).village;
              village = typeof holdingCodeVillage === 'object' ? 
                (holdingCodeVillage.nameArabic || holdingCodeVillage.nameEnglish || 'غير محدد') : 
                (holdingCodeVillage || 'غير محدد');
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
    // Intervention Categories
    {
      id: "interventionCategories",
      header: "Intervention Categories",
      cell: ({ row }) => {
        const rawCategories = (row.original as any).interventionCategories;
        const fallbackCategory = row.original.interventionCategory;

        const categories = Array.isArray(rawCategories)
          ? rawCategories
          : fallbackCategory
            ? [fallbackCategory]
            : [];

        if (categories.length === 0) {
          return <span className="text-xs text-muted-foreground">غير محدد</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {categories.map((category) => {
              const label = formatInterventionCategory(category);
              const key = typeof category === "string" ? category : JSON.stringify(category);
              return (
                <Badge
                  key={key}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {label}
                </Badge>
              );
            })}
          </div>
        );
      },
      size: 220,
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
        const village = typeof holdingCode === 'object' ? 
          (typeof holdingCode.village === 'object' && holdingCode.village !== null ? (holdingCode.village as any).nameArabic || (holdingCode.village as any).nameEnglish : holdingCode.village) : '';
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
    // Diagnosis
    {
      id: "diagnosis",
      header: "Diagnosis",
      cell: ({ row }) => {
        const diagnosis = row.original.diagnosis;
        
        if (!diagnosis) {
          return <span className="text-xs text-muted-foreground">غير محدد</span>;
        }

        // Handle both string and array formats
        const diagnoses = Array.isArray(diagnosis) ? diagnosis : [diagnosis];
        const diagnosisCount = diagnoses.length;
        
        if (diagnosisCount === 0) {
          return <span className="text-xs text-muted-foreground">غير محدد</span>;
        }

        if (diagnosisCount === 1) {
          const diagnosisText = typeof diagnoses[0] === 'object' 
            ? (diagnoses[0] as any).label || (diagnoses[0] as any).labelAr || (diagnoses[0] as any).name || String(diagnoses[0]) 
            : String(diagnoses[0]);
          return (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                {diagnosisText.length > 25 ? diagnosisText.substring(0, 25) + '...' : diagnosisText}
              </Badge>
            </div>
          );
        }

        const firstDiagnosis = typeof diagnoses[0] === 'object'
          ? (diagnoses[0] as any).label || (diagnoses[0] as any).labelAr || (diagnoses[0] as any).name || String(diagnoses[0])
          : String(diagnoses[0]);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3 gap-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
                <span className="text-xs font-medium">
                  {firstDiagnosis.length > 15 ? firstDiagnosis.substring(0, 15) + '...' : firstDiagnosis}
                </span>
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  +{diagnosisCount - 1}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 max-h-96 overflow-y-auto">
              <div className="px-2 py-1.5 text-sm font-semibold text-purple-700 border-b">
                التشخيصات ({diagnosisCount})
              </div>
              {diagnoses.map((item, index) => {
                const diagnosisText = typeof item === 'object'
                  ? (item as any).label || (item as any).labelAr || (item as any).name || String(item)
                  : String(item);
                return (
                  <DropdownMenuItem key={index} className="py-2 px-3">
                    <div className="flex items-start gap-2 w-full">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs shrink-0">
                        {index + 1}
                      </Badge>
                      <span className="text-xs break-words flex-1">{diagnosisText}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 200,
    },
    // Medications (Treatment)
    {
      id: "medications",
      header: "Medications",
      cell: ({ row }) => {
        // Use treatment field as it contains the medications/treatment text
        const treatment = row.original.treatment;
        
        if (!treatment || treatment.trim() === '') {
          return <span className="text-xs text-muted-foreground">غير محدد</span>;
        }

        // Split by common separators to show as list
        const meds = treatment.split(/[,،؛;]+/).map(m => m.trim()).filter(m => m);
        const medsCount = meds.length;
        
        if (medsCount === 0) {
          return <span className="text-xs text-muted-foreground">غير محدد</span>;
        }

        if (medsCount === 1) {
          return (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                {meds[0].length > 25 ? meds[0].substring(0, 25) + '...' : meds[0]}
              </Badge>
            </div>
          );
        }

        const firstMed = meds[0];

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3 gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                <span className="text-xs font-medium">
                  {firstMed.length > 15 ? firstMed.substring(0, 15) + '...' : firstMed}
                </span>
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  +{medsCount - 1}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 max-h-96 overflow-y-auto">
              <div className="px-2 py-1.5 text-sm font-semibold text-green-700 border-b">
                الأدوية ({medsCount})
              </div>
              {meds.map((medText, index) => (
                <DropdownMenuItem key={index} className="py-2 px-3">
                  <div className="flex items-start gap-2 w-full">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="text-xs break-words flex-1">{medText}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 200,
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
                  onClick={() => onDelete(row.original)}
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
