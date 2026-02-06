import type { CardType } from "~/lib/db";
import { getCardTypeColor } from "~/utils/getCardTypeColor";

interface CardTypeCountsProps {
  items: { type: CardType; count: number }[];
}

export function CardTypeCounts({ items }: CardTypeCountsProps) {
  return (
    <>
      {items.map(({ type, count }) => (
        <div
          key={type}
          className={`${getCardTypeColor(type)} flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium`}
        >
          <span>{type}:</span>
          <span className="font-bold">{count}</span>
        </div>
      ))}
    </>
  );
}
