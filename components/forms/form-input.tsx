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
      <div className={cn('space-y-1.5', className)}>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="mr-1 text-red-500">*</span>}
        </label>
        
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
              'disabled:cursor-not-allowed disabled:bg-gray-100',
              error ? 'border-red-500' : 'border-gray-300',
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

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {description && !error && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
