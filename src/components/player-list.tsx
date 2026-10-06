"use client";

import { useState, useEffect, useMemo } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { PlayerSheet } from "./add-player-sheet";
import { playerOperations, type Player } from "../lib/db";
import { ConfirmDialog } from "./confirmation-dialog";
import { ListCard, ListRow } from "~/components/ds/list";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { CardTypeChip } from "~/components/ds/chip";
import { EmptyState } from "~/components/ds/empty-state";
import { PenaltyBadge } from "~/components/penalty-badge";
import { useT } from "~/i18n/i18n-provider";
import { matchesQuery } from "~/utils/search";

type PlayersListProps = {
  refreshTrigger?: number;
};

export function PlayersList({ refreshTrigger = 0 }: PlayersListProps) {
  const t = useT();
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const visible = useMemo(
    () => players.filter((p) => matchesQuery(p.name, searchTerm)),
    [players, searchTerm],
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          aria-label={t("players.search")}
          placeholder={t("players.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
        />
      </div>
      {visible.length === 0 && searchTerm ? (
        <EmptyState title={t("common.noResults")} />
      ) : (
        <ListCard className="md:grid md:grid-cols-2 md:gap-x-8 md:divide-y-0">
          {visible.map((player) => (
            <ListRow
              key={player.id}
              className="md:border-b md:border-[#F0ECF7]"
              leading={<PlayerAvatar name={player.name} cardType={player.cardType} />}
              title={player.name}
              trailing={
                <span className="flex flex-none items-center gap-1">
                  <PenaltyBadge player={player} />
                  <CardTypeChip cardType={player.cardType} short />
                  <PlayerSheet
                    mode="edit"
                    player={player}
                    onSave={handleSavePlayer}
                    trigger={
                      <Button size="icon" variant="ghost" aria-label={t("adminPlayers.edit", { name: player.name })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    trigger={
                      <Button size="icon" variant="ghost" aria-label={t("adminPlayers.delete", { name: player.name })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    onConfirm={() => handleDeletePlayer(player.id)}
                    description={t("adminPlayers.deleteText")}
                    confirmLabel={t("common.delete")}
                    confirmVariant="destructive"
                  />
                </span>
              }
            />
          ))}
        </ListCard>
      )}
    </div>
  );
}
