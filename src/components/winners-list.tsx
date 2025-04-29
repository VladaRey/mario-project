import { Player } from "~/lib/db";
import { useState } from "react";
import { useEffect } from "react";
import { eventOperations } from "~/lib/db";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent } from "~/components/ui/card";
import { PlayerCard } from "~/components/player-card";


export function WinnersList({ id }: { id: string }) {
    const [winnersList, setWinnersList] = useState<Player[]>([]);

    useEffect(() => {
      const loadData = async () => {
        try {
          const winnersList = await eventOperations.getWinnersList(id);
          setWinnersList(winnersList);
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      };
      loadData();
    }, []);

return (
  <div className="mb-10">
    <div>
      <h2 className="text-xl font-bold">Winners</h2>
      <Separator className="my-4 bg-green-500" />
      {winnersList.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {winnersList.map((player) => {
            return (
              <Card key={player.id}>
                <CardContent className="flex flex-col gap-1 p-3 shadow-none">
                  <PlayerCard player={player} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-600">No winners yet.</p>
      )}
    </div>
  </div>
);   
}

