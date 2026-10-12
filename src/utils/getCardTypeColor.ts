import { type CardType } from "~/lib/db";

export const CARD_TYPE_STYLE: Record<CardType, { soft: string; ink: string; dot: string }> = {
  Medicover: { soft: "bg-[#E0ECFF]", ink: "text-[#1D4ED8]", dot: "bg-[#1D4ED8]" },
  "Medicover Light": { soft: "bg-[#EFE5FF]", ink: "text-[#6D28D9]", dot: "bg-[#6D28D9]" },
  Multisport: { soft: "bg-[#DCFCE7]", ink: "text-[#15803D]", dot: "bg-[#15803D]" },
  Classic: { soft: "bg-[#FEF3C7]", ink: "text-[#B45309]", dot: "bg-[#B45309]" },
  "No card": { soft: "bg-[#F1F5F9]", ink: "text-[#475569]", dot: "bg-[#475569]" },
};

export function getCardTypeColor(cardType: CardType): string {
  const s = CARD_TYPE_STYLE[cardType] ?? CARD_TYPE_STYLE["No card"];
  return `${s.soft} ${s.ink}`;
}
