import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

type Option = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  label: string;
  options: Option[];
  error?: string;
  description?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      description,
      className,
      required,
      placeholder = 'اختر...',
      ...props
    },
    ref
  ) => {
    const selectId = props.id || props.name || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('space-y-1.5', className)}>
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="mr-1 text-red-500">*</span>}
        </label>

        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              'disabled:cursor-not-allowed disabled:bg-gray-100',
              error ? 'border-red-500' : 'border-gray-300',
              'text-gray-700',
              'rtl:pl-10 rtl:pr-3' // RTL support
            )}
            {...props}
          >
            <option value="" disabled={!props.value}>
              {placeholder}
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-500 rtl:left-auto rtl:right-0">
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {description && !error && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
