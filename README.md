# Revenue Growth Dashboard — Design Kit v1.0

Implements `DESIGN.md` (v1.0-draft, 26 Okt 2026) as drop-in files for the v1.0 Next.js app.
Built and verified on its own (`npm run build` passes; checked in light, dark and 390px mobile).

## What's inside

| File | Replaces / adds |
|---|---|
| `app/globals.css` | **Replace** yours. All tokens as CSS variables: light, dark (redesigned), 5 accent variants, compact density, reduced motion, `.page`, skeleton, one-shot animations. |
| `tailwind.config.ts` | **Replace** yours. Theme points at the CSS variables only, so raw Tailwind palette colours (`bg-blue-500` etc.) no longer exist — anything still using them shows up at build. |
| `app/layout.tsx` | **Merge** into yours: Geist fonts via the `geist` package (no Google Fonts fetch at build), `lang="id"`, theme bootstrap script, `#sr-live`. Keep your Supabase providers. |
| `lib/format.ts` | New. `formatIDR` (full / compact), `formatNumber`, `formatPercent`, `formatDate` (short / long / time), `formatRelative`, `greeting`. All id-ID. |
| `lib/status.ts` | New. Pipeline, merchant, claim, request and role → label + colour. **Align the keys with `supabase/schema.sql` before shipping.** |
| `lib/cn.ts` | New. Class-name join helper. |
| `components/ui/*` | New. Button, IconButton, Badge, StatusBadge, Chip, PageHeader, Segmented, StatStrip, Progress, Table (TH/TR/TD), MobileCard, EmptyState, Skeleton, TableSkeleton, FullPageState. |
| `components/shell/*` | New. AppShell (sidebar, topbar, mobile drawer, skip link) and `nav.ts` with role-filtered navigation using the v1.0 routes. |
| `components/charts/chart-theme.tsx` | New. Shared Recharts props, tooltip and legend. |
| `app/dashboard/page.tsx` | Reference Dashboard in the new design, on **sample data**. Use it as the pattern; keep your Supabase queries. |

## How to merge into the v1.0 app

1. `npm i geist lucide-react` (recharts is already there).
2. Copy `app/globals.css`, `tailwind.config.ts`, `lib/*`, `components/ui/*`, `components/shell/*`, `components/charts/*`.
3. Merge `app/layout.tsx` and remove the old system-font stack.
4. Wrap the authenticated layout in `<AppShell role={profile.role} userName={profile.full_name}>`.
5. `npm run build` — fix every unknown-class error by switching to a token class (`bg-surface`, `text-text-2`, `border-border`, `text-red`…).
6. Restyle modules one at a time using the components and the reference dashboard. Suggested order: Dashboard → Status Merchant & Klaim (mobile-first for Tim Eksternal) → Request → the four acquisition modules → Financing import → Data Leads → Calendar → MOM → Users.

## Token classes cheat-sheet

- Surfaces: `bg-bg` `bg-side` `bg-surface` `bg-surface-2` `bg-surface-3` `bg-sunken`
- Text: `text-text` `text-text-2` `text-text-3` `text-text-4`
- Borders: `border-border` `border-border-strong` `border-divider`
- Accent: `bg-accent` `text-accent-on` `bg-accent-soft` `border-accent-line`
- Semantic: `text-green` `text-amber` `text-red` `text-blue` … (text/dots only — no saturated fills)
- Type: `text-2xs` 11 · `text-xs` 12 · `text-sm` 12.5 · `text-base` 13.5 · `text-md` 14.5 · `text-lg` 16 · `text-xl` 19 · `text-stat` 22 · `text-2xl` 23; weights `font-normal` `font-side` (450) `font-medium` `font-semibold`
- Radius: `rounded-xs` 4 · `rounded-sm` 6 · `rounded` 8 · `rounded-lg` 10 · `rounded-xl` 12 · `rounded-sheet` 14
- Sizes: `h-h-md` (30px control) · `h-row` (40/34px row) · `px-gutter`
- Shadows: `shadow-sm` `shadow-card` `shadow-pop` `shadow-drag`
- Numbers: add `num` for tabular figures.

## Not yet built (next steps)

- Bottom nav for ≤640px (the drawer works meanwhile).
- ⌘K command palette (the topbar trigger is in place).
- Drawer, modal/bottom-sheet, toast-with-Undo, popover/menu, input/select, Excel-import dropzone, FullCalendar theme.
- Persisting theme/accent/density in `profiles` (layout reads a `rgd-prefs` localStorage cache for now).
- Dark-mode chart palette has not been run through the palette validator yet.
