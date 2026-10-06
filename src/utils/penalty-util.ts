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
