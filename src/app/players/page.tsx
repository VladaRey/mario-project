"use client";

import PlayerSearchList from "~/features/players-page/player-search-list";
import { Breadcrumbs } from "~/components/breadcrumbs.component";

export default function PlayersPage() {
  return (
    <div className="container mx-auto p-4">
      <Breadcrumbs
        items={[{ label: "Players", href: "/players" }]}
        className="mb-4"
      />

      <div className="space-y-8">
        <div className="rounded-lg bg-gradient-to-r from-[#2E2A5D] to-[#7B3C7D] p-6 text-white shadow-lg">
          <h1 className="mb-2 text-3xl font-bold sm:mb-0 sm:text-4xl">
            Players
          </h1>
        </div>

        {/* players list with search input*/}
        <PlayerSearchList />
      </div>
    </div>
  );
}
