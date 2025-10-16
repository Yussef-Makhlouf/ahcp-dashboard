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
import { villagesApi, type Village } from "@/lib/api/villages";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VillageSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  showSector?: boolean;
}

export function VillageSelect({
  value,
  onValueChange,
  placeholder = "اختر القرية",
  disabled = false,
  className,
  error,
  required = false,
  showSector = true,
}: VillageSelectProps) {
  const {
    data: villagesResponse,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['villages'],
    queryFn: () => villagesApi.search('', 100),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  const villages = villagesResponse?.data || [];

  // Find selected village
  const selectedVillage = villages.find(village => village._id === value);

  // Handle village selection
  const handleSelect = (villageId: string) => {
    onValueChange?.(villageId);
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
            {selectedVillage && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{selectedVillage.nameArabic}</span>
                {showSector && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedVillage.sector}
                  </Badge>
                )}
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
              <p className="text-red-500">خطأ في تحميل القرى</p>
              <p className="text-sm text-muted-foreground mt-1">
                يرجى المحاولة مرة أخرى
              </p>
            </div>
          )}

          {!isLoading && !fetchError && villages.length === 0 && (
            <div className="text-center py-6">
              <p>لم يتم العثور على قرى</p>
            </div>
          )}

          {!isLoading && !fetchError && villages.length > 0 && (
            <>
              {villages.map((village) => (
                <SelectItem key={village._id} value={village._id}>
                  <div className="flex items-center gap-3 py-1 w-full">
                    {/* Village Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    
                    {/* Village Info */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {village.nameArabic}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {village.sector}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        {village.nameEnglish}
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {village.serialNumber}
                        </Badge>
                      </div>
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
        <p className="text-red-500 text-sm font-medium">القرية مطلوبة</p>
      )}
    </div>
  );
}