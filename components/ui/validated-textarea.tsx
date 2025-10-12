import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FieldError } from '@/components/ui/field-error';
import { cn } from '@/lib/utils';

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
  required?: boolean;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
}

export const ValidatedTextarea: React.FC<ValidatedTextareaProps> = ({
  label,
  error,
  required = false,
  onValueChange,
  onBlur,
  className,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
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
      <Textarea
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

export default ValidatedTextarea;
