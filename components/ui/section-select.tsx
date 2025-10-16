"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api/base-api";

interface Section {
  _id: string;
  name: string;
  nameEn?: string;
  code: string;
  description?: string;
  supervisorCount?: number;
  workerCount?: number;
  totalUsers?: number;
}

interface SectionSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // showInactive removed - all sections are active
}

export function SectionSelect({
  value,
  onValueChange,
  placeholder = "اختر القسم",
  disabled = false,
  className,
  // showInactive removed
}: SectionSelectProps) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["sections", "active"],
    queryFn: async () => {
      try {
        const endpoint = '/sections/active';
        const data = await api.get(endpoint);
        
        // التحقق من بنية الاستجابة
        if (data && typeof data === 'object') {
          const response = data as any;
          if (response.success && Array.isArray(response.data)) {
            console.log('✅ Loaded', response.data.length, 'sections from API');
          } else {
            console.log('⚠️ Unexpected response structure:', response);
          }
        }
        
        return data;
      } catch (error) {
        console.error('❌ Error fetching sections:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  // استخراج البيانات من الاستجابة مع معالجة الحالات المختلفة
  let sections: Section[] = [];
  
  if (response) {
    const apiResponse = response as any;
    
    // إذا كانت الاستجابة تحتوي على success و data
    if (apiResponse.success && apiResponse.data) {
      if (Array.isArray(apiResponse.data)) {
        sections = apiResponse.data as Section[];
      } else if (apiResponse.data.sections && Array.isArray(apiResponse.data.sections)) {
        sections = apiResponse.data.sections as Section[];
      }
    }
    // إذا كانت الاستجابة مباشرة array
    else if (Array.isArray(apiResponse)) {
      sections = apiResponse as Section[];
    }
    // إذا كانت الاستجابة تحتوي على data مباشرة
    else if (apiResponse.data && Array.isArray(apiResponse.data)) {
      sections = apiResponse.data as Section[];
    }
  }
  
  // All sections are active by default
  const activeSections = sections;
  
  // Confirmation message
  if (sections.length > 0) {
    console.log(`✅ SectionSelect: ${sections.length} sections ready`);
  }

  // Function to get section color based on code
  const getSectionColor = (code: string): string => {
    switch (code.toUpperCase()) {
      case 'VET': return 'bg-blue-500 text-white'; // Veterinary
      case 'LAB': return 'bg-purple-500 text-white'; // Laboratory
      case 'FARM': return 'bg-green-500 text-white'; // Farm
      case 'CLINIC': return 'bg-teal-500 text-white'; // Clinic
      case 'ADMIN': return 'bg-red-500 text-white'; // Administration
      case 'FIELD': return 'bg-orange-500 text-white'; // Field Work
      case 'RESEARCH': return 'bg-indigo-500 text-white'; // Research
      default: return 'bg-gray-500 text-white'; // Default
    }
  };

  // Find selected section for display
  const selectedSection = sections.find(s => s.code === value || s._id === value);

  if (error) {
    console.error("❌ Error loading sections:", error);
  }

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={className}>
        {selectedSection ? (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-6 rounded flex items-center justify-center text-xs font-bold ${getSectionColor(selectedSection.code)}`}>
              {selectedSection.code}
            </div>
            <span className="truncate">{selectedSection.name}</span>
          </div>
        ) : (
          <SelectValue placeholder={isLoading ? "جاري التحميل..." : placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            جاري تحميل الأقسام...
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
        ) : activeSections.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500 flex flex-col gap-2">
            <span>لا توجد أقسام متاحة</span>
            <span className="text-xs text-red-500">تم تحميل {sections.length} أقسام من الخادم</span>
            <button 
              onClick={() => {
                console.log('🔄 Manual refetch triggered');
                refetch();
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {activeSections.map((section: Section) => {
              const codeColor = getSectionColor(section.code);
              
              return (
                <SelectItem key={section._id} value={section.code}>
                  <div className="flex items-center gap-3 py-1">
                    {/* Section Code Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-6 rounded-md flex items-center justify-center text-xs font-bold ${codeColor}`}>
                        {section.code}
                      </div>
                    </div>
                    
                    {/* Section Info */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">{section.name}</span>
                        {/* All sections are active - no status indicator needed */}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {section.nameEn && (
                          <span className="truncate">{section.nameEn}</span>
                        )}
                        {section.totalUsers !== undefined && (
                          <span className="flex items-center gap-1">
                            👥 {section.totalUsers} مستخدم
                          </span>
                        )}
                      </div>
                      {section.description && (
                        <span className="text-xs text-gray-400 truncate mt-0.5">
                          {section.description}
                        </span>
                      )}
                    </div>
                    
                    {/* All sections are active - status indicator removed */}
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-green-500" 
                           title="نشط"></div>
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
