"use client";

import { Plus } from "lucide-react";
import { PlayerSheet } from "~/components/add-player-sheet";
import { PlayersList } from "~/components/player-list";
import { Button } from "~/components/ui/button";
import { withAdminLayout } from "~/components/with-admin-layout";
import { ScreenHeader } from "~/components/shell/screen-header";
import { PageBody } from "~/components/ds/page-body";
import { useT } from "~/i18n/i18n-provider";
import { type CardType, playerOperations } from "~/lib/db";
import { useState } from "react";

function PlayersPage() {
  const t = useT();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddPlayer = async (data: {
    id: string;
    name: string;
    cardType: CardType;
  }) => {
    await playerOperations.addPlayer(data.name, data.cardType);
    setRefreshTrigger((prev) => prev + 1);
  };

  const addSheet = (
    <PlayerSheet
      mode="add"
      player={{ id: "", name: "", cardType: "Multisport", paid: false, amount: 0 }}
      onSave={handleAddPlayer}
      trigger={<Button size="sm" className="md:h-11"><Plus />{t("adminPlayers.add")}</Button>}
    />
  );

  return (
    <>
      <ScreenHeader title={t("adminPlayers.title")} adminSection="players" actions={addSheet} mobileTitleAside={addSheet} />
      <PageBody><PlayersList refreshTrigger={refreshTrigger} /></PageBody>
    </>
  );
}

export default withAdminLayout(PlayersPage);
