import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const base =
  'relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm text-sm font-medium ' +
  'transition-[background-color,border-color,color,transform] select-none ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-on shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)] hover:brightness-[1.06]',
  secondary: 'bg-surface text-text border border-border-strong shadow-sm hover:bg-surface-2',
  ghost: 'text-text-2 hover:bg-surface-2 hover:text-text',
  danger: 'bg-red text-accent-on hover:brightness-[1.06]',
  'danger-ghost': 'text-red hover:bg-surface-2',
};

const sizes: Record<Size, string> = {
  sm: 'h-h-sm px-2.5',
  md: 'h-h-md px-3',
  lg: 'h-h-lg px-4',
};

/** One primary per view. Loading keeps the width fixed and swaps the label for a spinner. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading = false, icon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className={cn('inline-flex items-center gap-1.5', loading && 'invisible')}>
        {icon}
        {children}
      </span>
      {loading && <Loader2 size={14} className="absolute animate-spin" aria-hidden />}
    </button>
  );
});

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

/** 30px square icon button. `label` is required for screen readers. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-h-md w-h-md items-center justify-center rounded-sm text-text-2 transition-colors',
        'hover:bg-surface-2 hover:text-text active:scale-[0.97]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
