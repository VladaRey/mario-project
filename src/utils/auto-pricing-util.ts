import type { Event } from "~/lib/db";
import { getCourtsFromPlayersCount, DEFAULT_HOURS, DEFAULT_PRICE_PER_HOUR } from "~/constants/event-pricing-defaults";

export interface AutoParams {
  courts: number;
  hours: number;
  pricePerHour: number;
  /** FAME total input; null means "no value" (selector shows empty). Use ?? 0 for calculation. */
  fameTotal: number | null;
  /** Optional overrides for owner counts; when omitted, derived from event. */
  medicoverOwners?: number;
  medicoverLightOwners?: number;
  msOwners?: number;
  msClassicOwners?: number;
  noCardOwners?: number;
}


/**
 * Build AutoParams from event. fame_total is the stored input; when null, selector shows no value.
 */
export function paramsFromEvent(
  event: Event,
  _playerUsages: Record<string, number> = {},
): AutoParams {
  const courts = event.courts ?? getCourtsFromPlayersCount(event.players.length);
  const hours = event.hours ?? DEFAULT_HOURS;
  const pricePerHour = event.price_per_hour ?? DEFAULT_PRICE_PER_HOUR;
  const fameTotal = event.fame_total !== undefined && event.fame_total !== null ? event.fame_total : null;

  return {
    courts,
    hours,
    pricePerHour,
    fameTotal,
  };
}
