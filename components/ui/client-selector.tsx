"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/types";
import { User, Phone, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ClientSelectorProps {
  value?: string;
  onValueChange?: (client: Client | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  showDetails?: boolean;
}

export function ClientSelector({
  value,
  onValueChange,
  placeholder = "ابحث عن المربي",
  disabled = false,
  className,
  error,
  required = false,
  showDetails = true,
}: ClientSelectorProps) {
  const {
    data: clientsResponse,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getList({
      page: 1,
      limit: 100,
    }),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  const clients = clientsResponse?.data || [];

  // Find selected client
  const selectedClient = clients.find(client => client._id === value);

  // Handle client selection
  const handleSelect = (clientId: string) => {
    const client = clients.find(c => c._id === clientId);
    onValueChange?.(client || null);
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Select
        value={value}
        onValueChange={handleSelect}
        disabled={disabled}
      >
        <SelectTrigger className={`w-full ${error ? 'border-red-500' : ''}`}>
          <SelectValue placeholder={placeholder}>
            {selectedClient && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{selectedClient.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedClient.nationalId}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          
          {fetchError && (
            <div className="text-center py-6">
              <p className="text-red-500">خطأ في تحميل المربيين</p>
              <p className="text-sm text-muted-foreground mt-1">
                يرجى المحاولة مرة أخرى
              </p>
            </div>
          )}

          {!isLoading && !fetchError && clients.length === 0 && (
            <div className="text-center py-6">
              <p>لم يتم العثور على مربيين</p>
            </div>
          )}

          {!isLoading && !fetchError && clients.length > 0 && (
            <>
              {clients.map((client) => (
                <SelectItem key={client._id || client.name} value={client._id || client.name}>
                  <div className="flex items-center gap-3 py-1 w-full">
                    {/* Client Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {client.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Client Info */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {client.name}
                        </span>
                        <Badge 
                          variant={client.status === "نشط" ? "default" : "secondary"}
                          className="text-xs bg-gray-100 text-black"
                        >
                          {client.status}
                        </Badge>
                      </div>
                      
                      {showDetails && (
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                          {client.nationalId && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{client.nationalId}</span>
                            </div>
                          )}
                          
                          {client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          
                          {client.village && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{client.village}</span>
                            </div>
                          )}
                          
                          {client.birthDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(client.birthDate)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {client.animals && client.animals.length > 0 && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {client.animals.length} حيوان
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-red-500 text-sm font-medium">{error}</p>
      )}
      
      {required && !value && (
        <p className="text-red-500 text-sm font-medium">المربي مطلوب</p>
      )}
    </div>
  );
}