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
import { villagesApi, type Village } from "@/lib/api/villages";
import { MapPin, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/base-api";

interface VillageSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  showSector?: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
}

interface HoldingCode {
  _id: string;
  code: string;
  village: string;
  description?: string;
  isActive: boolean;
}

interface VillageWithHoldingCode extends Village {
  holdingCodes?: HoldingCode[];
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
  enableSearch = true,
  searchPlaceholder = "ابحث بالاسم أو رمز الحيازة...",
}: VillageSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [holdingCodes, setHoldingCodes] = useState<HoldingCode[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: villagesResponse,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['villages', searchQuery],
    queryFn: () => villagesApi.search(searchQuery, 100),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  // Fetch holding codes for enhanced search
  const {
    data: holdingCodesResponse,
    isLoading: isLoadingHoldingCodes,
  } = useQuery({
    queryKey: ['holding-codes-all'],
    queryFn: async () => {
      try {
        const response = await api.get<{success: boolean, data: HoldingCode[]}>('/holding-codes?limit=1000');
        return response;
      } catch (error) {
        console.error('Error fetching holding codes:', error);
        return { success: false, data: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const villages = villagesResponse?.data || [];
  const allHoldingCodes = holdingCodesResponse?.data || [];

  // Enhanced search logic
  const filteredVillages = useMemo(() => {
    if (!enableSearch || !searchQuery.trim()) {
      return villages;
    }

    const query = searchQuery.toLowerCase().trim();
    
    // Filter villages by name, sector, or serial number
    const villageMatches = villages.filter(village => 
      village.nameArabic.toLowerCase().includes(query) ||
      village.nameEnglish.toLowerCase().includes(query) ||
      village.sector.toLowerCase().includes(query) ||
      village.serialNumber.toLowerCase().includes(query)
    );

    // Find villages that have holding codes matching the search
    const holdingCodeMatches = allHoldingCodes
      .filter(hc => hc.code.toLowerCase().includes(query))
      .map(hc => hc.village)
      .filter(Boolean);

    // Get unique village names from holding code matches
    const uniqueHoldingCodeVillages = [...new Set(holdingCodeMatches)];
    
    // Find villages that match the holding code villages
    const villagesFromHoldingCodes = villages.filter(village => 
      uniqueHoldingCodeVillages.some(hcVillage => 
        village.nameArabic === hcVillage || village.nameEnglish === hcVillage
      )
    );

    // Combine and deduplicate results
    const allMatches = [...villageMatches, ...villagesFromHoldingCodes];
    const uniqueMatches = allMatches.filter((village, index, self) => 
      index === self.findIndex(v => v._id === village._id)
    );

    return uniqueMatches;
  }, [villages, allHoldingCodes, searchQuery, enableSearch]);

  // Get holding codes for each village
  const getVillageHoldingCodes = (villageName: string) => {
    return allHoldingCodes.filter(hc => 
      hc.village === villageName && hc.isActive
    );
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Find selected village
  const selectedVillage = villages.find(village => village._id === value);
  const selectedVillageHoldingCodes = selectedVillage ? getVillageHoldingCodes(selectedVillage.nameArabic) : [];

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
        open={isOpen}
        onOpenChange={setIsOpen}
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
                {selectedVillageHoldingCodes.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {selectedVillageHoldingCodes.length} رمز حيازة
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="w-full">
          {/* Search Bar */}
          {enableSearch && (
            <div className="sticky top-0 z-10 bg-white border-b p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-10 pr-10 h-9"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSearch();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {searchQuery && (
                <div className="text-xs text-gray-500 mt-1">
                  {filteredVillages.length} نتيجة للبحث "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {(isLoading || isLoadingHoldingCodes) && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="mr-2 text-sm text-gray-500">جاري التحميل...</span>
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

          {!isLoading && !isLoadingHoldingCodes && !fetchError && filteredVillages.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500">
                {searchQuery ? `لم يتم العثور على قرى تطابق "${searchQuery}"` : 'لم يتم العثور على قرى'}
              </p>
              {searchQuery && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearSearch}
                  className="mt-2 text-xs"
                >
                  مسح البحث
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isLoadingHoldingCodes && !fetchError && filteredVillages.length > 0 && (
            <>
              {filteredVillages.map((village) => {
                const villageHoldingCodes = getVillageHoldingCodes(village.nameArabic);
                const hasMatchingHoldingCode = searchQuery && villageHoldingCodes.some(hc => 
                  hc.code.toLowerCase().includes(searchQuery.toLowerCase())
                );
                
                return (
                  <SelectItem key={village._id} value={village._id}>
                    <div className="flex items-center gap-3 py-1 w-full">
                      {/* Village Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          hasMatchingHoldingCode ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <MapPin className={`h-4 w-4 ${
                            hasMatchingHoldingCode ? 'text-blue-600' : 'text-green-600'
                          }`} />
                        </div>
                      </div>
                      
                      {/* Village Info */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 truncate">
                            {village.nameArabic}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {village.sector}
                          </Badge>
                          {villageHoldingCodes.length > 0 && (
                            <Badge 
                              variant={hasMatchingHoldingCode ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {villageHoldingCodes.length} رمز حيازة
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          {village.nameEnglish} • {village.serialNumber}
                        </div>
                        
                        {/* Show matching holding codes */}
                        {searchQuery && villageHoldingCodes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {villageHoldingCodes
                              .filter(hc => !searchQuery || hc.code.toLowerCase().includes(searchQuery.toLowerCase()))
                              .slice(0, 3)
                              .map((hc) => (
                                <Badge key={hc._id} variant="outline" className="text-xs bg-blue-50">
                                  {hc.code}
                                </Badge>
                              ))}
                            {villageHoldingCodes.length > 3 && (
                              <span className="text-xs text-gray-400">+{villageHoldingCodes.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
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