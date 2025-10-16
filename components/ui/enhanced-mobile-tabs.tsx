"use client";

import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Lock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  completed?: boolean;
  disabled?: boolean;
}

interface EnhancedMobileTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: TabItem[];
}

export function EnhancedMobileTabs({ value, onValueChange, tabs }: EnhancedMobileTabsProps) {
  return (
    <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-gray-50 rounded-lg">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          onClick={() => !tab.disabled && onValueChange(tab.value)}
          disabled={tab.disabled}
          className={cn(
            "relative flex flex-col items-center justify-center p-2 min-h-[60px] text-xs font-medium transition-all duration-200",
            "data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm",
            "hover:bg-white/50 hover:text-gray-700",
            tab.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-400",
            tab.completed && !tab.disabled && "bg-green-50 text-green-700 border border-green-200",
            value === tab.value && "bg-white text-blue-600 shadow-sm"
          )}
        >
          {/* أيقونة الحالة */}
          <div className="flex items-center justify-center mb-1">
            {tab.disabled ? (
              <Lock className="w-4 h-4 text-gray-400" />
            ) : tab.completed ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400" />
            )}
          </div>

          {/* أيقونة التاب */}
          <div className="flex items-center justify-center mb-1">
            {tab.icon}
          </div>

          {/* نص التاب */}
          <span className="text-center leading-tight">
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </span>

          {/* مؤشر الإكمال */}
          {tab.completed && !tab.disabled && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
          )}

          {/* مؤشر التعطيل */}
          {tab.disabled && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
