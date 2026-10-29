"use client";

import { useEffect, useRef, useState } from "react";
import { PT_GO_EVENT, setPtNav, type PtGo, type PtNav } from "@/lib/pt-bridge";

const SRC = "/project-timeline/index.html";
const PRELOAD_AFTER_MS = 1500;

/**
 * Hosts the Project Timeline app (public/project-timeline) once, in the app layout (ADR-012):
 * - preloaded in the background shortly after the dashboard opens, so the first visit is fast;
 * - kept alive (hidden) when you switch menus, so coming back is instant;
 * - shows a progress bar only while it is visible and still loading.
 * Progress is real where we know it (35% code loaded, 75% data arrived, 100% first render).
 */
export function TimelineHost({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(active);
  const [progress, setProgress] = useState(8);
  const [state, setState] = useState<"loading" | "done" | "hidden" | "error">("loading");
  const floor = useRef(8);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const queue = useRef<PtGo[]>([]);

  const post = (msg: Record<string, unknown>) =>
    frameRef.current?.contentWindow?.postMessage({ source: "esmm", ...msg }, window.location.origin);

  // Mount on first visit, or preload quietly once the dashboard has settled.
  useEffect(() => {
    if (active) {
      setMounted(true);
      return;
    }
    if (mounted) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const id = window.setTimeout(() => (w.requestIdleCallback ? w.requestIdleCallback(() => setMounted(true)) : setMounted(true)), PRELOAD_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [active, mounted]);

  // Pause the template's background sync while hidden; resume (and catch up) when shown.
  useEffect(() => {
    if (ready.current) post({ type: "visible", visible: active });
  }, [active]);

  // The dashboard's theme is the only switch (ADR-011): mirror every change into the frame.
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const send = () => {
      const t = root.dataset.theme;
      const dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      post({ type: "theme", theme: dark ? "dark" : "light" });
    };
    const obs = new MutationObserver(send);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, [mounted]);

  // Sidebar navigation -> template (queued until the app reports ready).
  useEffect(() => {
    const onGo = (e: Event) => {
      const d = (e as CustomEvent<PtGo>).detail;
      if (ready.current) post({ type: "go", ...d });
      else queue.current = [d];
    };
    window.addEventListener(PT_GO_EVENT, onGo);
    return () => window.removeEventListener(PT_GO_EVENT, onGo);
  }, []);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.source !== "pm") return;
      if (e.source !== frameRef.current?.contentWindow) return;
      if (e.data.type === "progress") {
        floor.current = Math.max(floor.current, e.data.progress);
        setProgress((p) => Math.max(p, e.data.progress));
      } else if (e.data.type === "ready") {
        ready.current = true;
        setProgress(100);
        setState("done");
        queue.current.forEach((d) => post({ type: "go", ...d }));
        queue.current = [];
        post({ type: "visible", visible: activeRef.current });
      } else if (e.data.type === "nav" && e.data.nav && typeof e.data.nav.route === "string") {
        setPtNav(e.data.nav as PtNav);
      } else if (e.data.type === "error") {
        setState("hidden");
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  const activeRef = useRef(active);
  activeRef.current = active;

  // Creep toward (but never reach) the next milestone while waiting.
  useEffect(() => {
    if (state !== "loading" || !mounted) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const cap = floor.current < 35 ? 30 : floor.current < 75 ? 70 : 95;
        return p >= cap ? p : p + (cap - p) * 0.08;
      });
    }, 120);
    return () => window.clearInterval(id);
  }, [state, mounted]);

  // Fade the overlay out after the bar fills.
  useEffect(() => {
    if (state !== "done") return;
    const id = window.setTimeout(() => setState("hidden"), 450);
    return () => window.clearTimeout(id);
  }, [state]);

  // Safety net: never leave the overlay up if the app can't report back.
  useEffect(() => {
    if (!mounted) return;
    const id = window.setTimeout(() => setState((s) => (s === "loading" ? "hidden" : s)), 20000);
    return () => window.clearTimeout(id);
  }, [mounted]);

  return (
    <div className={active ? "relative min-h-0 w-full flex-1" : "hidden"} aria-hidden={!active}>
      {mounted && <iframe ref={frameRef} src={SRC} title="Project Timeline" className="block h-full w-full border-0 bg-bg" />}
      {active && state !== "hidden" && <TimelineLoading progress={progress} fading={state === "done"} />}
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
