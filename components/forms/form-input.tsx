import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type InputProps = {
  label: string;
  error?: string;
  description?: string;
  className?: string;
  required?: boolean;
  rightElement?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, description, className, required, rightElement, ...props },
    ref
  ) => {
    const inputId = props.id || props.name || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('form-group', className)}>
        <label
          htmlFor={inputId}
          className="form-label"
        >
          {label}
          {required && <span className="mr-1 text-danger">*</span>}
        </label>
        
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'form-input',
              error ? 'error' : '',
              rightElement ? 'pr-10' : ''
            )}
            {...props}
          />
          
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}
        {description && !error && (
          <p className="text-small text-muted">{description}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
