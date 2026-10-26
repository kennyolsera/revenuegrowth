"use client";

import { Logo } from "@/components/brand/Logo";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Shared frame for sign-in, forgot-password and set-password screens.
 * DESIGN.md: auth pages are the only centred pages — a calm 380px box,
 * language switch top-right, quiet footer.
 */
export function AuthShell({
  title,
  description,
  children,
  below,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Small text or link under the card. */
  below?: React.ReactNode;
}) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative flex min-h-screen flex-col bg-bg">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-5">
        <div role="radiogroup" aria-label="Language" className="inline-flex rounded-md bg-surface-3 p-0.5">
          {(["id", "en"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              role="radio"
              aria-checked={language === lang}
              onClick={() => setLanguage(lang)}
              title={lang === "id" ? "Bahasa Indonesia" : "English"}
              className={cn(
                "inline-flex h-6 items-center rounded-xs px-2 text-xs font-medium uppercase transition-colors",
                language === lang ? "bg-surface text-text shadow-sm" : "text-text-3 hover:text-text"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-[380px] animate-fade-up">
          <Logo tone="dark" size={28} />

          <div className="mt-8">
            <h1 className="text-xl text-text">{title}</h1>
            {description && <p className="mt-1 text-[12.5px] text-text-3">{description}</p>}
          </div>

          <div className="mt-6 rounded-lg border border-border bg-surface p-5">{children}</div>

          {below && <div className="mt-4 text-center text-xs text-text-3">{below}</div>}
        </div>
      </main>

      <footer className="flex items-center justify-between px-4 pb-4 text-xs text-text-4 sm:px-6">
        <span>© {new Date().getFullYear()} Revenue Growth · VAS</span>
        <span>v1.0</span>
      </footer>
    </div>
  );
}

/** Inline notice used inside auth cards (warnings, link errors). */
export function AuthNotice({ icon, children, tone = "neutral" }: { icon: React.ReactNode; children: React.ReactNode; tone?: "neutral" | "error" }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className="mb-4 flex items-start gap-2 rounded-md border border-border bg-surface-2 p-3 text-xs text-text-2"
    >
      <span className={cn("mt-px shrink-0", tone === "error" ? "text-red" : "text-amber")}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}
