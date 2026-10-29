# Migrations

Run in file-name order. All are additive and safe to re-run.

| File | What | Live (awqqijxcppvlkdjzdzfp) |
|---|---|---|
| `20261026_kanban_board.sql` | Kanban cards + history tables, triggers, RLS (schema.sql §13, never applied before) | Applied 2026-10-26 |
| `20261026_kanban_projects.sql` | Projects table + `kanban_tasks.project_id` (ADR-005) | Applied 2026-10-26 |
| `20261026_kanban_trigger_fn_hardening.sql` | Trigger functions not callable via `/rest/v1/rpc` | Applied 2026-10-26 |
| `20261026_calendar_event_types.sql` | Editable calendar activity types: `calendar_event_types` table, FK replaces the fixed CHECK (ADR-006) | Applied 2026-10-26 |
| `20261026_activity_record.sql` | Activity Record: `activity_options` (6 editable coloured lists) + `activity_records` (ADR-008) | Applied 2026-10-26 |
| `20261029_online_order_followups.sql` | Activity Online Order: `online_order_followup_options` (5 editable coloured lists: subscription, Status FU, Sumber Data, Produk, Perihal) + `online_order_followups` (ADR-013) | Applied 2026-10-29 |

`schema.sql` holds the full schema for a fresh project and includes all of the above.
