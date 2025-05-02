"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";
import { PlayerSheet } from "./add-player-sheet";
import { playerOperations, type Player } from "../lib/db";
import { PlayerCard } from "./player-card";
import { ConfirmDialog } from "./confirmation-dialog";

type PlayersListProps = {
  refreshTrigger?: number;
};

export function PlayersList({ refreshTrigger = 0 }: PlayersListProps) {
  const [players, setPlayers] = useState<Player[]>([]);

  const refreshPlayers = async () => {
    const dbPlayers = await playerOperations.getAllPlayers();
    setPlayers(dbPlayers);
  };

  useEffect(() => {
    refreshPlayers();
  }, [refreshTrigger]);

  const handleSavePlayer = async (updatedPlayer: Player) => {
    try {
      await playerOperations.editPlayer(
        updatedPlayer.id,
        updatedPlayer.name,
        updatedPlayer.cardType,
      );
      await refreshPlayers();
    } catch (error) {
      console.error("Failed to update player:", error);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      await playerOperations.removePlayer(playerId);
      await refreshPlayers();
    } catch (error) {
      console.error("Failed to delete player:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player}>
          <div className="flex">
            <PlayerSheet
              player={player}
              onSave={handleSavePlayer}
              trigger={<Button size="icon" variant="ghost">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit player</span>
              </Button>}
            />
            <ConfirmDialog trigger={<Button size="icon" variant="ghost">
              <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete player</span>
              </Button>} 
            onConfirm={() => handleDeletePlayer(player.id)}
            description="This action cannot be undone. This will permanently delete the player from the system." 
            confirmLabel="Delete" />
          </div>
        </PlayerCard>
      ))}
    </div>
  );
}
