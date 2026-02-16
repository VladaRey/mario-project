import { Users } from "lucide-react";
import { toast } from "sonner";
import {
  AutoPricingSheet,
  AutoPricingSheetTrigger,
} from "~/components/auto-pricing-sheet";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { eventOperations, type Event } from "~/lib/db";
import { PlayerPaymentCard } from "./player-payment-card";
import { PlayersByCardTypeDropdown } from "./players-by-card-type-dropdown";
import FullSizeLoader from "~/components/full-size-loader";
import { Breadcrumbs } from "~/components/breadcrumbs.component";
import { paramsFromEvent, type AutoParams } from "~/utils/auto-pricing-util";
import {
  DEFAULT_HOURS,
  DEFAULT_PRICE_PER_HOUR,
} from "~/constants/event-pricing-defaults";
import { calculateEventStatistics } from "~/services/calculate-event-statistics-service";
import { ConfirmDialog } from "~/components/confirmation-dialog";
import { CardTypeCounts } from "~/components/card-type-counts";
import { getCardTypeColor } from "~/utils/getCardTypeColor";
import { useUsageChange } from "../../hooks/use-usage-change";
import {
  getSortedCardTypeCounts,
  getSortedPlayers,
} from "~/utils/event-players-util";

interface CurrentEventProps {
  id: string;
}

export function CurrentEvent({ id }: CurrentEventProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>(
    {},
  );
  const [playerPaymentAmount, setPlayerPaymentAmount] = useState<
    Record<string, number>
  >({});
  const [draftPricingParams, setDraftPricingParams] = useState<AutoParams>(
    () => ({
      courts: 1,
      hours: DEFAULT_HOURS,
      pricePerHour: DEFAULT_PRICE_PER_HOUR,
      fameTotal: null,
    }),
  );
  const [playerUsages, setPlayerUsages] = useState<Record<string, number>>({});
  const appliedPricingParams = useMemo(
    () => (event ? paramsFromEvent(event, playerUsages) : null),
    [event, playerUsages],
  );
  const [autoPricingSheetOpen, setAutoPricingSheetOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  const loadingEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadingEventIdRef.current === id) return;
    loadingEventIdRef.current = id;

    const loadInitialEvent = async () => {
      try {
        const currentEvent = await eventOperations.getEvent(id);
        if (!currentEvent) return;

        setEvent(currentEvent);

        // payment status
        setPaymentStatus(
          Object.fromEntries(currentEvent.players.map((p) => [p.id, p.paid])),
        );

        // card usage
        const initialUsages = Object.fromEntries(
          currentEvent.players.map((p) => [p.id, p.cardUsage ?? 0]),
        );
        setPlayerUsages(initialUsages);

        const initialParams = paramsFromEvent(currentEvent, initialUsages);

        // Always recalc amounts from event's current params (courts, hours, price_per_hour, fame_total)
        // so we never show stale amounts that were computed with default/old params (e.g. without fame_total).
        const { amounts: initialAmounts } = calculateEventStatistics(
          currentEvent,
          initialParams,
          initialUsages,
        );
        await eventOperations.updatePlayerPaymentAmountsByPlayerIds(
          currentEvent.id,
          initialAmounts,
        );
        setPlayerPaymentAmount(initialAmounts);
        setDraftPricingParams(initialParams);
      } finally {
        if (loadingEventIdRef.current === id) {
          loadingEventIdRef.current = null;
        }
        setIsLoading(false);
      }
    };

    loadInitialEvent();
  }, [id]);

  const isAutoPricingDirty = useMemo(
    () =>
      appliedPricingParams != null &&
      JSON.stringify(draftPricingParams) !==
        JSON.stringify(appliedPricingParams),
    [draftPricingParams, appliedPricingParams],
  );

  const handleApplyAutoPricing = useCallback(async () => {
    if (!event) return;
    setSavingPricing(true);
    try {
      const { amounts } = calculateEventStatistics(
        event,
        draftPricingParams,
        playerUsages,
      );
      await eventOperations.updatePlayerPaymentAmountsByPlayerIds(
        event.id,
        amounts,
      );
      setPlayerPaymentAmount(amounts);

      await eventOperations.updateEventPricing(event.id, {
        courts: draftPricingParams.courts,
        hours: draftPricingParams.hours,
        price_per_hour: draftPricingParams.pricePerHour,
        fame_total: draftPricingParams.fameTotal ?? null,
      });
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              courts: draftPricingParams.courts,
              hours: draftPricingParams.hours,
              price_per_hour: draftPricingParams.pricePerHour,
              fame_total: draftPricingParams.fameTotal ?? null,
            }
          : null,
      );
      toast.success("Player payment amounts updated successfully!");
    } catch (error) {
      console.error("Error updating player payment amounts:", error);
      toast.error("Failed to update player payment amounts.");
    } finally {
      setSavingPricing(false);
    }
  }, [event, draftPricingParams, playerUsages]);

  const handleAutoPricingSheetOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setAutoPricingSheetOpen(true);
        return;
      }
      if (isAutoPricingDirty) {
        setDiscardDialogOpen(true);
        return;
      }
      setAutoPricingSheetOpen(false);
    },
    [isAutoPricingDirty],
  );

  const handleDiscardAutoPricing = useCallback(() => {
    if (appliedPricingParams != null) {
      setDraftPricingParams(appliedPricingParams);
    }
    setAutoPricingSheetOpen(false);
    setDiscardDialogOpen(false);
  }, [appliedPricingParams]);

  const handlePaymentChange = async (playerId: string, paid: boolean) => {
    if (!event) return;

    try {
      await eventOperations.updatePlayerPayment(event.id, playerId, paid);
      setPaymentStatus((prev) => ({
        ...prev,
        [playerId]: paid,
      }));
    } catch (error) {
      console.error("Failed to update payment status:", error);
      // Optionally add error handling UI here
    }
  };

  const handleUsageChange = useUsageChange(
    event,
    playerUsages,
    draftPricingParams,
    setPlayerUsages,
    setPlayerPaymentAmount,
    setDraftPricingParams,
    setEvent,
  );

  const pricingStatistics = useMemo(() => {
    if (!event) return null;
    const { statistics } = calculateEventStatistics(
      event,
      draftPricingParams,
      playerUsages,
    );
    return statistics;
  }, [event, draftPricingParams, playerUsages]);

  if (isLoading) {
    return <FullSizeLoader />;
  }

  if (!event) {
    return <div>No event found</div>;
  }

  const sortedCardTypeCounts = getSortedCardTypeCounts(event);
  const sortedPlayers = getSortedPlayers(event);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: event?.name || "", href: `/event/${event?.id}` }]}
      />
      <div className="space-y-4">
        <div className="flex flex-row justify-between gap-2 space-y-1 md:gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between">
              <h2 className="mb-1 text-2xl font-bold">Event: {event.name}</h2>
              <div className="flex gap-2 md:hidden">
                <AutoPricingSheetTrigger
                  onOpen={() => handleAutoPricingSheetOpenChange(true)}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="mt-3 flex flex-1 sm:max-w-[312px] md:hidden">
                <PlayersByCardTypeDropdown event={event} />
              </div>
              {/* md and desktop: players count + card type counts */}
              <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-[#2E2A5D] px-3 py-2 font-semibold text-white shadow-sm">
                  <Users className="h-4 w-4" />
                  <span>{event.players.length} Players</span>
                </div>
                <div className="h-6 w-px bg-gray-300" />
                <CardTypeCounts items={sortedCardTypeCounts} />
              </div>
            </div>
          </div>
          <div className="hidden gap-2 md:flex md:items-end">
            <AutoPricingSheetTrigger
              onOpen={() => handleAutoPricingSheetOpenChange(true)}
            />
          </div>
        </div>

        {/* Single sheet instance (opened by mobile or desktop trigger) */}
        <AutoPricingSheet
          open={autoPricingSheetOpen}
          onOpenChange={handleAutoPricingSheetOpenChange}
          params={draftPricingParams}
          onParamsChange={setDraftPricingParams}
          isDirty={isAutoPricingDirty}
          onSave={handleApplyAutoPricing}
          saving={savingPricing}
          showTrigger={false}
          fameDiscount={pricingStatistics?.fameDiscount}
          priceAfterDiscount={pricingStatistics?.priceAfterDiscount}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(sortedPlayers || []).map((player) => {
            return player ? (
              <PlayerPaymentCard
                key={player.id}
                player={player}
                paymentStatus={paymentStatus}
                handlePaymentChange={handlePaymentChange}
                getCardTypeColor={getCardTypeColor}
                displayAmount={
                  playerPaymentAmount[player.id] != null
                    ? String(playerPaymentAmount[player.id])
                    : undefined
                }
                usage={playerUsages[player.id] ?? 0}
                onUsageChange={handleUsageChange}
              />
            ) : null;
          })}
        </div>
      </div>

      <ConfirmDialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        title="Discard changes?"
        description="You have unsaved changes to the pricing parameters. Are you sure you want to discard them?"
        confirmLabel="Discard"
        confirmVariant="destructive"
        onConfirm={handleDiscardAutoPricing}
      />
    </div>
  );
}
