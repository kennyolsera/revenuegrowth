# Graph Report - revenuegrowth  (2026-10-29)

## Corpus Check
- 197 files · ~147,393 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 21, .woff2 4, (none) 3)

## Summary
- 2088 nodes · 8346 edges · 73 communities (61 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 172 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b1eaadd2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mem
- Data pages & ResourceManager
- Toasts & activity options
- m
- PT routing & view engine
- PT palette & modals
- PT task actions & drag-drop
- PT Supabase sync & embed
- helpers.js
- File preview (leads)
- PT toast, archive, teams
- PT build tooling
- PT event delegation
- Calendar & event types
- Shared TS types
- Database schema (all tables)
- b
- X
- i18n & navigation
- Admin user APIs
- Login & password reset
- App dependencies A
- Legacy kanban timeline
- online-order-activity/page.tsx
- Legacy kanban tasks
- TypeScript config
- createClient
- MOM Word export
- toast-ffrFrgRK.js
- App shell & top bar
- Root layout & contexts
- z
- useLanguage
- Activity Record migration
- pm_workspace table
- Design token generator
- esc
- pm-workspace API
- Kanban board migration
- Sidebar & logo
- Schema helpers
- Tailwind config
- Kanban projects migration
- App dependencies C
- oo-activity.ts
- PT prettier config
- Legacy kanban import
- Calendar types migration
- oo-activity/OptionsManager.tsx
- Next config
- Vercel config
- PT store (isolated)
- pptx.ts
- oo-activity/ImportDialog.tsx
- updateTask
- kanban/page.tsx
- ic
- popovers.js
- Dialog
- oo-activity/ActivityTable.tsx
- Ut
- ja
- @supabase/ssr
- y
- 20261029_online_order_followups.sql
- ToastContext.tsx
- .go
- KanbanCard.tsx
- skeletons.js

## God Nodes (most connected - your core abstractions)
1. `A` - 166 edges
2. `m` - 164 edges
3. `render()` - 157 edges
4. `createClient()` - 143 edges
5. `b()` - 134 edges
6. `D()` - 120 edges
7. `useLanguage()` - 117 edges
8. `ic()` - 114 edges
9. `$$` - 113 edges
10. `esc()` - 102 edges

## Surprising Connections (you probably didn't know these)
- `Conventions` --references--> `Dialog()`  [INFERRED]
  CLAUDE.md → src/components/ui/Dialog.tsx
- `Map` --references--> `mutate()`  [INFERRED]
  CLAUDE.md → pm-app/src/ui/toast.js
- `Map` --references--> `t()`  [INFERRED]
  CLAUDE.md → src/lib/LanguageContext.tsx
- `Map` --references--> `requireAdmin()`  [INFERRED]
  CLAUDE.md → src/lib/server/admin-guard.ts
- `Map` --references--> `recordName()`  [INFERRED]
  CLAUDE.md → src/lib/toast-copy.ts

## Import Cycles
- 3-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/board.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 3-file cycle: `pm-app/src/shell/render.js -> pm-app/src/views/timeline.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js`
- 3-file cycle: `pm-app/src/components/task-list.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js -> pm-app/src/components/task-list.js`
- 3-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 4-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/timeline.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 4-file cycle: `pm-app/src/components/task-list.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js -> pm-app/src/views/project-overview.js -> pm-app/src/components/task-list.js`

## Communities (73 total, 12 thin omitted)

### Community 0 - "mem"
Cohesion: 0.27
Nodes (19): CELL, cellAssignee(), cellDue(), cellPrio(), cellProject(), cellStatus(), LCOLS, taskRow() (+11 more)

### Community 1 - "Data pages & ResourceManager"
Cohesion: 0.06
Nodes (52): recharts, buildGrowthSeries(), DashboardData, DashboardPage(), load(), EMPTY, todayBoundaryISO(), FeeRow() (+44 more)

### Community 2 - "Toasts & activity options"
Cohesion: 0.06
Nodes (73): ActivityRecordPage(), changeOption(), fetchOptions(), fetchRecords(), load(), onKey(), COPY, DatePreset (+65 more)

### Community 3 - "m"
Cohesion: 0.05
Nodes (5): Ca(), ct(), g(), m, Pt()

### Community 4 - "PT routing & view engine"
Cohesion: 0.06
Nodes (3): handleFiles(), IN, fsize()

### Community 5 - "PT palette & modals"
Cohesion: 0.05
Nodes (9): A, copy(), save(), closePop(), countUp(), makeFocusable(), reduceMotion(), render() (+1 more)

### Community 6 - "PT task actions & drag-drop"
Cohesion: 0.07
Nodes (53): applyPatch(), createProject(), createTask(), ctxTo(), DBL, EMAIL_RE, makeKey(), nextKey() (+45 more)

### Community 7 - "PT Supabase sync & embed"
Cohesion: 0.17
Nodes (17): tick(), adoptRemote(), applyIdentity(), banner(), emptyWorkspace(), importLegacy(), initialData(), keyFor() (+9 more)

### Community 8 - "helpers.js"
Cohesion: 0.20
Nodes (33): miniRow(), LABELS, LB, PR, PRIOS, PSTAT, ROLES, STATUSES (+25 more)

### Community 9 - "File preview (leads)"
Cohesion: 0.11
Nodes (26): send(), handleSubmit(), ImportExcelDialog(), excelDateToISO(), handleConfirmImport(), handleFile(), resetState(), DocxView() (+18 more)

### Community 10 - "PT toast, archive, teams"
Cohesion: 0.10
Nodes (7): colTasks(), confirmDlg(), deleteTasks(), restore(), snapshot(), mutate(), toast()

### Community 11 - "PT build tooling"
Cohesion: 0.08
Nodes (27): description, devDependencies, eslint@^9.39.5, @eslint/js@^9.39.5, globals@^15.15.0, lucide@^0.460.0, prettier@^3.9.9, vite@^6.4.4 (+19 more)

### Community 12 - "PT event delegation"
Cohesion: 0.09
Nodes (34): CalendarPage(), fetchEventTypes(), openCreateAt(), openEdit(), DAY_LABELS_EN, DAY_LABELS_ID, emptyForm, MONTH_NAMES_EN (+26 more)

### Community 13 - "Calendar & event types"
Cohesion: 0.19
Nodes (41): projectFromKey(), actHtml(), myNotifs(), allTasks(), canSee(), D(), proj(), team() (+33 more)

### Community 14 - "Shared TS types"
Cohesion: 0.07
Nodes (28): ActionItem, ActivityStatus, CalendarEvent, CalendarEventType, ClaimStatus, FinancingLoan, HandoverStatus, KanbanActivity (+20 more)

### Community 15 - "Database schema (all tables)"
Cohesion: 0.10
Nodes (20): Live Supabase project awqqijxcppvlkdjzdzfp, Migrations README (applied-live log), activity_records_touch, kanban_projects_touch, kanban_tasks_log_created, kanban_tasks_track, public.activity_options, public.activity_records (+12 more)

### Community 16 - "b"
Cohesion: 0.04
Nodes (4): b(), w(), L, we()

### Community 17 - "X"
Cohesion: 0.12
Nodes (3): X(), Dt, Sa()

### Community 18 - "i18n & navigation"
Cohesion: 0.10
Nodes (8): ALL_NAV_ITEMS, NAV_GROUPS, NavGroup, NavItem, Language, TranslationKey, translations, LanguageContextValue

### Community 19 - "Admin user APIs"
Cohesion: 0.19
Nodes (13): POST(), POST(), ROLES, ADR-0002, POST(), POST(), ROLES, ADMIN_ROLES (+5 more)

### Community 20 - "Login & password reset"
Cohesion: 0.07
Nodes (48): ForgotPasswordPage(), LoginPage(), LoginPageInner(), establishSession(), LinkState, PasswordInput(), ResetPasswordInner(), ResetPasswordPage() (+40 more)

### Community 21 - "App dependencies A"
Cohesion: 0.08
Nodes (35): dependencies, clsx@^2.1.1, date-fns@^3.6.0, docx-preview@^0.3.7, @fontsource-variable/geist-mono@^5.3.0, next@14.2.35, react@^18.3.1, react-dom@^18.3.1 (+27 more)

### Community 22 - "Legacy kanban timeline"
Cohesion: 0.14
Nodes (23): emptyForm(), addDay(), ProjectTimeline(), RANGES, TONE_BAR, ADR-0005, emptyNewProject(), addMonths() (+15 more)

### Community 23 - "online-order-activity/page.tsx"
Cohesion: 0.18
Nodes (16): COPY, DatePreset, isoOf(), isTypingTarget(), OnlineOrderActivityPage(), changeOption(), fetchOptions(), fetchRecords() (+8 more)

### Community 24 - "Legacy kanban tasks"
Cohesion: 0.17
Nodes (10): Legacy kanban board (kanban_tasks / kanban_projects), MOM action item -> kanban task intake, KANBAN_FLOW.md (legacy kanban flow, superseded by ADR-010), PRIORITY_OPTIONS, PRIORITY_RANK, STAGE_ORDER, StageDef, STAGES (+2 more)

### Community 25 - "TypeScript config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 26 - "createClient"
Cohesion: 0.05
Nodes (69): CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS), Conventions, Map, Stack, fetchEvents(), handleDelete(), handleSubmit(), loadGrowthChart() (+61 more)

### Community 27 - "MOM Word export"
Cohesion: 0.19
Nodes (12): docx@^9.0.2, docx, buildMomDocx(), downloadMom(), L, Lang, loadLogo(), MomActionItem (+4 more)

### Community 28 - "toast-ffrFrgRK.js"
Cohesion: 0.05
Nodes (182): p(), u(), w(), x, F(), Y(), k(), P() (+174 more)

### Community 29 - "App shell & top bar"
Cohesion: 0.10
Nodes (21): Gr8r template: vanilla JS + Vite, data-a actions, mutate(), Gr8r Studio README (Project Timeline template), AppLayout(), FULL_BLEED, COLORS, Logo(), LogoMark(), Tone (+13 more)

### Community 30 - "Root layout & contexts"
Cohesion: 0.15
Nodes (12): @fontsource-variable/geist@^5.3.0, @fontsource-variable/geist, metadata, RootLayout(), viewport, LanguageProvider(), setLanguage(), toggleLanguage() (+4 more)

### Community 32 - "useLanguage"
Cohesion: 0.09
Nodes (47): react, FinancingLoanPage(), ACTION_OPTIONS, ActivityLogsPage(), AuditLogRow, MODULE_OPTIONS, SAMPLE_LOGS, FEATURE_OPTIONS (+39 more)

### Community 33 - "Activity Record migration"
Cohesion: 0.29
Nodes (12): activity_records_touch, idx_activity_records_date, idx_activity_records_flagging, idx_activity_records_product, idx_activity_records_scope, idx_activity_records_source, idx_activity_records_status, idx_activity_records_subs (+4 more)

### Community 34 - "pm_workspace table"
Cohesion: 0.18
Nodes (10): public.is_active_member(), public.pm_workspace, on_auth_user_created, public.current_profile_role(), public.handle_new_user(), public.merchant_status_claims, public.notifications, public.profiles (+2 more)

### Community 35 - "Design token generator"
Cohesion: 0.35
Nodes (7): accent_block(), accent_vars(), block(), ch(), hue_scale(), hx(), mix()

### Community 36 - "esc"
Cohesion: 0.11
Nodes (36): PCOLORS, PICONS, EXT(), fileUrl(), ADR-0015, KIND, MAX_UPLOAD, previewKind() (+28 more)

### Community 37 - "pm-workspace API"
Cohesion: 0.11
Nodes (21): next, activeCaller(), dynamic, GET(), POST(), safeName(), ADR-0015, caller() (+13 more)

### Community 38 - "Kanban board migration"
Cohesion: 0.38
Nodes (9): idx_kanban_activity_task, idx_kanban_stage_pos, kanban_tasks_log_created, kanban_tasks_track, public.kanban_task_activities, public.kanban_tasks, public.kanban_tasks_log_created(), public.kanban_tasks_track() (+1 more)

### Community 39 - "Sidebar & logo"
Cohesion: 0.12
Nodes (25): ADR-0014, lucide-react@^0.460.0, lucide-react, NotifKey, PrefKey, Row(), Section(), SettingsPage() (+17 more)

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

### Community 44 - "oo-activity.ts"
Cohesion: 0.19
Nodes (16): ADR-0013, cellText(), dedupKey(), HEADER_ALIASES, inferYear(), iso(), MONTHS, norm() (+8 more)

### Community 45 - "PT prettier config"
Cohesion: 0.40
Nodes (4): arrowParens, printWidth, singleQuote, trailingComma

### Community 46 - "Legacy kanban import"
Cohesion: 0.12
Nodes (3): curProjectId(), openModal(), commands()

### Community 47 - "Calendar types migration"
Cohesion: 0.60
Nodes (4): idx_calendar_events_type, public.calendar_event_types, uq_calendar_event_types_label, public.calendar_events

### Community 48 - "oo-activity/OptionsManager.tsx"
Cohesion: 0.15
Nodes (13): chip(), createOption(), NEW_OPTION, OPT_COPY, OptionSelectField(), add(), COPY, IconBtn() (+5 more)

### Community 54 - "pptx.ts"
Cohesion: 0.24
Nodes (13): jszip@^3.10.2, jszip, IMAGE_MIME, paragraphsOf(), parsePptx(), parseXml(), PptxBlock, PptxDocument (+5 more)

### Community 55 - "oo-activity/ImportDialog.tsx"
Cohesion: 0.17
Nodes (13): xlsx, COPY, FIELD_NAMES, ImportDialog(), onFile(), runImport(), Parsed, draftToRow() (+5 more)

### Community 56 - "updateTask"
Cohesion: 0.16
Nodes (3): BLUR, KEY, updateTask()

### Community 58 - "ic"
Cohesion: 0.17
Nodes (39): bulkBar(), cellLabels(), listHtml(), ic(), taskProg(), addD(), DAY, diffD() (+31 more)

### Community 60 - "popovers.js"
Cohesion: 0.13
Nodes (22): _icCache, LOGO_D, MARK(), wsLogo(), me(), dOff(), WD, ctxMenu() (+14 more)

### Community 61 - "Dialog"
Cohesion: 0.19
Nodes (10): COPY, emptyForm(), Form, today(), Dialog(), lang(), ADR-0011, ActivityRecord (+2 more)

### Community 62 - "oo-activity/ActivityTable.tsx"
Cohesion: 0.28
Nodes (5): ActivityTable(), COPY, fmtDate(), Lang, OptionChipSelect()

### Community 65 - "@supabase/ssr"
Cohesion: 0.33
Nodes (4): @supabase/ssr@^0.5.2, @supabase/ssr, config, PUBLIC_PATHS

### Community 68 - "20261029_online_order_followups.sql"
Cohesion: 0.32
Nodes (11): idx_oo_followups_date, idx_oo_followups_perihal, idx_oo_followups_product, idx_oo_followups_source, idx_oo_followups_status, idx_oo_followups_subs, online_order_followups_touch, public.online_order_followup_options (+3 more)

### Community 71 - "ToastContext.tsx"
Cohesion: 0.08
Nodes (30): ParsedRow, REQUIRED_COLUMNS, excelDateToISO(), OnlineOrderImportDialog(), handleFile(), handleImport(), reset(), ParsedRow (+22 more)

### Community 72 - ".go"
Cohesion: 0.11
Nodes (3): enterApp(), loadingBtn(), startResend()

### Community 74 - "KanbanCard.tsx"
Cohesion: 0.21
Nodes (6): KanbanCard(), checklistProgress(), isOverdue(), moduleLabel(), KanbanTask, initials()

### Community 75 - "skeletons.js"
Cohesion: 0.67
Nodes (6): pageStates(), sk(), skBoard(), skCards(), skeleton(), skRows()

## Ambiguous Edges - Review These
- `mom-export.ts` → `MOM action item -> kanban task intake`  [AMBIGUOUS]
  docs/KANBAN_FLOW.md · relation: related_to

## Knowledge Gaps
- **35 isolated node(s):** `ADR-0012`, `ADR-0011`, `ADR-0015`, `ADR-0011`, `ADR-0012` (+30 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 437 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `File preview (leads)` to `useLanguage`, `Data pages & ResourceManager`, `Toasts & activity options`, `PT task actions & drag-drop`, `Sidebar & logo`, `ToastContext.tsx`, `PT event delegation`, `Login & password reset`, `Legacy kanban timeline`, `oo-activity/ImportDialog.tsx`, `createClient`, `toast-ffrFrgRK.js`, `App shell & top bar`, `Root layout & contexts`?**
  _High betweenness centrality (0.490) - this node is a cross-community bridge._
- **What connects `ADR-0012`, `ADR-0011`, `ADR-0015` to the rest of the system?**
  _35 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Data pages & ResourceManager` be split into smaller, more focused modules?**
  _Cohesion score 0.06377151799687011 - nodes in this community are weakly interconnected._
- **Why does `m` connect `m` to `ja`, `y`, `b`, `X`, `toast-ffrFrgRK.js`, `Ut`, `z`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `Toasts & activity options` be split into smaller, more focused modules?**
  _Cohesion score 0.05851619644723093 - nodes in this community are weakly interconnected._
- **Why does `render()` connect `PT palette & modals` to `mem`, `esc`, `PT routing & view engine`, `PT task actions & drag-drop`, `PT Supabase sync & embed`, `.go`, `PT toast, archive, teams`, `Calendar & event types`, `Legacy kanban import`, `updateTask`, `ic`, `popovers.js`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `mom-export.ts` and `MOM action item -> kanban task intake`?**
  _Edge tagged AMBIGUOUS (relation: related_to) - confidence is low._