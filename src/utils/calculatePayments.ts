import { buildInputDataFromEvent } from "~/utils/auto-pricing-util";
import { calculateStatistics } from "~/services/calculation-service";
import { eventOperations, type Event } from "~/lib/db";
import type { AutoParams } from "~/utils/auto-pricing-util";
import { getPlayerIdsByCardType } from "~/utils/event-players-util";

/** Computes payment amounts per card type from event, params and usages. Reusable across components and hooks. */
export function getPaymentUpdatesForEvent(
  event: Event,
  autoParams: AutoParams,
  playerUsages: Record<string, number>,
): Record<string, number> {
  const inputData = buildInputDataFromEvent(event, autoParams, playerUsages);
  const stats = calculateStatistics(inputData);
  return {
    "Medicover Light": Number(stats.medicoverLight ?? 0),
    Medicover: Number(stats.medicover ?? 0),
    Multisport: Number(stats.MS ?? 0),
    Classic: Number(stats.msClassic ?? 0),
    "No card": Number(stats.noMs ?? 0),
  };
}

export async function calculatePayments(
  event: Event,
  autoParams: AutoParams,
  playerUsages: Record<string, number>,
) {
  const paymentUpdates = getPaymentUpdatesForEvent(
    event,
    autoParams,
    playerUsages,
  );
  const playerIdsByCardType = getPlayerIdsByCardType(event);
  await eventOperations.updatePlayerPaymentAmountsBatch(
    event.id,
    paymentUpdates,
    playerIdsByCardType,
  );
}
