import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X } from "lucide-react"

const Toast = ToastPrimitives.Root
const ToastAction = ToastPrimitives.Action
const ToastClose = ToastPrimitives.Close
const ToastDescription = ToastPrimitives.Description
const ToastProvider = ToastPrimitives.Provider
const ToastTitle = ToastPrimitives.Title
const ToastViewport = ToastPrimitives.Viewport

const ToastContainer = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={`
      group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all
      data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full
      ${
        props.variant === 'destructive'
          ? 'destructive group border-destructive bg-destructive text-destructive-foreground'
          : 'border-gray-200 bg-white text-gray-950'
      }
      ${className}
    `}
    {...props}
  />
))
ToastContainer.displayName = ToastPrimitives.Root.displayName

const ToastCloseButton = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={`absolute right-2 top-2 rounded-md p-1 text-gray-950/50 opacity-0 transition-opacity hover:text-gray-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 ${className}`}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastCloseButton.displayName = ToastPrimitives.Close.displayName

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastContainer,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastCloseButton,
}