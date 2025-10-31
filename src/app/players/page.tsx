"use client";

import PlayerSearchList from "~/features/players-page/player-search-list";
import { Breadcrumbs } from "~/components/breadcrumbs.component";
import { Navbar } from "~/components/navbar";

export default function PlayersPage() {
  return (
    <div className="mx-auto space-y-6 p-4">
      <Navbar title="Players" />
      <Breadcrumbs
        items={[{ label: "Players", href: "/players" }]}
        className="mb-4 ml-1"
      />

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Players</h2>
        
        {/* players list with search input*/}
        <PlayerSearchList />
      </div>
    </div>
  );
}
