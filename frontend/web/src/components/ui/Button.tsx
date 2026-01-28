// © 2026 Forsati. All rights reserved.
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Main CTA
        primary:
          "bg-primary-500 text-white shadow-sm hover:bg-primary-600 active:bg-primary-700",
        // Secondary - Secondary actions
        secondary:
          "bg-secondary-500 text-white shadow-sm hover:bg-secondary-600 active:bg-secondary-700",
        // Success - Positive actions
        success:
          "bg-success-500 text-white shadow-sm hover:bg-success-600 active:bg-success-700",
        // Warning - Caution actions
        warning:
          "bg-warning-500 text-white shadow-sm hover:bg-warning-600 active:bg-warning-700",
        // Danger - Destructive actions
        danger:
          "bg-danger-500 text-white shadow-sm hover:bg-danger-600 active:bg-danger-700",
        // Outline - Secondary emphasis
        outline:
          "border border-border bg-transparent text-foreground shadow-sm hover:bg-neutral-100 active:bg-neutral-200",
        // Ghost - Minimal emphasis
        ghost: "text-foreground hover:bg-neutral-100 active:bg-neutral-200",
        // Link - Text only
        link: "text-primary-500 underline-offset-4 hover:underline",
        // Primary outline
        "primary-outline":
          "border border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100",
        // Secondary outline
        "secondary-outline":
          "border border-secondary-500 text-secondary-500 hover:bg-secondary-50 active:bg-secondary-100",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    if (asChild) {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, fullWidth, className }),
          )}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
