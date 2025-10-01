"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "badge-modern",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-secondary text-secondary-foreground border-secondary/20",
        success: "badge-success-modern",
        warning: "badge-warning-modern", 
        danger: "badge-danger-modern",
        info: "badge-info-modern",
        outline: "border-2 bg-transparent",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot = true, icon, removable, onRemove, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && !icon && variant !== "outline" && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      )}
      {icon && <span className="text-current">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          type="button"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
)
Badge.displayName = "Badge"

// Status Badge Component
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: "active" | "inactive" | "pending" | "completed" | "cancelled" | "draft"
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusConfig = {
      active: { variant: "success" as const, text: "نشط" },
      inactive: { variant: "danger" as const, text: "غير نشط" },
      pending: { variant: "warning" as const, text: "قيد الانتظار" },
      completed: { variant: "success" as const, text: "مكتمل" },
      cancelled: { variant: "danger" as const, text: "ملغي" },
      draft: { variant: "secondary" as const, text: "مسودة" },
    }

    const config = statusConfig[status]

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        {...props}
      >
        {config.text}
      </Badge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

// Priority Badge Component
interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: "low" | "medium" | "high" | "urgent"
}

const PriorityBadge = React.forwardRef<HTMLDivElement, PriorityBadgeProps>(
  ({ priority, ...props }, ref) => {
    const priorityConfig = {
      low: { variant: "info" as const, text: "منخفض" },
      medium: { variant: "warning" as const, text: "متوسط" },
      high: { variant: "danger" as const, text: "عالي" },
      urgent: { variant: "danger" as const, text: "عاجل" },
    }

    const config = priorityConfig[priority]

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        {...props}
      >
        {config.text}
      </Badge>
    )
  }
)
PriorityBadge.displayName = "PriorityBadge"

// Count Badge Component
interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number
  max?: number
  showZero?: boolean
}

const CountBadge = React.forwardRef<HTMLDivElement, CountBadgeProps>(
  ({ count, max = 99, showZero = false, ...props }, ref) => {
    if (count === 0 && !showZero) return null

    const displayCount = count > max ? `${max}+` : count.toString()

    return (
      <Badge
        ref={ref}
        variant="danger"
        size="sm"
        dot={false}
        className="min-w-5 h-5 flex items-center justify-center p-0 text-xs font-bold"
        {...props}
      >
        {displayCount}
      </Badge>
    )
  }
)
CountBadge.displayName = "CountBadge"

export { 
  Badge, 
  StatusBadge, 
  PriorityBadge, 
  CountBadge, 
  badgeVariants
}

