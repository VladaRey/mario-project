import { Dices, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AutoPricingSheet } from "~/components/auto-pricing-sheet";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  eventOperations,
  DefaultAdminValuesOperations,
  type Event,
} from "~/lib/db";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";
import { useI18n } from "~/i18n/i18n-provider";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { StatTile } from "~/components/ds/stat-tile";
import { Segmented } from "~/components/ds/segmented";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { EmptyState } from "~/components/ds/empty-state";
import { Button } from "~/components/ui/button";
import { PlayerPaymentRow } from "./player-payment-row";
import { averageAmount, filterByPaid, paidSummary, pricingHints, type PaidFilter } from "~/utils/event-view";
import { paramsFromEvent, type AutoParams } from "~/utils/auto-pricing-util";
import {
  DEFAULT_HOURS,
  DEFAULT_PRICE_PER_HOUR,
  DISCOUNT_PER_USAGE
} from "~/constants/event-pricing-defaults";
import { calculateEventStatistics } from "~/services/calculate-event-statistics-service";
import { ConfirmDialog } from "~/components/confirmation-dialog";
import { CardTypeCounts } from "~/components/card-type-counts";
import { useUsageChange } from "../../hooks/use-usage-change";
import {
  getSortedCardTypeCounts,
  getSortedPlayers,
} from "~/utils/event-players-util";

interface CurrentEventProps {
  id: string;
}

export function CurrentEvent({ id }: CurrentEventProps) {
  const { t, fmt } = useI18n();
  const { role } = useGetRole();
  const canEdit = role === Role.Admin || role === Role.Fame;
  const [filter, setFilter] = useState<PaidFilter>("all");
  const [fameCleared, setFameCleared] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>(
    {},
  );
  const [playerPaymentAmount, setPlayerPaymentAmount] = useState<
    Record<string, number>
  >({});
  const [defaultPricingValues, setDefaultPricingValues] = useState({
    hours: DEFAULT_HOURS,
    pricePerHour: DEFAULT_PRICE_PER_HOUR,
  });
  const [discountPerUsage, setDiscountPerUsage] = useState<number>(DISCOUNT_PER_USAGE);
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
    () =>
      event ? paramsFromEvent(event, defaultPricingValues, playerUsages) : null,
    [event, playerUsages, defaultPricingValues],
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

        const defaultValues =
          await DefaultAdminValuesOperations.getDefaultAdminValues();

        const defaults = {
          hours: defaultValues.hours,
          pricePerHour: defaultValues.price_per_hour,
        };

        const currentDiscountPerUsage = defaultValues.discount_per_usage;

        setDiscountPerUsage(currentDiscountPerUsage);

        setDefaultPricingValues(defaults);

        const initialParams = paramsFromEvent(
          currentEvent,
          defaults,
          initialUsages,
        );

        // Always recalc amounts from event's current params (courts, hours, price_per_hour, fame_total)
        // so we never show stale amounts that were computed with default/old params (e.g. without fame_total).
        const { amounts: initialAmounts } = calculateEventStatistics(
          currentEvent,
          initialParams,
          initialUsages,
          currentDiscountPerUsage,
        );
        await eventOperations.updatePlayerPaymentAmountsByPlayerIds(
          currentEvent.id,
          initialAmounts,
        );
        setPlayerPaymentAmount(initialAmounts);

        setDraftPricingParams({
          ...initialParams,
          hours: defaultValues.hours,
          pricePerHour: defaultValues.price_per_hour,
        });
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
        discountPerUsage,
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
      setFameCleared(false);
      toast.success(t("event.amountsUpdated"));
    } catch (error) {
      console.error("Error updating player payment amounts:", error);
      toast.error(t("event.amountsFailed"));
    } finally {
      setSavingPricing(false);
    }
  }, [event, draftPricingParams, playerUsages, t]);

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
    discountPerUsage,
    { success: t("event.usageUpdated"), error: t("event.usageFailed") },
  );

  const onUsageChange = (playerId: string, usage: number) => {
    if (event?.fame_total != null) setFameCleared(true);
    void handleUsageChange(playerId, usage);
  };

  const pricingStatistics = useMemo(() => {
    if (!event) return null;
    const { statistics } = calculateEventStatistics(
      event,
      draftPricingParams,
      playerUsages,
      discountPerUsage
    );
    return statistics;
  }, [event, draftPricingParams, playerUsages]);

  if (isLoading) {
    return <PageBody><SkeletonRows count={8} /></PageBody>;
  }

  if (!event) {
    return <PageBody><EmptyState title={t("event.notFound")} /></PageBody>;
  }

  const sortedCardTypeCounts = getSortedCardTypeCounts(event);
  const sortedPlayers = getSortedPlayers(event);
  const summary = paidSummary(event.players.map((p) => ({ paid: paymentStatus[p.id] })));
  const avg = averageAmount(playerPaymentAmount, event.players.map((p) => p.id));
  const visiblePlayers = filterByPaid(sortedPlayers, paymentStatus, filter);
  const hints = pricingHints({ eventCourts: event.courts, playersCount: event.players.length, draft: draftPricingParams, defaults: defaultPricingValues });
  const openPricing = () => handleAutoPricingSheetOpenChange(true);
  const dateLabel = fmt(event.date, "EEE d MMM yyyy");

  const pricingButton = (
    <Button variant="outline" onClick={openPricing}><SlidersHorizontal />{t("event.pricing")}</Button>
  );
  const lotteryButton = (
    <Button asChild variant="outline"><GuardedLink href={`/event/${event.id}/lottery`}><Dices />{t("event.lottery")}</GuardedLink></Button>
  );

  return (
    <>
      <ScreenHeader
        title={event.name}
        back={{ href: "/", label: t("nav.events") }}
        crumbs={[{ label: t("nav.events"), href: "/" }, { label: event.name }]}
        meta={dateLabel}
        actions={<>{lotteryButton}{pricingButton}</>}
        mobileBarAction={
          <button type="button" onClick={openPricing} className="flex items-center gap-1.5 rounded-[10px] bg-white/[0.12] px-2.5 py-2 text-[13px] font-bold">
            <SlidersHorizontal className="h-4 w-4" />{t("event.pricing")}
          </button>
        }
        mobileHero={
          <section className="flex flex-col gap-2.5 bg-brand-900 px-4 pb-[18px] pt-1 text-white">
            <div className="text-xs font-bold text-[#D9CCF0]">{dateLabel}</div>
            <h1 className="text-[26px] font-extrabold tracking-tight">{event.name}</h1>
            <div className="grid grid-cols-3 gap-2">
              <StatTile tone="onDark" label={t("event.playersShort")} value={summary.total} />
              <StatTile tone="onDark" label={t("event.paidShort")} value={`${summary.paid}/${summary.total}`} />
              <StatTile tone="onDark" label={t("event.avgShort")} value={avg ?? "—"} />
            </div>
          </section>
        }
      />
      <PageBody>
        <div className="hidden grid-cols-4 gap-3 md:grid">
          <StatTile label={t("event.players")} value={summary.total} />
          <StatTile label={t("event.paid")} value={summary.paid} sub={`/ ${summary.total}`} progress={summary.total ? (summary.paid / summary.total) * 100 : 0} />
          <StatTile label={t("event.unpaid")} value={summary.unpaid} valueClassName="text-[#9A3412]" />
          <StatTile label={t("event.avgPrice")} value={avg ?? "—"} sub={avg != null ? t("pricing.pln") : undefined} />
        </div>
        <section className="overflow-hidden rounded-2xl border-line md:border md:bg-white">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:border-b md:border-line md:px-[18px] md:py-3.5">
            <CardTypeCounts items={sortedCardTypeCounts} />
            <Segmented<PaidFilter> ariaLabel={t("event.filter")} value={filter} onChange={setFilter} className="md:ml-auto md:w-[300px]"
              options={[
                { value: "all", label: t("event.filterAll", { count: summary.total }) },
                { value: "unpaid", label: t("event.filterUnpaid", { count: summary.unpaid }) },
                { value: "paid", label: t("event.filterPaid", { count: summary.paid }) },
              ]} />
          </div>
          <div className="mt-2 grid grid-cols-1 divide-y divide-[#F0ECF7] rounded-2xl border border-line bg-white px-3 md:mt-0 md:grid-cols-2 md:gap-x-7 md:divide-y-0 md:rounded-none md:border-0 md:px-[18px] md:py-1.5 lg:grid-cols-3 [&>*]:border-[#F0ECF7] md:[&>*]:border-b">
            {visiblePlayers.length === 0 && filter !== "all" ? (
              <p className="py-6 text-center text-sm text-muted-foreground md:col-span-full">
                {t(filter === "paid" ? "event.emptyPaid" : "event.emptyUnpaid")}
              </p>
            ) : null}
            {visiblePlayers.map((player) => (
              <PlayerPaymentRow key={player.id} player={player} paid={!!paymentStatus[player.id]} canEdit={canEdit}
                onPaidChange={handlePaymentChange} amount={playerPaymentAmount[player.id]}
                usage={playerUsages[player.id] ?? 0} onUsageChange={onUsageChange} />
            ))}
          </div>
        </section>
      </PageBody>

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
        eventName={event.name}
        hints={hints}
        fameCleared={fameCleared}
        playersCount={event.players.length}
        discountPerUsage={discountPerUsage}
      />

      <ConfirmDialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        title={t("event.discardTitle")}
        description={t("event.discardText")}
        confirmLabel={t("event.discard")}
        confirmVariant="destructive"
        onConfirm={handleDiscardAutoPricing}
      />
    </>
  );
}
