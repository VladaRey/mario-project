-- Penalty list: non-null = player has an unpaid penalty since this moment.
alter table players add column if not exists penalty_since timestamptz null;
