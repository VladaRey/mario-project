import { useState, useEffect } from "react";
import { Player, playerOperations } from "~/lib/db";

interface UseGetPlayerDataProps {
  playerId?: string;
}

export function useGetPlayerData({ playerId }: UseGetPlayerDataProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerEventDates, setPlayerEventDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!playerId) {
        setLoading(false);
        return;
      }

      try {
        const [allPlayers, eventDates] = await Promise.all([
          playerOperations.getAllPlayers(),
          playerOperations.getPlayerEventDates(playerId),
        ]);

        const foundPlayer = allPlayers.find((p) => p.id === playerId);
        if (!foundPlayer) {
          setLoading(false);
          return;
        }
        setPlayer(foundPlayer);
        setPlayerEventDates(eventDates);
      } catch (error) {
        console.error("Failed to fetch player data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [playerId]);

  return { player, playerEventDates, loading };
}
