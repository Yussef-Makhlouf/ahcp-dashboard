"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,  
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supervisorsApi, SupervisorResponse } from "@/lib/api/supervisors";
import { Supervisor } from "@/types";

interface SupervisorSelectProps {
  value?: string;
  onValueChange: (value: string, supervisor?: Supervisor) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  section?: string; // معامل القسم للفلترة
}

export function SupervisorSelect({
  value,
  onValueChange,
  placeholder = "اختر المشرف",
  disabled = false,
  className,
  section, // معامل القسم للفلترة
}: SupervisorSelectProps) {
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
    isError,
  } = useQuery<SupervisorResponse>({
    queryKey: section ? ["supervisors", "by-section", section] : ["supervisors"],
    queryFn: section ? () => supervisorsApi.getBySection(section) : supervisorsApi.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutes - allow some caching for performance
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // استخراج البيانات من الاستجابة
  const supervisors = Array.isArray(apiResponse?.data) ? apiResponse.data : [];
  const isFallback = apiResponse?.fallback || false;

  // Function to get supervisor code based on supervisorCode field or section/role
  const getSupervisorCode = (supervisor: Supervisor): string => {
    // Use supervisorCode from database if available
    if (supervisor.supervisorCode) {
      return supervisor.supervisorCode;
    }
    
    // Fallback to old logic for backward compatibility
    if (supervisor.role === 'super_admin') return 'SA';
    
    // Get code based on section
    const section = supervisor.section?.toLowerCase() || '';
    if (section.includes('طفيليات') || section.includes('parasite')) return 'P';
    if (section.includes('تحصين') || section.includes('vaccin')) return 'V';
    if (section.includes('عيادة') || section.includes('clinic')) return 'C';
    if (section.includes('مختبر') || section.includes('lab')) return 'L';
    if (section.includes('خيول') || section.includes('equine')) return 'E';
    
    // Default fallback
    return supervisor.section?.charAt(0)?.toUpperCase() || 'S';
  };

  // Function to get code color
  const getCodeColor = (code: string): string => {
    // Handle multi-character codes (P1, C2, V3, etc.)
    const prefix = code.charAt(0);
    switch (prefix) {
      case 'S': return 'bg-red-500 text-white'; // Super Admin (SA)
      case 'P': return 'bg-green-500 text-white'; // Parasite Control (P1, P2, etc.)
      case 'V': return 'bg-blue-500 text-white'; // Vaccination (V1, V2, etc.)
      case 'C': return 'bg-purple-500 text-white'; // Clinic (C1, C2, etc.)
      case 'L': return 'bg-yellow-500 text-white'; // Laboratory (L1, L2, etc.)
      case 'E': return 'bg-orange-500 text-white'; // Equine (E1, E2, etc.)
      case 'R': return 'bg-gray-500 text-white'; // Reports (R1, R2, etc.)
      default: return 'bg-gray-400 text-white'; // Default
    }
  };


  if (error) {
    console.error("❌ Error loading supervisors:", error);
  }

  const [open, setOpen] = useState(false);
  
  // Auto-focus search input when popover opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }, [open]);
  
  // Find selected supervisor for display
  const selectedSupervisor = supervisors.find(s => s.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || isLoading}
        >
          {selectedSupervisor ? (
            <div className="flex items-center gap-2 w-full">
              <div className={`w-6 h-5 rounded flex items-center justify-center text-xs font-bold ${getCodeColor(getSupervisorCode(selectedSupervisor))}`}>
                {getSupervisorCode(selectedSupervisor)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate font-medium">{selectedSupervisor.name}</span>
                {selectedSupervisor.vehicleNo && (
                  <span className="text-xs text-blue-600 truncate">
                    مركبة: {selectedSupervisor.vehicleNo}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">
              {isLoading ? "جاري التحميل..." : placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command className="rounded-lg border shadow-md">
          <div className="border-b bg-gray-50/50 p-1">
            <CommandInput 
              placeholder="🔍 ابحث بالاسم أو رقم المركبة أو القسم..." 
              className="h-11 border-0 focus:ring-0 bg-white rounded-md shadow-sm" 
            />
          </div>
          <CommandList className="max-h-[300px]">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                جاري تحميل المشرفين...
              </div>
            ) : isError ? (
              <div className="px-3 py-2 text-sm text-red-500 flex flex-col gap-2">
                <span className="flex items-center gap-1">
                  ❌ خطأ في الاتصال بالخادم
                </span>
                <button 
                  onClick={() => refetch()}
                  className="text-xs text-blue-600 hover:text-blue-800 underline bg-blue-50 px-2 py-1 rounded"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : supervisors.length === 0 ? (
              <CommandEmpty>
                <div className="px-3 py-2 text-sm text-gray-500 flex flex-col gap-2">
                  <span>لا توجد مشرفين متاحين {section ? `لقسم "${section}"` : ''}</span>
                  <button 
                    onClick={() => refetch()}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {isFallback && (
                  <div className="px-3 py-2 text-xs bg-yellow-50 text-yellow-700 border-b">
                    ⚠️ لا توجد مشرفين مختصين بهذا القسم، يتم عرض المشرفين العامين
                  </div>
                )}
                {supervisors.map((supervisor: Supervisor) => {
                  const code = getSupervisorCode(supervisor);
                  const codeColor = getCodeColor(code);
                  
                  return (
                    <CommandItem 
                      key={supervisor._id || supervisor.name} 
                      value={supervisor.name}
                      keywords={[
                        supervisor.name,
                        supervisor.section || '',
                        supervisor.vehicleNo || '',
                        code,
                        supervisor.role === 'super_admin' ? 'مدير عام' : '',
                        supervisor.role === 'super_admin' ? 'admin' : '',
                      ].filter(Boolean)}
                      onSelect={(currentValue) => {
                        const selectedSupervisor = supervisors.find(s => s.name === currentValue);
                        onValueChange(currentValue === value ? "" : currentValue, selectedSupervisor);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === supervisor.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-3 py-1 w-full">
                        {/* Supervisor Code Badge */}
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-6 rounded-md flex items-center justify-center text-xs font-bold ${codeColor}`}>
                            {code}
                          </div>
                        </div>
                        
                        {/* Supervisor Info */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">{supervisor.name}</span>
                            {supervisor.role === 'super_admin' && (
                              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                                مدير عام
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="truncate">
                              {supervisor.role === 'super_admin' ? 'جميع الأقسام' : (
                                supervisor.section || 'مشرف قسم'
                              )}
                            </span>
                            {supervisor.vehicleNo && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-blue-600">
                                  مركبة: {supervisor.vehicleNo}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="نشط"></div>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
