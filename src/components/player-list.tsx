"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { PlayerSheet } from "./add-player-sheet";
import { playerOperations, type Player } from "../lib/db";
import { PlayerCard } from "./player-card";

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
        <Card key={player.id}>
          <CardContent className="flex items-center justify-between p-4">
            <PlayerCard player={player}>
              <div className="flex">
                <PlayerSheet
                  player={player}
                  onSave={handleSavePlayer}
                  trigger={
                    <Button size="icon" variant="ghost">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit player</span>
                    </Button>
                  }
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete player</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the player from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeletePlayer(player.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </PlayerCard>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
