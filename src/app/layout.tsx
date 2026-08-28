import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { SidebarProvider } from "@/lib/SidebarContext";
import { ToastProvider } from "@/lib/ToastContext";

// "Ledger" type system — IBM Plex: engineered, technical, credible for finance.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const plexDisplay = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Revenue Growth Dashboard | VAS Operations",
  description: "Operational and performance analytics hub for the Revenue Growth (VAS) division",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexDisplay.variable} ${plexMono.variable}`}
    >
      <body className="font-sans antialiased bg-surface-canvas text-ink selection:bg-accent/15 selection:text-accent-strong">
        <LanguageProvider>
          <ToastProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
