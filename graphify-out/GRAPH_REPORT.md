# Graph Report - revenuegrowth  (2026-10-29)

## Corpus Check
- 181 files · ~133,567 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 21, .woff2 4, (none) 3)

## Summary
- 1929 nodes · 7595 edges · 60 communities (48 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 147 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ec7a8cc8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PT store & render helpers
- calendar/page.tsx
- cn
- Users, leads, calendar pages
- IN
- A
- PT task actions & drag-drop
- remote.js
- icons.ts
- File preview (leads)
- PT toast, archive, teams
- PT build tooling
- loadingBtn
- EventTypeField.tsx
- Shared TS types
- Database schema (all tables)
- Financing weekly import
- m
- i18n & navigation
- Admin user APIs
- t
- package.json
- Legacy kanban timeline
- toast-qAj-TBsX.js
- Legacy kanban tasks
- TypeScript config
- MOM page
- MOM Word export
- _
- Topbar.tsx
- Root layout & contexts
- z
- mom/page.tsx
- Activity Record migration
- pm_workspace table
- Design token generator
- save
- next
- Kanban board migration
- TimelineFrame.tsx
- Schema helpers
- Tailwind config
- Kanban projects migration
- App dependencies C
- TaskDialog.tsx
- PT prettier config
- openModal
- Calendar types migration
- Auth middleware
- Next config
- Vercel config
- PT store (isolated)
- pptx.ts
- CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)
- DBL
- kanban/page.tsx

## God Nodes (most connected - your core abstractions)
1. `A` - 165 edges
2. `m` - 161 edges
3. `render()` - 156 edges
4. `createClient()` - 127 edges
5. `D()` - 117 edges
6. `ic()` - 114 edges
7. `$$` - 112 edges
8. `esc()` - 102 edges
9. `useLanguage()` - 102 edges
10. `cn()` - 80 edges

## Surprising Connections (you probably didn't know these)
- `Conventions` --references--> `Dialog()`  [INFERRED]
  CLAUDE.md → src/components/ui/Dialog.tsx
- `Map` --references--> `mutate()`  [INFERRED]
  CLAUDE.md → pm-app/src/ui/toast.js
- `Map` --references--> `S()`  [INFERRED]
  CLAUDE.md → public/project-timeline/assets/store-CsWTZ7e4.js
- `Map` --references--> `t()`  [INFERRED]
  CLAUDE.md → src/lib/LanguageContext.tsx
- `Map` --references--> `requireAdmin()`  [INFERRED]
  CLAUDE.md → src/lib/server/admin-guard.ts

## Import Cycles
- 3-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/board.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 3-file cycle: `pm-app/src/shell/render.js -> pm-app/src/views/timeline.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js`
- 3-file cycle: `pm-app/src/components/task-list.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js -> pm-app/src/components/task-list.js`
- 3-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 4-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/timeline.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 4-file cycle: `pm-app/src/components/task-list.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js -> pm-app/src/views/project-overview.js -> pm-app/src/components/task-list.js`

## Communities (60 total, 12 thin omitted)

### Community 0 - "PT store & render helpers"
Cohesion: 0.05
Nodes (225): ctxTo(), EMAIL_RE, handleFiles(), makeKey(), RECUR_DAYS, clearDropMarks(), DRAG, gPending (+217 more)

### Community 1 - "calendar/page.tsx"
Cohesion: 0.07
Nodes (53): recharts, CalendarPage(), fetchEventTypes(), openCreateAt(), openEdit(), DAY_LABELS_EN, DAY_LABELS_ID, emptyForm (+45 more)

### Community 2 - "cn"
Cohesion: 0.06
Nodes (62): ADR-0008, ActivityRecordPage(), changeOption(), fetchOptions(), fetchRecords(), load(), onKey(), COPY (+54 more)

### Community 3 - "Users, leads, calendar pages"
Cohesion: 0.07
Nodes (62): Map, fetchEvents(), handleDelete(), handleSubmit(), FinancingLoanPage(), loadGrowthChart(), MerchantStatusPage(), fetchRows() (+54 more)

### Community 5 - "A"
Cohesion: 0.05
Nodes (9): A, copy(), startResend(), closePop(), countUp(), makeFocusable(), reduceMotion(), render() (+1 more)

### Community 6 - "PT task actions & drag-drop"
Cohesion: 0.12
Nodes (10): applyPatch(), BLUR, createProject(), createTask(), KEY, nextKey(), updateTask(), logAct() (+2 more)

### Community 7 - "remote.js"
Cohesion: 0.13
Nodes (18): ADR-0011, tick(), adoptRemote(), applyIdentity(), banner(), emptyWorkspace(), importLegacy(), initialData() (+10 more)

### Community 8 - "icons.ts"
Cohesion: 0.06
Nodes (51): react, xlsx, KIND_TO_TYPE, COPY, FIELD_NAMES, ImportDialog(), onFile(), runImport() (+43 more)

### Community 9 - "File preview (leads)"
Cohesion: 0.11
Nodes (31): LeadsPage(), countRows(), fetchRows(), handleDownload(), handleRename(), handleUpload(), markProcessed(), openRename() (+23 more)

### Community 10 - "PT toast, archive, teams"
Cohesion: 0.11
Nodes (7): colTasks(), confirmDlg(), deleteTasks(), restore(), snapshot(), mutate(), toast()

### Community 11 - "PT build tooling"
Cohesion: 0.08
Nodes (27): description, devDependencies, eslint@^9.39.5, @eslint/js@^9.39.5, globals@^15.15.0, lucide@^0.460.0, prettier@^3.9.9, vite@^6.4.4 (+19 more)

### Community 13 - "EventTypeField.tsx"
Cohesion: 0.20
Nodes (11): Copy, EventTypeField(), addType(), removeType(), saveEdit(), COLOR_LABELS, EVENT_TYPE_COLOR_CLASSES, EVENT_TYPE_COLORS_ORDER (+3 more)

### Community 14 - "Shared TS types"
Cohesion: 0.07
Nodes (28): ActionItem, ActivityStatus, CalendarEvent, CalendarEventType, ClaimStatus, FinancingLoan, HandoverStatus, KanbanActivity (+20 more)

### Community 15 - "Database schema (all tables)"
Cohesion: 0.10
Nodes (20): Live Supabase project awqqijxcppvlkdjzdzfp, Migrations README (applied-live log), activity_records_touch, kanban_projects_touch, kanban_tasks_log_created, kanban_tasks_track, public.activity_options, public.activity_records (+12 more)

### Community 16 - "Financing weekly import"
Cohesion: 0.12
Nodes (20): handleFile(), Aggregate, blankMetrics(), CellKind, ColumnTarget, DataFlag, FinancingReportRow, FlagSeverity (+12 more)

### Community 17 - "m"
Cohesion: 0.02
Nodes (19): ge, k, q(), X(), y, Ba(), be(), Et() (+11 more)

### Community 18 - "i18n & navigation"
Cohesion: 0.10
Nodes (8): ALL_NAV_ITEMS, NAV_GROUPS, NavGroup, NavItem, Language, TranslationKey, translations, LanguageContextValue

### Community 19 - "Admin user APIs"
Cohesion: 0.19
Nodes (13): POST(), POST(), ROLES, ADR-0002, POST(), POST(), ROLES, ADMIN_ROLES (+5 more)

### Community 20 - "t"
Cohesion: 0.10
Nodes (32): OnlineOrderPage(), ForgotPasswordPage(), send(), LoginPage(), LoginPageInner(), establishSession(), LinkState, PasswordInput() (+24 more)

### Community 21 - "package.json"
Cohesion: 0.07
Nodes (41): dependencies, clsx@^2.1.1, date-fns@^3.6.0, docx@^9.0.2, docx-preview@^0.3.7, @fontsource-variable/geist@^5.3.0, @fontsource-variable/geist-mono@^5.3.0, jszip@^3.10.2 (+33 more)

### Community 22 - "Legacy kanban timeline"
Cohesion: 0.11
Nodes (26): Legacy kanban board (kanban_tasks / kanban_projects), MOM action item -> kanban task intake, KANBAN_FLOW.md (legacy kanban flow, superseded by ADR-010), emptyForm(), addDay(), ProjectTimeline(), RANGES, TONE_BAR (+18 more)

### Community 23 - "toast-qAj-TBsX.js"
Cohesion: 0.10
Nodes (109): be, ce(), de(), F(), H(), l(), le(), m() (+101 more)

### Community 24 - "Legacy kanban tasks"
Cohesion: 0.14
Nodes (13): KanbanCard(), checklistProgress(), isOverdue(), moduleLabel(), PRIORITY_OPTIONS, PRIORITY_RANK, STAGE_ORDER, StageDef (+5 more)

### Community 25 - "TypeScript config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 26 - "MOM page"
Cohesion: 0.21
Nodes (10): MomPage(), MomPageInner(), emailMom(), exportWord(), fetchRows(), handleSubmit(), openAttachment(), uploadFiles() (+2 more)

### Community 27 - "MOM Word export"
Cohesion: 0.23
Nodes (10): buildMomDocx(), downloadMom(), L, Lang, loadLogo(), MomActionItem, momFileName(), MomRecord (+2 more)

### Community 28 - "_"
Cohesion: 0.05
Nodes (48): A, b(), l(), m(), R(), w(), U(), b() (+40 more)

### Community 29 - "Topbar.tsx"
Cohesion: 0.14
Nodes (13): COLORS, Logo(), LogoMark(), Tone, NAV_ITEMS, Sidebar(), Theme, Topbar() (+5 more)

### Community 30 - "Root layout & contexts"
Cohesion: 0.23
Nodes (8): metadata, RootLayout(), viewport, LanguageProvider(), setLanguage(), toggleLanguage(), SidebarProvider(), ToastProvider()

### Community 31 - "z"
Cohesion: 0.04
Nodes (6): z(), Bt(), L(), N, ne(), Wa()

### Community 32 - "mom/page.tsx"
Cohesion: 0.08
Nodes (31): ACTION_OPTIONS, ActivityLogsPage(), fetchLogs(), AuditLogRow, MODULE_OPTIONS, SAMPLE_LOGS, FEATURE_OPTIONS, ActionItem (+23 more)

### Community 33 - "Activity Record migration"
Cohesion: 0.29
Nodes (12): activity_records_touch, idx_activity_records_date, idx_activity_records_flagging, idx_activity_records_product, idx_activity_records_scope, idx_activity_records_source, idx_activity_records_status, idx_activity_records_subs (+4 more)

### Community 34 - "pm_workspace table"
Cohesion: 0.18
Nodes (10): public.is_active_member(), public.pm_workspace, on_auth_user_created, public.current_profile_role(), public.handle_new_user(), public.merchant_status_claims, public.notifications, public.profiles (+2 more)

### Community 35 - "Design token generator"
Cohesion: 0.35
Nodes (7): accent_block(), accent_vars(), block(), ch(), hue_scale(), hx(), mix()

### Community 37 - "next"
Cohesion: 0.15
Nodes (15): next, caller(), colorFor(), COLORS, dynamic, GET(), Profile, PUT() (+7 more)

### Community 38 - "Kanban board migration"
Cohesion: 0.38
Nodes (9): idx_kanban_activity_task, idx_kanban_stage_pos, kanban_tasks_log_created, kanban_tasks_track, public.kanban_task_activities, public.kanban_tasks, public.kanban_tasks_log_created(), public.kanban_tasks_track() (+1 more)

### Community 39 - "TimelineFrame.tsx"
Cohesion: 0.13
Nodes (19): Gr8r template: vanilla JS + Vite, data-a actions, mutate(), Gr8r Studio README (Project Timeline template), AppLayout(), FULL_BLEED, TimelineHost(), TimelineLoading(), ADR-0011, ADR-0012 (+11 more)

### Community 40 - "Schema helpers"
Cohesion: 0.25
Nodes (8): idx_qris_acq_provider, public.financing_loans, public.import_batches, public.meeting_minutes, public.merchants, public.network_partner_handovers, public.online_order_activities, public.qris_acquisitions

### Community 41 - "Tailwind config"
Cohesion: 0.28
Nodes (8): ADR-0003, ADR-0007, tailwindcss@^3.4.4, tailwindcss, c(), config, hue(), neutral

### Community 42 - "Kanban projects migration"
Cohesion: 0.43
Nodes (5): idx_kanban_projects_dates, idx_kanban_tasks_project, kanban_projects_touch, public.kanban_projects, public.kanban_projects_touch()

### Community 43 - "App dependencies C"
Cohesion: 0.33
Nodes (6): scripts, build, build:timeline, dev, lint, start

### Community 44 - "TaskDialog.tsx"
Cohesion: 0.18
Nodes (14): ChecklistItem, emptyForm, TaskDialog(), activityText(), fetchActivities(), handleDelete(), handleSubmit(), postComment() (+6 more)

### Community 45 - "PT prettier config"
Cohesion: 0.40
Nodes (4): arrowParens, printWidth, singleQuote, trailingComma

### Community 46 - "openModal"
Cohesion: 0.14
Nodes (3): curProjectId(), projectFromKey(), openModal()

### Community 47 - "Calendar types migration"
Cohesion: 0.60
Nodes (4): idx_calendar_events_type, public.calendar_event_types, uq_calendar_event_types_label, public.calendar_events

### Community 48 - "Auth middleware"
Cohesion: 0.33
Nodes (4): @supabase/ssr@^0.5.2, @supabase/ssr, config, PUBLIC_PATHS

### Community 54 - "pptx.ts"
Cohesion: 0.30
Nodes (11): IMAGE_MIME, paragraphsOf(), parsePptx(), parseXml(), PptxBlock, PptxDocument, PptxSlide, readRels() (+3 more)

### Community 55 - "CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)"
Cohesion: 0.50
Nodes (3): CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS), Conventions, Stack

## Ambiguous Edges - Review These
- `mom-export.ts` → `MOM action item -> kanban task intake`  [AMBIGUOUS]
  docs/KANBAN_FLOW.md · relation: related_to

## Knowledge Gaps
- **30 isolated node(s):** `ADR-0012`, `ADR-0011`, `ADR-0011`, `ADR-0012`, `ADR-0002` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 459 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `t` to `PT store & render helpers`, `calendar/page.tsx`, `mom/page.tsx`, `Users, leads, calendar pages`, `icons.ts`, `File preview (leads)`, `TaskDialog.tsx`, `Legacy kanban timeline`, `toast-qAj-TBsX.js`, `MOM page`, `Topbar.tsx`, `Root layout & contexts`?**
  _High betweenness centrality (0.413) - this node is a cross-community bridge._
- **What connects `ADR-0012`, `ADR-0011`, `ADR-0011` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PT store & render helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.05249110320284697 - nodes in this community are weakly interconnected._
- **Why does `render()` connect `A` to `PT store & render helpers`, `save`, `IN`, `PT task actions & drag-drop`, `remote.js`, `PT toast, archive, teams`, `loadingBtn`, `openModal`, `DBL`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Should `calendar/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06596035543403965 - nodes in this community are weakly interconnected._
- **Why does `Map` connect `Users, leads, calendar pages` to `PT toast, archive, teams`, `Admin user APIs`, `t`, `CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)`, `_`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `mom-export.ts` and `MOM action item -> kanban task intake`?**
  _Edge tagged AMBIGUOUS (relation: related_to) - confidence is low._