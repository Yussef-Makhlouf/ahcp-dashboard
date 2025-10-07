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
import { supervisorsApi } from "@/lib/api/supervisors";
import type { Supervisor, SupervisorResponse } from "@/lib/api/supervisors";

interface SupervisorSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  section?: string; // إضافة معامل القسم للفلترة
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
  const supervisors = apiResponse?.data || [];
  const isFallback = apiResponse?.fallback || false;

  // Function to get supervisor code based on section/role
  const getSupervisorCode = (supervisor: Supervisor): string => {
    if (supervisor.role === 'super_admin') return 'SA';
    
    // Get code based on section
    const section = supervisor.section?.toLowerCase() || '';
    if (section.includes('طفيليات') || section.includes('parasite')) return 'P';
    if (section.includes('تحصين') || section.includes('vaccin')) return 'V';
    if (section.includes('عيادة') || section.includes('clinic')) return 'C';
    if (section.includes('مختبر') || section.includes('lab')) return 'L';
    if (section.includes('خيول') || section.includes('equine')) return 'E';
    if (section.includes('تقارير') || section.includes('report')) return 'R';
    
    // Default code based on first letter of name
    return supervisor.name.charAt(0).toUpperCase();
  };

  // Function to get code color
  const getCodeColor = (code: string): string => {
    switch (code) {
      case 'SA': return 'bg-red-500 text-white'; // Super Admin
      case 'P': return 'bg-green-500 text-white'; // Parasite Control
      case 'V': return 'bg-blue-500 text-white'; // Vaccination
      case 'C': return 'bg-purple-500 text-white'; // Clinic
      case 'L': return 'bg-yellow-500 text-white'; // Laboratory
      case 'E': return 'bg-orange-500 text-white'; // Equine
      case 'R': return 'bg-gray-500 text-white'; // Reports
      default: return 'bg-gray-400 text-white'; // Default
    }
  };


  if (error) {
    console.error("❌ Error loading supervisors:", error);
  }

  // Find selected supervisor for display
  const selectedSupervisor = supervisors.find(s => s.name === value);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={className}>
        {selectedSupervisor ? (
          <div className="flex items-center gap-2">
            <div className={`w-6 h-5 rounded flex items-center justify-center text-xs font-bold ${getCodeColor(getSupervisorCode(selectedSupervisor))}`}>
              {getSupervisorCode(selectedSupervisor)}
            </div>
            <span className="truncate">{selectedSupervisor.name}</span>
          </div>
        ) : (
          <SelectValue placeholder={isLoading ? "جاري التحميل..." : placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
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
          <div className="px-3 py-2 text-sm text-gray-500 flex flex-col gap-2">
            <span>لا توجد مشرفين متاحين {section ? `لقسم "${section}"` : ''}</span>
            <button 
              onClick={() => refetch()}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {isFallback && (
              <div className="px-3 py-2 text-xs bg-yellow-50 text-yellow-700 border-b">
                ⚠️ لا توجد مشرفين مختصين بهذا القسم، يتم عرض المشرفين العامين
              </div>
            )}
            {supervisors.map((supervisor: Supervisor) => {
              const code = getSupervisorCode(supervisor);
              const codeColor = getCodeColor(code);
              
              return (
                <SelectItem key={supervisor._id || supervisor.name} value={supervisor.name}>
                  <div className="flex items-center gap-3 py-1">
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
                      <span className="text-xs text-gray-500 truncate">
                        {supervisor.role === 'super_admin' ? 'جميع الأقسام' : (
                          supervisor.section || 'مشرف قسم'
                        )}
                      </span>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="نشط"></div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
