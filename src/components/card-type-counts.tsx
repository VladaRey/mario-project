"use client";
import type { CardType } from "~/lib/db";
import { CARD_TYPE_STYLE } from "~/utils/getCardTypeColor";
import { getCardTypeDisplayLabel } from "~/utils/card-type-display";
import { useIsDesktop } from "~/hooks/use-media-query";
import { useT } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";

export function CardTypeCounts({ items }: { items: { type: CardType; count: number }[] }) {
  const t = useT();
  const isDesktop = useIsDesktop();
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.filter((i) => i.count > 0).map(({ type, count }) => (
        <span key={type} className={cn("rounded-full px-2.5 py-1 text-xs font-extrabold", CARD_TYPE_STYLE[type].soft, CARD_TYPE_STYLE[type].ink)}>
          {isDesktop ? t(`cardType.${type}`) : getCardTypeDisplayLabel(type)} {count}
        </span>
      ))}
    </div>
  );
}
