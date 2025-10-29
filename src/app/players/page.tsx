"use client";

import PlayerSearchList from "~/features/players-page/player-search-list";
import { Breadcrumbs } from "~/components/breadcrumbs.component";
import { Navbar } from "~/components/navbar";

export default function PlayersPage() {
  return (
    <div className="mx-auto space-y-8 p-4">
      <div className="space-y-4">
        <Navbar title="Players" />
        <Breadcrumbs
          items={[{ label: "Players", href: "/players" }]}
          className="mb-4 ml-1"
        />
      </div>

      {/* players list with search input*/}
      <PlayerSearchList />
    </div>
  );
}
