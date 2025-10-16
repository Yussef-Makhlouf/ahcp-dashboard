import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  required?: boolean;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  error,
  required = false,
  onValueChange,
  onBlur,
  className,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur();
    }
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
          {label}
        </Label>
      )}
      <Input
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          error && "border-red-500 focus:border-red-500",
          className
        )}
      />
      <FieldError error={error} />
    </div>
  );
};

export default ValidatedInput;
