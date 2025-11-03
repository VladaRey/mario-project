"use client";

import PlayerSearchList from "~/features/players-page/player-search-list";
import { Breadcrumbs } from "~/components/breadcrumbs.component";

export default function PlayersPage() {
  return (
    <div className="px-2 space-y-4">
      <Breadcrumbs
        items={[{ label: "Players", href: "/players" }]}
        className="mb-4"
      />

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Players</h2>
        
        {/* players list with search input*/}
        <PlayerSearchList />
      </div>
    </div>
  );
}
