import type { CardType, Event, Player } from "~/lib/db";

const CARD_TYPE_ORDER: CardType[] = [
  "Medicover",
  "Medicover Light",
  "Multisport",
  "Classic",
  "No card",
];

export function getSortedCardTypeCounts(
  event: Event | null,
): { type: CardType; count: number }[] {
  if (!event) return [];
  const counts = event.players.reduce<Record<CardType, number>>(
    (acc, p) => {
      acc[p.cardType] = (acc[p.cardType] ?? 0) + 1;
      return acc;
    },
    {} as Record<CardType, number>,
  );
  return CARD_TYPE_ORDER.map((type) => ({ type, count: counts[type] ?? 0 }));
}

export function getSortedPlayers(event: Event | null): Player[] {
  if (!event) return [];
  const order = Object.fromEntries(
    CARD_TYPE_ORDER.map((t, i) => [t, i]),
  ) as Record<CardType, number>;
  return [...event.players].sort(
    (a, b) => (order[a.cardType] ?? 99) - (order[b.cardType] ?? 99),
  );
}

/** Build map of cardType -> player ids for batch payment updates (avoids N GETs per card type). */
export function getPlayerIdsByCardType(event: Event | null): Record<string, string[]> {
  if (!event) return {};
  return event.players.reduce<Record<string, string[]>>((acc, p) => {
    const t = p.cardType;
    (acc[t] = acc[t] ?? []).push(p.id);
    return acc;
  }, {});
}

/**
 * Build playerId -> amount from card-type updates (avoids GET after PATCH when we just wrote these amounts).
 */
export function buildPlayerPaymentAmountFromCardTypes(
  playerIdsByCardType: Record<string, string[]>,
  paymentUpdates: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [cardType, playerIds] of Object.entries(playerIdsByCardType)) {
    const amount = paymentUpdates[cardType] ?? 0;
    for (const playerId of playerIds) {
      result[playerId] = amount;
    }
  }
  return result;
}
