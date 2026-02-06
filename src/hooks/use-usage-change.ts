import { useCallback } from "react";
import { toast } from "sonner";
import { eventOperations, type Event } from "~/lib/db";
import type { AutoParams } from "~/utils/auto-pricing-util";
import { getPaymentUpdatesForEvent } from "~/utils/calculatePayments";
import {
  getPlayerIdsByCardType,
  buildPlayerPaymentAmountFromCardTypes,
} from "~/utils/event-players-util";

export function useUsageChange(
  event: Event | null,
  playerUsages: Record<string, number>,
  autoParams: AutoParams,
  setPlayerUsages: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >,
  setPlayerPaymentAmount: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >,
) {
  return useCallback(
    async (playerId: string, usage: number) => {
      if (!event) return;
      const previousUsage = playerUsages[playerId] ?? 0;
      const newUsages = { ...playerUsages, [playerId]: usage };
      setPlayerUsages(newUsages);
      try {
        await eventOperations.updatePlayerCardUsage(event.id, playerId, usage);
        const paymentUpdates = getPaymentUpdatesForEvent(
          event,
          autoParams,
          newUsages,
        );
        const playerIdsByCardType = getPlayerIdsByCardType(event);
        await eventOperations.updatePlayerPaymentAmountsBatch(
          event.id,
          paymentUpdates,
          playerIdsByCardType,
        );
        setPlayerPaymentAmount(
          buildPlayerPaymentAmountFromCardTypes(
            playerIdsByCardType,
            paymentUpdates,
          ),
        );
        toast.success("Card usage updated successfully");
      } catch (error) {
        console.error("Failed to update card usage:", error);
        setPlayerUsages((prev) => ({ ...prev, [playerId]: previousUsage }));
        toast.error("Failed to update card usage");
      }
    },
    [event, playerUsages, autoParams, setPlayerUsages, setPlayerPaymentAmount],
  );
}
