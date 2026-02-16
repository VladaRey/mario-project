import { useCallback } from "react";
import { toast } from "sonner";
import { eventOperations, type Event } from "~/lib/db";
import type { AutoParams } from "~/utils/auto-pricing-util";
import { calculateEventStatistics } from "~/services/calculate-event-statistics-service";

/**
 * Usage-change flow (V2): when a player's card usage changes, recalc all amounts
 * (overflow from negative prices is distributed to others immediately). Update all
 * players in the DB and in state in this same flow so the "addition" of discount
 * is applied to other players right away, not on the next usage change.
 */
export function useUsageChange(
  event: Event | null,
  playerUsages: Record<string, number>,
  autoParams: AutoParams,
  setPlayerUsages: React.Dispatch<React.SetStateAction<Record<string, number>>>,
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
        const { amounts } = calculateEventStatistics(
          event,
          autoParams,
          newUsages,
        );
        // Update every player in DB immediately so overflow is persisted for others now
        await Promise.all(
          Object.entries(amounts).map(([pid, amount]) =>
            eventOperations.updatePlayerPaymentAmountForPlayer(
              event.id,
              pid,
              amount,
            ),
          ),
        );
        setPlayerPaymentAmount(amounts);
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
