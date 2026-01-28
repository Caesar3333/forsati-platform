// © 2026 Forsati. All rights reserved.
// Toast notification hook and context

"use client";

import * as React from "react";
import { createContext, useContext, useCallback, useState } from "react";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actions?: ToastAction[];
  dismissible?: boolean;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">): string => {
    const id = `toast-${++toastId}`;
    const newToast: Toast = {
      id,
      duration: 5000,
      dismissible: true,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, clearToasts }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { addToast, removeToast, clearToasts, toasts } = context;

  // Convenience methods
  const toast = useCallback(
    (title: string, options?: Partial<Omit<Toast, "id" | "title">>) => {
      return addToast({ title, type: "info", ...options });
    },
    [addToast],
  );

  const success = useCallback(
    (
      title: string,
      options?: Partial<Omit<Toast, "id" | "title" | "type">>,
    ) => {
      return addToast({ title, type: "success", ...options });
    },
    [addToast],
  );

  const error = useCallback(
    (
      title: string,
      options?: Partial<Omit<Toast, "id" | "title" | "type">>,
    ) => {
      return addToast({ title, type: "error", duration: 8000, ...options });
    },
    [addToast],
  );

  const warning = useCallback(
    (
      title: string,
      options?: Partial<Omit<Toast, "id" | "title" | "type">>,
    ) => {
      return addToast({ title, type: "warning", ...options });
    },
    [addToast],
  );

  const info = useCallback(
    (
      title: string,
      options?: Partial<Omit<Toast, "id" | "title" | "type">>,
    ) => {
      return addToast({ title, type: "info", ...options });
    },
    [addToast],
  );

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    remove: removeToast,
    clear: clearToasts,
  };
}

/**
 * Hook for accessing Toast context directly
 * Used by Toast components
 */
export function useToastContext() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }

  return {
    toasts: context.toasts,
    add: context.addToast,
    remove: context.removeToast,
    clear: context.clearToasts,
  };
}

export default useToast;
