import type { Event } from "~/lib/db";
import { getCourtsFromPlayersCount } from "~/constants/event-pricing-defaults";

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


interface DefaultPricingParams {
  hours: number;
  pricePerHour: number;
}

/**
 * Build AutoParams from event. fame_total is the stored input; when null, selector shows no value.
 */
export function paramsFromEvent(
  event: Event,
  defaults: DefaultPricingParams,
  _playerUsages: Record<string, number> = {},
): AutoParams {
  const courts =
    event.courts ?? getCourtsFromPlayersCount(event.players.length);
  const hours = event.hours ?? defaults.hours;
  const pricePerHour = event.price_per_hour ?? defaults.pricePerHour;
  const fameTotal =
    event.fame_total !== undefined && event.fame_total !== null
      ? event.fame_total
      : null;

  return {
    courts,
    hours,
    pricePerHour,
    fameTotal,
  };
}
