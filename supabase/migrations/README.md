# Migrations

Run in file-name order. All are additive and safe to re-run.

| File | What | Live (awqqijxcppvlkdjzdzfp) |
|---|---|---|
| `20261026_kanban_board.sql` | Kanban cards + history tables, triggers, RLS (schema.sql §13, never applied before) | Applied 2026-10-26 |
| `20261026_kanban_projects.sql` | Projects table + `kanban_tasks.project_id` (ADR-005) | Applied 2026-10-26 |
| `20261026_kanban_trigger_fn_hardening.sql` | Trigger functions not callable via `/rest/v1/rpc` | Applied 2026-10-26 |

`schema.sql` holds the full schema for a fresh project and includes all of the above.
