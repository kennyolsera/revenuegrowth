# Graph Report - revenuegrowth  (2026-11-02)

## Corpus Check
- 201 files · ~149,057 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 21, .woff2 4, (none) 3)

## Summary
- 2107 nodes · 8401 edges · 79 communities (62 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 172 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e0f16096`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- uid
- Data pages & ResourceManager
- Toasts & activity options
- Users, leads, calendar pages
- PT routing & view engine
- PT palette & modals
- PT task actions & drag-drop
- PT Supabase sync & embed
- members.js
- mom/page.tsx
- PT toast, archive, teams
- PT build tooling
- PT event delegation
- ic
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
- esc
- pm-workspace API
- Kanban board migration
- Sidebar & logo
- Schema helpers
- Tailwind config
- Kanban projects migration
- activity.ts
- Merchant select field
- PT prettier config
- Legacy kanban import
- Calendar types migration
- Auth middleware
- Next config
- Vercel config
- PT store (isolated)
- pptx.ts
- oo-activity/ImportDialog.tsx
- updateTask
- kanban/page.tsx
- ic
- proj
- icons.ts
- oo-activity/ActivityTable.tsx
- Ut
- ja
- @supabase/ssr
- y
- 20261029_online_order_followups.sql
- financingWeekly.ts
- D
- ToastContext.tsx
- save
- CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)
- KanbanCard.tsx
- skeletons.js
- enterApp

## God Nodes (most connected - your core abstractions)
1. `A` - 166 edges
2. `m` - 164 edges
3. `render()` - 157 edges
4. `createClient()` - 147 edges
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
- `Map` --references--> `requireAdmin()`  [INFERRED]
  CLAUDE.md → src/lib/server/admin-guard.ts
- `Map` --references--> `t()`  [INFERRED]
  CLAUDE.md → src/lib/LanguageContext.tsx
- `Map` --references--> `recordName()`  [INFERRED]
  CLAUDE.md → src/lib/toast-copy.ts

## Import Cycles
- 3-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/board.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 3-file cycle: `pm-app/src/shell/render.js -> pm-app/src/views/timeline.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js`
- 3-file cycle: `pm-app/src/components/task-list.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js -> pm-app/src/components/task-list.js`
- 3-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 4-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/timeline.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 4-file cycle: `pm-app/src/components/task-list.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js -> pm-app/src/views/project-overview.js -> pm-app/src/components/task-list.js`

## Communities (79 total, 17 thin omitted)

### Community 0 - "uid"
Cohesion: 0.14
Nodes (10): applyPatch(), createProject(), createTask(), KEY, nextKey(), projectFromKey(), notifyAssign(), logAct() (+2 more)

### Community 1 - "Data pages & ResourceManager"
Cohesion: 0.10
Nodes (33): recharts, buildGrowthSeries(), DashboardData, DashboardPage(), load(), EMPTY, todayBoundaryISO(), FeeRow() (+25 more)

### Community 2 - "Toasts & activity options"
Cohesion: 0.07
Nodes (50): ActivityRecordPage(), deleteSelected(), fetchOptions(), fetchRecords(), load(), onKey(), COPY, DatePreset (+42 more)

### Community 3 - "Users, leads, calendar pages"
Cohesion: 0.05
Nodes (5): Ca(), ct(), g(), m, Pt()

### Community 4 - "PT routing & view engine"
Cohesion: 0.06
Nodes (3): handleFiles(), IN, fsize()

### Community 5 - "PT palette & modals"
Cohesion: 0.05
Nodes (9): A, copy(), startResend(), closePop(), countUp(), makeFocusable(), reduceMotion(), render() (+1 more)

### Community 6 - "PT task actions & drag-drop"
Cohesion: 0.08
Nodes (46): EMAIL_RE, RECUR_DAYS, clearDropMarks(), DRAG, gPending, _rmSub, ADR-0011, LB (+38 more)

### Community 7 - "PT Supabase sync & embed"
Cohesion: 0.17
Nodes (17): tick(), adoptRemote(), applyIdentity(), banner(), emptyWorkspace(), importLegacy(), initialData(), keyFor() (+9 more)

### Community 8 - "members.js"
Cohesion: 0.29
Nodes (20): ROLES, allTasks(), canSee(), progressOf(), tasksOf(), visibleProjects(), minsAgo(), pageFavorites() (+12 more)

### Community 9 - "mom/page.tsx"
Cohesion: 0.06
Nodes (48): LeadsPage(), countRows(), fetchRows(), handleDownload(), handleRename(), handleUpload(), openRename(), ActivityLogsPage() (+40 more)

### Community 10 - "PT toast, archive, teams"
Cohesion: 0.11
Nodes (8): colTasks(), confirmDlg(), deleteTasks(), loadingBtn(), restore(), snapshot(), mutate(), toast()

### Community 11 - "PT build tooling"
Cohesion: 0.08
Nodes (27): description, devDependencies, eslint@^9.39.5, @eslint/js@^9.39.5, globals@^15.15.0, lucide@^0.460.0, prettier@^3.9.9, vite@^6.4.4 (+19 more)

### Community 12 - "PT event delegation"
Cohesion: 0.12
Nodes (22): DAY_LABELS_EN, DAY_LABELS_ID, emptyForm, MONTH_NAMES_EN, MONTH_NAMES_ID, DAY_LABELS, getMonthGrid(), isSameDay() (+14 more)

### Community 13 - "ic"
Cohesion: 0.10
Nodes (48): bulkBar(), ic(), _icCache, LOGO(), LOGO_D, MARK(), wsLogo(), myNotifs() (+40 more)

### Community 14 - "Shared TS types"
Cohesion: 0.07
Nodes (28): ActionItem, ActivityStatus, CalendarEvent, CalendarEventType, ClaimStatus, FinancingLoan, HandoverStatus, KanbanActivity (+20 more)

### Community 15 - "Database schema (all tables)"
Cohesion: 0.10
Nodes (20): Live Supabase project awqqijxcppvlkdjzdzfp, Migrations README (applied-live log), activity_records_touch, kanban_projects_touch, kanban_tasks_log_created, kanban_tasks_track, public.activity_options, public.activity_records (+12 more)

### Community 16 - "Financing weekly import"
Cohesion: 0.04
Nodes (4): b(), w(), L, we()

### Community 17 - "Activity Record logic"
Cohesion: 0.12
Nodes (3): X(), Dt, Sa()

### Community 18 - "i18n & navigation"
Cohesion: 0.12
Nodes (5): ALL_NAV_ITEMS, NAV_GROUPS, NavGroup, NavItem, TranslationKey

### Community 19 - "Admin user APIs"
Cohesion: 0.19
Nodes (13): POST(), POST(), ROLES, ADR-0002, POST(), POST(), ROLES, ADMIN_ROLES (+5 more)

### Community 20 - "Login & password reset"
Cohesion: 0.09
Nodes (43): ForgotPasswordPage(), LoginPage(), LoginPageInner(), establishSession(), LinkState, PasswordInput(), ResetPasswordInner(), ResetPasswordPage() (+35 more)

### Community 21 - "App dependencies A"
Cohesion: 0.07
Nodes (39): dependencies, clsx@^2.1.1, date-fns@^3.6.0, docx-preview@^0.3.7, next@14.2.35, react@^18.3.1, react-dom@^18.3.1, recharts@^2.12.7 (+31 more)

### Community 22 - "Legacy kanban timeline"
Cohesion: 0.15
Nodes (20): addDay(), ProjectTimeline(), RANGES, TONE_BAR, ADR-0005, addMonths(), AT_RISK_GAP, daysBetween() (+12 more)

### Community 23 - "App dependencies B"
Cohesion: 0.16
Nodes (19): COPY, DatePreset, isoOf(), isTypingTarget(), OnlineOrderActivityPage(), changeOption(), deleteSelected(), fetchOptions() (+11 more)

### Community 24 - "Legacy kanban tasks"
Cohesion: 0.13
Nodes (13): Legacy kanban board (kanban_tasks / kanban_projects), MOM action item -> kanban task intake, KANBAN_FLOW.md (legacy kanban flow, superseded by ADR-010), Language, translations, PRIORITY_OPTIONS, PRIORITY_RANK, STAGE_ORDER (+5 more)

### Community 25 - "TypeScript config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 26 - "MOM page"
Cohesion: 0.05
Nodes (79): Map, changeOption(), CalendarPage(), fetchEvents(), fetchEventTypes(), handleDelete(), handleSubmit(), openCreateAt() (+71 more)

### Community 27 - "MOM Word export"
Cohesion: 0.19
Nodes (12): docx@^9.0.2, docx, buildMomDocx(), downloadMom(), L, Lang, loadLogo(), MomActionItem (+4 more)

### Community 28 - "Legacy kanban projects"
Cohesion: 0.05
Nodes (182): p(), u(), w(), x, F(), Y(), k(), P() (+174 more)

### Community 29 - "App shell & top bar"
Cohesion: 0.12
Nodes (17): AppLayout(), FULL_BLEED, COLORS, Logo(), LogoMark(), Tone, TimelineHost(), TimelineLoading() (+9 more)

### Community 30 - "Root layout & contexts"
Cohesion: 0.16
Nodes (12): @fontsource-variable/geist@^5.3.0, @fontsource-variable/geist-mono@^5.3.0, @fontsource-variable/geist, @fontsource-variable/geist-mono, metadata, RootLayout(), viewport, LanguageProvider() (+4 more)

### Community 32 - "Activity Record page"
Cohesion: 0.09
Nodes (37): react, FinancingLoanPage(), ACTION_OPTIONS, AuditLogRow, MODULE_OPTIONS, SAMPLE_LOGS, FEATURE_OPTIONS, NetworkPartnerPage() (+29 more)

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
Cohesion: 0.12
Nodes (57): ctxTo(), CELL, cellAssignee(), cellDue(), cellLabels(), cellPrio(), cellProject(), cellStatus() (+49 more)

### Community 37 - "pm-workspace API"
Cohesion: 0.11
Nodes (21): next, activeCaller(), dynamic, GET(), POST(), safeName(), ADR-0015, caller() (+13 more)

### Community 38 - "Kanban board migration"
Cohesion: 0.38
Nodes (9): idx_kanban_activity_task, idx_kanban_stage_pos, kanban_tasks_log_created, kanban_tasks_track, public.kanban_task_activities, public.kanban_tasks, public.kanban_tasks_log_created(), public.kanban_tasks_track() (+1 more)

### Community 39 - "Sidebar & logo"
Cohesion: 0.10
Nodes (31): Gr8r template: vanilla JS + Vite, data-a actions, mutate(), Gr8r Studio README (Project Timeline template), ADR-0014, lucide-react@^0.460.0, lucide-react, NotifKey, PrefKey, Row() (+23 more)

### Community 40 - "Schema helpers"
Cohesion: 0.25
Nodes (8): idx_qris_acq_provider, public.financing_loans, public.import_batches, public.meeting_minutes, public.merchants, public.network_partner_handovers, public.online_order_activities, public.qris_acquisitions

### Community 41 - "Tailwind config"
Cohesion: 0.38
Nodes (6): ADR-0003, ADR-0007, c(), config, hue(), neutral

### Community 42 - "Kanban projects migration"
Cohesion: 0.43
Nodes (5): idx_kanban_projects_dates, idx_kanban_tasks_project, kanban_projects_touch, public.kanban_projects, public.kanban_projects_touch()

### Community 43 - "activity.ts"
Cohesion: 0.15
Nodes (21): save(), cellText(), dedupKey(), draftToRow(), findOption(), HEADER_ALIASES, headerKey(), ImportKey (+13 more)

### Community 44 - "Merchant select field"
Cohesion: 0.19
Nodes (16): ADR-0013, cellText(), dedupKey(), HEADER_ALIASES, inferYear(), iso(), MONTHS, norm() (+8 more)

### Community 45 - "PT prettier config"
Cohesion: 0.40
Nodes (4): arrowParens, printWidth, singleQuote, trailingComma

### Community 47 - "Calendar types migration"
Cohesion: 0.60
Nodes (4): idx_calendar_events_type, public.calendar_event_types, uq_calendar_event_types_label, public.calendar_events

### Community 48 - "Auth middleware"
Cohesion: 0.17
Nodes (15): chip(), createOption(), NEW_OPTION, OPT_COPY, OptionChipSelect(), OptionSelectField(), add(), COPY (+7 more)

### Community 54 - "pptx.ts"
Cohesion: 0.24
Nodes (13): jszip@^3.10.2, jszip, IMAGE_MIME, paragraphsOf(), parsePptx(), parseXml(), PptxBlock, PptxDocument (+5 more)

### Community 55 - "oo-activity/ImportDialog.tsx"
Cohesion: 0.21
Nodes (13): COPY, FIELD_NAMES, ImportDialog(), onFile(), runImport(), Parsed, ActivityRecord, draftToRow() (+5 more)

### Community 56 - "updateTask"
Cohesion: 0.13
Nodes (3): BLUR, DBL, updateTask()

### Community 58 - "ic"
Cohesion: 0.23
Nodes (33): listHtml(), miniRow(), isOver(), pColor(), taskProg(), addD(), DAY, diffD() (+25 more)

### Community 60 - "proj"
Cohesion: 0.26
Nodes (13): proj(), task(), ctxMenu(), renderLayer(), paletteHtml(), paletteItems(), filterBuilder(), openPop() (+5 more)

### Community 61 - "icons.ts"
Cohesion: 0.11
Nodes (16): ADR-0011, COPY, emptyForm(), Form, today(), ADR-0016, COPY, Lang (+8 more)

### Community 62 - "oo-activity/ActivityTable.tsx"
Cohesion: 0.25
Nodes (6): ActivityTable(), COPY, fmtDate(), Lang, ADR-0016, OPTION_FIELDS

### Community 65 - "@supabase/ssr"
Cohesion: 0.33
Nodes (4): @supabase/ssr@^0.5.2, @supabase/ssr, config, PUBLIC_PATHS

### Community 68 - "20261029_online_order_followups.sql"
Cohesion: 0.32
Nodes (11): idx_oo_followups_date, idx_oo_followups_perihal, idx_oo_followups_product, idx_oo_followups_source, idx_oo_followups_status, idx_oo_followups_subs, online_order_followups_touch, public.online_order_followup_options (+3 more)

### Community 69 - "financingWeekly.ts"
Cohesion: 0.12
Nodes (20): handleFile(), Aggregate, blankMetrics(), CellKind, ColumnTarget, DataFlag, FinancingReportRow, FlagSeverity (+12 more)

### Community 70 - "D"
Cohesion: 0.27
Nodes (14): makeKey(), actHtml(), mentionedIds(), myUnread(), NOTIF_KINDS, notifPrefsOf(), notifyComment(), push() (+6 more)

### Community 71 - "ToastContext.tsx"
Cohesion: 0.08
Nodes (29): xlsx, onFile(), ParsedRow, REQUIRED_COLUMNS, excelDateToISO(), OnlineOrderImportDialog(), handleFile(), handleImport() (+21 more)

### Community 73 - "CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)"
Cohesion: 0.50
Nodes (3): CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS), Conventions, Stack

### Community 74 - "KanbanCard.tsx"
Cohesion: 0.21
Nodes (6): KanbanCard(), checklistProgress(), isOverdue(), moduleLabel(), KanbanTask, initials()

### Community 75 - "skeletons.js"
Cohesion: 0.44
Nodes (8): LABELS, PRIOS, pageStates(), sk(), skBoard(), skCards(), skeleton(), skRows()

## Ambiguous Edges - Review These
- `mom-export.ts` → `MOM action item -> kanban task intake`  [AMBIGUOUS]
  docs/KANBAN_FLOW.md · relation: related_to

## Knowledge Gaps
- **42 isolated node(s):** `ADR-0012`, `ADR-0011`, `ADR-0015`, `ADR-0011`, `ADR-0016` (+37 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 447 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `MOM page` to `Activity Record page`, `Data pages & ResourceManager`, `Toasts & activity options`, `PT task actions & drag-drop`, `Sidebar & logo`, `ToastContext.tsx`, `mom/page.tsx`, `Login & password reset`, `Legacy kanban timeline`, `oo-activity/ImportDialog.tsx`, `Legacy kanban projects`, `App shell & top bar`, `Root layout & contexts`?**
  _High betweenness centrality (0.480) - this node is a cross-community bridge._
- **What connects `ADR-0012`, `ADR-0011`, `ADR-0015` to the rest of the system?**
  _42 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `uid` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Why does `m` connect `Users, leads, calendar pages` to `ja`, `y`, `Financing weekly import`, `Activity Record logic`, `Legacy kanban projects`, `Ut`, `Auth confirm & Supabase server`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `Data pages & ResourceManager` be split into smaller, more focused modules?**
  _Cohesion score 0.10449927431059507 - nodes in this community are weakly interconnected._
- **Why does `render()` connect `PT palette & modals` to `uid`, `esc`, `PT routing & view engine`, `PT task actions & drag-drop`, `PT Supabase sync & embed`, `save`, `PT toast, archive, teams`, `enterApp`, `ic`, `Legacy kanban import`, `updateTask`, `proj`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `mom-export.ts` and `MOM action item -> kanban task intake`?**
  _Edge tagged AMBIGUOUS (relation: related_to) - confidence is low._