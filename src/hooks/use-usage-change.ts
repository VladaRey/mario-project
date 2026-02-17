import { useCallback } from "react";
import { toast } from "sonner";
import { eventOperations, type Event } from "~/lib/db";
import type { AutoParams } from "~/utils/auto-pricing-util";
import { calculateEventStatistics } from "~/services/calculate-event-statistics-service";

/**
 * When a player's card usage changes: set fame_total to null, recalc all amounts
 * with the new params (no fame), update DB and state. Overflow from negative
 * prices is distributed to others immediately.
 */
export function useUsageChange(
  event: Event | null,
  playerUsages: Record<string, number>,
  autoParams: AutoParams,
  setPlayerUsages: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  setPlayerPaymentAmount: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >,
  setDraftPricingParams: React.Dispatch<React.SetStateAction<AutoParams>>,
  setEvent: React.Dispatch<React.SetStateAction<Event | null>>,
) {
  return useCallback(
    async (playerId: string, usage: number) => {
      if (!event) return;
      const previousUsage = playerUsages[playerId] ?? 0;
      const newUsages = { ...playerUsages, [playerId]: usage };
      const paramsWithNoFame: AutoParams = {
        ...autoParams,
        fameTotal: null,
      };
      const { amounts } = calculateEventStatistics(
        event,
        paramsWithNoFame,
        newUsages,
      );
      setPlayerUsages(newUsages);
      setPlayerPaymentAmount(amounts);
      setDraftPricingParams(paramsWithNoFame);
      setEvent((prev) =>
        prev ? { ...prev, fame_total: null } : null,
      );
      try {
        await eventOperations.updatePlayerCardUsage(event.id, playerId, usage);
        await eventOperations.updateEventPricing(event.id, {
          courts: paramsWithNoFame.courts,
          hours: paramsWithNoFame.hours,
          price_per_hour: paramsWithNoFame.pricePerHour,
          fame_total: null,
        });
        await Promise.all(
          Object.entries(amounts).map(([pid, amount]) =>
            eventOperations.updatePlayerPaymentAmountForPlayer(
              event.id,
              pid,
              amount,
            ),
          ),
        );
        toast.success("Card usage updated successfully");
      } catch (error) {
        console.error("Failed to update card usage:", error);
        setPlayerUsages((prev) => ({ ...prev, [playerId]: previousUsage }));
        setPlayerPaymentAmount((prev) => {
          const { amounts: reverted } = calculateEventStatistics(
            event,
            autoParams,
            { ...playerUsages, [playerId]: previousUsage },
          );
          return reverted;
        });
        setDraftPricingParams(autoParams);
        setEvent((prev) =>
          prev ? { ...prev, fame_total: event.fame_total ?? null } : null,
        );
        toast.error("Failed to update card usage");
      }
    },
    [
      event,
      playerUsages,
      autoParams,
      setPlayerUsages,
      setPlayerPaymentAmount,
      setDraftPricingParams,
      setEvent,
    ],
  );
}
