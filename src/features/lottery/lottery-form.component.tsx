import { Dices, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ActionDock } from "~/components/ds/action-dock";
import { MoreMenu } from "~/components/ds/more-menu";
import { ConfirmDialog } from "~/components/confirmation-dialog";
import { useI18n } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";
import { freeSpots } from "~/utils/event-view";
import { Button } from "~/components/ui/button";
import { LotteryAddPlayersInput } from "~/features/lottery/lottery-add-players-input.component";
import { LotteryPlaceInput } from "~/features/lottery/lottery-place-input.component";
import { eventOperations, type Event, type Player } from "~/lib/db";
import { useLotteryService } from "~/services/lottery-service";

interface LotteryFormProps {
  event: Event | null;
  availablePlayers: Player[];
  isWinners: boolean;
  onReset: () => void;
  onLotteryGenerated?: (winners: Player[], waiting: Player[]) => void;
  winnersCount: number;
  onAddWinners: () => void;
  courts?: number | null;
  playersInEvent: number;
}

export function LotteryForm({
  event,
  availablePlayers,
  isWinners,
  onReset,
  onLotteryGenerated,
  winnersCount,
  onAddWinners,
  courts,
  playersInEvent,
}: LotteryFormProps) {
  const { t } = useI18n();
  const [resetOpen, setResetOpen] = useState(false);
  const free = freeSpots(courts, playersInEvent);

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const [places, setPlaces] = useState<number>(1);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const {
    addToWaitingList,
    addToWinnersList,
    generateRandomPlayers
  } = useLotteryService();

  const handleShuffle = async () => {
    setIsLoading(true);
    const lotteryPlayer= availablePlayers.filter((player) => selectedPlayers.includes(player.id));
    const {winners, waitingList:waiting} = generateRandomPlayers(lotteryPlayer, places);
    
    try {
      // Update winners
      await addToWinnersList( winners, event?.id || "");
      
      // Update waiting list
      await addToWaitingList(
        waiting,
        event?.id || "",
      );
      setIsGenerated(true);
      setIsResetting(true);

      onLotteryGenerated?.(winners, waiting);
      toast.success(t("lottery.saved"));
    } catch (error) {
      console.error("Failed to update winners and waiting list:", error);
      toast.error(t("lottery.saveFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const removePlayer = (playerToRemove: string) => {
    setSelectedPlayers((prevPlayers) =>
      prevPlayers.filter((id) => id !== playerToRemove),
    );
  };

  const handleReset = async () => {
    await eventOperations.removeLotteryResults(event?.id || "");
    setIsGenerated(false);
    setIsResetting(false);
    onReset();
  };

  const playDisabled = selectedPlayers.length === 0 || places > selectedPlayers.length || places <= 0 || isLoading;
  const playButton = (
    <Button className="flex-1" disabled={playDisabled} onClick={handleShuffle}>
      {isLoading ? <Loader2 className="animate-spin" /> : <Dices />}
      {isLoading ? t("lottery.generating") : isWinners ? t("lottery.playAgain") : t("lottery.play")}
    </Button>
  );
  const addButton = winnersCount > 0
    ? <Button variant="accent" className="flex-1" onClick={onAddWinners}>{t("lottery.addToEvent", { count: winnersCount })}</Button>
    : null;
  const more = (isResetting || isWinners)
    ? <MoreMenu label={t("common.more")} items={[{ label: t("lottery.reset"), destructive: true, onSelect: () => setResetOpen(true) }]} />
    : null;

  return (
    <>
      <section className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5 md:p-[18px]">
        <LotteryAddPlayersInput availablePlayers={availablePlayers} selectedPlayers={selectedPlayers} onAddPlayers={setSelectedPlayers} />
        {selectedPlayers.length > 0 && !isGenerated ? (
          <div className={cn("flex flex-wrap gap-1.5", isLoading && "opacity-50")}>
            {selectedPlayers.map((id) => {
              const p = availablePlayers.find((x) => x.id === id);
              return p ? (
                <button key={id} type="button" onClick={() => removePlayer(id)} aria-label={`${t("common.remove")} ${p.name}`}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-1.5 text-xs font-extrabold text-brand-700">
                  {p.name}<X className="h-3 w-3" />
                </button>
              ) : null;
            })}
          </div>
        ) : null}
        <LotteryPlaceInput selectedPlayers={selectedPlayers} places={places} setPlaces={setPlaces} />
        {free !== null ? (
          <div className="text-xs text-muted-foreground">
            {t("lottery.freeSpots", { courts: courts ?? 0, players: playersInEvent, free })}
          </div>
        ) : null}
        <div className="hidden gap-2 pt-1 md:flex">{more}{playButton}{addButton}</div>
      </section>
      <ActionDock>{playButton}{addButton}{more}</ActionDock>
      <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen}
        title={t("lottery.resetTitle")} description={t("lottery.resetText", { event: event?.name ?? "" })}
        confirmLabel={t("lottery.resetConfirm")} confirmVariant="destructive" onConfirm={() => void handleReset()} />
    </>
  );
}
