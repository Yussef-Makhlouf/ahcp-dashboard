"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Modern Card Container
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "modern"
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        variant === "modern" ? "card-modern" : "card",
        hover && variant === "modern" && "hover:shadow-lg hover:-translate-y-1",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

// Modern Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "modern"
  accent?: boolean
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant = "default", accent = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        variant === "modern" ? "card-header-modern" : "card-header",
        accent && variant === "modern" && "relative",
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

// Modern Card Title
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: "default" | "modern"
  icon?: React.ReactNode
}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, variant = "default", icon, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        variant === "modern" ? "card-title-modern" : "card-title",
        className
      )}
      {...props}
    >
      {icon && <span className="text-primary">{icon}</span>}
      {children}
    </h3>
  )
)
CardTitle.displayName = "CardTitle"

// Modern Card Description
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "default" | "modern"
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        variant === "modern" ? "card-description-modern" : "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

// Modern Card Content
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "modern"
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        variant === "modern" ? "card-content-modern" : "p-6 pt-0",
        className
      )}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

// Modern Card Footer
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

// Stats Card (Enhanced)
interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  description?: string
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, change, trend, icon, description, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("stats-card", className)}
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="stats-label">{title}</p>
          {description && (
            <p className="text-small text-muted mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-light rounded-lg text-primary">
            {icon}
          </div>
        )}
      </div>
      
      <div className="stats-value mb-2">{value}</div>
      
      {change && (
        <div className={cn(
          "stats-change",
          trend === "up" && "positive",
          trend === "down" && "negative"
        )}>
          {trend === "up" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
          {trend === "down" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
          {change}
        </div>
      )}
    </div>
  )
)
StatsCard.displayName = "StatsCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatsCard,
}
