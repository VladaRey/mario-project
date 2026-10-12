"use client";

import { useEffect, useState } from "react";
import {
  playerOperations,
  eventOperations,
  type Player,
  type Event,
} from "~/lib/db";
import { useParams, useRouter } from "next/navigation";
import { useGetRole } from "~/hooks/use-get-role";
import { LotteryForm } from "~/features/lottery/lottery-form.component";
import { LotteryResults } from "~/features/lottery/lottery-results";
import { useLotteryService } from "~/services/lottery-service";
import { toast } from "sonner";
import { ScreenHeader } from "~/components/shell/screen-header";
import { PageBody } from "~/components/ds/page-body";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { Notice } from "~/components/ds/notice";
import { useI18n } from "~/i18n/i18n-provider";
import {
  getPenalizedIds,
  isPenalized,
  partitionNewIds,
  withFreshPenalty,
} from "~/utils/penalty-util";

export default function LotteryPage() {
  const params = useParams();
  const id = params.id as string;

  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  // Fresh players: lottery_results holds stale JSON snapshots without current penalties.
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const penalizedIds = getPenalizedIds(allPlayers);

  const [winnersList, setWinnersList] = useState<Player[]>([]);
  const [waitingList, setWaitingList] = useState<Player[]>([]);

  const [event, setEvent] = useState<Event | null>(null);

  const isWinners = winnersList.length > 0;

  const { role } = useGetRole();
  const { t } = useI18n();

  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const { addtoEvent } = useLotteryService();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [players, currentEvent, winnersList, waitingList] =
          await Promise.all([
            playerOperations.getAllPlayers(),
            eventOperations.getEvent(id),
            eventOperations.getWinnersList(id),
            eventOperations.getWaitingList(id),
          ]);

        setEvent(currentEvent);
        setAllPlayers(players);
        setWinnersList(winnersList);
        setWaitingList(waitingList);

        const currentEventPlayerIds =
          currentEvent?.players.map((p) => p.id) || [];

        const filteredPlayers = players.filter(
          (player) => !currentEventPlayerIds.includes(player.id),
        );
        setAvailablePlayers(filteredPlayers);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addPlayersToEvent = async (winners: Player[]) => {
    const { added, skipped } = partitionNewIds(
      winners.map((p) => p.id),
      event?.players.map((p) => p.id) || [],
      penalizedIds,
    );
    if (skipped.length > 0) {
      toast.warning(t("lottery.skipped", { count: skipped.length }));
    }
    const players = winners.filter((p) => added.includes(p.id));
    if (players.length === 0) return;

    try {
      await addtoEvent(
        players,
        event?.id || "",
        event,
        event?.name || "",
        event?.date || "",
      );

      toast.success(t("lottery.added"));
      router.push(`/admin/event/${event?.id}`);
    } catch (error) {
      console.error("Failed to add players to event:", error);
      toast.error(t("lottery.addFailed"));
    }
  };

  const handleAddPlayer = async (player: Player) => {
    if (penalizedIds.has(player.id)) {
      toast.error(t("lottery.hasPenalty", { name: player.name }));
      return;
    }
    try {
      await eventOperations.addToWinnersList(event?.id || "", player);
      setWinnersList((prev) => [...prev, player]);
      setWaitingList((prev) => prev.filter((p) => p.id !== player.id));
      toast.success(t("lottery.promoted"));
    } catch (error) {
      console.error("Failed to add player to winners list:", error);
      toast.error(t("lottery.promoteFailed"));
    }
  };

  const handleRemoveWinner = async (player: Player) => {
    try {
      await eventOperations.removeFromWinnersList(event?.id || "", player.id);
      setWinnersList((prev) => prev.filter((p) => p.id !== player.id));
      toast.success(t("lottery.removedWinner"));
    } catch (error) {
      console.error("Failed to remove player from winners list:", error);
      toast.error(t("lottery.removeWinnerFailed"));
    }
  };

  const handleRemoveFromWaitingList = async (player: Player) => {
    try {
      await eventOperations.removeFromWaitingList(event?.id || "", player.id);
      setWaitingList((prev) => prev.filter((p) => p.id !== player.id));
      toast.success(t("lottery.removedWaiting"));
    } catch (error) {
      console.error("Failed to remove player from waiting list:", error);
      toast.error(t("lottery.removeWaitingFailed"));
    }
  };

  function handleReset() {
    setWinnersList([]);
    setWaitingList([]);
  }

  const handleLotteryGenerated = (winners: Player[], waiting: Player[]) => {
    setWinnersList(winners);
    setWaitingList(waiting);
  };

  if (isLoading) return <PageBody><SkeletonRows count={6} /></PageBody>;

  const winnersCount = winnersList.length;
  const results = (
    <LotteryResults
      event={event}
      penalizedPlayers={allPlayers.filter(isPenalized).sort((a, b) => (b.penalty_since ?? "").localeCompare(a.penalty_since ?? ""))}
      winnersList={withFreshPenalty(winnersList, allPlayers)}
      waitingList={withFreshPenalty(waitingList, allPlayers)}
      addPlayersToEvent={addPlayersToEvent}
      handleAddPlayer={handleAddPlayer}
      handleRemoveWinner={handleRemoveWinner}
      handleRemoveFromWaitingList={handleRemoveFromWaitingList}
    />
  );
  return (
    <>
      <ScreenHeader
        title={t("lottery.title")}
        back={{ href: `/event/${id}`, label: event?.name ?? t("nav.events") }}
        crumbs={[{ label: t("nav.events"), href: "/" }, { label: event?.name ?? "", href: `/event/${id}` }, { label: t("lottery.title") }]}
        meta={t("lottery.hint")}
      />
      <PageBody className={role === "admin" ? "pb-24 md:pb-0" : undefined}>
        {role === "admin" ? (
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:gap-5">
            <div className="md:flex-[1_1_380px]">
              <LotteryForm event={event} availablePlayers={availablePlayers} isWinners={isWinners}
                onReset={handleReset} onLotteryGenerated={handleLotteryGenerated}
                winnersCount={winnersCount} onAddWinners={() => void addPlayersToEvent(winnersList)}
                courts={event?.courts} playersInEvent={event?.players.length ?? 0} />
            </div>
            <div className="flex flex-col gap-3 md:flex-[999_1_520px]">{results}</div>
          </div>
        ) : (
          <>
            {results}
            <Notice tone="info">{t("lottery.guestInfo")}</Notice>
          </>
        )}
      </PageBody>
    </>
  );
}
