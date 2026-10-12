"use client";
import { useState } from "react";
import PlayerSearchList from "~/features/players-page/player-search-list";
import { ScreenHeader } from "~/components/shell/screen-header";
import { PageBody } from "~/components/ds/page-body";
import { useT } from "~/i18n/i18n-provider";

export default function PlayersPage() {
  const t = useT();
  const [count, setCount] = useState<number | null>(null);
  return (
    <>
      <ScreenHeader
        title={
          <>
            {t("players.title")}
            {count !== null ? <> <span className="text-base font-bold text-muted-foreground">{count}</span></> : null}
          </>
        }
      />
      <PageBody><PlayerSearchList onLoaded={setCount} /></PageBody>
    </>
  );
}
