import React from 'react';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ValidatedSelectProps {
  label?: string;
  error?: string | null;
  required?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
  disabled?: boolean;
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  label,
  error,
  required = false,
  value,
  onValueChange,
  onBlur,
  placeholder,
  options,
  className,
  disabled = false,
}) => {
  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
          {label}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className={cn(
            error && "border-red-500 focus:border-red-500",
            className
          )}
          onBlur={handleBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError error={error} />
    </div>
  );
};

export default ValidatedSelect;
