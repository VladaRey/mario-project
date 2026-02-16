import { DISCOUNT_PER_USAGE } from "~/constants/event-pricing-defaults";
import type { Event } from "~/lib/db";
import type { AutoParams } from "~/utils/auto-pricing-util";

export interface StatisticsV2 {
  totalPrice: string; // base price by formula
  priceAfterDiscount: string; // actual event price (with fame)
  discount: string; // usage discount (informational)
  fameDiscount: string; // how much fame reduced the base price
  noMs?: string; // no multisport
  MS?: string; // multisport
  medicover?: string; // medicover
  medicoverLight?: string; // medicover light
  msClassic?: string; // classic
}

const POWER = 100;

function roundUp(num: number): string {
  return num <= 0 ? "0" : (Math.ceil(num * POWER) / POWER).toFixed(2);
}

function roundAmount(num: number): number {
  return Math.max(0, Math.round(num * POWER) / POWER);
}

export function calculateEventStatistics(
  event: Event,
  params: AutoParams,
  playerUsages: Record<string, number>,
) {
  if (!event.players.length) {
    return { amounts: {}, statistics: null };
  }

  /**
   * base price (as calculated by the club)
   */
  const baseTotal = params.courts * params.pricePerHour * params.hours;

  /**
   * actual event price
   * Fame total is an override, not another discount.
   */
  const eventTotal =
    params.fameTotal != null && params.fameTotal > 0
      ? params.fameTotal
      : baseTotal;

  /**
   * base share per player
   */
  const baseShare = eventTotal / event.players.length;

  type Slot = {
    playerId: string;
    usage: number;
    price: number;
    cardType: string;
  };

  const slots: Slot[] = event.players.map((p) => ({
    playerId: p.id,
    usage: playerUsages[p.id] ?? 0,
    price: 0,
    cardType: p.cardType,
  }));

  /**
   * usage discount per player
   */
  slots.forEach((s) => {
    s.price = baseShare - s.usage * DISCOUNT_PER_USAGE;
  });

  /**
   * overflow addition discount by card type (like old calculation-service).
   * When a card type's total goes negative, that overflow is split only among
   * specific recipient card types, not all users. Order: Medicover → Medicover Light → Multisport → Classic.
   */
  const overflowOrder: Array<{
    sourceType: string;
    recipientTypes: string[];
  }> = [
    {
      sourceType: "Medicover",
      recipientTypes: ["Multisport", "Classic", "Medicover Light", "No card"],
    },
    {
      sourceType: "Medicover Light",
      recipientTypes: ["Multisport", "Classic", "No card"],
    },
    {
      sourceType: "Multisport",
      recipientTypes: ["No card", "Medicover Light"],
    },
    {
      sourceType: "Classic",
      recipientTypes: ["Multisport", "Medicover", "Medicover Light", "No card"],
    },
  ];

  for (const { sourceType, recipientTypes } of overflowOrder) {
    const sourceSlots = slots.filter((s) => s.cardType === sourceType);
    let overflow = 0;
    sourceSlots.forEach((s) => {
      if (s.price < 0) {
        overflow += -s.price;
        s.price = 0;
      }
    });
    if (overflow <= 0) continue;

    const recipientSlots = slots.filter((s) =>
      recipientTypes.includes(s.cardType),
    );
    const recipientCount = recipientSlots.length;
    if (recipientCount === 0) continue;

    const additionPerRecipient = overflow / recipientCount;
    recipientSlots.forEach((s) => {
      s.price += additionPerRecipient;
    });
  }

  /**
   * final amounts per player
   */
  const amounts: Record<string, number> = {};
  slots.forEach((s) => {
    amounts[s.playerId] = roundAmount(s.price);
  });

  /**
   * statistics by card type (only analytics)
   */
  const sumByCardType: Record<string, number> = {};
  slots.forEach((s) => {
    sumByCardType[s.cardType] = (sumByCardType[s.cardType] ?? 0) + s.price;
  });

  /**
   * informational indicators (do not affect the calculation)
   */
  const totalUsageDiscount = slots.reduce(
    (acc, s) => acc + s.usage * DISCOUNT_PER_USAGE,
    0,
  );

  const fameDiscount = Math.max(0, baseTotal - eventTotal);

  const statistics: StatisticsV2 = {
    totalPrice: roundUp(baseTotal), // how much was "by formula"
    priceAfterDiscount: roundUp(eventTotal), // how much we actually pay
    discount: roundUp(totalUsageDiscount), // usage - only info
    fameDiscount: roundUp(fameDiscount), // difference due to fame

    noMs: sumByCardType["No card"]
      ? roundUp(sumByCardType["No card"])
      : undefined,

    MS: sumByCardType["Multisport"]
      ? roundUp(sumByCardType["Multisport"])
      : undefined,

    medicover: sumByCardType["Medicover"]
      ? roundUp(sumByCardType["Medicover"])
      : undefined,

    medicoverLight: sumByCardType["Medicover Light"]
      ? roundUp(sumByCardType["Medicover Light"])
      : undefined,

    msClassic: sumByCardType["Classic"]
      ? roundUp(sumByCardType["Classic"])
      : undefined,
  };

  return { amounts, statistics };
}
