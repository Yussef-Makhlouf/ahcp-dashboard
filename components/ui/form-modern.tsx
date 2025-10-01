"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Modern Form Field with Floating Label
interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  floating?: boolean
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, floating = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        floating ? "form-field-floating" : "form-field",
        className
      )}
      {...props}
    />
  )
)
FormField.displayName = "FormField"

// Modern Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("form-label", className)}
      {...props}
    >
      {children}
      {required && <span className="text-danger mr-1">*</span>}
    </label>
  )
)
FormLabel.displayName = "FormLabel"

// Enhanced Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "enhanced"
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", error, success, ...props }, ref) => {
    const baseClasses = variant === "enhanced" ? "form-input-enhanced" : "form-input"
    
    return (
      <input
        ref={ref}
        className={cn(
          baseClasses,
          error && "border-danger focus:border-danger focus:ring-danger/20",
          success && "border-success focus:border-success focus:ring-success/20",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Enhanced Select
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "enhanced"
  error?: boolean
  success?: boolean
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, variant = "default", error, success, children, ...props }, ref) => {
    const baseClasses = variant === "enhanced" ? "form-select-enhanced" : "form-input"
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          "flex items-center justify-between",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          success && "border-success focus:border-success focus:ring-success/20",
          className
        )}
        {...props}
      >
        {children}
        <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

// Form Error Message
interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("form-error", className)}
      {...props}
    />
  )
)
FormError.displayName = "FormError"

// Form Success Message
interface FormSuccessProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormSuccess = React.forwardRef<HTMLParagraphElement, FormSuccessProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("form-success", className)}
      {...props}
    />
  )
)
FormSuccess.displayName = "FormSuccess"

// Form Help Text
interface FormHelpProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormHelp = React.forwardRef<HTMLParagraphElement, FormHelpProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-small text-muted mt-1", className)}
      {...props}
    />
  )
)
FormHelp.displayName = "FormHelp"

export {
  FormField,
  FormLabel,
  Input,
  SelectTrigger,
  FormError,
  FormSuccess,
  FormHelp,
}
