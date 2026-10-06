import type { Event } from "~/lib/db";

export function paidSummary(players: { paid?: boolean }[]) {
  const paid = players.filter((p) => p.paid).length;
  return { paid, total: players.length, unpaid: players.length - paid };
}

export function flattenEvents(grouped: Record<string, Event[]>): Event[] {
  return Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .flatMap((d) => grouped[d] ?? []);
}

export type PaidFilter = "all" | "unpaid" | "paid";

export function filterByPaid<T extends { id: string }>(players: T[], status: Record<string, boolean>, filter: PaidFilter): T[] {
  if (filter === "all") return players;
  return players.filter((p) => (filter === "paid" ? status[p.id] === true : status[p.id] !== true));
}

export function averageAmount(amounts: Record<string, number>, ids: string[]): number | null {
  const vals = ids.map((id) => amounts[id]).filter((v): v is number => typeof v === "number");
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}
