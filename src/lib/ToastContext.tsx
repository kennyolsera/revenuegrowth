"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

const STYLES: Record<ToastType, { ring: string; icon: React.ReactNode; bar: string }> = {
  success: {
    ring: "ring-emerald-200",
    bar: "bg-emerald-500",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
  },
  error: {
    ring: "ring-rose-200",
    bar: "bg-rose-500",
    icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
  },
  info: {
    ring: "ring-accent/30",
    bar: "bg-accent",
    icon: <Info className="h-5 w-5 text-accent" />,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = ++counter;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((t) => {
          const s = STYLES[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className="animate-slide-right pointer-events-auto flex items-stretch overflow-hidden rounded-xl bg-white shadow-elevated ring-1 ring-inset ring-slate-200"
            >
              <div className={`w-1 shrink-0 ${s.bar}`} />
              <div className="flex flex-1 items-start gap-3 px-4 py-3">
                <span className="mt-0.5 shrink-0">{s.icon}</span>
                <p className="flex-1 text-sm font-medium leading-snug text-slate-700">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
