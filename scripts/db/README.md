# Database changes

SQL scripts to apply manually in Supabase (Dashboard → SQL Editor) for the production project.
Run them **in numeric order** and **before** deploying the code that needs them.

| # | Script | Needed by | Applied to prod |
|---|---|---|---|
| 001 | `001_2026-10-06_add_penalty_since.sql`: adds `players.penalty_since` (penalty list) | `feature/penalty-list` | ☐ not yet |

When a script has been applied, tick the last column in the same PR or commit.

**Why the order matters:** the app selects `penalty_since` when it loads reservations and events. If the code is deployed before 001 is applied, those pages fail to load.

Local development doesn't need any of this. See "Mock mode" in the root README.
