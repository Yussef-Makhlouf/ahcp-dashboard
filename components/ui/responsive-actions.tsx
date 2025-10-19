"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  FileText,
  Database
} from 'lucide-react';

export interface ResponsiveAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  priority?: 'high' | 'medium' | 'low';
  hidden?: boolean;
}

interface ResponsiveActionsProps {
  actions: ResponsiveAction[];
  primaryAction?: ResponsiveAction;
  maxVisibleActions?: number;
  className?: string;
}

export function ResponsiveActions({
  actions,
  primaryAction,
  maxVisibleActions = 2,
  className = ""
}: ResponsiveActionsProps) {
  // Filter out hidden actions
  const visibleActions = actions.filter(action => !action.hidden);
  
  // Sort actions by priority (high -> medium -> low)
  const sortedActions = [...visibleActions].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority || 'medium'];
    const bPriority = priorityOrder[b.priority || 'medium'];
    return bPriority - aPriority;
  });

  // Split actions for responsive display
  const directActions = sortedActions.slice(0, maxVisibleActions);
  const dropdownActions = sortedActions.slice(maxVisibleActions);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Desktop: Show all actions side by side */}
      <div className="hidden md:flex items-center gap-2">
        {/* Primary Action */}
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            variant={primaryAction.variant || 'default'}
            size="sm"
            className="shrink-0"
          >
            {primaryAction.icon}
            <span className="mr-2">{primaryAction.label}</span>
          </Button>
        )}
        
        {/* Direct Actions */}
        {directActions.map((action) => (
          <Button
            key={action.key}
            onClick={action.onClick}
            variant={action.variant || 'outline'}
            size="sm"
            className="shrink-0"
          >
            {action.icon}
            <span className="mr-2">{action.label}</span>
          </Button>
        ))}
        
        {/* Overflow Actions */}
        {dropdownActions.map((action) => (
          <Button
            key={action.key}
            onClick={action.onClick}
            variant={action.variant || 'outline'}
            size="sm"
            className="shrink-0"
          >
            {action.icon}
            <span className="mr-2">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Mobile: Show primary action + dropdown with all other actions */}
      <div className="flex md:hidden items-center gap-2">
        {/* Primary Action - Always visible */}
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            variant={primaryAction.variant || 'default'}
            size="sm"
            className="shrink-0"
          >
            {primaryAction.icon}
            <span className="mr-2">{primaryAction.label}</span>
          </Button>
        )}
        
        {/* Show Dromo import button directly on mobile */}
        {sortedActions.find(action => action.key === 'import-dromo') && (
          <Button
            onClick={sortedActions.find(action => action.key === 'import-dromo')!.onClick}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            {sortedActions.find(action => action.key === 'import-dromo')!.icon}
            <span className="mr-2">Dromo</span>
          </Button>
        )}
        
        {/* Dropdown for other actions */}
        {sortedActions.filter(action => action.key !== 'import-dromo').length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">المزيد من الخيارات</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              {sortedActions.filter(action => action.key !== 'import-dromo').map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  onClick={action.onClick}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// Helper functions to create common actions
export const createActions = {
  add: (onClick: () => void, label: string = "إضافة جديد"): ResponsiveAction => ({
    key: 'add',
    label,
    icon: <Plus className="h-4 w-4" />,
    onClick,
    variant: 'default',
    priority: 'high'
  }),

  importDromo: (onClick: () => void, label: string = "استيراد عبر Dromo"): ResponsiveAction => ({
    key: 'import-dromo',
    label,
    icon: <FileSpreadsheet className="h-4 w-4" />,
    onClick,
    variant: 'outline',
    priority: 'medium'
  }),

  export: (onClick: () => void, label: string = "تصدير"): ResponsiveAction => ({
    key: 'export',
    label,
    icon: <Download className="h-4 w-4" />,
    onClick,
    variant: 'outline',
    priority: 'medium'
  }),

  import: (onClick: () => void, label: string = "استيراد"): ResponsiveAction => ({
    key: 'import',
    label,
    icon: <Upload className="h-4 w-4" />,
    onClick,
    variant: 'outline',
    priority: 'medium'
  }),

  template: (onClick: () => void, label: string = "تحميل القالب"): ResponsiveAction => ({
    key: 'template',
    label,
    icon: <FileText className="h-4 w-4" />,
    onClick,
    variant: 'outline',
    priority: 'low'
  }),

  bulkActions: (onClick: () => void, label: string = "عمليات مجمعة"): ResponsiveAction => ({
    key: 'bulk-actions',
    label,
    icon: <Database className="h-4 w-4" />,
    onClick,
    variant: 'outline',
    priority: 'low'
  })
};
