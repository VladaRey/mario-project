import { cn } from "~/lib/utils";
import type { CardType } from "~/lib/db";
import { CARD_TYPE_STYLE } from "~/utils/getCardTypeColor";

export function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

const SIZES = { sm: "h-8 w-8 text-[11px]", md: "h-9 w-9 text-xs", lg: "h-16 w-16 text-xl" } as const;

export function PlayerAvatar({ name, cardType, size = "md", className }: { name: string; cardType: CardType; size?: keyof typeof SIZES; className?: string }) {
  const s = CARD_TYPE_STYLE[cardType] ?? CARD_TYPE_STYLE["No card"];
  return (
    <span aria-hidden="true" className={cn("flex flex-none items-center justify-center rounded-full font-extrabold", s.soft, s.ink, SIZES[size], className)}>
      {initials(name)}
    </span>
  );
}
