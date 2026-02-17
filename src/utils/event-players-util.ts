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
