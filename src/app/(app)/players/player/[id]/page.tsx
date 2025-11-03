"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import PlayerInfoCards from "~/features/players-page/player-info-cards";
import PlayerHistory from "~/features/players-page/player-history";
import { useGetPlayerData } from "~/hooks/use-get-player-data";
import { Breadcrumbs } from "~/components/breadcrumbs.component";
import FullSizeLoader from "~/components/full-size-loader";

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();

  const playerId = params.id as string;

  const { player, playerEventDates, loading, lotteryResults } =
    useGetPlayerData({ playerId });

  if (loading) {
    return <FullSizeLoader />;
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
    <div className="px-2 space-y-4">
        <Breadcrumbs
          items={[
            { label: "Players", href: "/players" },
            { label: player.name, href: `/players/player/${player.id}` },
          ]}
        />

      {/* Additional player details */}
      <PlayerInfoCards
        player={player}
        playerEventDates={playerEventDates}
        lotteryResults={lotteryResults}
      />

      {/* Statistics overview */}
      <PlayerHistory player={player} lotteryResults={lotteryResults} playerEventDates={playerEventDates} />
    </div>
  );
}
