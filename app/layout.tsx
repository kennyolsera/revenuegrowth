import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Revenue Growth Dashboard',
  description: 'VAS Revenue Growth Dashboard',
};

/**
 * Applies the user's theme/accent/density/motion knobs before first paint (no flash).
 * In the real app these come from `profiles` (see DESIGN.md › User-tunable knobs);
 * localStorage is only a fast local cache.
 */
const themeBootstrap = `
(function(){try{
  var p=JSON.parse(localStorage.getItem('rgd-prefs')||'{}');
  var d=document.documentElement;
  if(p.theme&&p.theme!=='system')d.dataset.theme=p.theme;
  if(p.accent&&p.accent!=='indigo')d.dataset.accent=p.accent;
  if(p.density==='compact')d.dataset.density='compact';
  if(p.side==='compact')d.dataset.side='compact';
  if(p.motion==='reduce')d.dataset.motion='reduce';
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        {children}
        <div id="sr-live" aria-live="polite" className="sr-only" />
      </body>
    </html>
  );
}
