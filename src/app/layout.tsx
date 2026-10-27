import type { Metadata, Viewport } from "next";
// ESMM type (DESIGN.md › Typography): Geist + Geist Mono, self-hosted via
// @fontsource so the build never fetches Google Fonts.
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { SidebarProvider } from "@/lib/SidebarContext";
import { ToastProvider } from "@/lib/ToastContext";

export const metadata: Metadata = {
  title: "ESMM · Revenue Growth Dashboard",
  description: "Ecosystem Solution & Merchant Monetization: operations and performance hub for the Revenue Growth (VAS) division",
};

export const viewport: Viewport = {
  themeColor: "#16397b",
};

/**
 * Applies theme/density/motion knobs before first paint (no flash).
 * One brand accent (ESMM), so there is no accent knob.
 * Values are cached in localStorage under `rgd-prefs`.
 */
const themeBootstrap = `
(function(){try{
  var p=JSON.parse(localStorage.getItem('rgd-prefs')||'{}');
  var d=document.documentElement;
  if(p.theme==='dark'||p.theme==='system')d.dataset.theme=p.theme;
  if(p.density==='compact')d.dataset.density='compact';
  if(p.motion==='reduce')d.dataset.motion='reduce';
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="font-sans antialiased bg-surface-canvas text-ink">
        <LanguageProvider>
          <ToastProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ToastProvider>
        </LanguageProvider>
        <div id="sr-live" aria-live="polite" className="sr-only" />
      </body>
    </html>
  );
}
