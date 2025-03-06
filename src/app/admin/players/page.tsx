
"use client";

import { PlayerSheet } from "~/components/add-player-sheet";
import { PlayersList } from "~/components/player-list";
import { Button } from "~/components/ui/button";
import { withAdminLayout } from "~/components/with-admin-layout";
import { CardType, playerOperations } from "~/lib/db";
import { useState } from "react";

function PlayersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddPlayer = async (data: {
    id: string;
    name: string;
    cardType: CardType;
  }) => {
    await playerOperations.addPlayer(data.name, data.cardType);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-start items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Players</h2>
        <PlayerSheet
          player={{
            id: "",
            name: "",
            cardType: "Multisport",
          }}
          onSave={handleAddPlayer}
          trigger={<Button>Add Player</Button>}
        />
      </div>
      <PlayersList refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default withAdminLayout(PlayersPage);
