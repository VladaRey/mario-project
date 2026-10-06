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

/**
 * Lottery results are stored as JSON snapshots of players, so their
 * penalty_since is stale. Overlay the current value from fresh player data.
 */
export function withFreshPenalty<T extends { id: string }>(
  snapshots: T[],
  freshPlayers: (PenaltyFields & { id: string })[],
): (T & { penalty_since: string | null })[] {
  const fresh = new Map(freshPlayers.map((p) => [p.id, p.penalty_since ?? null]));
  return snapshots.map((p) => ({ ...p, penalty_since: fresh.get(p.id) ?? null }));
}

/** Runs `fn` for every id and reports which ones succeeded, never throwing. */
export async function settleEach(
  ids: string[],
  fn: (id: string) => Promise<unknown>,
): Promise<{ succeeded: string[]; failed: string[] }> {
  const results = await Promise.allSettled(ids.map((id) => fn(id)));
  return {
    succeeded: ids.filter((_, i) => results[i]!.status === "fulfilled"),
    failed: ids.filter((_, i) => results[i]!.status === "rejected"),
  };
}
