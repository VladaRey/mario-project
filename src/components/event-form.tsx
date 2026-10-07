import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MultiSelect } from "./multi-select";
import { Loader2, X } from "lucide-react";
import { ConfirmDialog } from "./confirmation-dialog";
import { toast } from "sonner";
import {
  playerOperations,
  reservationOperations,
  eventOperations,
  type Player,
  type ReservationList,
  type Event,
} from "../lib/db";
import { format } from "date-fns";
import { EventDatePicker } from "./event-date-picker.component";
import { useRouter } from "next/navigation";
import { getPenalizedIds, partitionNewIds } from "~/utils/penalty-util";
import { useI18n } from "~/i18n/i18n-provider";
import { useLeaveGuard, useNavigationGuard } from "~/components/shell/navigation-guard";
import { Segmented } from "~/components/ds/segmented";
import { SectionLabel } from "~/components/ds/section-label";
import { Notice } from "~/components/ds/notice";
import { ListRow } from "~/components/ds/list";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { CardTypeChip } from "~/components/ds/chip";
import { ActionDock } from "~/components/ds/action-dock";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { MoreMenu } from "~/components/ds/more-menu";
import { PenaltyBadge } from "./penalty-badge";
import { isEventFormDirty, type EventFormSnapshot, type PlayerSource } from "~/utils/event-form-state";

type EventFormProps = {
  initialEvent?: Event;
  onSave: (event: { id: string; name: string; date: string; players: string[] }) => void;
  mode: "create" | "edit";
};

export function EventForm({ initialEvent, onSave, mode }: EventFormProps) {
  const router = useRouter();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    initialEvent?.players?.map((p) => p.id) || [],
  );
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [reservations, setReservations] = useState<ReservationList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [loading, setLoading] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [date, setDate] = useState<Date | undefined>(initialEvent?.date ? new Date(initialEvent.date) : new Date());

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const [eventName, setEventName] = useState(initialEvent?.name || formatDate(new Date()));

  const { t } = useI18n();
  const [source, setSource] = useState<PlayerSource>("reservation");
  const [skippedFrom, setSkippedFrom] = useState<string[]>([]);
  const [baseline, setBaseline] = useState<EventFormSnapshot>(() => ({
    name: initialEvent?.name || formatDate(new Date()),
    date: format(initialEvent?.date ? new Date(initialEvent.date) : new Date(), "yyyy-MM-dd"),
    players: initialEvent?.players?.map((p) => p.id) || [],
  }));
  const current: EventFormSnapshot = { name: eventName, date: date ? format(date, "yyyy-MM-dd") : "", players: selectedPlayers };
  const dirty = isEventFormDirty(baseline, current);
  useLeaveGuard(dirty);
  const { setDirty } = useNavigationGuard();
  const [removeAllOpen, setRemoveAllOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [waitingListPlayers, setWaitingListPlayers] = useState<Player[]>([]);

  const [skippedPlayers, setSkippedPlayers] = useState<string[]>([]);
  // Fresh data from getAllPlayers: waiting-list entries are JSON snapshots without penalty_since.
  const penalizedIds = getPenalizedIds(availablePlayers);
  const penaltyOption = (id: string) =>
    penalizedIds.has(id) ? { disabled: true, hint: t("penalty.chip") } : {};

  const handleSetDate = (date: Date | undefined) => {
    setDate(date);
    if(!initialEvent?.name && date) {
      setEventName(formatDate(date));
    }
  };

  // Load players, reservations and waiting list
  useEffect(() => {
    const loadData = async () => {
      try {
        const [players, reservationLists, waitingListPlayers] =
          await Promise.all([
            playerOperations.getAllPlayers(),
            reservationOperations.getAllReservationLists(),
            initialEvent?.id
              ? eventOperations.getWaitingList(initialEvent.id)
              : Promise.resolve([]),
          ]);
        setAvailablePlayers(players);
        setReservations(reservationLists);
        setWaitingListPlayers(waitingListPlayers);

        console.log("reservations", reservationLists);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        id: initialEvent?.id || "",
        name: eventName,
        date: format(date!, "yyyy-MM-dd"),
        players: selectedPlayers,
      });
    } catch (error) {
      console.error("Failed to save event:", error);
      // Changes stay local until a successful save: keep baseline, leave guard and the page.
      toast.error(t("eventForm.saveFailed"));
      setLoading(false);
      return;
    }
    setBaseline(current);
    setDirty(false);
    setSkippedPlayers([]);
    toast.success(t(mode === "create" ? "eventForm.created" : "eventForm.updated"));
    setLoading(false);
    setTimeout(() => {
      router.push("/admin/events");
    }, 1000);
  };

  const handleRemoveAllPlayers = () => {
    setSelectedPlayers([]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers((prevPlayers) =>
      prevPlayers.filter((id) => id !== playerId),
    );
  };

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    await eventOperations.deleteEvent(initialEvent?.id || "");
    toast.success(t("eventForm.deleted"));
    setIsDeleting(false);
    setDirty(false);
    setTimeout(() => {
      router.push("/admin/events");
    }, 1000);
  };

  const reservationOptions = reservations.map((reservation) => ({
    value: reservation.id,
    label: reservation.name,
  }));

  const playerOptions = availablePlayers.map((player) => ({
    value: player.id,
    label: player.name,
    cardType: player.cardType,
    ...penaltyOption(player.id),
  }));

  const waitingListOptions = waitingListPlayers.map((player) => ({
    label: player.name,
    value: player.id,
    cardType: player.cardType,
    ...penaltyOption(player.id),
  }));

  const onReservationsPicked = (selectedReservations: string[]) => {
    const reservationIds = reservations
      .filter((r) => selectedReservations.includes(r.id))
      .flatMap((r) => r.players.map((p) => p.id));
    const { added, skipped } = partitionNewIds(
      reservationIds,
      selectedPlayers,
      penalizedIds,
    );
    setSelectedPlayers((prev) => [...prev, ...added]);
    setSkippedPlayers(skipped);
    setSkippedFrom(reservations.filter((r) => selectedReservations.includes(r.id)).map((r) => r.name));
    if (skipped.length > 0) {
      toast.warning(
        t("eventForm.addedSkipped", { added: added.length, total: added.length + skipped.length, skipped: skipped.length }),
      );
    }
  };

  if (isLoading) return <SkeletonRows count={6} />;

  const skippedNames = skippedPlayers.map((id) => availablePlayers.find((p) => p.id === id)?.name ?? id).join(", ");
  const saveLabel = mode === "create" ? t("eventForm.create") : t("eventForm.save");
  const unsaved = dirty ? (
    <span className="flex items-center gap-1.5 text-xs font-bold text-[#9A3412] md:text-[13px]">
      <span className="h-2 w-2 rounded-full bg-coral" />{t("common.unsaved")}
    </span>
  ) : null;
  const moreItems = [
    { label: t("eventForm.removeAll"), onSelect: () => setRemoveAllOpen(true) },
    ...(mode === "edit" ? [{ label: t("eventForm.delete"), destructive: true, onSelect: () => setDeleteOpen(true) }] : []),
  ];
  const saveButton = (
    <Button type="submit" form="event-form" disabled={loading} className="w-full md:w-auto">
      {loading ? <Loader2 className="animate-spin" /> : null}{saveLabel}
    </Button>
  );

  const sourcePicker =
    source === "reservation" ? (
      <MultiSelect options={reservationOptions} selected={[]} placeholder={t("eventForm.selectReservations")} title={t("eventForm.srcReservation")} mode="add"
        onChange={onReservationsPicked} />
    ) : source === "waiting" ? (
      <MultiSelect options={waitingListOptions} selected={[]} placeholder={t("eventForm.selectWaiting")} mode="add"
        onChange={(newPlayers) => setSelectedPlayers((prev) => [...new Set([...prev, ...newPlayers])])} />
    ) : (
      <MultiSelect options={playerOptions.filter((o) => !selectedPlayers.includes(o.value))} selected={[]} placeholder={t("eventForm.selectPlayers")} mode="add"
        onChange={(newPlayers) => setSelectedPlayers((prev) => [...prev, ...newPlayers])} />
    );

  return (
    <>
      <form id="event-form" onSubmit={handleSubmit} className="flex flex-col gap-4 pb-24 md:flex-row md:items-start md:gap-5 md:pb-0">
        <div className="flex flex-col gap-3 md:flex-[1_1_360px]">
          <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3.5 md:p-[18px]">
            <label className="flex flex-col gap-1.5 text-[13px] font-bold text-[#4A4361]">{t("eventForm.name")}
              <Input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder={t("eventForm.namePlaceholder")} required className="h-12 rounded-xl text-[15px] font-bold" />
            </label>
            <div className="flex flex-col gap-1.5 text-[13px] font-bold text-[#4A4361]">{t("eventForm.date")}
              <EventDatePicker date={date!} setDate={handleSetDate} />
            </div>
          </section>
          <section className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5 md:p-[18px]">
            <SectionLabel>{t("eventForm.addFrom")}</SectionLabel>
            <Segmented<PlayerSource> ariaLabel={t("eventForm.addFrom")} value={source} onChange={setSource}
              options={[
                { value: "reservation", label: t("eventForm.srcReservation") },
                ...(waitingListPlayers.length > 0 ? [{ value: "waiting" as const, label: t("eventForm.srcWaiting", { count: waitingListPlayers.length }) }] : []),
                { value: "individual", label: t("eventForm.srcIndividual") },
              ]} />
            {sourcePicker}
          </section>
          {skippedPlayers.length > 0 ? (
            <Notice>
              {t("eventForm.skipped", { names: skippedNames })}{" "}
              {skippedFrom.length ? t("eventForm.skippedRest", { from: skippedFrom.join(", ") }) : null}
            </Notice>
          ) : null}
          <div className="hidden items-center gap-2.5 md:flex">
            {unsaved}<span className="flex-1" />
            <MoreMenu label={t("common.more")} items={moreItems} />
            {saveButton}
          </div>
        </div>
        <section className="rounded-2xl border border-line bg-white px-3.5 py-2.5 md:flex-[999_1_520px] md:px-5">
          <SectionLabel className="py-1">{t("eventForm.current", { count: selectedPlayers.length })}</SectionLabel>
          {selectedPlayers.length === 0 ? <p className="py-4 text-sm text-muted-foreground">{t("eventForm.noPlayers")}</p> : null}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-7">
            {selectedPlayers.map((playerId) => {
              const player = availablePlayers.find((p) => p.id === playerId);
              return player ? (
                <ListRow key={player.id} className="border-b border-[#F0ECF7]"
                  leading={<PlayerAvatar name={player.name} cardType={player.cardType} />}
                  title={player.name}
                  trailing={<><PenaltyBadge player={player} /><CardTypeChip cardType={player.cardType} short />
                    <Button type="button" size="icon" variant="ghost" aria-label={`${t("common.remove")} ${player.name}`} onClick={() => handleRemovePlayer(player.id)}><X /></Button></>} />
              ) : null;
            })}
          </div>
        </section>
      </form>

      <ActionDock>
        <div className="flex min-w-0 flex-1 flex-col gap-1">{unsaved}{saveButton}</div>
        <MoreMenu label={t("common.more")} items={moreItems} />
      </ActionDock>

      <ConfirmDialog open={removeAllOpen} onOpenChange={setRemoveAllOpen} description={t("eventForm.removeAllText")}
        confirmLabel={t("eventForm.removeAllConfirm")} onConfirm={handleRemoveAllPlayers} />
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} description={t("eventForm.deleteText")}
        confirmLabel={t("common.delete")} confirmVariant="destructive" onConfirm={() => void handleDeleteEvent()} />
    </>
  );
}
