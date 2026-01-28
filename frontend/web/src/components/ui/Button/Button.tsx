/**
 * Button Component
 * مكون الزر
 */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================
// Button Variants
// ============================================

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary shadow-sm hover:shadow-md",
        outline:
          "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
        ghost:
          "text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500",
        danger:
          "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm",
        link: "text-primary underline-offset-4 hover:underline focus:ring-primary p-0",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

// ============================================
// Types
// ============================================

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

// ============================================
// Loading Spinner
// ============================================

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ============================================
// Button Component
// ============================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      children,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
