import { Input } from "~/components/ui/input";
import { PlayerCard } from "~/components/player-card";
import { useEffect, useState } from "react";
import { Player, playerOperations } from "~/lib/db";
import { useRouter } from "next/navigation";

export default function PlayerSearchList() {
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlayers = players.filter((player) => {
    const playerName = player.name.toLowerCase();
    const search = searchTerm.toLowerCase();

    return playerName.includes(search);
  });

  const refreshPlayers = async () => {
    const dbPlayers = await playerOperations.getAllPlayers();
    setPlayers(dbPlayers);
  };

  useEffect(() => {
    refreshPlayers();
  }, []);

  const handlePlayerClick = (player: Player) => {
    router.push(`/players/player/${player.id}`);
  };

  return (
    <div className="space-y-4">
      {/* search input */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search by first letter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* players list */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => handlePlayerClick(player)}
            className="cursor-pointer rounded-xl transition-transform hover:shadow-md"
          >
            <PlayerCard player={player} />
          </div>
        ))}
      </div>

      {/* no players found */}
      {filteredPlayers.length === 0 && searchTerm && (
        <div className="py-8 text-center text-gray-500">
          No players found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
