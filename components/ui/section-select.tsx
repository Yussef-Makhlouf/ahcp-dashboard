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

interface Section {
  _id: string;
  name: string;
  nameEn?: string;
  code: string;
  description?: string;
  isActive: boolean;
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
  showInactive?: boolean; // إظهار الأقسام غير النشطة
}

export function SectionSelect({
  value,
  onValueChange,
  placeholder = "اختر القسم",
  disabled = false,
  className,
  showInactive = false,
}: SectionSelectProps) {
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["sections", showInactive ? "all" : "active"],
    queryFn: async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const url = showInactive ? `${baseUrl}/sections` : `${baseUrl}/sections/active`;
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('🔍 Sections API response:', data);
        console.log('🔍 Response type:', typeof data);
        console.log('🔍 Response keys:', Object.keys(data || {}));
        return data;
      } catch (error) {
        console.error('Error fetching sections:', error);
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
  
  console.log('🔍 Processing response:', response);
  
  if (response) {
    // إذا كانت الاستجابة تحتوي على success و data
    if (response.success && response.data) {
      console.log('✅ Found response.success and response.data');
      if (Array.isArray(response.data)) {
        sections = response.data as Section[];
        console.log('✅ Using response.data as sections array:', sections.length);
      } else if (response.data.sections && Array.isArray(response.data.sections)) {
        sections = response.data.sections as Section[];
        console.log('✅ Using response.data.sections as sections array:', sections.length);
      }
    }
    // إذا كانت الاستجابة مباشرة array
    else if (Array.isArray(response)) {
      sections = response as Section[];
      console.log('✅ Using response as sections array:', sections.length);
    }
    // إذا كانت الاستجابة تحتوي على data مباشرة
    else if (response.data && Array.isArray(response.data)) {
      sections = response.data as Section[];
      console.log('✅ Using response.data as sections array:', sections.length);
    }
  }
  
  console.log('🎯 Final sections array:', sections);
  
  const activeSections = showInactive ? sections : sections.filter(s => s.isActive);

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
  const selectedSection = activeSections.find(s => s.code === value || s._id === value);

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
            <button 
              onClick={() => refetch()}
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
                        {!section.isActive && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                            غير نشط
                          </span>
                        )}
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
                    
                    {/* Status Indicator */}
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${section.isActive ? 'bg-green-500' : 'bg-gray-400'}`} 
                           title={section.isActive ? 'نشط' : 'غير نشط'}></div>
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
