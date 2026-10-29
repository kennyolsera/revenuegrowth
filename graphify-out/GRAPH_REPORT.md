# Graph Report - revenuegrowth  (2026-10-29)

## Corpus Check
- 190 files · ~143,370 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 21, .woff2 4, (none) 3)

## Summary
- 2027 nodes · 8005 edges · 77 communities (68 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 150 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4448bab6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PT store & render helpers
- calendar/page.tsx
- activity/OptionsManager.tsx
- createClient
- IN
- A
- PT task actions & drag-drop
- remote.js
- OnlineOrderImportDialog
- File preview (leads)
- PT toast, archive, teams
- PT build tooling
- calendar/page.tsx
- oo-activity/options.tsx
- Shared TS types
- Database schema (all tables)
- Financing weekly import
- m
- i18n & navigation
- Admin user APIs
- cn
- package.json
- ProjectTimeline.tsx
- toast-qAj-TBsX.js
- Legacy kanban tasks
- TypeScript config
- MOM page
- MOM Word export
- _
- Topbar.tsx
- Root layout & contexts
- z
- useLanguage
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
- t
- PT prettier config
- openModal
- Calendar types migration
- online-order-activity/page.tsx
- Next config
- Vercel config
- PT store (isolated)
- pptx.ts
- CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)
- updateTask
- kanban/page.tsx
- oo-activity.ts
- activity/page.tsx
- useToast
- activity.ts
- LeadsPage
- oo-activity/ImportDialog.tsx
- oo-activity/OptionsManager.tsx
- Dialog
- activity/ImportDialog.tsx
- 20261029_online_order_followups.sql
- UsersPage
- activity/ActivityTable.tsx
- ToastContext.tsx
- oo-activity/ActivityTable.tsx
- kanban-projects.ts
- KanbanCard.tsx
- oo-activity/ActivityDialog.tsx
- QrisImportDialog

## God Nodes (most connected - your core abstractions)
1. `A` - 165 edges
2. `m` - 161 edges
3. `render()` - 156 edges
4. `createClient()` - 143 edges
5. `D()` - 117 edges
6. `ic()` - 114 edges
7. `useLanguage()` - 113 edges
8. `$$` - 112 edges
9. `esc()` - 102 edges
10. `cn()` - 95 edges

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

## Communities (77 total, 9 thin omitted)

### Community 0 - "PT store & render helpers"
Cohesion: 0.05
Nodes (224): BLUR, ctxTo(), EMAIL_RE, makeKey(), RECUR_DAYS, clearDropMarks(), DRAG, gPending (+216 more)

### Community 1 - "calendar/page.tsx"
Cohesion: 0.09
Nodes (36): recharts, buildGrowthSeries(), DashboardData, DashboardPage(), load(), EMPTY, todayBoundaryISO(), FeeRow() (+28 more)

### Community 2 - "activity/OptionsManager.tsx"
Cohesion: 0.15
Nodes (14): runImport(), chip(), createOption(), add(), COPY, IconBtn(), OptionsManager(), add() (+6 more)

### Community 3 - "createClient"
Cohesion: 0.13
Nodes (23): loadGrowthChart(), load(), fetchLogs(), handleSubmit(), ImportExcelDialog(), excelDateToISO(), handleConfirmImport(), handleFile() (+15 more)

### Community 4 - "IN"
Cohesion: 0.06
Nodes (3): handleFiles(), IN, fsize()

### Community 5 - "A"
Cohesion: 0.05
Nodes (11): A, copy(), enterApp(), loadingBtn(), startResend(), countUp(), focusKey(), makeFocusable() (+3 more)

### Community 6 - "PT task actions & drag-drop"
Cohesion: 0.14
Nodes (8): applyPatch(), createProject(), createTask(), KEY, nextKey(), logAct(), uid(), fxSet()

### Community 7 - "remote.js"
Cohesion: 0.13
Nodes (18): ADR-0011, tick(), adoptRemote(), applyIdentity(), banner(), emptyWorkspace(), importLegacy(), initialData() (+10 more)

### Community 8 - "OnlineOrderImportDialog"
Cohesion: 0.27
Nodes (10): excelDateToISO(), OnlineOrderImportDialog(), handleFile(), handleImport(), reset(), normHeader(), OO_HEADER_MAP, OOField (+2 more)

### Community 9 - "File preview (leads)"
Cohesion: 0.14
Nodes (18): DocxView(), FilePreview(), KIND_ICON, LoadState, PdfView(), PptxView(), PreviewMessage(), PreviewSkeleton() (+10 more)

### Community 10 - "PT toast, archive, teams"
Cohesion: 0.11
Nodes (7): colTasks(), confirmDlg(), deleteTasks(), restore(), snapshot(), mutate(), toast()

### Community 11 - "PT build tooling"
Cohesion: 0.08
Nodes (27): description, devDependencies, eslint@^9.39.5, @eslint/js@^9.39.5, globals@^15.15.0, lucide@^0.460.0, prettier@^3.9.9, vite@^6.4.4 (+19 more)

### Community 12 - "calendar/page.tsx"
Cohesion: 0.13
Nodes (19): CalendarPage(), fetchEventTypes(), openCreateAt(), openEdit(), DAY_LABELS_EN, DAY_LABELS_ID, emptyForm, MONTH_NAMES_EN (+11 more)

### Community 13 - "oo-activity/options.tsx"
Cohesion: 0.21
Nodes (9): NEW_OPTION, OPT_COPY, CalendarEventType, COLOR_LABELS, EVENT_TYPE_COLOR_CLASSES, EVENT_TYPE_COLORS_ORDER, EventTypeColor, FALLBACK_EVENT_TYPES (+1 more)

### Community 14 - "Shared TS types"
Cohesion: 0.07
Nodes (28): ActionItem, ActivityStatus, CalendarEvent, CalendarEventType, ClaimStatus, FinancingLoan, HandoverStatus, KanbanActivity (+20 more)

### Community 15 - "Database schema (all tables)"
Cohesion: 0.10
Nodes (20): Live Supabase project awqqijxcppvlkdjzdzfp, Migrations README (applied-live log), activity_records_touch, kanban_projects_touch, kanban_tasks_log_created, kanban_tasks_track, public.activity_options, public.activity_records (+12 more)

### Community 16 - "Financing weekly import"
Cohesion: 0.13
Nodes (19): handleFile(), Aggregate, blankMetrics(), CellKind, ColumnTarget, DataFlag, FlagSeverity, MATCHERS (+11 more)

### Community 17 - "m"
Cohesion: 0.02
Nodes (19): ge, k, q(), X(), y, Ba(), be(), Et() (+11 more)

### Community 18 - "i18n & navigation"
Cohesion: 0.11
Nodes (8): ALL_NAV_ITEMS, NAV_GROUPS, NavGroup, NavItem, Language, TranslationKey, translations, LanguageContextValue

### Community 19 - "Admin user APIs"
Cohesion: 0.19
Nodes (13): POST(), POST(), ROLES, ADR-0002, POST(), POST(), ROLES, ADMIN_ROLES (+5 more)

### Community 20 - "cn"
Cohesion: 0.08
Nodes (51): ForgotPasswordPage(), LoginPage(), LoginPageInner(), establishSession(), LinkState, PasswordInput(), ResetPasswordInner(), ResetPasswordPage() (+43 more)

### Community 21 - "package.json"
Cohesion: 0.07
Nodes (37): dependencies, clsx@^2.1.1, date-fns@^3.6.0, docx-preview@^0.3.7, @fontsource-variable/geist@^5.3.0, lucide-react@^0.460.0, next@14.2.35, react@^18.3.1 (+29 more)

### Community 22 - "ProjectTimeline.tsx"
Cohesion: 0.18
Nodes (12): addDay(), ProjectTimeline(), RANGES, TONE_BAR, ADR-0005, addMonths(), HEALTH_META, monthsFrom() (+4 more)

### Community 23 - "toast-qAj-TBsX.js"
Cohesion: 0.10
Nodes (109): be, ce(), de(), F(), H(), l(), le(), m() (+101 more)

### Community 24 - "Legacy kanban tasks"
Cohesion: 0.14
Nodes (12): Legacy kanban board (kanban_tasks / kanban_projects), MOM action item -> kanban task intake, KANBAN_FLOW.md (legacy kanban flow, superseded by ADR-010), moduleLabel(), PRIORITY_OPTIONS, PRIORITY_RANK, STAGE_ORDER, StageDef (+4 more)

### Community 25 - "TypeScript config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 26 - "MOM page"
Cohesion: 0.22
Nodes (10): MomPageInner(), emailMom(), exportWord(), fetchRows(), handleSubmit(), openAttachment(), uploadFiles(), lang() (+2 more)

### Community 27 - "MOM Word export"
Cohesion: 0.19
Nodes (12): docx@^9.0.2, docx, buildMomDocx(), downloadMom(), L, Lang, loadLogo(), MomActionItem (+4 more)

### Community 28 - "_"
Cohesion: 0.05
Nodes (48): A, b(), l(), m(), R(), w(), U(), b() (+40 more)

### Community 29 - "Topbar.tsx"
Cohesion: 0.20
Nodes (5): NAV_ITEMS, Theme, Topbar(), handleLogout(), useTheme()

### Community 30 - "Root layout & contexts"
Cohesion: 0.15
Nodes (12): @fontsource-variable/geist-mono@^5.3.0, @fontsource-variable/geist-mono, metadata, RootLayout(), viewport, LanguageProvider(), setLanguage(), toggleLanguage() (+4 more)

### Community 31 - "z"
Cohesion: 0.04
Nodes (6): z(), Bt(), L(), N, ne(), Wa()

### Community 32 - "useLanguage"
Cohesion: 0.07
Nodes (60): react, xlsx, FinancingLoanPage(), ACTION_OPTIONS, ActivityLogsPage(), AuditLogRow, MODULE_OPTIONS, SAMPLE_LOGS (+52 more)

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
Cohesion: 0.11
Nodes (19): @supabase/ssr@^0.5.2, next, @supabase/ssr, caller(), colorFor(), COLORS, dynamic, GET() (+11 more)

### Community 38 - "Kanban board migration"
Cohesion: 0.38
Nodes (9): idx_kanban_activity_task, idx_kanban_stage_pos, kanban_tasks_log_created, kanban_tasks_track, public.kanban_task_activities, public.kanban_tasks, public.kanban_tasks_log_created(), public.kanban_tasks_track() (+1 more)

### Community 39 - "TimelineFrame.tsx"
Cohesion: 0.11
Nodes (25): Gr8r template: vanilla JS + Vite, data-a actions, mutate(), Gr8r Studio README (Project Timeline template), AppLayout(), FULL_BLEED, COLORS, Logo(), LogoMark(), Tone (+17 more)

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

### Community 44 - "t"
Cohesion: 0.21
Nodes (15): fetchEvents(), handleDelete(), handleSubmit(), MerchantStatusPage(), fetchRows(), handleCreate(), saveDetail(), send() (+7 more)

### Community 45 - "PT prettier config"
Cohesion: 0.40
Nodes (4): arrowParens, printWidth, singleQuote, trailingComma

### Community 46 - "openModal"
Cohesion: 0.12
Nodes (3): curProjectId(), projectFromKey(), openModal()

### Community 47 - "Calendar types migration"
Cohesion: 0.60
Nodes (4): idx_calendar_events_type, public.calendar_event_types, uq_calendar_event_types_label, public.calendar_events

### Community 48 - "online-order-activity/page.tsx"
Cohesion: 0.18
Nodes (17): COPY, DatePreset, isoOf(), isTypingTarget(), OnlineOrderActivityPage(), changeOption(), fetchOptions(), fetchRecords() (+9 more)

### Community 54 - "pptx.ts"
Cohesion: 0.24
Nodes (13): jszip@^3.10.2, jszip, IMAGE_MIME, paragraphsOf(), parsePptx(), parseXml(), PptxBlock, PptxDocument (+5 more)

### Community 55 - "CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)"
Cohesion: 0.50
Nodes (3): CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS), Conventions, Stack

### Community 58 - "oo-activity.ts"
Cohesion: 0.19
Nodes (16): ADR-0013, cellText(), dedupKey(), HEADER_ALIASES, inferYear(), iso(), MONTHS, norm() (+8 more)

### Community 60 - "activity/page.tsx"
Cohesion: 0.18
Nodes (15): ActivityRecordPage(), changeOption(), fetchOptions(), fetchRecords(), load(), onKey(), COPY, DatePreset (+7 more)

### Community 61 - "useToast"
Cohesion: 0.21
Nodes (15): Map, QrisProvidersPage(), check(), toggleActive(), InlineStatusSelect(), handleChange(), statusTone(), COPY (+7 more)

### Community 62 - "activity.ts"
Cohesion: 0.22
Nodes (14): cellText(), dedupKey(), HEADER_ALIASES, inferYear(), iso(), MONTHS, norm(), pad() (+6 more)

### Community 63 - "LeadsPage"
Cohesion: 0.26
Nodes (12): LeadsPage(), countRows(), fetchRows(), handleDownload(), handleRename(), handleUpload(), markProcessed(), openRename() (+4 more)

### Community 64 - "oo-activity/ImportDialog.tsx"
Cohesion: 0.23
Nodes (12): COPY, FIELD_NAMES, ImportDialog(), onFile(), runImport(), Parsed, draftToRow(), headerKey() (+4 more)

### Community 65 - "oo-activity/OptionsManager.tsx"
Cohesion: 0.23
Nodes (9): createOption(), add(), COPY, IconBtn(), OptionsManager(), add(), save(), findOption() (+1 more)

### Community 66 - "Dialog"
Cohesion: 0.21
Nodes (10): ActivityDialog(), handleDelete(), handleSave(), COPY, emptyForm(), Form, today(), Dialog() (+2 more)

### Community 67 - "activity/ImportDialog.tsx"
Cohesion: 0.20
Nodes (9): COPY, FIELD_NAMES, ImportDialog(), onFile(), Parsed, headerKey(), ImportKey, ImportPlan (+1 more)

### Community 68 - "20261029_online_order_followups.sql"
Cohesion: 0.32
Nodes (11): idx_oo_followups_date, idx_oo_followups_perihal, idx_oo_followups_product, idx_oo_followups_source, idx_oo_followups_status, idx_oo_followups_subs, online_order_followups_touch, public.online_order_followup_options (+3 more)

### Community 69 - "UsersPage"
Cohesion: 0.29
Nodes (7): UsersPage(), fetchLogs(), fetchRows(), handleDelete(), handleInvite(), saveEdit(), toggleActive()

### Community 70 - "activity/ActivityTable.tsx"
Cohesion: 0.24
Nodes (6): ActivityTable(), COPY, fmtDate(), Lang, safeHref(), OptionColumn

### Community 71 - "ToastContext.tsx"
Cohesion: 0.22
Nodes (7): ICON, Toast, ToastContext, ToastContextValue, ToastOptions, ToastType, ADR-0011

### Community 72 - "oo-activity/ActivityTable.tsx"
Cohesion: 0.24
Nodes (7): ActivityTable(), COPY, fmtDate(), Lang, chip(), OptionChipSelect(), ActivityRecord

### Community 73 - "kanban-projects.ts"
Cohesion: 0.27
Nodes (8): AT_RISK_GAP, daysBetween(), expectedRatio(), positionIn(), PROJECT_STATUSES, projectHealth, ADR-0005, KanbanProjectStatus

### Community 74 - "KanbanCard.tsx"
Cohesion: 0.31
Nodes (4): KanbanCard(), checklistProgress(), isOverdue(), initials()

### Community 75 - "oo-activity/ActivityDialog.tsx"
Cohesion: 0.29
Nodes (6): COPY, emptyForm(), Form, today(), OPTION_FIELDS, OptionColumn

### Community 76 - "QrisImportDialog"
Cohesion: 0.40
Nodes (6): excelDateToISO(), norm(), QrisImportDialog(), handleFile(), handleImport(), reset()

## Ambiguous Edges - Review These
- `mom-export.ts` → `MOM action item -> kanban task intake`  [AMBIGUOUS]
  docs/KANBAN_FLOW.md · relation: related_to

## Knowledge Gaps
- **32 isolated node(s):** `ADR-0012`, `ADR-0011`, `ADR-0011`, `ADR-0012`, `ADR-0002` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 479 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `t` to `PT store & render helpers`, `calendar/page.tsx`, `activity/OptionsManager.tsx`, `createClient`, `OnlineOrderImportDialog`, `File preview (leads)`, `calendar/page.tsx`, `cn`, `ProjectTimeline.tsx`, `toast-qAj-TBsX.js`, `MOM page`, `Topbar.tsx`, `Root layout & contexts`, `useLanguage`, `TimelineFrame.tsx`, `useToast`, `LeadsPage`, `oo-activity/ImportDialog.tsx`, `activity/ImportDialog.tsx`, `UsersPage`, `QrisImportDialog`?**
  _High betweenness centrality (0.424) - this node is a cross-community bridge._
- **What connects `ADR-0012`, `ADR-0011`, `ADR-0011` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PT store & render helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.05194215188914969 - nodes in this community are weakly interconnected._
- **Why does `render()` connect `A` to `PT store & render helpers`, `save`, `IN`, `PT task actions & drag-drop`, `remote.js`, `PT toast, archive, teams`, `openModal`, `updateTask`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Should `calendar/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09210526315789473 - nodes in this community are weakly interconnected._
- **Why does `Map` connect `useToast` to `PT toast, archive, teams`, `t`, `Admin user APIs`, `CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)`, `_`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `mom-export.ts` and `MOM action item -> kanban task intake`?**
  _Edge tagged AMBIGUOUS (relation: related_to) - confidence is low._