"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink-body disabled:opacity-50",
  accent:
    "bg-accent text-white hover:bg-accent-strong disabled:opacity-50",
  secondary:
    "bg-surface text-ink-body border border-surface-border hover:bg-surface-muted hover:text-ink disabled:opacity-50",
  ghost:
    "bg-transparent text-ink-body hover:bg-surface-muted hover:text-ink disabled:opacity-40",
  danger:
    "bg-status-danger text-white hover:brightness-110 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5 rounded-md font-medium",
  md: "text-sm px-3.5 py-2 gap-2 rounded-md font-medium",
  lg: "text-[15px] px-5 py-2.5 gap-2.5 rounded-md font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center transition-colors duration-100 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
