"use client";

import { X } from "@/components/icons";
import { useEffect, useId, useRef, useState } from "react";
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
  guardChanges = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
  /** Ask before Esc / outside click throws away edits (ADR-011). On by default. */
  guardChanges?: boolean;
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

  // Unsaved-changes guard: any edit inside the panel marks it dirty; Esc or a click outside
  // then asks first. Closing from code (open=false, e.g. after a successful save) needs no answer;
  // a failed save keeps the guard, so the entered values are not lost.
  const dirty = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const confirmingRef = useRef(false);
  confirmingRef.current = confirming;
  const guardRef = useRef(guardChanges);
  guardRef.current = guardChanges;
  const keepRef = useRef<HTMLButtonElement>(null);

  const requestClose = () => {
    if (guardRef.current && dirty.current) setConfirming(true);
    else onCloseRef.current();
  };
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  useEffect(() => {
    if (confirming) keepRef.current?.focus();
  }, [confirming]);

  useEffect(() => {
    if (!open) return;

    // Remember what was focused so we can restore it on close.
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dirty.current = false;
    setConfirming(false);
    document.body.style.overflow = "hidden";

    // Move focus into the dialog once, on open (first field, else the panel).
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const markDirty = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("[data-no-dirty]")) return;
      dirty.current = true;
    };
    panel?.addEventListener("input", markDirty, true);
    panel?.addEventListener("change", markDirty, true);
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!guardRef.current || !dirty.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (confirmingRef.current) setConfirming(false);
        else requestCloseRef.current();
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
      panel?.removeEventListener("input", markDirty, true);
      panel?.removeEventListener("change", markDirty, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.body.style.overflow = "unset";
      // Restore focus to whatever triggered the dialog.
      previouslyFocused.current?.focus?.();
    };
    // Intentionally depends ONLY on `open` — see onCloseRef note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[var(--overlay)] p-4 sm:items-center animate-fade-in">
      <div className="fixed inset-0" onClick={() => requestCloseRef.current()} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative z-10 w-full ${width} overflow-hidden rounded-lg border border-border bg-surface shadow-pop transition-all focus:outline-none`}
      >
        <div className="flex items-start justify-between border-b border-divider px-5 py-3.5">
          <div>
            <h3 id={titleId} className="text-lg font-semibold text-text">
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
            className="rounded-md p-1.5 text-text-3 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
        {confirming && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--overlay)] p-4 animate-fade-in">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={`${titleId}-discard`}
              aria-describedby={`${titleId}-discard-d`}
              className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-pop"
            >
              <h4 id={`${titleId}-discard`} className="text-base font-semibold text-text">
                {lang() === "id" ? "Buang perubahan?" : "Discard changes?"}
              </h4>
              <p id={`${titleId}-discard-d`} className="mt-1.5 text-sm leading-relaxed text-text-2">
                {lang() === "id"
                  ? `Isian di “${title}” belum disimpan dan akan hilang.`
                  : `What you entered in “${title}” hasn't been saved and will be lost.`}
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  ref={keepRef}
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="h-8 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  {lang() === "id" ? "Lanjut mengisi" : "Keep editing"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dirty.current = false;
                    setConfirming(false);
                    onCloseRef.current();
                  }}
                  className="h-8 rounded-md bg-red-600 px-3 text-sm font-medium text-[rgb(var(--c-on-accent))] hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
                >
                  {lang() === "id" ? "Buang" : "Discard"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/** Current UI language from the dashboard's saved preference (dialog copy only). */
function lang(): "id" | "en" {
  try {
    return localStorage.getItem("rgd_lang") === "id" ? "id" : "en";
  } catch {
    return "en";
  }
}
