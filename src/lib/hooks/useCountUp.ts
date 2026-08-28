import { useEffect, useRef, useState } from "react";

/**
 * Animate a number from 0 → target with an ease-out curve, no dependency.
 * Jumps straight to target when disabled, target is 0, or the user prefers
 * reduced motion. Returns the current (possibly fractional) value.
 */
export function useCountUp(target: number, opts?: { duration?: number; enabled?: boolean }): number {
  const duration = opts?.duration ?? 900;
  const enabled = opts?.enabled ?? true;
  const [value, setValue] = useState(enabled ? 0 : target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (!enabled || target === 0 || prefersReduced) {
      setValue(target);
      return;
    }

    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled]);

  return value;
}
