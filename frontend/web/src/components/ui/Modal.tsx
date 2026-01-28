// © 2026 Forsati. All rights reserved.
"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  dir?: "ltr" | "rtl";
}

const Modal = ({ open, onOpenChange, children }: ModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
};

const ModalTrigger = Dialog.Trigger;

const ModalPortal = Dialog.Portal;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      className,
    )}
    {...props}
  />
));
ModalOverlay.displayName = "ModalOverlay";

const ModalContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content> & ModalContentProps
>(
  (
    { className, children, size = "md", showClose = true, dir, ...props },
    ref,
  ) => (
    <ModalPortal>
      <ModalOverlay />
      <Dialog.Content
        ref={ref}
        dir={dir}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "bg-surface rounded-xl shadow-xl border border-border",
          "w-full max-h-[90vh] overflow-auto",
          "data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out",
          "focus:outline-none",
          // Sizes
          size === "sm" && "max-w-sm",
          size === "md" && "max-w-md",
          size === "lg" && "max-w-lg",
          size === "xl" && "max-w-2xl",
          size === "full" && "max-w-[90vw] h-[90vh]",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <Dialog.Close asChild>
            <button
              className={cn(
                "absolute top-4 p-2 rounded-lg text-muted hover:text-foreground hover:bg-neutral-100 transition-colors",
                dir === "rtl" ? "left-4" : "right-4",
              )}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        )}
      </Dialog.Content>
    </ModalPortal>
  ),
);
ModalContent.displayName = "ModalContent";

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 pt-6 pb-4", className)} {...props} />
));
ModalHeader.displayName = "ModalHeader";

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn("text-xl font-semibold text-foreground", className)}
    {...props}
  />
));
ModalTitle.displayName = "ModalTitle";

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("text-sm text-muted mt-1", className)}
    {...props}
  />
));
ModalDescription.displayName = "ModalDescription";

const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
));
ModalBody.displayName = "ModalBody";

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 bg-neutral-50 border-t border-border rounded-b-xl flex items-center justify-end gap-3",
      className,
    )}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

const ModalClose = Dialog.Close;

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
  ModalOverlay,
};
