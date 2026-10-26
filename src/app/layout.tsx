import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { SidebarProvider } from "@/lib/SidebarContext";
import { ToastProvider } from "@/lib/ToastContext";

// Geist via the local `geist` package (DESIGN.md › Typography): no Google Fonts fetch at build.

export const metadata: Metadata = {
  title: "Revenue Growth Dashboard | VAS Operations",
  description: "Operational and performance analytics hub for the Revenue Growth (VAS) division",
};

/**
 * Applies theme/accent/density/motion knobs before first paint (no flash).
 * Values are cached in localStorage under `rgd-prefs`.
 */
const themeBootstrap = `
(function(){try{
  var p=JSON.parse(localStorage.getItem('rgd-prefs')||'{}');
  var d=document.documentElement;
  if(p.theme==='dark'||p.theme==='system')d.dataset.theme=p.theme;
  if(p.accent&&p.accent!=='indigo')d.dataset.accent=p.accent;
  if(p.density==='compact')d.dataset.density='compact';
  if(p.motion==='reduce')d.dataset.motion='reduce';
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
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
