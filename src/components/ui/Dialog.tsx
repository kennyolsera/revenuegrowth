"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  // Keep the latest onClose in a ref so the open-effect never re-subscribes
  // (parents pass a fresh arrow each render — depending on it would re-run the
  // effect on every keystroke and steal focus back to the first field).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    // Remember what was focused so we can restore it on close.
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog once, on open (first field, else the panel).
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;

      // Focus trap: keep Tab / Shift+Tab within the dialog.
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      const activeEl = document.activeElement;

      if (e.shiftKey && (activeEl === firstEl || activeEl === panel)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
      // Restore focus to whatever triggered the dialog.
      previouslyFocused.current?.focus?.();
    };
    // Intentionally depends ONLY on `open` — see onCloseRef note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center animate-fade-in">
      <div className="fixed inset-0" onClick={() => onCloseRef.current()} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative z-10 w-full ${width} overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl transition-all focus:outline-none`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-accent via-accent-bright to-accent-violet" />
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h3 id={titleId} className="text-base font-bold tracking-tight text-slate-900">
              {title}
            </h3>
            {description && (
              <p id={descId} className="mt-1 text-xs text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => onCloseRef.current()}
            className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
      </div>
    </div>,
    document.body
  );
}
