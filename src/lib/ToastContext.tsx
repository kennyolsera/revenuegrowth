"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle, WarningCircle, Info, X } from "@/components/icons";

/**
 * Notifications in the Project Timeline (Gr8r) toast style, ADR-011: a compact dark bar at the
 * bottom right, status icon, short message, optional action button, spring-in / fade-out.
 * API is unchanged: toast.success("..."), plus an optional { action, ms }.
 */
type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  action?: { label: string; onClick: () => void };
  ms?: number;
}

interface Toast extends ToastOptions {
  id: number;
  type: ToastType;
  message: string;
  leaving?: boolean;
}

interface ToastContextValue {
  success: (message: string, opts?: ToastOptions) => void;
  error: (message: string, opts?: ToastOptions) => void;
  info: (message: string, opts?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

const ICON: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="esmm-toast-i ok" size={15} aria-hidden />,
  error: <WarningCircle className="esmm-toast-i bad" size={15} aria-hidden />,
  info: <Info className="esmm-toast-i" size={15} aria-hidden />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 160);
  }, []);

  const push = useCallback(
    (type: ToastType, message: string, opts: ToastOptions = {}) => {
      const id = ++counter;
      setToasts((prev) => [...prev.slice(-3), { id, type, message, ...opts }]);
      const ms = opts.ms ?? (type === "error" ? 6000 : opts.action ? 6000 : 4200);
      timers.current.set(id, window.setTimeout(() => dismiss(id), ms));
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    success: (m, o) => push("success", m, o),
    error: (m, o) => push("error", m, o),
    info: (m, o) => push("info", m, o),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="esmm-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role={t.type === "error" ? "alert" : "status"} className={`esmm-toast${t.leaving ? " out" : ""}`}>
            {ICON[t.type]}
            <span className="esmm-toast-msg">{t.message}</span>
            {t.action && (
              <button
                type="button"
                className="esmm-toast-act"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" className="esmm-toast-x" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              <X size={13} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
