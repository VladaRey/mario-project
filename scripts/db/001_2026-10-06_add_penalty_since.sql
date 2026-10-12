-- 001 · 2026-10-06 · Penalty list (branch feature/penalty-list)
-- Non-null penalty_since = the player has an unpaid penalty since this moment.
-- Safe to run more than once.

alter table players add column if not exists penalty_since timestamptz null;

-- Rollback (only if the feature is reverted; drops all penalty data):
-- alter table players drop column if exists penalty_since;
