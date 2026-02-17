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

  const rawTotal = params.courts * params.pricePerHour * params.hours;

  type PlayerInfo = {
    playerId: string;
    usage: number;
    price: number;
  };

  const baseShare = rawTotal / event.players.length;
  const playerInfos: PlayerInfo[] = event.players.map((p) => ({
    playerId: p.id,
    usage: playerUsages[p.id] ?? 0,
    price: baseShare,
  }));

  // застосовуємо знижку за usage
  let totalUsageDiscount = 0;
  playerInfos.forEach((p) => {
    const discount = p.usage * DISCOUNT_PER_USAGE;
    p.price -= discount;
    totalUsageDiscount += discount;
  });

  // one-time redistribution negative balances
  const negativePlayers = playerInfos.filter((p) => p.price < 0);
  if (negativePlayers.length > 0) {
    const debt = negativePlayers.reduce((acc, p) => acc - p.price, 0);
    negativePlayers.forEach((p) => (p.price = 0));

    const positivePlayers = playerInfos.filter((p) => p.price > 0);
    if (positivePlayers.length > 0) {
      const split = debt / positivePlayers.length;
      positivePlayers.forEach((p) => (p.price -= split));
    }
  }

  // total after usage redistrib
  let totalFromPlayers = playerInfos.reduce((acc, p) => acc + p.price, 0);

  // fame discount (evenly among paying players)
  let fameDiscount = 0;
  if (params.fameTotal != null && params.fameTotal > 0) {
    let remainingDiscount = Math.max(0, totalFromPlayers - params.fameTotal);

    // розподіляємо поки є що віднімати і є гравці з ціною > 0
    while (remainingDiscount > 0) {
      const positivePlayers = playerInfos.filter((p) => p.price > 0);
      if (positivePlayers.length === 0) break;

      const split = remainingDiscount / positivePlayers.length;
      positivePlayers.forEach((p) => {
        p.price = Math.max(0, p.price - split);
      });

      totalFromPlayers = playerInfos.reduce((acc, p) => acc + p.price, 0);
      remainingDiscount = Math.max(0, totalFromPlayers - params.fameTotal);
    }

    fameDiscount = rawTotal - totalFromPlayers - totalUsageDiscount;
  }

  // final rounded amounts
  const amounts: Record<string, number> = {};
  playerInfos.forEach((p) => {
    amounts[p.playerId] = roundAmount(p.price);
  });

  const statistics: Statistics = {
    totalPrice: roundUp(rawTotal),
    priceAfterDiscount: roundUp(totalFromPlayers),
    totalFromPlayers: roundUp(totalFromPlayers),
    discount: roundUp(totalUsageDiscount),
    fameDiscount: roundUp(fameDiscount),
  };

  return { amounts, statistics };
}
