import { getCourtsFromPlayersCount, PLAYERS_PER_COURT } from "~/constants/event-pricing-defaults";
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

export function pricingHints(a: {
  eventCourts: number | null | undefined; playersCount: number;
  draft: { courts: number; hours: number; pricePerHour: number };
  defaults: { hours: number; pricePerHour: number };
}) {
  // Events always store courts (addEvent/updateEvent write ceil(players / 4)), so a saved value
  // equal to the auto value for the current player count is treated as auto.
  const auto = getCourtsFromPlayersCount(a.playersCount);
  return {
    courtsAuto: (a.eventCourts == null || a.eventCourts === auto) && a.draft.courts === auto,
    hoursFromDefaults: a.draft.hours === a.defaults.hours,
    priceFromDefaults: a.draft.pricePerHour === a.defaults.pricePerHour,
  };
}

export function freeSpots(courts: number | null | undefined, playersInEvent: number): number | null {
  if (courts == null) return null;
  return Math.max(0, courts * PLAYERS_PER_COURT - playersInEvent);
}
