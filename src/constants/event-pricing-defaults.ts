/** Single place of truth for event/pricing defaults and court count logic. */

/** Number of players per court when deriving court count from player count. */
export const PLAYERS_PER_COURT = 4;

/** Default hours per event. */
export const DEFAULT_HOURS = 2;

/** Default price per hour. */
export const DEFAULT_PRICE_PER_HOUR = 77;

/** Default fame total for getDefaultAutoParams (0 = no fame discount). Stored value is fame_total in DB; null means no value in selector. */
export const DEFAULT_FAME_DISCOUNT = 0;

/** Discount amount (PLN) per card usage in event pricing. */
export const DISCOUNT_PER_USAGE = 15;

/**
 * Derive number of courts from player count (one place of truth for this logic).
 */
export function getCourtsFromPlayersCount(playersCount: number): number {
  return Math.ceil(playersCount / PLAYERS_PER_COURT);
}
