"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/types";

interface ClientSelectorProps {
  value?: Client | null;
  onValueChange: (client: Client | null) => void;
  placeholder?: string;
  className?: string;
}

export function ClientSelector({
  value,
  onValueChange,
  placeholder = "اختر عميل...",
  className,
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Load clients
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientsApi.getList({ page: 1, limit: 100 });
      setClients(response.data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name?.toLowerCase().includes(search.toLowerCase()) ||
    client.nationalId?.includes(search) ||
    client.phone?.includes(search)
  );

  return (
    <div className={cn("w-full", className)}>
      <Select
        value={value?._id || value?.id || ""}
        onValueChange={(clientId) => {
          const client = clients.find(c => (c._id || c.id) === clientId);
          onValueChange(client || null);
        }}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            {value ? (
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">{value.name}</span>
                <span className="text-xs text-muted-foreground">
                  {value.nationalId} • {value.phone}
                </span>
              </div>
            ) : (
              <SelectValue placeholder={placeholder} />
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>
              جاري التحميل...
            </SelectItem>
          ) : filteredClients.length === 0 ? (
            <SelectItem value="empty" disabled>
              لا توجد عملاء
            </SelectItem>
          ) : (
            filteredClients.map((client) => (
              <SelectItem 
                key={client._id || client.id} 
                value={client._id || client.id || ""}
              >
                <div className="flex flex-col">
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {client.nationalId} • {client.phone}
                  </div>
                  {client.village && (
                    <div className="text-xs text-muted-foreground">
                      {client.village}
                    </div>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
