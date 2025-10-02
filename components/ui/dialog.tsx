"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideTitle?: boolean;
  }
>(({ className, children, hideTitle = false, ...props }, ref) => {
  // Check if children contains a DialogTitle component
  const hasTitle = React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child)) {
      // Check if it's a DialogHeader which typically contains DialogTitle
      if (child.type === DialogHeader) {
        const headerProps = child.props as { children?: React.ReactNode }
        return React.Children.toArray(headerProps.children).some((headerChild) => {
          return React.isValidElement(headerChild) && 
                 (headerChild.type === DialogTitle || 
                  headerChild.type === DialogPrimitive.Title)
        })
      }
      // Check if it's a DialogTitle directly
      return child.type === DialogTitle || child.type === DialogPrimitive.Title
    }
    return false
  })

  // If hideTitle is true, always add hidden title
  // If hideTitle is false and no title found, add hidden title
  const shouldAddHiddenTitle = hideTitle || !hasTitle

  // Debug: Log the detection result for troubleshooting
  if (process.env.NODE_ENV === 'development') {
    console.log('DialogContent: hasTitle =', hasTitle, 'hideTitle =', hideTitle, 'shouldAddHiddenTitle =', shouldAddHiddenTitle)
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-card border border-border rounded-xl shadow-xl p-0 overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Add hidden title if no title is found or hideTitle is true */}
        {shouldAddHiddenTitle && (
          <VisuallyHidden>
            <DialogPrimitive.Title>Dialog</DialogPrimitive.Title>
          </VisuallyHidden>
        )}
        
        {/* Modern Close Button */}
        <DialogPrimitive.Close className="absolute left-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary/80 text-secondary-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">إغلاق</span>
        </DialogPrimitive.Close>
        
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-6 pt-6 pb-4 border-b border-border bg-card",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-6 py-4 border-t border-border bg-secondary/30 flex flex-col-reverse sm:flex-row sm:justify-end gap-3",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-6 py-4 max-h-[70vh] overflow-y-auto",
      className
    )}
    {...props}
  />
)
DialogBody.displayName = "DialogBody"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl font-bold text-primary leading-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-secondary mt-2", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogBody,
  DialogTitle,
  DialogDescription,
}
