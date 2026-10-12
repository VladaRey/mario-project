import type { Locale } from "~/i18n/translate";

export type EventFormSnapshot = { name: string; date: string; players: string[] };
export type PlayerSource = "reservation" | "waiting" | "individual";

export function isEventFormDirty(baseline: EventFormSnapshot, current: EventFormSnapshot): boolean {
  if (baseline.name !== current.name || baseline.date !== current.date) return true;
  if (baseline.players.length !== current.players.length) return true;
  const a = new Set(baseline.players);
  return current.players.some((id) => !a.has(id));
}

/** Name for a new event, e.g. "Wednesday, 07/10/2026" / "środa, 07.10.2026". */
export function defaultEventName(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === "pl" ? "pl-PL" : "en-GB", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
}
