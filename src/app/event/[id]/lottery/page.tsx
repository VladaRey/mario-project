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
import { toast, Toaster } from "sonner";
import FullSizeLoader from "~/components/full-size-loader";
import { Navbar } from "~/components/navbar";

export default function LotteryPage() {
  const params = useParams();
  const id = params.id as string;

  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

  const [winnersList, setWinnersList] = useState<Player[]>([]);
  const [waitingList, setWaitingList] = useState<Player[]>([]);

  const [event, setEvent] = useState<Event | null>(null);

  const isWinners = winnersList.length > 0;

  const { role } = useGetRole();

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

  const addPlayersToEvent = async (players: Player[]) => {
    if (players.length === 0) return;

    try {
      await addtoEvent(
        players,
        event?.id || "",
        event,
        event?.name || "",
        event?.date || "",
      );

      toast.success("Players added to event successfully!");
      router.push(`/admin/event/${event?.id}`);
    } catch (error) {
      console.error("Failed to add players to event:", error);
      toast.error("Failed to add players to event.");
    }
  };

  const handleAddPlayer = async (player: Player) => {
    try {
      await eventOperations.addToWinnersList(event?.id || "", player);
      setWinnersList((prev) => [...prev, player]);
      setWaitingList((prev) => prev.filter((p) => p.id !== player.id));
      toast.success("Player added to winners list successfully!");
    } catch (error) {
      console.error("Failed to add player to winners list:", error);
      toast.error("Failed to add player to winners list.");
    }
  };

  const handleRemoveWinner = async (player: Player) => {
    try {
      await eventOperations.removeFromWinnersList(event?.id || "", player.id);
      setWinnersList((prev) => prev.filter((p) => p.id !== player.id));
      toast.success("Player removed from winners list successfully!");
    } catch (error) {
      console.error("Failed to remove player from winners list:", error);
      toast.error("Failed to remove player from winners list.");
    }
  };

  const handleRemoveFromWaitingList = async (player: Player) => {
    try {
      await eventOperations.removeFromWaitingList(event?.id || "", player.id);
      setWaitingList((prev) => prev.filter((p) => p.id !== player.id));
      toast.success("Player removed from waiting list successfully!");
    } catch (error) {
      console.error("Failed to remove player from waiting list:", error);
      toast.error("Failed to remove player from waiting list.");
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

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-center" />

      {isLoading && <FullSizeLoader />}

      <div className="space-y-6">
        <Navbar title="Lottery" />

        <div className="space-y-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="mb-2 space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-xl md:text-2xl font-bold">Event: {event?.name}</h2>
              <p className="text-sm">
                Choose random players to add to the event
              </p>
            </div>

            {role === "admin" && (
              <LotteryForm
                event={event}
                availablePlayers={availablePlayers}
                isWinners={isWinners}
                onReset={handleReset}
                onLotteryGenerated={handleLotteryGenerated}
              />
            )}
          </div>

          <LotteryResults
            winnersList={winnersList}
            waitingList={waitingList}
            addPlayersToEvent={addPlayersToEvent}
            handleAddPlayer={handleAddPlayer}
            handleRemoveWinner={handleRemoveWinner}
            handleRemoveFromWaitingList={handleRemoveFromWaitingList}
          />
        </div>
      </div>
    </div>
  );
}
