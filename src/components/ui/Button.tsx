"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { CircleNotch as Loader2 } from "@phosphor-icons/react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

// DESIGN.md › Buttons: 30px, 6px radius, 12.5/500, press = scale(0.97). One primary per view.
const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-on shadow-[inset_0_-1px_0_rgb(0_0_0/0.12)] hover:bg-accent-strong disabled:opacity-50",
  accent:
    "bg-accent text-accent-on shadow-[inset_0_-1px_0_rgb(0_0_0/0.12)] hover:bg-accent-strong disabled:opacity-50",
  secondary:
    "bg-surface text-text border border-border-strong shadow-sm hover:bg-surface-2 disabled:opacity-50",
  ghost:
    "bg-transparent text-text-2 hover:bg-surface-2 hover:text-text disabled:opacity-40",
  danger:
    "bg-red text-accent-on hover:brightness-[1.06] disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-[26px] px-2.5 gap-1.5 text-xs",
  md: "h-[30px] px-3 gap-1.5 text-[12.5px]",
  lg: "h-9 px-4 gap-2 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap select-none",
          "transition-[background-color,border-color,color,transform] active:scale-[0.97]",
          "cursor-pointer disabled:cursor-not-allowed disabled:active:scale-100",
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
