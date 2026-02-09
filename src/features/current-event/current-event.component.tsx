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
import {
  getDefaultAutoParams,
  DEFAULT_AUTO_PARAMS,
  buildInputDataFromEvent,
} from "~/utils/auto-pricing-util";
import type { AutoParams } from "~/utils/auto-pricing-util";
import { calculateStatistics } from "~/services/calculation-service";
import { ConfirmDialog } from "~/components/confirmation-dialog";
import {
  calculatePayments,
  getPaymentUpdatesForEvent,
} from "~/utils/calculatePayments";
import { CardTypeCounts } from "~/components/card-type-counts";
import { getCardTypeColor } from "~/utils/getCardTypeColor";
import { useUsageChange } from "../../hooks/use-usage-change";
import {
  getSortedCardTypeCounts,
  getSortedPlayers,
  getPlayerIdsByCardType,
  buildPlayerPaymentAmountFromCardTypes,
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
  const [draftPricingParams, setDraftPricingParams] = useState<AutoParams>(DEFAULT_AUTO_PARAMS);
  const [appliedPricingParams, setAppliedPricingParams] = useState<AutoParams>(DEFAULT_AUTO_PARAMS);
  const [playerUsages, setPlayerUsages] = useState<Record<string, number>>({});
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

        const playerIdsByCardType = getPlayerIdsByCardType(currentEvent);

        // check for amount null
        const playersToUpdate = currentEvent.players.filter(
          (p) => p.amount == null,
        );

        if (playersToUpdate.length > 0) {
          // calculate amounts with default auto parameters
          const defaultParams = getDefaultAutoParams(
            currentEvent.players.length,
          );
          const paymentUpdates = getPaymentUpdatesForEvent(
            currentEvent,
            defaultParams,
            initialUsages,
          );

          await eventOperations.updatePlayerPaymentAmountsBatch(
            currentEvent.id,
            paymentUpdates,
            playerIdsByCardType,
          );
          setPlayerPaymentAmount(
            buildPlayerPaymentAmountFromCardTypes(
              playerIdsByCardType,
              paymentUpdates,
            ),
          );
        } else {
          const amountsFromDb = await eventOperations.getPlayerPaymentAmount(
            currentEvent.id,
          );
          setPlayerPaymentAmount(amountsFromDb);
        }

        // set default auto parameters
        const defaults = getDefaultAutoParams(currentEvent.players.length);
        setDraftPricingParams(defaults);
        setAppliedPricingParams(defaults);
      } finally {
        if (loadingEventIdRef.current === id) {
          loadingEventIdRef.current = null;
        }
        setIsLoading(false);
      }
    };

    loadInitialEvent();
  }, [id]);

  const refreshPaymentAmounts = async () => {
    if (event) {
      const playerPayments = await eventOperations.getPlayerPaymentAmount(
        event.id,
      );
      setPlayerPaymentAmount(playerPayments);
    }
  };

  const isAutoPricingDirty = useMemo(
    () =>
      JSON.stringify(draftPricingParams) !==
      JSON.stringify(appliedPricingParams),
    [draftPricingParams, appliedPricingParams],
  );

  const handleApplyAutoPricing = useCallback(async () => {
    if (!event) return;
    setSavingPricing(true);
    try {
      await calculatePayments(event, draftPricingParams, playerUsages);
      setAppliedPricingParams(draftPricingParams);
      await refreshPaymentAmounts();
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
    setDraftPricingParams(appliedPricingParams);
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
  );

  const pricingStatistics = useMemo(() => {
    if (!event) return null;
    const inputData = buildInputDataFromEvent(
      event,
      draftPricingParams,
      playerUsages,
    );
    return calculateStatistics(inputData);
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
              <div className="flex sm:max-w-[312px] flex-1 md:hidden mt-3">
                <PlayersByCardTypeDropdown event={event} />
              </div>
              {/* md and desktop: players count + card type counts */}
              <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-[#2E2A5D] px-3 py-2 font-semibold text-white shadow-sm">
                  <Users className="h-4 w-4" />
                  <span>{event.players.length} Players</span>
                </div>
                <div className="h-6 w-px bg-gray-300"/>
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
