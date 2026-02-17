import { DISCOUNT_PER_USAGE } from "../constants/event-pricing-defaults";
import type { Event } from "../lib/db";
import type { AutoParams } from "../utils/auto-pricing-util";

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
  };

  const playerInfos: PlayerInfo[] = event.players.map((p) => ({
    playerId: p.id,
    usage: playerUsages[p.id] ?? 0,
    price: 0,
  }));

  // base share per player
  const baseShare = baseTotal / event.players.length;
  playerInfos.forEach((p) => {
    p.price = baseShare - p.usage * DISCOUNT_PER_USAGE;
  });

  // one-time redistribution of negative balances
  const negativePlayers = playerInfos.filter((p) => p.price < 0);
  if (negativePlayers.length > 0) {
    let totalNegative = negativePlayers.reduce((acc, p) => acc - p.price, 0);
    negativePlayers.forEach((p) => (p.price = 0));

    const positivePlayers = playerInfos.filter((p) => p.price > 0);
    if (positivePlayers.length > 0) {
      const split = totalNegative / positivePlayers.length;
      positivePlayers.forEach((p) => (p.price = Math.max(0, p.price - split)));
    }
  }

  // total after usage
  let totalFromPlayers = playerInfos.reduce((acc, p) => acc + p.price, 0);

  // fame discount (evenly distributed among all players)
  let fameDiscount = 0;
  if (params.fameTotal != null && params.fameTotal > 0) {
    fameDiscount = Math.max(0, totalFromPlayers - params.fameTotal);

    if (playerInfos.length > 0) {
      const split = fameDiscount / playerInfos.length;
      playerInfos.forEach((p) => {
        p.price = Math.max(0, p.price - split);
      });
    }

    // update total after fame
    totalFromPlayers = playerInfos.reduce((acc, p) => acc + p.price, 0);
  }

  // final rounded amounts
  const amounts: Record<string, number> = {};
  playerInfos.forEach((p) => {
    amounts[p.playerId] = roundAmount(p.price);
  });

  const totalUsageDiscount = playerInfos.reduce(
    (acc, p) => acc + p.usage * DISCOUNT_PER_USAGE,
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
