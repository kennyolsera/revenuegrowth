# CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)

Read this first; it replaces re-exploring the repo. Deeper map: `graphify-out/GRAPH_REPORT.md`
(54 labelled communities, god nodes). Ask the graph instead of grepping:
`graphify query "how does MOM export work?"` · `graphify path "TimelineFrame" "pm_workspace"` · `graphify explain "Dialog"`.
After code changes: `graphify update .` (AST only, no tokens). Team decisions/ADRs live outside the repo in `~/.10x` (ADR-001..011).

## Stack
Next.js 14 App Router + TypeScript, Tailwind 3 (tokens from `scripts/gen-tokens.py` -> `src/styles/tokens.css`, RGB channel vars),
Supabase (project `awqqijxcppvlkdjzdzfp`, RLS), Vercel (revenuegrowth-rose.vercel.app). Geist / Geist Mono, Lucide icons via
`src/components/icons.ts` (old Phosphor names kept as aliases). Olsera Blue accent #1468B3 / dark #5AAEE9.

## Map
| Area | Where |
|---|---|
| Pages (one folder each) | `src/app/(app)/*`: dashboard, kanban (=Project Timeline), activity, calendar, mom, qris, online-order, financing-*, network-partner, merchant-status, requests, weekly-report, leads, qris-providers, users, logs |
| Shell | `src/app/(app)/layout.tsx` (full-bleed for /kanban), `components/layout/{Sidebar,Topbar,nav-items}` |
| Shared UI | `components/ui/Dialog.tsx` (unsaved-changes guard: Esc/outside asks), `Button/Input/Card/Badge`, `components/shared/{ResourceManager,DataTable,Toolbar,PageHeader}` |
| Toasts | `lib/ToastContext.tsx` (`toast.success(msg,{action,ms})`), wording via `lib/toast-copy.ts` (`savedMsg`, `statusMsg`, `recordName`) |
| i18n | `lib/i18n.ts` + `LanguageContext` (`t()`, `language` id/en, localStorage `rgd_lang`) |
| Supabase | `lib/supabase/{client,server}.ts`; admin-only APIs use `lib/server/admin-guard.ts` `requireAdmin()` |
| APIs | `app/api/{invite-user,set-user-password,update-user,delete-user}` (admin), `app/api/pm-workspace` (shared PT doc, optimistic `version`, 409 on conflict) |
| MOM | `app/(app)/mom/page.tsx` + `lib/mom-export.ts` (lazy `docx`, logo `public/brand/olsera-logo.png`, mailto draft) |
| Project Timeline | Gr8r template source `pm-app/` (vanilla JS + Vite, `data-a` actions, `mutate()`, store `S`), built to `public/project-timeline/` (committed). Glue: `pm-app/src/boot.js`, `pm-app/src/core/remote.js`, `components/kanban/TimelineFrame.tsx` (progress bar, theme postMessage). Rebuild: `npm run build:timeline` |
| DB | `supabase/schema.sql` (full) + `supabase/migrations/*` (README lists what's applied live). PT data = `pm_workspace` row `main` (jsonb). `kanban_*` tables are legacy (imported once) |

## Conventions
- No em/en dashes in UI text. Radius 6px controls / 8px containers. Specific toast wording, never "updated successfully".
- Every add/edit form uses `Dialog` (gets the discard guard for free). Theme: dashboard `data-theme` is the only switch.
- Commits: author Kenny <kenny.olsera@gmail.com>, end with Co-Authored-By + Claude-Session lines. Don't commit `package-lock.json`, `next-env.d.ts`, `tsconfig.tsbuildinfo`.
- Local test build: `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54399 NEXT_PUBLIC_SUPABASE_ANON_KEY=mock npx next build` (move `.env.local` aside first).
