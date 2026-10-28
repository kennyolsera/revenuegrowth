"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Embeds the Project Timeline app (public/project-timeline) and shows a progress bar until
 * it reports it is ready. Progress is real where we know it (the app posts 35% when its code
 * has loaded, 75% when the shared data has arrived, 100% after the first render) and creeps
 * forward in between so the bar never looks stuck.
 */
export function TimelineFrame() {
  const [progress, setProgress] = useState(8);
  const [state, setState] = useState<"loading" | "done" | "hidden" | "error">("loading");
  const floor = useRef(8);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.source !== "pm") return;
      if (e.data.type === "progress") {
        floor.current = Math.max(floor.current, e.data.progress);
        setProgress((p) => Math.max(p, e.data.progress));
      } else if (e.data.type === "ready") {
        setProgress(100);
        setState("done");
      } else if (e.data.type === "error") {
        setState("hidden");
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Creep toward (but never reach) the next milestone while waiting.
  useEffect(() => {
    if (state !== "loading") return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const cap = floor.current < 35 ? 30 : floor.current < 75 ? 70 : 95;
        return p >= cap ? p : p + (cap - p) * 0.08;
      });
    }, 120);
    return () => window.clearInterval(id);
  }, [state]);

  // Fade the overlay out after the bar fills.
  useEffect(() => {
    if (state !== "done") return;
    const id = window.setTimeout(() => setState("hidden"), 450);
    return () => window.clearTimeout(id);
  }, [state]);

  // Safety net: never leave the overlay up if the app can't report back.
  useEffect(() => {
    const id = window.setTimeout(() => setState((s) => (s === "loading" ? "hidden" : s)), 20000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="relative h-full w-full">
      <iframe src="/project-timeline/index.html" title="Project Timeline" className="block h-full w-full border-0 bg-bg" />
      {state !== "hidden" && <TimelineLoading progress={progress} fading={state === "done"} />}
    </div>
  );
}

export function TimelineLoading({ progress = 8, fading = false }: { progress?: number; fading?: boolean }) {
  const pct = Math.round(progress);
  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col bg-bg transition-opacity duration-300 motion-reduce:transition-none ${fading ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="progressbar"
      aria-label="Loading Project Timeline"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="h-[3px] w-full bg-accent/15">
        <div
          className="h-full bg-accent transition-[width] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-64 text-center">
          <p className="text-sm font-medium text-ink">Loading Project Timeline</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-accent/15">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out motion-reduce:transition-none"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-xs tabular-nums text-ink-muted">{pct}%</p>
        </div>
      </div>
    </div>
  );
}
