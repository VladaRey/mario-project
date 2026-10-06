# Penalty list (штрафной список) — design

Date: 2026-10-06 · Branch: `feature/penalty-list`

## Goal

A player who skipped a training session without notice can be put on a penalty list by an admin. While on the list, the player cannot be added to any event or selected in a lottery. Once the penalty is paid, the admin removes the player from the list and everything works as before.

## Decisions

| Question | Decision |
|---|---|
| What is stored | Only the fact "penalized" plus the date. No amount, reason or history. |
| Which add paths are blocked | All of them: reservation lists, individual add, waiting list, lottery. |
| Who sees penalties | Only admin manages. Everyone (incl. guests) sees a "Penalty" badge on player cards. |
| Players already in an event / lottery result when penalized | Stay where they are. The penalty affects only new additions. |
| Lottery places | Still entered manually (no auto "capacity − players"). |

## Data

Migration `scripts/db/001_2026-10-06_add_penalty_since.sql`:

```sql
alter table players add column if not exists penalty_since timestamptz null;
```

- `Player` type gets `penalty_since?: string | null`. Non-null = penalized.
- `playerOperations.addPenalty(id)` sets `penalty_since = now()`; `removePenalty(id)` sets it to `null`.
- Every explicit player join in `src/lib/db.ts` (`players(id, name, created_at, cardType)` — reservations, events, last event) also selects `penalty_since`. `getAllPlayers` already uses `select("*")`.

The migration must be applied in Supabase before deploying. Without it, writes from the penalty page fail and joins that name the column fail, so the order matters.

## Logic

New pure module `src/utils/penalty-util.ts`:

- `isPenalized(player): boolean`
- `splitByPenalty(players): { eligible: Player[]; penalized: Player[] }`

Covered by jest tests in `src/_tests_/penalty-util.test.ts`.

## UI

1. **`/admin/penalties`** (new, `withAdminLayout`). The admin nav gets a "Penalties" link (desktop and mobile menus).
   - A player picker (only non-penalized players) plus an "Add to penalty list" button.
   - Cards of penalized players: name, card type, "since dd.MM.yyyy", and a "Remove penalty" button behind `ConfirmDialog`.
   - Empty state: "No players with unpaid penalties".
2. **`PlayerCard`** shows a red "Penalty" badge next to the card type when the player is penalized. This makes the badge appear on public `/players`, reservations, the event form and the lottery. The public player page `/players/player/[id]` shows the same badge.
3. **`MultiSelect`** options get optional `disabled` and `hint` fields. Disabled options render greyed out with the hint ("penalty") and cannot be selected. Used by: event form "Add Individual Players" and "Waiting List", and the lottery player picker.
4. **Event form, add from reservations.** Penalized players are filtered out via `splitByPenalty`. A yellow notice above the current players lists who was skipped: "Not added — unpaid penalty: …". A toast says "Added N of M, K skipped (penalty)". The notice clears on submit or on the next reservation selection.

## Out of scope

Penalty history, amount or reason; auto-calculating lottery places; WhatsApp bot; UI redesign.

## Testing

- Unit: `penalty-util` (empty list, none penalized, mixed, all penalized).
- Manual on a local dev server against the same Supabase:
  - add and remove a penalty on `/admin/penalties`;
  - the badge shows on `/players`;
  - a reservation with a penalized player gives the right count and notice;
  - the penalized player is disabled in the individual, waiting-list and lottery pickers.
- `pnpm check` (lint + tsc) and `pnpm test` pass.
