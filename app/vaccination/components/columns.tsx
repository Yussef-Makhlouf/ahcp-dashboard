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
  return [
    {
      accessorKey: "serialNo",
      header: "الرقم المسلسل",
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
      header: "اسم المالك",
      cell: ({ row }) => {
        const client = row.original.client;
        const owner = row.original.owner; // Legacy support
        
        if (client) {
          return (
            <div>
              <div className="font-medium">{client.name}</div>
              <div className="text-xs text-gray-500">
                {client.nationalId && `هوية: ${client.nationalId}`}
              </div>
              <div className="text-xs text-gray-500">
                {client.phone && `هاتف: ${client.phone}`}
              </div>
            </div>
          );
        } else if (owner) {
          return (
            <div>
              <div className="font-medium">{owner.name}</div>
              <div className="text-xs text-gray-500">
                {owner.id && `هوية: ${owner.id}`}
              </div>
              <div className="text-xs text-gray-500">
                {owner.phone && `هاتف: ${owner.phone}`}
              </div>
            </div>
          );
        }
        
        return <div className="text-gray-500">غير محدد</div>;
      },
    },
    {
      accessorKey: "vaccineType",
      header: "نوع المصل",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("vaccineType")}</Badge>
      ),
    },
    {
      accessorKey: "vaccineCategory",
      header: "فئة المصل",
      cell: ({ row }) => {
        const category = row.getValue("vaccineCategory") as string;
        const categoryColors = {
          "Preventive": "bg-blue-500 text-white border-blue-600",
          "Emergency": "bg-red-500 text-white border-red-600",
        };
        const labels = {
          "Preventive": "وقائي",
          "Emergency": "طوارئ",
        };
        return (
          <Badge className={categoryColors[category as keyof typeof categoryColors] || "bg-gray-500 text-white border-gray-600"}>
            {labels[category as keyof typeof labels] || category}
          </Badge>
        );
      },
    },
    {
      accessorKey: "farmLocation",
      header: "موقع المزرعة",
    },
    {
      id: "herdCounts",
      header: "أعداد القطيع",
      cell: ({ row }) => {
        const herdCounts = row.original.herdCounts;
        const herd = row.original.herd; // Legacy support
        
        if (herdCounts) {
          const totalAnimals = (herdCounts.sheep?.total || 0) + 
                             (herdCounts.goats?.total || 0) + 
                             (herdCounts.cattle?.total || 0) + 
                             (herdCounts.camel?.total || 0) + 
                             (herdCounts.horse?.total || 0);
          
          const totalVaccinated = (herdCounts.sheep?.vaccinated || 0) + 
                                 (herdCounts.goats?.vaccinated || 0) + 
                                 (herdCounts.cattle?.vaccinated || 0) + 
                                 (herdCounts.camel?.vaccinated || 0) + 
                                 (herdCounts.horse?.vaccinated || 0);
          
          return (
            <div className="text-sm">
              <div>الإجمالي: {totalAnimals}</div>
              <div className="text-green-600">المحصن: {totalVaccinated}</div>
            </div>
          );
        } else if (herd) {
          // Legacy support
          const totalAnimals = (herd.sheep?.total || 0) + 
                             (herd.goats?.total || 0) + 
                             (herd.cattle?.total || 0) + 
                             (herd.camel?.total || 0);
          return <div className="text-sm">الإجمالي: {totalAnimals}</div>;
        }
        
        return <div className="text-sm text-gray-500">غير محدد</div>;
      },
    },
    {
      accessorKey: "team",
      header: "الفريق",
    },
    {
      accessorKey: "herdHealth",
      header: "حالة القطيع",
      cell: ({ row }) => {
        const status = row.getValue("herdHealth") as string;
        const statusColors = {
          "Healthy": "bg-green-500 text-white border-green-600",
          "Sick": "bg-red-500 text-white border-red-600",
          "Under Treatment": "bg-yellow-500 text-white border-yellow-600",
        };

        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white border-gray-600"}>
            {status === "Healthy" && "صحي"}
            {status === "Sick" && "مريض"}
            {status === "Under Treatment" && "قيد العلاج"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "animalsHandling",
      header: "معاملة الحيوانات",
      cell: ({ row }) => {
        const handling = row.getValue("animalsHandling") as string;
        const handlingColors = {
          "Easy": "bg-green-500 text-white border-green-600",
          "Difficult": "bg-red-500 text-white border-red-600",
        };
        const labels = {
          "Easy": "سهلة",
          "Difficult": "صعبة",
        };
        return (
          <Badge className={handlingColors[handling as keyof typeof handlingColors] || "bg-gray-500 text-white border-gray-600"}>
            {labels[handling as keyof typeof labels] || handling}
          </Badge>
        );
      },
    },
    {
      accessorKey: "labours",
      header: "حالة العمال",
      cell: ({ row }) => {
        const labours = row.getValue("labours") as string;
        const laboursColors = {
          "Available": "bg-green-500 text-white border-green-600",
          "Not Available": "bg-red-500 text-white border-red-600",
        };
        const labels = {
          "Available": "متوفر",
          "Not Available": "غير متوفر",
        };
        return (
          <Badge className={laboursColors[labours as keyof typeof laboursColors] || "bg-gray-500 text-white border-gray-600"}>
            {labels[labours as keyof typeof labels] || labours}
          </Badge>
        );
      },
    },
    {
      accessorKey: "reachableLocation",
      header: "سهولة الوصول",
      cell: ({ row }) => {
        const location = row.getValue("reachableLocation") as string;
        const locationColors = {
          "Easy": "bg-green-500 text-white border-green-600",
          "Hard to reach": "bg-red-500 text-white border-red-600",
        };
        const labels = {
          "Easy": "سهل",
          "Hard to reach": "صعب",
        };
        return (
          <Badge className={locationColors[location as keyof typeof locationColors] || "bg-gray-500 text-white border-gray-600"}>
            {labels[location as keyof typeof labels] || location}
          </Badge>
        );
      },
    },
    {
      id: "requestInfo",
      header: "معلومات الطلب",
      cell: ({ row }) => {
        const request = row.original.request;
        const status = request?.situation;
        const statusColors = {
          "Open": "bg-blue-500 text-white border-blue-600",
          "Closed": "bg-green-500 text-white border-green-600",
          "Pending": "bg-yellow-500 text-white border-yellow-600",
        };

        return (
          <div className="text-sm">
            <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white border-gray-600"}>
              {status === "Open" && "مفتوح"}
              {status === "Closed" && "مغلق"}
              {status === "Pending" && "معلق"}
              {!status && "غير محدد"}
            </Badge>
            {request?.date && (
              <div className="text-xs text-gray-500 mt-1">
                طلب: {new Date(request.date).toLocaleDateString("ar-EG")}
              </div>
            )}
            {request?.fulfillingDate && (
              <div className="text-xs text-gray-500">
                إنجاز: {new Date(request.fulfillingDate).toLocaleDateString("ar-EG")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => (
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
                <Eye className="ml-2 h-4 w-4" />
                عرض
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="ml-2 h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="text-red-600"
            >
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
