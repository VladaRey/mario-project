import { Player } from "~/lib/db";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent } from "~/components/ui/card";
import { PlayerCard } from "~/components/player-card";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGetRole } from "~/hooks/use-get-role";


interface LotteryResultsProps {
  winnersList: Player[];
  waitingList: Player[];
  addPlayersToEvent: (players: Player[]) => void;
  handleAddPlayer: (player: Player) => void;
  handleRemoveWinner: (player: Player) => void;
  handleRemoveFromWaitingList: (player: Player) => void;
}

export function LotteryResults({
  winnersList,
  waitingList,
  addPlayersToEvent,
  handleAddPlayer,
  handleRemoveWinner,
  handleRemoveFromWaitingList
}: LotteryResultsProps) {

  const role = useGetRole();

  return (
    <>
      <div className="mb-10">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Winners</h2>
            {role === "admin" && winnersList.length > 0 && (
              <Button
                size="sm"
                className="rounded-md bg-green-500 text-white hover:bg-green-600 hover:text-white"
                variant="outline"
                onClick={() => addPlayersToEvent(winnersList)}
              >
                Add to event
              </Button>
            )}
          </div>
          <Separator className="my-4 bg-green-500" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {winnersList.length > 0 ? (
              <>
                {winnersList.map((player) => {
                  return (
                    <Card key={player.id}>
                      <CardContent className="flex items-center justify-between gap-1 p-3 shadow-none">
                        <PlayerCard player={player}>
                          {role === "admin" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveWinner(player)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">
                                Remove {player.name}
                              </span>
                            </Button>
                          )}
                        </PlayerCard>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            ) : (
              <p className="text-sm text-gray-500">No winners yet.</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold">Waiting List</h2>
        <Separator className="my-4 bg-yellow-500" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {waitingList.length > 0 ? (
            <>
              {waitingList.map((player) => {
                return (
                  <Card key={player.id}>
                    <CardContent className="flex justify-between gap-1 p-3 shadow-none">
                      <PlayerCard player={player}>
                        {role === "admin" && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddPlayer(player)}
                            >
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleRemoveFromWaitingList(player)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">
                                Remove {player.name}
                              </span>
                            </Button>
                          </div>
                        )}
                      </PlayerCard>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No players in the waiting list.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
