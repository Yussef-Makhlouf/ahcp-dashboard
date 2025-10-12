import React from 'react';
import { cn } from '@/lib/utils';

interface FieldErrorProps {
  error?: string | null;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ 
  error, 
  className 
}) => {
  if (!error) return null;

  return (
    <p className={cn(
      "text-red-500 text-sm font-medium mt-1",
      className
    )}>
      {error}
    </p>
  );
};

export default FieldError;
