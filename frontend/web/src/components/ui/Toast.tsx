// © 2026 Forsati. All rights reserved.
// Toast Component

"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastContext, ToastType } from "@/hooks/useToast";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-success-500" />,
  error: <AlertCircle className="h-5 w-5 text-danger-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
  info: <Info className="h-5 w-5 text-primary-500" />,
};

const toastStyles: Record<ToastType, string> = {
  success: "border-success-200 bg-success-50",
  error: "border-danger-200 bg-danger-50",
  warning: "border-warning-200 bg-warning-50",
  info: "border-primary-200 bg-primary-50",
};

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export function Toast({ id, type, title, message, action, duration = 5000 }: ToastProps) {
  const { remove } = useToastContext();

  return (
    <ToastPrimitive.Root
      className={cn(
        "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[swipe=end]:animate-out data-[state=closed]:fade-out-80",
        "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
        toastStyles[type]
      )}
      duration={duration}
      onOpenChange={(open) => {
        if (!open) remove(id);
      }}
    >
      {icons[type]}
      
      <div className="flex-1 grid gap-1">
        <ToastPrimitive.Title className="text-sm font-semibold text-foreground">
          {title}
        </ToastPrimitive.Title>
        {message && (
          <ToastPrimitive.Description className="text-sm text-muted">
            {message}
          </ToastPrimitive.Description>
        )}
      </div>

      {action && (
        <ToastPrimitive.Action
          altText={action.label}
          onClick={action.onClick}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-white px-3 text-sm font-medium transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {action.label}
        </ToastPrimitive.Action>
      )}

      <ToastPrimitive.Close
        onClick={() => remove(id)}
        className="absolute end-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export function ToastContainer() {
  const { toasts } = useToastContext();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
      <ToastPrimitive.Viewport
        className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-auto sm:top-0 sm:max-w-[420px] md:gap-3"
      />
    </ToastPrimitive.Provider>
  );
}

export default ToastContainer;
