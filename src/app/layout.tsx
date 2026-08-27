import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { SidebarProvider } from "@/lib/SidebarContext";

export const metadata: Metadata = {
  title: "Revenue Growth Dashboard | VAS Operations",
  description: "Pusat operasional dan analitik performa divisi Revenue Growth (VAS)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-accent/20 selection:text-accent">
        <LanguageProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
