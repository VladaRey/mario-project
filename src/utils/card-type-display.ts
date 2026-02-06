import type { CardType } from "~/lib/db";

const CARD_TYPE_LABELS: Record<CardType, string> = {
  Medicover: "MD",
  "Medicover Light": "ML",
  Multisport: "MS",
  Classic: "CL",
  "No card": "NC",
};

/**
 * Returns a short display label for a card type (e.g. for badges and compact UI).
 */
export function getCardTypeDisplayLabel(cardType: CardType): string {
  return CARD_TYPE_LABELS[cardType] ?? cardType;
}
