"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: Array<{
    value: string;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
  }>;
  className?: string;
}

export function MobileTabs({ 
  value, 
  onValueChange, 
  tabs, 
  className 
}: MobileTabsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentTab = tabs.find(tab => tab.value === value);

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Tabs - Hidden on Mobile */}
      <div className="hidden sm:block">
        <div className="tabs-list-modern">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onValueChange(tab.value)}
              className={cn(
                "tabs-trigger-modern",
                value === tab.value && "data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:border-blue-200"
              )}
            >
              {tab.icon}
              <span className="tab-text">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Dropdown - Visible on Mobile */}
      <div className="sm:hidden">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between h-12 px-4 py-3 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {currentTab?.icon}
                <span className="font-medium text-gray-900">
                  {currentTab?.shortLabel || currentTab?.label}
                </span>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-full min-w-[200px] p-2 bg-white border border-gray-200 shadow-lg rounded-lg"
            align="start"
          >
            {tabs.map((tab) => (
              <DropdownMenuItem
                key={tab.value}
                onClick={() => {
                  onValueChange(tab.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-colors",
                  value === tab.value 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "hover:bg-gray-50 text-gray-700"
                )}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
                {value === tab.value && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Enhanced Mobile Tabs with better UX
export function EnhancedMobileTabs({ 
  value, 
  onValueChange, 
  tabs, 
  className 
}: MobileTabsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentTab = tabs.find(tab => tab.value === value);

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <div className="tabs-list-modern">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onValueChange(tab.value)}
              className={cn(
                "tabs-trigger-modern",
                value === tab.value && "data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:border-blue-200"
              )}
            >
              {tab.icon}
              <span className="tab-text">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Enhanced Dropdown */}
      <div className="sm:hidden">
        <div className="mobile-dialog-tabs">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between h-14 px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {currentTab?.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {currentTab?.shortLabel || currentTab?.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tabs.length} قسم متاح
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-full min-w-[280px] p-3 bg-white border border-gray-200 shadow-xl rounded-xl"
              align="start"
            >
              <div className="mb-2 px-2 py-1">
                <h3 className="text-sm font-semibold text-gray-700">اختر القسم</h3>
              </div>
              {tabs.map((tab, index) => (
                <DropdownMenuItem
                  key={tab.value}
                  onClick={() => {
                    onValueChange(tab.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-lg cursor-pointer transition-all duration-200 mb-1",
                    value === tab.value 
                      ? "bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm" 
                      : "hover:bg-gray-50 text-gray-700 hover:shadow-sm"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    value === tab.value ? "bg-blue-100" : "bg-gray-100"
                  )}>
                    {tab.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500">
                      القسم {index + 1}
                    </div>
                  </div>
                  {value === tab.value && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-xs text-blue-600 font-medium">نشط</span>
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
