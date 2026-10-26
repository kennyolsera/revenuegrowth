import { cn } from "@/lib/utils";

/**
 * ESMM brand mark (Ecosystem Solution & Merchant Monetization).
 *
 * Nine nodes on a 40-unit grid are the ecosystem; four links climb in steps to
 * one filled node — revenue captured. Open rings are the ecosystem still to win.
 * At 32 px and below the rings drop out and the strokes thicken (brand kit › Sizes).
 *
 * `tone`:
 *  - "dark"  → dark mark for the page background: follows the theme
 *              (Ink + Deep Mint in light mode, Paper + Signal Mint in dark mode).
 *  - "light" → light mark for the Forest sidebar/rail (Paper + Signal Mint).
 */
type Tone = "light" | "dark";

const COLORS: Record<Tone, { ink: string; node: string }> = {
  dark: { ink: "rgb(var(--c-text))", node: "rgb(var(--c-accent))" },
  light: { ink: "rgb(var(--c-rail-text))", node: "rgb(var(--c-rail-node))" },
};

export function LogoMark({
  className,
  size = 34,
  tone = "dark",
}: {
  className?: string;
  size?: number;
  tone?: Tone;
}) {
  const { ink, node } = COLORS[tone];
  const compact = size <= 32;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="ESMM"
    >
      {compact ? (
        <>
          <path
            d="M20 100 H60 V60 H100 V24"
            style={{ stroke: ink }}
            strokeWidth={13}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="100" cy="20" r="19" style={{ fill: node }} />
        </>
      ) : (
        <>
          <g style={{ stroke: ink }} strokeOpacity={0.32} strokeWidth={3}>
            <circle cx="20" cy="20" r="6" />
            <circle cx="60" cy="20" r="6" />
            <circle cx="20" cy="60" r="6" />
            <circle cx="100" cy="100" r="6" />
          </g>
          <path
            d="M20 100 H60 V60 H100 V24"
            style={{ stroke: ink }}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="100" r="9" style={{ fill: ink }} />
          <circle cx="60" cy="100" r="7" style={{ fill: ink }} />
          <circle cx="60" cy="60" r="7" style={{ fill: ink }} />
          <circle cx="100" cy="60" r="7" style={{ fill: ink }} />
          <circle cx="100" cy="20" r="15" style={{ fill: node }} />
        </>
      )}
    </svg>
  );
}

/** Full lockup: mark + "ESMM" wordmark + optional subtitle. */
export function Logo({
  className,
  size = 32,
  tone = "dark",
  subtitle = "Revenue Growth · VAS",
}: {
  className?: string;
  size?: number;
  tone?: Tone;
  subtitle?: string | false;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} tone={tone} />
      <span className="min-w-0 leading-tight">
        <span
          className={cn(
            "block font-semibold",
            size >= 36 ? "text-[19px]" : "text-[15px]",
            tone === "light" ? "text-rail-text" : "text-text"
          )}
          style={{ letterSpacing: "-0.04em" }}
        >
          ESMM
        </span>
        {subtitle && (
          <span
            className={cn(
              "block font-mono text-[10.5px] tracking-[0.04em]",
              tone === "light" ? "text-rail-muted" : "text-text-3"
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
