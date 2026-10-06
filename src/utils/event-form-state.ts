export type EventFormSnapshot = { name: string; date: string; players: string[] };
export type PlayerSource = "reservation" | "waiting" | "individual";

export function isEventFormDirty(baseline: EventFormSnapshot, current: EventFormSnapshot): boolean {
  if (baseline.name !== current.name || baseline.date !== current.date) return true;
  if (baseline.players.length !== current.players.length) return true;
  const a = new Set(baseline.players);
  return current.players.some((id) => !a.has(id));
}
