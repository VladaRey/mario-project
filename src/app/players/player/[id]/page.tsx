"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import PlayerInfoCards from "~/features/players-page/player-info-cards";
import PlayerHistory from "~/features/players-page/player-history";
import { useGetPlayerData } from "~/hooks/use-get-player-data";
import { Breadcrumbs } from "~/components/breadcrumbs.component";

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();

  const playerId = params.id as string;

  const { player, playerEventDates, loading } = useGetPlayerData({ playerId });

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading player...</div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold">Player not found</h2>
            <p className="mb-4 text-gray-600">
              The player you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push("/players")}>
              Back to Players
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Breadcrumbs
        items={[{ label: "Players", href: "/players" }, { label: player.name, href: `/players/player/${player.id}` }]}
        className="mb-4"
      />

      <div className="space-y-4">
        <div className="rounded-lg bg-gradient-to-r from-[#2E2A5D] to-[#7B3C7D] p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl">Player details</h1>
          </div>
        </div>

        {/* Additional player details */}
        <PlayerInfoCards player={player} playerEventDates={playerEventDates} />

        {/* Statistics overview */}
        <PlayerHistory playerEventDates={playerEventDates} />
      </div>
    </div>
  );
}
