"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ParasiteControl } from "@/types";
import { formatDate, formatPhoneNumber } from "@/lib/utils";

interface ColumnsProps {
  onEdit: (item: ParasiteControl) => void;
  onDelete: (id: number) => void;
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<ParasiteControl>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "serialNo",
    header: "الرقم المسلسل",
  },
  {
    accessorKey: "date",
    header: "التاريخ",
    cell: ({ row }) => formatDate(row.getValue("date")),
  },
  {
    accessorKey: "owner.name",
    header: "اسم المربي",
  },
  {
    accessorKey: "owner.id",
    header: "رقم الهوية",
  },
  {
    accessorKey: "owner.phone",
    header: "رقم الهاتف",
    cell: ({ row }) => {
      const phone = row.original.owner.phone;
      return <span dir="ltr">{formatPhoneNumber(phone)}</span>;
    },
  },
  {
    accessorKey: "supervisor",
    header: "المشرف",
  },
  {
    accessorKey: "vehicleNo",
    header: "رقم المركبة",
  },
  {
    id: "animals",
    header: "الحيوانات",
    cell: ({ row }) => {
      const herd = row.original.herd;
      const total = 
        herd.sheep.total + 
        herd.goats.total + 
        herd.camel.total + 
        herd.cattle.total;
      return (
        <div className="text-sm">
          <span className="font-medium">{total}</span>
          <span className="text-muted-foreground"> حيوان</span>
        </div>
      );
    },
  },
  {
    accessorKey: "insecticide.status",
    header: "حالة الرش",
    cell: ({ row }) => {
      const status = row.original.insecticide.status;
      return (
        <Badge
          variant={status === "Sprayed" ? "default" : "destructive"}
          className={status === "Sprayed" ? "bg-green-600" : ""}
        >
          {status === "Sprayed" ? "تم الرش" : "لم يتم الرش"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "herdHealthStatus",
    header: "الحالة الصحية",
    cell: ({ row }) => {
      const status = row.getValue("herdHealthStatus") as string;
      const variants: Record<string, "default" | "secondary" | "destructive"> = {
        Healthy: "default",
        Sick: "destructive",
        "Under Treatment": "secondary",
      };
      const labels: Record<string, string> = {
        Healthy: "صحي",
        Sick: "مريض",
        "Under Treatment": "تحت العلاج",
      };
      return (
        <Badge variant={variants[status] || "default"}>
          {labels[status] || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "request.situation",
    header: "حالة الطلب",
    cell: ({ row }) => {
      const situation = row.original.request.situation;
      const variants: Record<string, "default" | "secondary" | "destructive"> = {
        Closed: "default",
        Open: "destructive",
        Pending: "secondary",
      };
      const labels: Record<string, string> = {
        Closed: "مغلق",
        Open: "مفتوح",
        Pending: "معلق",
      };
      return (
        <Badge variant={variants[situation] || "default"}>
          {labels[situation] || situation}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">فتح القائمة</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="ml-2 h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(item.serialNo)}
              className="text-red-600"
            >
              <Trash className="ml-2 h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
