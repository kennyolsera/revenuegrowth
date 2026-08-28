import { cn } from "@/lib/utils";

/**
 * Brand mark — a flat "ledger + ascending step" glyph. Solid petrol fill, one
 * lighter tint step, a crisp ascending stroke. No gradients or glow: it reads
 * as an instrument, not a marketing logo.
 */
export function LogoMark({ className, size = 34 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Revenue Growth"
    >
      <rect x="1" y="1" width="30" height="30" rx="6" fill="#134E7A" />
      {/* base ledger line */}
      <rect x="7" y="22" width="18" height="2.2" rx="1.1" fill="#7FA8C9" />
      {/* ascending steps */}
      <rect x="8" y="16" width="4" height="6" rx="1" fill="#CBD8E6" />
      <rect x="14" y="12" width="4" height="10" rx="1" fill="#CBD8E6" />
      <rect x="20" y="7.5" width="4" height="14.5" rx="1" fill="#FFFFFF" />
    </svg>
  );
}

/** Full lockup: mark + wordmark. `tone` adapts text color to light/dark surfaces. */
export function Logo({
  className,
  size = 32,
  tone = "dark",
  subtitle = "VAS Operations",
}: {
  className?: string;
  size?: number;
  tone?: "light" | "dark";
  subtitle?: string | false;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="min-w-0 leading-tight">
        <span
          className={cn(
            "block font-display font-semibold tracking-tight",
            size >= 36 ? "text-[15px]" : "text-[13.5px]",
            tone === "light" ? "text-white" : "text-ink"
          )}
        >
          Revenue&nbsp;Growth
        </span>
        {subtitle && (
          <span
            className={cn(
              "label-mono block",
              tone === "light" ? "text-slate-400" : "text-ink-muted"
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
