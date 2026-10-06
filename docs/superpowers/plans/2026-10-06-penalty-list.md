# Penalty List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An admin can put a player on a penalty list. While on it, the player cannot be added to any event or lottery, and everyone sees a "Penalty" badge on the player.

**Architecture:** One nullable column `players.penalty_since` holds the penalty flag and date. Pure helpers in `src/utils/penalty-util.ts` decide who is penalized and split the ids being added into added and skipped. The UI reuses the shared `PlayerCard` (badge) and `MultiSelect` (disabled options), so most screens pick the feature up automatically. A new admin page `/admin/penalties` manages the list.

**Tech Stack:** Next.js 16 App Router (client components), Supabase JS, Tailwind + shadcn/ui, jest + ts-jest, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-06-penalty-list-design.md`

## Global Constraints

- Store only `penalty_since timestamptz null` on `players`. No other tables, no history.
- Only admin pages (`withAdminLayout`) may add or remove a penalty.
- Everyone sees the badge, including guests.
- A penalized player can't be picked by any path: reservation list, individual add, waiting list, or lottery.
- Players already in an event or lottery result are never removed automatically.
- Lottery "Number of Places" stays manual.
- UI copy is English, like the rest of the app: badge "Penalty", hint "penalty".
- Tests must not import `~/lib/db`. It throws at import time without Supabase env vars, and jest has no `~` path mapping. `penalty-util.ts` therefore uses structural types only.

## Review Focus

1. **The same penalized player is in two selected reservations.** They should appear once in the "skipped" notice. Pinned in Task 1 (`partitionNewIds` dedupes).
2. **A player who is already in the event gets penalized, and the admin then re-adds a reservation containing them.** They must stay in the event and must not be reported as skipped. Pinned in Task 1.
3. **Waiting-list entries are JSON snapshots** in `lottery_results` and have no `penalty_since`. The penalty check must use fresh player data (a `penalizedIds` set built from `getAllPlayers`), never the snapshot. Pinned in Task 1 (the helper takes ids plus a set) and used in Task 6.
4. **Every player in the reservation is penalized.** Nothing is added, the notice lists all of them, and the form does not crash. Pinned in Task 1.
5. **The migration was not applied before deploy.** Joins that name `penalty_since` fail. This is handled by deploy order (Task 8 checklist), not by code.

---

## File Map

| File | Change | Responsibility |
|---|---|---|
| `supabase/migrations/20261006_add_penalty_since.sql` | create | DB column |
| `src/utils/penalty-util.ts` | create | Pure penalty logic |
| `src/_tests_/penalty-util.test.ts` | create | Unit tests |
| `src/lib/db.ts` | modify | `Player.penalty_since`, `addPenalty` / `removePenalty`, joins select `penalty_since` |
| `src/components/penalty-badge.tsx` | create | Red "Penalty" badge |
| `src/components/player-card.tsx` | modify | Show the badge |
| `src/features/players-page/player-info-cards.tsx` | modify | Badge on the public player page |
| `src/components/multi-select.tsx` | modify | `disabled` / `hint` options |
| `src/app/admin/penalties/page.tsx` | create | Admin penalty page |
| `src/components/admin-navbar.tsx` | modify | "Penalties" link |
| `src/components/event-form.tsx` | modify | Filter reservations, notice, disabled options |
| `src/features/lottery/lottery-add-players-input.component.tsx` | modify | Disabled options |

---

### Task 1: Penalty helpers (pure logic, TDD)

**Files:**
- Create: `src/utils/penalty-util.ts`
- Test: `src/_tests_/penalty-util.test.ts`

**Interfaces:**
- Produces:
  - `isPenalized(p: { penalty_since?: string | null }): boolean`
  - `getPenalizedIds(players: { id: string; penalty_since?: string | null }[]): Set<string>`
  - `partitionNewIds(newIds: string[], currentIds: string[], penalizedIds: Set<string>): { added: string[]; skipped: string[] }`
    - `added` = new ids that are not in `currentIds` and not penalized, deduped, in input order.
    - `skipped` = new ids that are penalized and not in `currentIds`, deduped.
    - Ids already in `currentIds` are ignored (neither added nor skipped).

- [ ] **Step 1: Write the failing test** at `src/_tests_/penalty-util.test.ts`

```ts
import {
  isPenalized,
  getPenalizedIds,
  partitionNewIds,
} from "../utils/penalty-util";

describe("isPenalized", () => {
  test("null / undefined / empty string → not penalized", () => {
    expect(isPenalized({ penalty_since: null })).toBe(false);
    expect(isPenalized({})).toBe(false);
    expect(isPenalized({ penalty_since: "" })).toBe(false);
  });

  test("timestamp → penalized", () => {
    expect(isPenalized({ penalty_since: "2026-10-06T10:00:00Z" })).toBe(true);
  });
});

describe("getPenalizedIds", () => {
  test("collects only penalized ids", () => {
    const ids = getPenalizedIds([
      { id: "a", penalty_since: "2026-10-06T10:00:00Z" },
      { id: "b", penalty_since: null },
      { id: "c" },
    ]);
    expect([...ids]).toEqual(["a"]);
  });

  test("empty list → empty set", () => {
    expect(getPenalizedIds([]).size).toBe(0);
  });
});

describe("partitionNewIds", () => {
  const penalized = new Set(["p1", "p2"]);

  test("no penalized → everything added", () => {
    expect(partitionNewIds(["a", "b"], [], new Set())).toEqual({
      added: ["a", "b"],
      skipped: [],
    });
  });

  test("mixed: penalized are skipped (16 in reservation, 1 penalized)", () => {
    const ids = Array.from({ length: 15 }, (_, i) => `x${i}`).concat("p1");
    const result = partitionNewIds(ids, [], penalized);
    expect(result.added).toHaveLength(15);
    expect(result.skipped).toEqual(["p1"]);
  });

  test("all penalized → nothing added", () => {
    expect(partitionNewIds(["p1", "p2"], [], penalized)).toEqual({
      added: [],
      skipped: ["p1", "p2"],
    });
  });

  test("duplicates across two reservations are reported once", () => {
    expect(partitionNewIds(["a", "p1", "a", "p1"], [], penalized)).toEqual({
      added: ["a"],
      skipped: ["p1"],
    });
  });

  test("already in event: ignored even if penalized now", () => {
    expect(partitionNewIds(["p1", "a", "b"], ["p1", "a"], penalized)).toEqual({
      added: ["b"],
      skipped: [],
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- penalty-util`
Expected: FAIL with "Cannot find module '../utils/penalty-util'"

- [ ] **Step 3: Write the implementation** at `src/utils/penalty-util.ts`

```ts
type PenaltyFields = { penalty_since?: string | null };

export function isPenalized(player: PenaltyFields): boolean {
  return !!player.penalty_since;
}

export function getPenalizedIds(
  players: (PenaltyFields & { id: string })[],
): Set<string> {
  return new Set(players.filter(isPenalized).map((p) => p.id));
}

/**
 * Splits ids the admin is about to add into those that can be added and
 * those skipped because of an unpaid penalty. Ids already in `currentIds`
 * are left alone: a penalty never removes or re-reports existing players.
 */
export function partitionNewIds(
  newIds: string[],
  currentIds: string[],
  penalizedIds: Set<string>,
): { added: string[]; skipped: string[] } {
  const current = new Set(currentIds);
  const added = new Set<string>();
  const skipped = new Set<string>();

  for (const id of newIds) {
    if (current.has(id)) continue;
    if (penalizedIds.has(id)) skipped.add(id);
    else added.add(id);
  }

  return { added: [...added], skipped: [...skipped] };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test -- penalty-util`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/penalty-util.ts src/_tests_/penalty-util.test.ts
git commit -m "feat(penalty): add pure penalty helpers with tests"
```

---

### Task 2: Data layer and migration

**Files:**
- Create: `supabase/migrations/20261006_add_penalty_since.sql`
- Modify: `src/lib/db.ts`: the `Player` type (~line 36), `playerOperations` (~line 82), and every `players(id, name, created_at, cardType)` select (lines ~179, 233, 343, 554, 648)

**Interfaces:**
- Produces:
  - `Player.penalty_since?: string | null`
  - `playerOperations.addPenalty(id: string): Promise<void>`
  - `playerOperations.removePenalty(id: string): Promise<void>`

- [ ] **Step 1: Create the migration**

```sql
-- Penalty list: non-null = player has an unpaid penalty since this moment.
alter table players add column if not exists penalty_since timestamptz null;
```

- [ ] **Step 2: Extend the `Player` type.** Add the field after `cardUsage`:

```ts
  /** Set when the player has an unpaid penalty; null/undefined otherwise. */
  penalty_since?: string | null;
```

- [ ] **Step 3: Add the operations** to `playerOperations`, after `removePlayer`:

```ts
  async addPenalty(id: string): Promise<void> {
    const { error } = await supabase
      .from("players")
      .update({ penalty_since: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  async removePenalty(id: string): Promise<void> {
    const { error } = await supabase
      .from("players")
      .update({ penalty_since: null })
      .eq("id", id);

    if (error) throw error;
  },
```

- [ ] **Step 4: Select `penalty_since` in every explicit player join**

Run: `sed -i '' 's/players(id, name, created_at, cardType)/players(id, name, created_at, cardType, penalty_since)/g' src/lib/db.ts && grep -c "cardType, penalty_since" src/lib/db.ts`
Expected: `5`

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: no new errors (compare with `git stash; pnpm typecheck; git stash pop` if the baseline already has errors).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261006_add_penalty_since.sql src/lib/db.ts
git commit -m "feat(penalty): add penalty_since column and player operations"
```

---

### Task 3: Penalty badge on player cards and the player page

**Files:**
- Create: `src/components/penalty-badge.tsx`
- Modify: `src/components/player-card.tsx`
- Modify: `src/features/players-page/player-info-cards.tsx`

**Interfaces:**
- Consumes: `isPenalized` (Task 1), `Player.penalty_since` (Task 2)
- Produces: `<PenaltyBadge player={player} />`, which renders nothing when the player is not penalized.

- [ ] **Step 1: Create `src/components/penalty-badge.tsx`**

```tsx
import { Badge } from "./ui/badge";
import { isPenalized } from "~/utils/penalty-util";
import type { Player } from "~/lib/db";

export function PenaltyBadge({ player }: { player: Pick<Player, "penalty_since"> }) {
  if (!isPenalized(player)) return null;
  return (
    <Badge variant="destructive" className="mt-1">
      Penalty
    </Badge>
  );
}
```

- [ ] **Step 2: Use it in `PlayerCard`.** Replace the single `<Badge …>{player.cardType}</Badge>` with:

```tsx
          <div className="flex flex-wrap gap-1">
            <Badge className="mt-1" variant="outline">
              {player.cardType}
            </Badge>
            <PenaltyBadge player={player} />
          </div>
```

and add `import { PenaltyBadge } from "./penalty-badge";`.

- [ ] **Step 3: Show it on the public player page.** In `player-info-cards.tsx`, replace the heading `<div>` with:

```tsx
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Player details</h2>
        <PenaltyBadge player={player} />
      </div>
```

and add `import { PenaltyBadge } from "~/components/penalty-badge";`.

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/penalty-badge.tsx src/components/player-card.tsx src/features/players-page/player-info-cards.tsx
git commit -m "feat(penalty): show Penalty badge on player cards and player page"
```

---

### Task 4: MultiSelect disabled options

**Files:**
- Modify: `src/components/multi-select.tsx`

**Interfaces:**
- Produces: `Option = { value: string; label: string; disabled?: boolean; hint?: string }`. A disabled option renders greyed out with its hint and cannot be selected. Existing callers are unaffected.

- [ ] **Step 1: Extend the type and rendering**

```ts
type Option = {
  value: string;
  label: string;
  disabled?: boolean;
  hint?: string;
};
```

Replace the `<CommandItem …>…</CommandItem>` block with:

```tsx
                <CommandItem
                  key={option.value}
                  disabled={option.disabled}
                  onSelect={() => {
                    if (!option.disabled) handleSelect(option.value);
                  }}
                  className={cn(option.disabled && "opacity-50")}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      (selected || []).includes(option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option.label}
                  {option.hint && (
                    <span className="ml-auto text-xs text-red-600">
                      {option.hint}
                    </span>
                  )}
                </CommandItem>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/multi-select.tsx
git commit -m "feat(penalty): support disabled options with hint in MultiSelect"
```

---

### Task 5: Admin penalties page and nav link

**Files:**
- Create: `src/app/admin/penalties/page.tsx`
- Modify: `src/components/admin-navbar.tsx`

**Interfaces:**
- Consumes: `playerOperations.getAllPlayers / addPenalty / removePenalty`, `isPenalized`, `PlayerCard`, `MultiSelect`, `ConfirmDialog`, `withAdminLayout`

- [ ] **Step 1: Create the page**

```tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { withAdminLayout } from "~/components/with-admin-layout";
import { PlayerCard } from "~/components/player-card";
import { MultiSelect } from "~/components/multi-select";
import { ConfirmDialog } from "~/components/confirmation-dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { playerOperations, type Player } from "~/lib/db";
import { isPenalized } from "~/utils/penalty-util";

function PenaltiesPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = async () => {
    try {
      setPlayers(await playerOperations.getAllPlayers());
    } catch (error) {
      console.error("Failed to load players:", error);
      toast.error("Failed to load players.");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const penalized = players.filter(isPenalized);
  const options = players
    .filter((p) => !isPenalized(p))
    .map((p) => ({ value: p.id, label: p.name }));

  const handleAdd = async () => {
    setIsSaving(true);
    try {
      await Promise.all(selected.map((id) => playerOperations.addPenalty(id)));
      toast.success(`Added ${selected.length} player(s) to the penalty list`);
      setSelected([]);
      await refresh();
    } catch (error) {
      console.error("Failed to add penalty:", error);
      toast.error("Failed to add penalty.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (player: Player) => {
    try {
      await playerOperations.removePenalty(player.id);
      toast.success(`${player.name} removed from the penalty list`);
      await refresh();
    } catch (error) {
      console.error("Failed to remove penalty:", error);
      toast.error("Failed to remove penalty.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Penalties</h2>

      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <Label>Add players to the penalty list</Label>
          <MultiSelect
            options={options}
            selected={selected}
            onChange={setSelected}
            placeholder="Select players"
          />
        </div>
        <Button onClick={handleAdd} disabled={selected.length === 0 || isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add to penalty list
        </Button>
      </div>

      {penalized.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          No players with unpaid penalties
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {penalized.map((player) => (
            <PlayerCard key={player.id} player={player}>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-gray-500">
                  since {format(new Date(player.penalty_since!), "dd.MM.yyyy")}
                </span>
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="outline">
                      Remove penalty
                    </Button>
                  }
                  onConfirm={() => handleRemove(player)}
                  description={`Confirm that ${player.name} has paid the penalty. They will be able to join events and lotteries again.`}
                  confirmLabel="Remove penalty"
                />
              </div>
            </PlayerCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAdminLayout(PenaltiesPage);
```

- [ ] **Step 2: Add the nav link.** In `admin-navbar.tsx`, insert after **both** Reservations links: the desktop one, and the mobile one, which keeps its existing `onClick`.

Desktop:
```tsx
          <Button asChild variant="ghost">
            <Link href="/admin/penalties">Penalties</Link>
          </Button>
```
Mobile:
```tsx
          <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
            <Link href="/admin/penalties">Penalties</Link>
          </Button>
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm check`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/penalties/page.tsx src/components/admin-navbar.tsx
git commit -m "feat(penalty): add admin penalties page and nav link"
```

---

### Task 6: Event form, block penalized players

**Files:**
- Modify: `src/components/event-form.tsx`

**Interfaces:**
- Consumes: `getPenalizedIds`, `partitionNewIds` (Task 1); `Option.disabled` / `hint` (Task 4)

- [ ] **Step 1: Derive the penalized set and the skipped state.** Add these imports:

```ts
import { getPenalizedIds, partitionNewIds } from "~/utils/penalty-util";
```

After the existing `useState` declarations, add:

```ts
  const [skippedPlayers, setSkippedPlayers] = useState<string[]>([]);
  // Fresh data from getAllPlayers: waiting-list entries are JSON snapshots without penalty_since.
  const penalizedIds = getPenalizedIds(availablePlayers);
  const penaltyOption = (id: string) =>
    penalizedIds.has(id) ? { disabled: true, hint: "penalty" } : {};
```

- [ ] **Step 2: Reservation select.** Replace the `onChange` of the "Add Players from Reservations" `MultiSelect` with:

```tsx
            onChange={(selectedReservations) => {
              const reservationIds = reservations
                .filter((r) => selectedReservations.includes(r.id))
                .flatMap((r) => r.players.map((p) => p.id));
              const { added, skipped } = partitionNewIds(
                reservationIds,
                selectedPlayers,
                penalizedIds,
              );
              setSelectedPlayers((prev) => [...prev, ...added]);
              setSkippedPlayers(skipped);
              if (skipped.length > 0) {
                toast.warning(
                  `Added ${added.length} of ${added.length + skipped.length}, ${skipped.length} skipped (penalty)`,
                );
              }
            }}
```

- [ ] **Step 3: Waiting-list and individual options.** Change the two option builders:

```ts
  const playerOptions = availablePlayers.map((player) => ({
    value: player.id,
    label: player.name,
    ...penaltyOption(player.id),
  }));

  const waitingListOptions = waitingListPlayers.map((player) => ({
    label: player.name,
    value: player.id,
    ...penaltyOption(player.id),
  }));
```

- [ ] **Step 4: Show the skipped notice** directly above the "Current Players" block (`<div className="space-y-2">` that contains `Current Players`):

```tsx
      {skippedPlayers.length > 0 && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
          Not added — unpaid penalty:{" "}
          {skippedPlayers
            .map((id) => availablePlayers.find((p) => p.id === id)?.name ?? id)
            .join(", ")}
        </div>
      )}
```

- [ ] **Step 5: Clear the notice on submit.** In `handleSubmit`, after `await onSave(...)`, add `setSkippedPlayers([]);`.

- [ ] **Step 6: Typecheck and lint**

Run: `pnpm check`
Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/event-form.tsx
git commit -m "feat(penalty): skip penalized players when adding to events"
```

---

### Task 7: Lottery picker, block penalized players

**Files:**
- Modify: `src/features/lottery/lottery-add-players-input.component.tsx`

**Interfaces:**
- Consumes: `isPenalized` (Task 1), `Option.disabled` / `hint` (Task 4). `availablePlayers` comes from `getAllPlayers`, so `penalty_since` is present.

- [ ] **Step 1: Mark penalized options**

```tsx
import { isPenalized } from "~/utils/penalty-util";
// …
    const playerOptions = availablePlayers.map((player) => ({
      value: player.id,
      label: player.name,
      ...(isPenalized(player) ? { disabled: true, hint: "penalty" } : {}),
    }));
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/lottery/lottery-add-players-input.component.tsx
git commit -m "feat(penalty): block penalized players in lottery picker"
```

---

### Task 8: Verification and deploy checklist

- [ ] **Step 1: Full checks**

Run: `pnpm test && pnpm check && pnpm build`
Expected: all pass. If `build` needs env vars, export placeholder `NEXT_PUBLIC_*` values for the build only.

- [ ] **Step 2: Manual check on a local dev server** (needs `.env` with real `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_ADMIN_PASSWORD`, and the migration applied):
  1. `/admin/penalties`: add a player, see the card with "since" and the badge; remove the penalty; the player goes back to the picker.
  2. `/players`: the badge is visible without logging in.
  3. `/admin/event` (create): pick a reservation that contains a penalized player. The count is right, the yellow notice appears, the toast appears.
  4. The same player is disabled with "penalty" in "Add Individual Players", in "Waiting List" (edit event) and in the lottery picker.

- [ ] **Step 3: Deploy order** (owner does this):
  1. Run `supabase/migrations/20261006_add_penalty_since.sql` in the Supabase SQL Editor.
  2. Only then merge into `main` and let Netlify deploy.
