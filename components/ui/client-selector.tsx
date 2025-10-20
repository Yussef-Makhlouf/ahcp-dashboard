"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/types";
import { User, Phone, MapPin, Calendar, Search, X } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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

  const allClients = clientsResponse?.data || [];

  // البحث المحسن - يدعم البحث بالاسم، رقم الهوية، والرقم التسلسلي
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return allClients;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return allClients.filter(client => {
      // البحث بالاسم
      const nameMatch = client.name?.toLowerCase().includes(searchLower);
      
      // البحث برقم الهوية
      const idMatch = client.nationalId?.toLowerCase().includes(searchLower);
      
      // البحث برقم الهاتف (يمكن اعتباره كرقم تسلسلي)
      const phoneMatch = client.phone?.includes(searchTerm);
      
      // البحث بالقرية
      const villageMatch = client.village?.toLowerCase().includes(searchLower);
      
      return nameMatch || idMatch || phoneMatch || villageMatch;
    });
  }, [allClients, searchTerm]);

  // Find selected client
  const selectedClient = allClients.find(client => client._id === value);

  // Handle client selection
  const handleSelect = (clientId: string) => {
    const client = allClients.find(c => c._id === clientId);
    onValueChange?.(client || null);
    setIsOpen(false);
    setSearchTerm(""); // مسح البحث بعد الاختيار
  };

  // مسح البحث
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Select
        value={value}
        onValueChange={handleSelect}
        disabled={disabled}
        open={isOpen}
        onOpenChange={setIsOpen}
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
        
        <SelectContent className="p-0">
          {/* مربع البحث */}
          <div className="sticky top-0 bg-white border-b p-3 z-10">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ابحث بالاسم، رقم الهوية، أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 pl-8 text-right"
                dir="rtl"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* محتوى القائمة */}
          <div className="max-h-60 overflow-y-auto">
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

            {!isLoading && !fetchError && filteredClients.length === 0 && searchTerm && (
              <div className="text-center py-6">
                <p className="text-gray-500">لا توجد نتائج للبحث "{searchTerm}"</p>
                <button
                  onClick={clearSearch}
                  className="text-blue-500 hover:text-blue-700 text-sm mt-2"
                >
                  مسح البحث
                </button>
              </div>
            )}

            {!isLoading && !fetchError && filteredClients.length === 0 && !searchTerm && (
              <div className="text-center py-6">
                <p>لم يتم العثور على مربيين</p>
              </div>
            )}

            {!isLoading && !fetchError && filteredClients.length > 0 && (
              <>
                {filteredClients.map((client: Client) => (
                  <SelectItem key={client._id || client.name} value={client._id || client.name}>
                    <div className="flex items-center gap-3 py-1 w-full">
                      {/* Client Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {client.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
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
          </div>
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