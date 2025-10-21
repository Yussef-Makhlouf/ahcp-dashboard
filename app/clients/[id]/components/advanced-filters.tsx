"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  services: string[];
  animalTypes: string[];
  healthStatus: string[];
  villages: string[];
  visitCountRange: {
    min: number | null;
    max: number | null;
  };
}

const defaultFilters: FilterState = {
  dateRange: { from: null, to: null },
  services: [],
  animalTypes: [],
  healthStatus: [],
  villages: [],
  visitCountRange: { min: null, max: null }
};

export function AdvancedFilters({ onFiltersChange, initialFilters = defaultFilters }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const serviceOptions = [
    { value: 'mobile_clinic', label: 'العيادة المتنقلة' },
    { value: 'vaccination', label: 'التطعيمات' },
    { value: 'laboratory', label: 'المختبر' },
    { value: 'parasite_control', label: 'مكافحة الطفيليات' },
    { value: 'equine_health', label: 'صحة الخيول' }
  ];

  const animalTypeOptions = [
    { value: 'sheep', label: 'أغنام' },
    { value: 'goats', label: 'ماعز' },
    { value: 'cattle', label: 'أبقار' },
    { value: 'camel', label: 'إبل' },
    { value: 'horse', label: 'خيول' }
  ];

  const healthStatusOptions = [
    { value: 'سليم', label: 'سليم' },
    { value: 'مريض', label: 'مريض' },
    { value: 'تحت العلاج', label: 'تحت العلاج' }
  ];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const handleServiceToggle = (service: string) => {
    const newServices = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service];
    updateFilters({ services: newServices });
  };

  const handleAnimalTypeToggle = (animalType: string) => {
    const newAnimalTypes = filters.animalTypes.includes(animalType)
      ? filters.animalTypes.filter(t => t !== animalType)
      : [...filters.animalTypes, animalType];
    updateFilters({ animalTypes: newAnimalTypes });
  };

  const handleHealthStatusToggle = (status: string) => {
    const newHealthStatus = filters.healthStatus.includes(status)
      ? filters.healthStatus.filter(s => s !== status)
      : [...filters.healthStatus, status];
    updateFilters({ healthStatus: newHealthStatus });
  };

  return (
    <Card className="text-right" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-end text-right">
          <span>فلاتر متقدمة</span>
          <Filter className="h-4 w-4" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-right">
        {isExpanded && (
          <div>
            {/* فلترة التاريخ */}
            <div className="space-y-2 text-right">
              <Label className="text-right">فترة زمنية</Label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-end text-right font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, "PPP", { locale: ar })
                      ) : (
                        <span>من تاريخ</span>
                      )}
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) => updateFilters({ 
                        dateRange: { ...filters.dateRange, from: date || null } 
                      })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-end text-right font-normal",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, "PPP", { locale: ar })
                      ) : (
                        <span>إلى تاريخ</span>
                      )}
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) => updateFilters({ 
                        dateRange: { ...filters.dateRange, to: date || null } 
                      })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* فلترة الخدمات */}
            <div className="space-y-2 text-right">
              <Label className="text-right">نوع الخدمة</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {serviceOptions.map((service) => (
                  <div key={service.value} className="flex items-center space-x-2 justify-end text-right">
                    <Label htmlFor={service.value} className="text-sm text-right">
                      {service.label}
                    </Label>
                    <Checkbox
                      id={service.value}
                      checked={filters.services.includes(service.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({
                            services: [...filters.services, service.value]
                          });
                        } else {
                          updateFilters({
                            services: filters.services.filter(s => s !== service.value)
                          });
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
