"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { withAdminLayout } from "~/components/with-admin-layout";
import { PlayerCard } from "~/components/player-card";
import { MultiSelect } from "~/components/multi-select";
import { ConfirmDialog } from "~/components/confirmation-dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { playerOperations, type Player } from "~/lib/db";
import { isPenalized } from "~/utils/penalty-util";

function PenaltiesPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = async () => {
    try {
      setPlayers(await playerOperations.getAllPlayers());
    } catch (error) {
      console.error("Failed to load players:", error);
      toast.error("Failed to load players.");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const penalized = players.filter(isPenalized);
  const options = players
    .filter((p) => !isPenalized(p))
    .map((p) => ({ value: p.id, label: p.name }));

  const handleAdd = async () => {
    setIsSaving(true);
    try {
      await Promise.all(selected.map((id) => playerOperations.addPenalty(id)));
      toast.success(`Added ${selected.length} player(s) to the penalty list`);
      setSelected([]);
      await refresh();
    } catch (error) {
      console.error("Failed to add penalty:", error);
      toast.error("Failed to add penalty.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (player: Player) => {
    try {
      await playerOperations.removePenalty(player.id);
      toast.success(`${player.name} removed from the penalty list`);
      await refresh();
    } catch (error) {
      console.error("Failed to remove penalty:", error);
      toast.error("Failed to remove penalty.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Penalties</h2>

      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <Label>Add players to the penalty list</Label>
          <MultiSelect
            options={options}
            selected={selected}
            onChange={setSelected}
            placeholder="Select players"
          />
        </div>
        <Button onClick={handleAdd} disabled={selected.length === 0 || isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add to penalty list
        </Button>
      </div>

      {penalized.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          No players with unpaid penalties
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {penalized.map((player) => (
            <PlayerCard key={player.id} player={player}>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-gray-500">
                  since {format(new Date(player.penalty_since!), "dd.MM.yyyy")}
                </span>
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="outline">
                      Remove penalty
                    </Button>
                  }
                  onConfirm={() => handleRemove(player)}
                  description={`Confirm that ${player.name} has paid the penalty. They will be able to join events and lotteries again.`}
                  confirmLabel="Remove penalty"
                />
              </div>
            </PlayerCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAdminLayout(PenaltiesPage);
