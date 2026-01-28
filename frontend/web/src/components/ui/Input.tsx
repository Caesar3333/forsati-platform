// © 2026 Forsati. All rights reserved.
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: string;
  rightAddon?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      id,
      dir,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const isRTL = dir === "rtl";

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative flex">
          {/* Left Addon */}
          {leftAddon && (
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-neutral-50 text-muted text-sm">
              {leftAddon}
            </span>
          )}

          {/* Input Wrapper */}
          <div className="relative flex-1">
            {/* Left Icon */}
            {leftIcon && (
              <div
                className={cn(
                  "absolute inset-y-0 flex items-center pointer-events-none text-muted",
                  isRTL ? "right-0 pr-3" : "left-0 pl-3"
                )}
              >
                {leftIcon}
              </div>
            )}

            {/* Input */}
            <input
              type={type}
              id={inputId}
              dir={dir}
              className={cn(
                "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50",
                error
                  ? "border-danger-500 focus:ring-danger-100 focus:border-danger-500"
                  : "border-border hover:border-neutral-300",
                leftIcon && (isRTL ? "pr-10" : "pl-10"),
                rightIcon && (isRTL ? "pl-10" : "pr-10"),
                leftAddon && "rounded-l-none",
                rightAddon && "rounded-r-none",
                className
              )}
              ref={ref}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={
                error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
              }
              {...props}
            />

            {/* Right Icon */}
            {rightIcon && (
              <div
                className={cn(
                  "absolute inset-y-0 flex items-center pointer-events-none text-muted",
                  isRTL ? "left-0 pl-3" : "right-0 pr-3"
                )}
              >
                {rightIcon}
              </div>
            )}
          </div>

          {/* Right Addon */}
          {rightAddon && (
            <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-border bg-neutral-50 text-muted text-sm">
              {rightAddon}
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger-500">
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
