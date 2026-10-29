# Graph Report - revenuegrowth  (2026-10-29)

## Corpus Check
- 172 files · ~131,976 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: .css 19, (none) 3, .csv 3)

## Summary
- 1505 nodes · 6146 edges · 54 communities (48 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- PT store & render helpers
- Data pages & ResourceManager
- Toasts & activity options
- Users, leads, calendar pages
- PT routing & view engine
- PT palette & modals
- PT task actions & drag-drop
- PT Supabase sync & embed
- Import dialogs (QRIS/orders)
- File preview (leads)
- PT toast, archive, teams
- PT build tooling
- PT event delegation
- Calendar & event types
- Shared TS types
- Database schema (all tables)
- Financing weekly import
- Activity Record logic
- i18n & navigation
- Admin user APIs
- Login & password reset
- App dependencies A
- Legacy kanban timeline
- App dependencies B
- Legacy kanban tasks
- TypeScript config
- MOM page
- MOM Word export
- Legacy kanban projects
- App shell & top bar
- Root layout & contexts
- Auth confirm & Supabase server
- Activity Record page
- Activity Record migration
- pm_workspace table
- Design token generator
- PT keyboard & popovers
- pm-workspace API
- Kanban board migration
- Sidebar & logo
- Schema helpers
- Tailwind config
- Kanban projects migration
- App dependencies C
- Merchant select field
- PT prettier config
- Legacy kanban import
- Calendar types migration
- Auth middleware
- Next config
- Vercel config
- PT store (isolated)

## God Nodes (most connected - your core abstractions)
1. `A` - 165 edges
2. `render()` - 156 edges
3. `createClient()` - 127 edges
4. `D()` - 117 edges
5. `ic()` - 114 edges
6. `$$` - 112 edges
7. `esc()` - 102 edges
8. `useLanguage()` - 102 edges
9. `cn()` - 78 edges
10. `proj()` - 73 edges

## Surprising Connections (you probably didn't know these)
- `createTask()` --indirect_call--> `canSee()`  [INFERRED]
  pm-app/src/actions/actions.js → pm-app/src/core/store.js
- `clearDropMarks()` --calls--> `$$`  [EXTRACTED]
  pm-app/src/actions/drag-drop.js → pm-app/src/core/utils.js
- `changeOption()` --calls--> `createClient()`  [EXTRACTED]
  src/app/(app)/activity/page.tsx → src/lib/supabase/client.ts
- `load()` --calls--> `createClient()`  [EXTRACTED]
  src/app/(app)/financing-performance/page.tsx → src/lib/supabase/client.ts
- `uploadFiles()` --calls--> `createClient()`  [EXTRACTED]
  src/app/(app)/mom/page.tsx → src/lib/supabase/client.ts

## Import Cycles
- 3-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/board.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 3-file cycle: `pm-app/src/components/task-list.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js -> pm-app/src/components/task-list.js`
- 3-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 3-file cycle: `pm-app/src/shell/render.js -> pm-app/src/views/timeline.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js`
- 4-file cycle: `pm-app/src/components/task-list.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js -> pm-app/src/views/project-overview.js -> pm-app/src/components/task-list.js`
- 4-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/timeline.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`

## Communities (54 total, 6 thin omitted)

### Community 0 - "PT store & render helpers"
Cohesion: 0.06
Nodes (189): actHtml(), bulkBar(), CELL, cellAssignee(), cellDue(), cellLabels(), cellPrio(), cellProject() (+181 more)

### Community 1 - "Data pages & ResourceManager"
Cohesion: 0.07
Nodes (66): recharts, buildGrowthSeries(), DashboardData, DashboardPage(), load(), EMPTY, todayBoundaryISO(), FinancingLoanPage() (+58 more)

### Community 2 - "Toasts & activity options"
Cohesion: 0.06
Nodes (66): react, COPY, DatePreset, AuditLogRow, SAMPLE_LOGS, ActivityDialog(), COPY, emptyForm() (+58 more)

### Community 3 - "Users, leads, calendar pages"
Cohesion: 0.06
Nodes (71): CalendarPage(), fetchEvents(), fetchEventTypes(), handleDelete(), handleSubmit(), loadGrowthChart(), LeadsPage(), fetchRows() (+63 more)

### Community 4 - "PT routing & view engine"
Cohesion: 0.04
Nodes (10): IN, save(), autosize(), countUp(), makeFocusable(), reduceMotion(), render(), tryFocus() (+2 more)

### Community 5 - "PT palette & modals"
Cohesion: 0.06
Nodes (9): A, copy(), curProjectId(), enterApp(), projectFromKey(), openModal(), commands(), paletteItems() (+1 more)

### Community 6 - "PT task actions & drag-drop"
Cohesion: 0.08
Nodes (20): applyPatch(), BLUR, createProject(), createTask(), ctxTo(), EMAIL_RE, handleFiles(), KEY (+12 more)

### Community 7 - "PT Supabase sync & embed"
Cohesion: 0.07
Nodes (37): Gr8r template: vanilla JS + Vite, data-a actions, mutate(), Gr8r Studio README (Project Timeline template), ADR-0011, tick(), LOGO(), adoptRemote(), applyIdentity(), banner() (+29 more)

### Community 8 - "Import dialogs (QRIS/orders)"
Cohesion: 0.08
Nodes (33): xlsx, QrisPage(), onFile(), ParsedRow, REQUIRED_COLUMNS, excelDateToISO(), OnlineOrderImportDialog(), handleFile() (+25 more)

### Community 9 - "File preview (leads)"
Cohesion: 0.09
Nodes (30): countRows(), DocxView(), FilePreview(), KIND_ICON, LoadState, PdfView(), PptxView(), PreviewMessage() (+22 more)

### Community 10 - "PT toast, archive, teams"
Cohesion: 0.13
Nodes (7): colTasks(), confirmDlg(), deleteTasks(), restore(), snapshot(), mutate(), toast()

### Community 11 - "PT build tooling"
Cohesion: 0.08
Nodes (27): description, devDependencies, eslint@^9.39.5, @eslint/js@^9.39.5, globals@^15.15.0, lucide@^0.460.0, prettier@^3.9.9, vite@^6.4.4 (+19 more)

### Community 12 - "PT event delegation"
Cohesion: 0.08
Nodes (8): DBL, loadingBtn(), startResend(), $$, dateFormat, isMac, MON, WDL

### Community 13 - "Calendar & event types"
Cohesion: 0.10
Nodes (24): openCreateAt(), openEdit(), DAY_LABELS_EN, DAY_LABELS_ID, emptyForm, MONTH_NAMES_EN, MONTH_NAMES_ID, DAY_LABELS (+16 more)

### Community 14 - "Shared TS types"
Cohesion: 0.07
Nodes (28): ActionItem, ActivityStatus, CalendarEvent, CalendarEventType, ClaimStatus, FinancingLoan, HandoverStatus, KanbanActivity (+20 more)

### Community 15 - "Database schema (all tables)"
Cohesion: 0.10
Nodes (20): Live Supabase project awqqijxcppvlkdjzdzfp, Migrations README (applied-live log), activity_records_touch, kanban_projects_touch, kanban_tasks_log_created, kanban_tasks_track, public.activity_options, public.activity_records (+12 more)

### Community 16 - "Financing weekly import"
Cohesion: 0.11
Nodes (23): handleFile(), Aggregate, aggregateRow(), blankMetrics(), CellKind, ColumnTarget, computeFlags(), DataFlag (+15 more)

### Community 17 - "Activity Record logic"
Cohesion: 0.15
Nodes (21): ADR-0008, save(), cellText(), dedupKey(), draftToRow(), findOption(), HEADER_ALIASES, headerKey() (+13 more)

### Community 18 - "i18n & navigation"
Cohesion: 0.10
Nodes (7): ALL_NAV_ITEMS, NavGroup, NavItem, Language, TranslationKey, translations, LanguageContextValue

### Community 19 - "Admin user APIs"
Cohesion: 0.16
Nodes (15): next@14.2.35, next, POST(), POST(), ROLES, ADR-0002, POST(), POST() (+7 more)

### Community 20 - "Login & password reset"
Cohesion: 0.19
Nodes (12): ForgotPasswordPage(), LoginPage(), LoginPageInner(), establishSession(), LinkState, PasswordInput(), ResetPasswordInner(), ResetPasswordPage() (+4 more)

### Community 21 - "App dependencies A"
Cohesion: 0.10
Nodes (20): dependencies, clsx@^2.1.1, date-fns@^3.6.0, docx-preview@^0.3.7, @fontsource-variable/geist@^5.3.0, @fontsource-variable/geist-mono@^5.3.0, jszip@^3.10.2, lucide-react@^0.460.0 (+12 more)

### Community 22 - "Legacy kanban timeline"
Cohesion: 0.16
Nodes (16): emptyForm(), addDay(), ProjectTimeline(), RANGES, TONE_BAR, ADR-0005, emptyNewProject(), isOverdue() (+8 more)

### Community 23 - "App dependencies B"
Cohesion: 0.15
Nodes (18): devDependencies, autoprefixer@^10.4.19, postcss@^8.4.38, tailwindcss@^3.4.4, @types/node@^20.14.2, @types/react@^18.3.3, @types/react-dom@^18.3.0, typescript@^5.5.2 (+10 more)

### Community 24 - "Legacy kanban tasks"
Cohesion: 0.13
Nodes (16): activityText(), handleSubmit(), checklistProgress(), cycleDays(), MODULE_OPTIONS, PRIORITY_OPTIONS, PRIORITY_RANK, STAGE_ORDER (+8 more)

### Community 25 - "TypeScript config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 26 - "MOM page"
Cohesion: 0.14
Nodes (11): ActionItem, Attachment, CATEGORY_OPTIONS, emptyForm, MomPage(), MomPageInner(), emailMom(), openAttachment() (+3 more)

### Community 27 - "MOM Word export"
Cohesion: 0.16
Nodes (14): docx@^9.0.2, docx, exportWord(), lang(), buildMomDocx(), downloadMom(), L, Lang (+6 more)

### Community 28 - "Legacy kanban projects"
Cohesion: 0.16
Nodes (13): Legacy kanban board (kanban_tasks / kanban_projects), MOM action item -> kanban task intake, KANBAN_FLOW.md (legacy kanban flow, superseded by ADR-010), AT_RISK_GAP, daysBetween(), expectedRatio(), HEALTH_META, positionIn() (+5 more)

### Community 29 - "App shell & top bar"
Cohesion: 0.16
Nodes (7): AppLayout(), FULL_BLEED, NAV_ITEMS, Theme, Topbar(), handleLogout(), useTheme()

### Community 30 - "Root layout & contexts"
Cohesion: 0.18
Nodes (10): metadata, RootLayout(), viewport, LanguageProvider(), setLanguage(), toggleLanguage(), SidebarContext, SidebarContextValue (+2 more)

### Community 31 - "Auth confirm & Supabase server"
Cohesion: 0.21
Nodes (10): @supabase/ssr@^0.5.2, @supabase/supabase-js@^2.45.4, @supabase/ssr, @supabase/supabase-js, GET(), OTP_TYPES, ADR-0002, handleSubmit() (+2 more)

### Community 32 - "Activity Record page"
Cohesion: 0.22
Nodes (12): ActivityRecordPage(), changeOption(), fetchOptions(), fetchRecords(), load(), onKey(), isoOf(), isTypingTarget() (+4 more)

### Community 33 - "Activity Record migration"
Cohesion: 0.29
Nodes (12): activity_records_touch, idx_activity_records_date, idx_activity_records_flagging, idx_activity_records_product, idx_activity_records_scope, idx_activity_records_source, idx_activity_records_status, idx_activity_records_subs (+4 more)

### Community 34 - "pm_workspace table"
Cohesion: 0.18
Nodes (10): public.is_active_member(), public.pm_workspace, on_auth_user_created, public.current_profile_role(), public.handle_new_user(), public.merchant_status_claims, public.notifications, public.profiles (+2 more)

### Community 35 - "Design token generator"
Cohesion: 0.35
Nodes (7): accent_block(), accent_vars(), block(), ch(), hue_scale(), hx(), mix()

### Community 36 - "PT keyboard & popovers"
Cohesion: 0.20
Nodes (5): gPending, closeModal(), closePop(), openPop(), focusKey()

### Community 37 - "pm-workspace API"
Cohesion: 0.29
Nodes (9): caller(), colorFor(), COLORS, dynamic, GET(), Profile, PUT(), ROLE_LABEL (+1 more)

### Community 38 - "Kanban board migration"
Cohesion: 0.38
Nodes (9): idx_kanban_activity_task, idx_kanban_stage_pos, kanban_tasks_log_created, kanban_tasks_track, public.kanban_task_activities, public.kanban_tasks, public.kanban_tasks_log_created(), public.kanban_tasks_track() (+1 more)

### Community 39 - "Sidebar & logo"
Cohesion: 0.39
Nodes (7): COLORS, Logo(), LogoMark(), Tone, NAV_GROUPS, Sidebar(), useSidebar()

### Community 40 - "Schema helpers"
Cohesion: 0.25
Nodes (8): idx_qris_acq_provider, public.financing_loans, public.import_batches, public.meeting_minutes, public.merchants, public.network_partner_handovers, public.online_order_activities, public.qris_acquisitions

### Community 41 - "Tailwind config"
Cohesion: 0.38
Nodes (6): ADR-0003, ADR-0007, c(), config, hue(), neutral

### Community 42 - "Kanban projects migration"
Cohesion: 0.43
Nodes (5): idx_kanban_projects_dates, idx_kanban_tasks_project, kanban_projects_touch, public.kanban_projects, public.kanban_projects_touch()

### Community 43 - "App dependencies C"
Cohesion: 0.33
Nodes (6): scripts, build, build:timeline, dev, lint, start

### Community 44 - "Merchant select field"
Cohesion: 0.47
Nodes (5): MerchantSelectField(), emit(), handleType(), onKeyDown(), pick()

### Community 45 - "PT prettier config"
Cohesion: 0.40
Nodes (4): arrowParens, printWidth, singleQuote, trailingComma

### Community 46 - "Legacy kanban import"
Cohesion: 0.40
Nodes (4): ImportSourcesDialog(), handleImport(), load(), sourceKey()

### Community 47 - "Calendar types migration"
Cohesion: 0.60
Nodes (4): idx_calendar_events_type, public.calendar_event_types, uq_calendar_event_types_label, public.calendar_events

## Ambiguous Edges - Review These
- `mom-export.ts` → `MOM action item -> kanban task intake`  [AMBIGUOUS]
  docs/KANBAN_FLOW.md · relation: related_to

## Knowledge Gaps
- **25 isolated node(s):** `ADR-0011`, `ADR-0011`, `ADR-0002`, `ADR-0002`, `ADR-0002` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 340 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `Users, leads, calendar pages` to `Data pages & ResourceManager`, `Toasts & activity options`, `PT task actions & drag-drop`, `Sidebar & logo`, `Import dialogs (QRIS/orders)`, `File preview (leads)`, `Merchant select field`, `Login & password reset`, `Legacy kanban timeline`, `Legacy kanban tasks`, `MOM page`, `App shell & top bar`, `Root layout & contexts`?**
  _High betweenness centrality (0.330) - this node is a cross-community bridge._
- **What connects `ADR-0011`, `ADR-0011`, `ADR-0002` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PT store & render helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.06463651291237499 - nodes in this community are weakly interconnected._
- **Why does `render()` connect `PT routing & view engine` to `PT store & render helpers`, `PT keyboard & popovers`, `PT palette & modals`, `PT task actions & drag-drop`, `PT Supabase sync & embed`, `PT toast, archive, teams`, `PT event delegation`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Should `Data pages & ResourceManager` be split into smaller, more focused modules?**
  _Cohesion score 0.06660456450861667 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Admin user APIs` to `Data pages & ResourceManager`, `pm-workspace API`, `Sidebar & logo`, `Calendar & event types`, `Auth middleware`, `Login & password reset`, `App dependencies B`, `MOM page`, `App shell & top bar`, `Root layout & contexts`, `Auth confirm & Supabase server`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `mom-export.ts` and `MOM action item -> kanban task intake`?**
  _Edge tagged AMBIGUOUS (relation: related_to) - confidence is low._