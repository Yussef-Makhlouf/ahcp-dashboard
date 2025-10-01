import { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  className = '',
}: StatCardProps) {
  const isPositive = trend === undefined ? null : trend >= 0;
  
  return (
    <div className={`overflow-hidden rounded-lg bg-white p-5 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {trend !== undefined && (
            <div className={`mt-1 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
              <span className="mr-1 font-medium">
                {Math.abs(trend)}%
              </span>
              <span className="text-gray-500">{trendLabel}</span>
            </div>
          )}
        </div>
        
        <div className="rounded-lg bg-primary-50 p-3 text-primary-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
