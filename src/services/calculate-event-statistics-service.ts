import { DISCOUNT_PER_USAGE } from "~/constants/event-pricing-defaults";
import type { Event } from "~/lib/db";
import type { AutoParams } from "~/utils/auto-pricing-util";

export interface Statistics {
  totalPrice: string; 
  priceAfterDiscount: string; 
  totalFromPlayers: string; 
  discount: string; 
  fameDiscount: string; 
}

const power = Math.pow(10, 2);

function roundUp(num: number) {
  if (num < 0) return "0";
  return (Math.ceil(num * power) / power).toFixed(2);
}

function roundAmount(num: number) {
  return Math.max(0, Math.round(num * power) / power);
}

export function calculateEventStatistics(
  event: Event,
  params: AutoParams,
  playerUsages: Record<string, number>,
) {
  if (!event.players.length) return { amounts: {}, statistics: null };

  const baseTotal = params.courts * params.pricePerHour * params.hours;

  type PlayerInfo = {
    playerId: string;
    usage: number;
    price: number;
    cardType: string;
  };

  // Create player slots
  const playerInfos: PlayerInfo[] = event.players.map((p) => ({
    playerId: p.id,
    usage: playerUsages[p.id] ?? 0,
    price: 0,
    cardType: p.cardType,
  }));

  // Base share per player with usage discount
  const baseShare = baseTotal / event.players.length;
  playerInfos.forEach((playerInfo) => {
    playerInfo.price = baseShare - playerInfo.usage * DISCOUNT_PER_USAGE;
  });

  // Overflow redistribution by cards (as before)
  const overflowOrder: Array<{ sourceType: string; recipientTypes: string[] }> =
    [
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
        recipientTypes: [
          "Multisport",
          "Medicover",
          "Medicover Light",
          "No card",
        ],
      },
    ];

  for (const { sourceType, recipientTypes } of overflowOrder) {
    const sourceSlots = playerInfos.filter((playerInfo) => playerInfo.cardType === sourceType);
    let overflow = 0;
    sourceSlots.forEach((playerInfo) => {
      if (playerInfo.price < 0) {
        overflow += -playerInfo.price;
        playerInfo.price = 0;
      }
    });
    if (overflow <= 0) continue;

    const recipientSlots = playerInfos.filter((playerInfo) =>
      recipientTypes.includes(playerInfo.cardType),
    );
    if (recipientSlots.length === 0) continue;

    const additionPerRecipient = overflow / recipientSlots.length;
    recipientSlots.forEach((playerInfo) => {
      playerInfo.price += additionPerRecipient;
    });
  }

  // Calculate total after usage discount
  let totalFromPlayers = playerInfos.reduce((acc, playerInfo) => acc + playerInfo.price, 0);

  // Fame discount (if fameTotal is set)
  let fameDiscount = 0;
  if (params.fameTotal != null && params.fameTotal > 0) {
    // discount = difference between totalFromPlayers and fameTotal
    fameDiscount = Math.max(0, totalFromPlayers - params.fameTotal);

    // proportionally reduce player prices
    const ratio = params.fameTotal / totalFromPlayers;
    playerInfos.forEach((playerInfo) => {
      playerInfo.price = playerInfo.price * ratio;
    });

    // update totalFromPlayers after fame discount
    totalFromPlayers = playerInfos.reduce((acc, playerInfo) => acc + playerInfo.price, 0);
  }

  // Round final amounts
  const amounts: Record<string, number> = {};
  playerInfos.forEach((playerInfo) => {
    amounts[playerInfo.playerId] = roundAmount(playerInfo.price);
  });

  // Informational indicators
  const totalUsageDiscount = playerInfos.reduce(
    (acc, playerInfo) => acc + playerInfo.usage * DISCOUNT_PER_USAGE,
    0,
  );

  const statistics: Statistics = {
    totalPrice: roundUp(baseTotal),
    priceAfterDiscount: roundUp(totalFromPlayers),
    totalFromPlayers: roundUp(totalFromPlayers),
    discount: roundUp(totalUsageDiscount),
    fameDiscount: roundUp(fameDiscount),
  };

  return { amounts, statistics };
}
