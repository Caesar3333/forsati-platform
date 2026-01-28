// © 2026 Forsati. All rights reserved.
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-700",
        primary: "bg-primary-100 text-primary-700",
        secondary: "bg-secondary-100 text-secondary-700",
        success: "bg-success-100 text-success-700",
        warning: "bg-warning-100 text-warning-700",
        danger: "bg-danger-100 text-danger-700",
        // Solid variants
        "solid-primary": "bg-primary-500 text-white",
        "solid-secondary": "bg-secondary-500 text-white",
        "solid-success": "bg-success-500 text-white",
        "solid-warning": "bg-warning-500 text-white",
        "solid-danger": "bg-danger-500 text-white",
        // Outline variants
        "outline-primary":
          "border border-primary-500 text-primary-500 bg-transparent",
        "outline-secondary":
          "border border-secondary-500 text-secondary-500 bg-transparent",
        "outline-success":
          "border border-success-500 text-success-500 bg-transparent",
        "outline-warning":
          "border border-warning-500 text-warning-500 bg-transparent",
        "outline-danger":
          "border border-danger-500 text-danger-500 bg-transparent",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-xs px-2.5 py-1",
        lg: "text-sm px-3 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      dot,
      removable,
      onRemove,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-1 -mr-0.5 h-4 w-4 rounded-full hover:bg-black/10 inline-flex items-center justify-center"
            aria-label="Remove"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
