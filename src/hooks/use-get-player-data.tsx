import { useState, useEffect } from "react";
import { Player, playerOperations, eventOperations } from "~/lib/db";

export type LotteryResults = {
  wins: { eventId: string; date: string }[];
  played: { eventId: string; date: string }[];
};

interface UseGetPlayerDataProps {
  playerId?: string;
}

export function useGetPlayerData({ playerId }: UseGetPlayerDataProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerEventDates, setPlayerEventDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lotteryResults, setLotteryResults] = useState<LotteryResults>({
    wins: [],
    played: [],
  });

  useEffect(() => {
    async function fetchData() {
      if (!playerId) {
        setLoading(false);
        return;
      }

      try {
        const [allPlayers, eventDates, lotteryResults] = await Promise.all([
          playerOperations.getAllPlayers(),
          playerOperations.getPlayerEventDates(playerId),
          eventOperations.getLotteryResultsByPlayerId(playerId),
        ]);

        const foundPlayer = allPlayers.find((p) => p.id === playerId);
        if (!foundPlayer) {
          setLoading(false);
          return;
        }
        setPlayer(foundPlayer);
        setPlayerEventDates(eventDates);
        setLotteryResults(lotteryResults as LotteryResults);
      } catch (error) {
        console.error("Failed to fetch player data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [playerId]);

  return { player, playerEventDates, loading, lotteryResults };
}
