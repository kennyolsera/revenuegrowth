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
    "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-sm hover:from-slate-800 hover:to-slate-700 hover:shadow active:scale-[0.98] disabled:opacity-50",
  accent:
    "bg-gradient-to-r from-accent to-blue-600 text-white shadow-md shadow-accent/25 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50",
  secondary:
    "bg-white text-slate-700 border border-slate-200/90 shadow-xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98] disabled:opacity-50",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] disabled:opacity-40",
  danger:
    "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm shadow-rose-500/20 hover:from-rose-500 hover:to-red-500 active:scale-[0.98] disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg font-medium",
  md: "text-sm px-4 py-2 gap-2 rounded-xl font-medium",
  lg: "text-base px-5 py-2.5 gap-2.5 rounded-xl font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap",
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
