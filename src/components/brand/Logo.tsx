import { cn } from "@/lib/utils";

/**
 * Brand mark — a geometric "revenue growth" glyph: an ascending node-line
 * rising out of a gradient tile, capped with a spark. Self-contained SVG
 * (gradients scoped by a unique id) so it renders anywhere on any surface.
 */
export function LogoMark({
  className,
  size = 40,
  glow = true,
}: {
  className?: string;
  size?: number;
  glow?: boolean;
}) {
  const gid = "rg-logo-grad";
  const sid = "rg-logo-spark";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Revenue Growth"
    >
      <defs>
        <linearGradient id={gid} x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="0.55" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={sid} x1="10" y1="28" x2="30" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#C7D2FE" />
        </linearGradient>
      </defs>

      {/* Rounded tile */}
      <rect x="1" y="1" width="38" height="38" rx="11" fill={`url(#${gid})`} />
      {/* Inner top highlight */}
      <rect x="1" y="1" width="38" height="19" rx="11" fill="#FFFFFF" opacity="0.12" />

      {/* Ascending growth line */}
      <path
        d="M9 27.5L16.5 20L21.5 24.5L31 14"
        stroke={`url(#${sid})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Nodes */}
      <circle cx="9" cy="27.5" r="2.1" fill="#FFFFFF" />
      <circle cx="16.5" cy="20" r="2.1" fill="#FFFFFF" />
      <circle cx="21.5" cy="24.5" r="2.1" fill="#FFFFFF" />
      {/* Arrow spark at the peak */}
      <path
        d="M31 14L25.5 13.2M31 14L30.2 19.5"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="14" r="2.6" fill="#FFFFFF" />

      {glow && <rect x="1" y="1" width="38" height="38" rx="11" stroke="#FFFFFF" strokeOpacity="0.14" />}
    </svg>
  );
}

/** Full lockup: mark + wordmark. `tone` adapts text color to light/dark surfaces. */
export function Logo({
  className,
  size = 38,
  tone = "dark",
  subtitle = "VAS Operations Hub",
}: {
  className?: string;
  size?: number;
  tone?: "light" | "dark";
  subtitle?: string | false;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark size={size} />
      <span className="min-w-0 leading-tight">
        <span
          className={cn(
            "block font-display font-bold tracking-tight",
            size >= 40 ? "text-base" : "text-sm",
            tone === "light" ? "text-white" : "text-slate-900"
          )}
        >
          Revenue Growth
        </span>
        {subtitle && (
          <span
            className={cn(
              "block text-[11px] font-medium",
              tone === "light" ? "text-slate-400" : "text-slate-500"
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
