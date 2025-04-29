import { Player } from "~/lib/db";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent } from "~/components/ui/card";
import { PlayerCard } from "~/components/player-card";


export function WinnersList({ winnersList }: { winnersList: Player[] }) {
 
return (
  <div className="mb-10">
    <div>
      <h2 className="text-xl font-bold">Winners</h2>
      <Separator className="my-4 bg-green-500" />
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
    </div>
  </div>
);   
}

