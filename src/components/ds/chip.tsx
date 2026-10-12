"use client";
import { cn } from "~/lib/utils";
import type { CardType } from "~/lib/db";
import { CARD_TYPE_STYLE } from "~/utils/getCardTypeColor";
import { getCardTypeDisplayLabel } from "~/utils/card-type-display";
import { useT } from "~/i18n/i18n-provider";

const BASE = "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-extrabold";
const TONES = {
  violet: "bg-brand-50 text-brand-700",
  danger: "bg-danger-soft text-danger-ink",
  warning: "bg-coral-soft text-[#9A3412]",
  success: "bg-[#DCFCE7] text-[#15803D]",
  neutral: "bg-[#F1F5F9] text-[#475569]",
  onDark: "bg-white/15 text-white",
} as const;

export function Chip({ tone = "neutral", className, children }: { tone?: keyof typeof TONES; className?: string; children: React.ReactNode }) {
  return <span className={cn(BASE, TONES[tone], className)}>{children}</span>;
}

export function CardTypeChip({ cardType, short = false }: { cardType: CardType; short?: boolean }) {
  const t = useT();
  const s = CARD_TYPE_STYLE[cardType] ?? CARD_TYPE_STYLE["No card"];
  return <span className={cn(BASE, s.soft, s.ink)}>{short ? getCardTypeDisplayLabel(cardType) : t(`cardType.${cardType}`)}</span>;
}
