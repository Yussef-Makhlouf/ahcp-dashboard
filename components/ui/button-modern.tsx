"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "btn-modern",
  {
    variants: {
      variant: {
        default: "btn-primary-modern",
        destructive: "btn-danger-modern",
        outline: "btn-secondary-modern border-2",
        secondary: "btn-secondary-modern",
        ghost: "bg-transparent hover:bg-secondary/80 shadow-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none p-0 h-auto",
        success: "btn-success-modern",
        warning: "bg-warning text-white hover:bg-warning/90",
        info: "bg-info text-white hover:bg-info/90",
        danger: "btn-danger-modern",
      },
      size: {
        default: "min-h-12 px-6 py-3",
        sm: "min-h-9 px-4 py-2 text-sm",
        lg: "min-h-14 px-8 py-4 text-lg",
        icon: "h-12 w-12 p-0",
        xl: "min-h-16 px-10 py-5 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="w-4 h-4 animate-spin" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </Comp>
    )
  }
)
Button.displayName = "Button"

// Icon Button Component
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode
  label?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, className, ...props }, ref) => (
    <Button
      ref={ref}
      size="icon"
      className={cn("relative group", className)}
      {...props}
    >
      {icon}
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </Button>
  )
)
IconButton.displayName = "IconButton"

// Button Group Component
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "default" | "lg"
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", size = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        "[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg",
        orientation === "vertical" && "[&>button:first-child]:rounded-t-lg [&>button:first-child]:rounded-l-none [&>button:last-child]:rounded-b-lg [&>button:last-child]:rounded-r-none",
        "[&>button:not(:first-child)]:border-l-0",
        orientation === "vertical" && "[&>button:not(:first-child)]:border-l [&>button:not(:first-child)]:border-t-0",
        className
      )}
      {...props}
    />
  )
)
ButtonGroup.displayName = "ButtonGroup"

// Loading Button Component
interface LoadingButtonProps extends ButtonProps {
  loadingText?: string
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText, children, ...props }, ref) => (
    <Button
      ref={ref}
      loading={loading}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </Button>
  )
)
LoadingButton.displayName = "LoadingButton"

export { 
  Button, 
  IconButton, 
  ButtonGroup, 
  LoadingButton, 
  buttonVariants
}

