# Graph Report - revenuegrowth  (2026-10-29)

## Corpus Check
- 194 files · ~145,997 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 21, .woff2 4, (none) 3)

## Summary
- 2062 nodes · 8259 edges · 79 communities (62 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 163 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e5f05d7b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- esc
- Data pages & ResourceManager
- cn
- TaskDialog.tsx
- PT routing & view engine
- PT palette & modals
- $$
- PT Supabase sync & embed
- m
- File preview (leads)
- PT toast, archive, teams
- PT build tooling
- PT event delegation
- D
- Shared TS types
- Database schema (all tables)
- b
- X
- i18n & navigation
- Admin user APIs
- Login & password reset
- App dependencies A
- Legacy kanban timeline
- j
- Legacy kanban tasks
- TypeScript config
- icons.ts
- MOM Word export
- main-DfnE9oOk.js
- Topbar.tsx
- Root layout & contexts
- z
- Activity Record page
- Activity Record migration
- pm_workspace table
- Design token generator
- PT keyboard & popovers
- pm-workspace API
- Kanban board migration
- settings/page.tsx
- Schema helpers
- Tailwind config
- Kanban projects migration
- App dependencies C
- createClient
- PT prettier config
- Legacy kanban import
- Calendar types migration
- online-order-activity/page.tsx
- Next config
- Vercel config
- PT store (isolated)
- pptx.ts
- CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)
- updateTask
- kanban/page.tsx
- popovers.js
- ic
- recordName
- activity.ts
- LeadsPage
- r
- toast-BQDV1DAm.js
- y
- m
- 20261029_online_order_followups.sql
- fetchRows
- TimelineFrame.tsx
- ToastContext.tsx
- loadingBtn
- KanbanCard.tsx
- skeletons.js
- be
- ja

## God Nodes (most connected - your core abstractions)
1. `A` - 165 edges
2. `m` - 163 edges
3. `render()` - 156 edges
4. `createClient()` - 143 edges
5. `b()` - 133 edges
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
- `Map` --references--> `savedMsg()`  [INFERRED]
  CLAUDE.md → src/lib/toast-copy.ts

## Import Cycles
- 3-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/board.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 3-file cycle: `pm-app/src/shell/render.js -> pm-app/src/views/timeline.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js`
- 3-file cycle: `pm-app/src/components/task-list.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js -> pm-app/src/components/task-list.js`
- 3-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 4-file cycle: `pm-app/src/pages/project.js -> pm-app/src/views/timeline.js -> pm-app/src/views/calendar.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js`
- 4-file cycle: `pm-app/src/components/task-list.js -> pm-app/src/shell/render.js -> pm-app/src/pages/project.js -> pm-app/src/views/project-overview.js -> pm-app/src/components/task-list.js`

## Communities (79 total, 17 thin omitted)

### Community 0 - "esc"
Cohesion: 0.12
Nodes (56): CELL, cellAssignee(), cellDue(), cellLabels(), cellPrio(), cellProject(), cellStatus(), LCOLS (+48 more)

### Community 1 - "Data pages & ResourceManager"
Cohesion: 0.06
Nodes (52): recharts, buildGrowthSeries(), DashboardData, DashboardPage(), load(), EMPTY, todayBoundaryISO(), FeeRow() (+44 more)

### Community 2 - "cn"
Cohesion: 0.08
Nodes (44): ActivityRecordPage(), fetchOptions(), fetchRecords(), load(), onKey(), COPY, DatePreset, isoOf() (+36 more)

### Community 3 - "TaskDialog.tsx"
Cohesion: 0.21
Nodes (13): ChecklistItem, emptyForm, TaskDialog(), activityText(), fetchActivities(), handleSubmit(), postComment(), cycleDays() (+5 more)

### Community 5 - "PT palette & modals"
Cohesion: 0.05
Nodes (9): A, copy(), startResend(), countUp(), focusKey(), makeFocusable(), reduceMotion(), render() (+1 more)

### Community 6 - "$$"
Cohesion: 0.07
Nodes (55): applyPatch(), BLUR, createProject(), createTask(), ctxTo(), EMAIL_RE, handleFiles(), makeKey() (+47 more)

### Community 7 - "PT Supabase sync & embed"
Cohesion: 0.17
Nodes (17): tick(), adoptRemote(), applyIdentity(), banner(), emptyWorkspace(), importLegacy(), initialData(), keyFor() (+9 more)

### Community 8 - "m"
Cohesion: 0.05
Nodes (4): Ca(), ct(), g(), m

### Community 9 - "File preview (leads)"
Cohesion: 0.14
Nodes (18): DocxView(), FilePreview(), KIND_ICON, LoadState, PdfView(), PptxView(), PreviewMessage(), PreviewSkeleton() (+10 more)

### Community 10 - "PT toast, archive, teams"
Cohesion: 0.15
Nodes (7): colTasks(), confirmDlg(), deleteTasks(), restore(), snapshot(), mutate(), toast()

### Community 11 - "PT build tooling"
Cohesion: 0.08
Nodes (27): description, devDependencies, eslint@^9.39.5, @eslint/js@^9.39.5, globals@^15.15.0, lucide@^0.460.0, prettier@^3.9.9, vite@^6.4.4 (+19 more)

### Community 12 - "PT event delegation"
Cohesion: 0.08
Nodes (35): CalendarPage(), fetchEventTypes(), openCreateAt(), openEdit(), DAY_LABELS_EN, DAY_LABELS_ID, emptyForm, MONTH_NAMES_EN (+27 more)

### Community 13 - "D"
Cohesion: 0.17
Nodes (52): actHtml(), miniRow(), myNotifs(), allTasks(), canSee(), D(), progressOf(), proj() (+44 more)

### Community 14 - "Shared TS types"
Cohesion: 0.07
Nodes (28): ActionItem, ActivityStatus, CalendarEvent, CalendarEventType, ClaimStatus, FinancingLoan, HandoverStatus, KanbanActivity (+20 more)

### Community 15 - "Database schema (all tables)"
Cohesion: 0.10
Nodes (20): Live Supabase project awqqijxcppvlkdjzdzfp, Migrations README (applied-live log), activity_records_touch, kanban_projects_touch, kanban_tasks_log_created, kanban_tasks_track, public.activity_options, public.activity_records (+12 more)

### Community 16 - "b"
Cohesion: 0.04
Nodes (3): b(), w(), L

### Community 17 - "X"
Cohesion: 0.11
Nodes (12): k(), q(), re(), X(), Dt, ma(), Pt(), Rt() (+4 more)

### Community 18 - "i18n & navigation"
Cohesion: 0.11
Nodes (7): ALL_NAV_ITEMS, NavGroup, NavItem, Language, TranslationKey, translations, LanguageContextValue

### Community 19 - "Admin user APIs"
Cohesion: 0.19
Nodes (13): POST(), POST(), ROLES, ADR-0002, POST(), POST(), ROLES, ADMIN_ROLES (+5 more)

### Community 20 - "Login & password reset"
Cohesion: 0.10
Nodes (35): ForgotPasswordPage(), LoginPage(), LoginPageInner(), establishSession(), LinkState, PasswordInput(), ResetPasswordInner(), ResetPasswordPage() (+27 more)

### Community 21 - "App dependencies A"
Cohesion: 0.08
Nodes (33): dependencies, clsx@^2.1.1, date-fns@^3.6.0, docx-preview@^0.3.7, next@14.2.35, react@^18.3.1, react-dom@^18.3.1, recharts@^2.12.7 (+25 more)

### Community 22 - "Legacy kanban timeline"
Cohesion: 0.14
Nodes (23): emptyForm(), addDay(), ProjectTimeline(), RANGES, TONE_BAR, ADR-0005, emptyNewProject(), addMonths() (+15 more)

### Community 23 - "j"
Cohesion: 0.28
Nodes (30): F(), H(), le(), oe, pe, v(), ai(), bt() (+22 more)

### Community 24 - "Legacy kanban tasks"
Cohesion: 0.17
Nodes (10): Legacy kanban board (kanban_tasks / kanban_projects), MOM action item -> kanban task intake, KANBAN_FLOW.md (legacy kanban flow, superseded by ADR-010), PRIORITY_OPTIONS, PRIORITY_RANK, STAGE_ORDER, StageDef, STAGES (+2 more)

### Community 25 - "TypeScript config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 26 - "icons.ts"
Cohesion: 0.07
Nodes (45): ACTION_OPTIONS, ActivityLogsPage(), AuditLogRow, MODULE_OPTIONS, SAMPLE_LOGS, FEATURE_OPTIONS, MerchantStatusPage(), ActionItem (+37 more)

### Community 27 - "MOM Word export"
Cohesion: 0.19
Nodes (12): docx@^9.0.2, docx, buildMomDocx(), downloadMom(), L, Lang, loadLogo(), MomActionItem (+4 more)

### Community 28 - "main-DfnE9oOk.js"
Cohesion: 0.06
Nodes (47): p(), u(), w(), x, U(), P(), S(), u() (+39 more)

### Community 29 - "Topbar.tsx"
Cohesion: 0.13
Nodes (16): AppLayout(), FULL_BLEED, COLORS, Logo(), LogoMark(), Tone, NAV_GROUPS, NAV_ITEMS (+8 more)

### Community 30 - "Root layout & contexts"
Cohesion: 0.16
Nodes (12): @fontsource-variable/geist@^5.3.0, @fontsource-variable/geist-mono@^5.3.0, @fontsource-variable/geist, @fontsource-variable/geist-mono, metadata, RootLayout(), viewport, LanguageProvider() (+4 more)

### Community 32 - "Activity Record page"
Cohesion: 0.07
Nodes (54): react, xlsx, FinancingLoanPage(), NetworkPartnerPage(), KIND_TO_TYPE, OnlineOrderPage(), QrisPage(), RequestsPage() (+46 more)

### Community 33 - "Activity Record migration"
Cohesion: 0.29
Nodes (12): activity_records_touch, idx_activity_records_date, idx_activity_records_flagging, idx_activity_records_product, idx_activity_records_scope, idx_activity_records_source, idx_activity_records_status, idx_activity_records_subs (+4 more)

### Community 34 - "pm_workspace table"
Cohesion: 0.18
Nodes (10): public.is_active_member(), public.pm_workspace, on_auth_user_created, public.current_profile_role(), public.handle_new_user(), public.merchant_status_claims, public.notifications, public.profiles (+2 more)

### Community 35 - "Design token generator"
Cohesion: 0.35
Nodes (7): accent_block(), accent_vars(), block(), ch(), hue_scale(), hx(), mix()

### Community 37 - "pm-workspace API"
Cohesion: 0.11
Nodes (19): @supabase/ssr@^0.5.2, next, @supabase/ssr, caller(), colorFor(), COLORS, dynamic, GET() (+11 more)

### Community 38 - "Kanban board migration"
Cohesion: 0.38
Nodes (9): idx_kanban_activity_task, idx_kanban_stage_pos, kanban_tasks_log_created, kanban_tasks_track, public.kanban_task_activities, public.kanban_tasks, public.kanban_tasks_log_created(), public.kanban_tasks_track() (+1 more)

### Community 39 - "settings/page.tsx"
Cohesion: 0.14
Nodes (23): ADR-0014, lucide-react@^0.460.0, lucide-react, NotifKey, PrefKey, Row(), Section(), SettingsPage() (+15 more)

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

### Community 44 - "createClient"
Cohesion: 0.10
Nodes (36): changeOption(), fetchEvents(), handleDelete(), handleSubmit(), loadGrowthChart(), fetchLogs(), fetchRows(), handleCreate() (+28 more)

### Community 45 - "PT prettier config"
Cohesion: 0.40
Nodes (4): arrowParens, printWidth, singleQuote, trailingComma

### Community 46 - "Legacy kanban import"
Cohesion: 0.11
Nodes (4): curProjectId(), projectFromKey(), openModal(), commands()

### Community 47 - "Calendar types migration"
Cohesion: 0.60
Nodes (4): idx_calendar_events_type, public.calendar_event_types, uq_calendar_event_types_label, public.calendar_events

### Community 48 - "online-order-activity/page.tsx"
Cohesion: 0.06
Nodes (65): ADR-0013, COPY, DatePreset, isoOf(), isTypingTarget(), OnlineOrderActivityPage(), changeOption(), fetchOptions() (+57 more)

### Community 54 - "pptx.ts"
Cohesion: 0.24
Nodes (13): jszip@^3.10.2, jszip, IMAGE_MIME, paragraphsOf(), parsePptx(), parseXml(), PptxBlock, PptxDocument (+5 more)

### Community 55 - "CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS)"
Cohesion: 0.50
Nodes (3): CLAUDE.md: ESMM / Revenue Growth Dashboard (Olsera VAS), Conventions, Stack

### Community 58 - "popovers.js"
Cohesion: 0.17
Nodes (38): STATUSES, isOver(), pColor(), taskProg(), addD(), diffD(), dOff(), fmtDate() (+30 more)

### Community 60 - "ic"
Cohesion: 0.12
Nodes (36): bulkBar(), listHtml(), ic(), _icCache, LOGO(), LOGO_D, MARK(), wsLogo() (+28 more)

### Community 61 - "recordName"
Cohesion: 0.46
Nodes (8): Map, QrisProvidersPage(), check(), toggleActive(), InlineStatusSelect(), handleChange(), recordName(), statusMsg()

### Community 62 - "activity.ts"
Cohesion: 0.15
Nodes (20): save(), cellText(), dedupKey(), findOption(), HEADER_ALIASES, headerKey(), ImportKey, ImportPlan (+12 more)

### Community 63 - "LeadsPage"
Cohesion: 0.26
Nodes (12): LeadsPage(), countRows(), fetchRows(), handleDownload(), handleRename(), handleUpload(), markProcessed(), openRename() (+4 more)

### Community 64 - "r"
Cohesion: 0.16
Nodes (38): de(), te(), s(), _a(), as(), B(), cs(), di() (+30 more)

### Community 65 - "toast-BQDV1DAm.js"
Cohesion: 0.11
Nodes (28): ae(), l(), ae, bi, ci, D(), Da, de() (+20 more)

### Community 67 - "m"
Cohesion: 0.22
Nodes (23): be, ce(), G(), m(), me, R(), aa(), Ba() (+15 more)

### Community 68 - "20261029_online_order_followups.sql"
Cohesion: 0.32
Nodes (11): idx_oo_followups_date, idx_oo_followups_perihal, idx_oo_followups_product, idx_oo_followups_source, idx_oo_followups_status, idx_oo_followups_subs, online_order_followups_touch, public.online_order_followup_options (+3 more)

### Community 69 - "fetchRows"
Cohesion: 0.40
Nodes (5): fetchRows(), handleDelete(), handleInvite(), saveEdit(), toggleActive()

### Community 70 - "TimelineFrame.tsx"
Cohesion: 0.22
Nodes (10): Gr8r template: vanilla JS + Vite, data-a actions, mutate(), Gr8r Studio README (Project Timeline template), TimelineHost(), TimelineLoading(), ADR-0011, ADR-0012, PT_CMD_EVENT, PtCmd (+2 more)

### Community 71 - "ToastContext.tsx"
Cohesion: 0.25
Nodes (7): ICON, Toast, ToastContext, ToastContextValue, ToastOptions, ToastType, ADR-0011

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
- **33 isolated node(s):** `ADR-0012`, `ADR-0011`, `ADR-0011`, `ADR-0012`, `ADR-0002` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 435 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `createClient` to `Data pages & ResourceManager`, `cn`, `TaskDialog.tsx`, `$$`, `File preview (leads)`, `PT event delegation`, `X`, `Login & password reset`, `Legacy kanban timeline`, `icons.ts`, `Topbar.tsx`, `Root layout & contexts`, `Activity Record page`, `settings/page.tsx`, `online-order-activity/page.tsx`, `recordName`, `LeadsPage`, `r`, `toast-BQDV1DAm.js`, `fetchRows`?**
  _High betweenness centrality (0.511) - this node is a cross-community bridge._
- **What connects `ADR-0012`, `ADR-0011`, `ADR-0011` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `esc` be split into smaller, more focused modules?**
  _Cohesion score 0.12071992976294996 - nodes in this community are weakly interconnected._
- **Why does `m` connect `m` to `toast-BQDV1DAm.js`, `y`, `m`, `be`, `ja`, `b`, `X`, `j`, `main-DfnE9oOk.js`, `z`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `Data pages & ResourceManager` be split into smaller, more focused modules?**
  _Cohesion score 0.06103286384976526 - nodes in this community are weakly interconnected._
- **Why does `render()` connect `PT palette & modals` to `esc`, `PT keyboard & popovers`, `PT routing & view engine`, `$$`, `PT Supabase sync & embed`, `.go`, `loadingBtn`, `PT toast, archive, teams`, `D`, `Legacy kanban import`, `updateTask`, `popovers.js`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `mom-export.ts` and `MOM action item -> kanban task intake`?**
  _Edge tagged AMBIGUOUS (relation: related_to) - confidence is low._