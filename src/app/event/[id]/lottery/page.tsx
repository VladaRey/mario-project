"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { MultiSelect } from "~/components/multi-select";
import { useEffect, useState } from "react";
import { playerOperations, eventOperations, type Player, type Event } from "~/lib/db";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent } from "~/components/ui/card";
import { PlayerCard } from "~/components/player-card";
import { Trash2 } from "lucide-react";
import { useLotteryService } from "~/services/lottery-service";
import { WinnersList } from "~/components/winners-list";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;


export default function LotteryPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [generatedPlayers, setGeneratedPlayers] = useState<string[]>([]);

  const [winnersList, setWinnersList] = useState<Player[]>([]);

  const [places, setPlaces] = useState<number>(1);
  const [event, setEvent] = useState<Event | null>(null);

  const [isGenerated, setIsGenerated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { addtoEvent, addToWaitingList, addToWinnersList } =
    useLotteryService();

  const invalidPlaces =
    selectedPlayers.length > 0 && places > selectedPlayers.length;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [players, currentEvent, winnersList] = await Promise.all([
          playerOperations.getAllPlayers(),
          eventOperations.getEvent(id),
          eventOperations.getWinnersList(id),
        ]);

        setEvent(currentEvent);
        setWinnersList(winnersList);

        const currentEventPlayerIds =
          currentEvent?.players.map((p) => p.id) || [];

        const filteredPlayers = players.filter(
          (player) => !currentEventPlayerIds.includes(player.id),
        );
        setAvailablePlayers(filteredPlayers);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();

    const adminPassword = localStorage.getItem("admin-password");
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    }
  }, []);

  const generateRandomPlayers = (
    playerIds: string[],
    places: number,
  ): string[] => {
    if (!playerIds || playerIds.length === 0 || places <= 0) return [];

    const availableIds = [...playerIds];
    const result: string[] = [];

    for (let i = 0; i < places; i++) {
      const randomIndex = Math.floor(Math.random() * availableIds.length);
      const selectedId = availableIds[randomIndex];
      if (selectedId) {
        result.push(selectedId);
        availableIds.splice(randomIndex, 1);
      }
    }

    return result;
  };

  const handleShuffle = () => {
    const randomIds = generateRandomPlayers(selectedPlayers, places);
    setGeneratedPlayers(randomIds);
    setIsGenerated(true);
  };

  const playerOptions = availablePlayers.map((player) => ({
    value: player.id,
    label: player.name,
  }));

  useEffect(() => {
    setIsGenerated(false);
    setGeneratedPlayers([]);
  }, [selectedPlayers, places]);

  const removePlayer = (playerToRemove: string) => {
    setSelectedPlayers((prevPlayers) =>
      prevPlayers.filter((id) => id !== playerToRemove),
    );
  };

  const handleAddPlayer = (playerId: string) => {
    setGeneratedPlayers((prevPlayers) => [...prevPlayers, playerId]);
  };

  const addPlayersToEvent = async () => {
    if (generatedPlayers.length === 0) return;

    try {
      await addtoEvent(generatedPlayers, id, event, event?.name || "", event?.date || "");

      // Update winners 
      await addToWinnersList(availablePlayers, generatedPlayers, id);

      // Update waiting list
      await addToWaitingList(selectedPlayers, generatedPlayers, availablePlayers, id);

      toast.success("Players added to event successfully!");
      router.push(`/admin`);
    } catch (error) {
      console.error("Failed to add players to event:", error);
      toast.error("Failed to add players to event.");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-8 flex items-center text-3xl font-bold">
        <h2 className="font-extrabold text-[#2E2A5D]">Mario Group</h2>
      </div>

      <div className="mb-6 rounded-lg border border-violet-200 bg-violet-50 p-4">
        <h2 className="mb-2 text-xl font-bold">Event: {event?.name}</h2>
        <p className="text-sm text-gray-600">
          Generate random players to add to this event.
        </p>
      </div>

      {winnersList.length > 0 ? (
        <WinnersList id={id} />
      ) : (
        <p className="text-sm text-gray-600 mb-4">No winners yet.</p>
      )}

      {isAuthenticated && winnersList.length === 0 && (
        <div className="mb-10">
          <div className="mb-4 grid grid-cols-2 items-end gap-4 md:grid-cols-3">
            <div className="h-full">
              <Label className="text-md mb-2 block">Add Players</Label>
              <div className="flex gap-2">
                <MultiSelect
                  options={playerOptions.filter(
                    (option) => !selectedPlayers.includes(option.value),
                  )}
                  selected={[]}
                  onChange={(newPlayers) => {
                    setSelectedPlayers((prevPlayers) => [
                      ...prevPlayers,
                      ...newPlayers,
                    ]);
                  }}
                  placeholder="Select players"
                />
              </div>
            </div>

            <div className="h-full">
              <Label
                htmlFor="places"
                className="text-md mb-2 block font-medium"
              >
                Number of Places
              </Label>
              <Input
                id="places"
                type="number"
                min={1}
                value={places || ""}
                className="h-10 w-full"
                onChange={(e) => {
                  const value = e.target.value;
                  setPlaces(value === "" ? 0 : Number.parseInt(value));
                }}
              />
              {invalidPlaces && (
                <p className="py-2 text-sm text-red-500">
                  You cannot have more places than players.
                </p>
              )}
            </div>

            <div className="col-span-2 md:col-span-1">
              <Button
                variant={"default"}
                className="w-full text-base md:w-auto"
                disabled={selectedPlayers.length === 0 || invalidPlaces}
                onClick={handleShuffle}
              >
                Play
              </Button>
            </div>
          </div>

          <div className="mb-6">
            {selectedPlayers.length > 0 && !isGenerated && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedPlayers.map((playerId) => {
                  const player = availablePlayers.find(
                    (p) => p.id === playerId,
                  );
                  return player ? (
                    <Card key={playerId}>
                      <CardContent className="flex items-center justify-between gap-8 p-4">
                        <PlayerCard player={player}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removePlayer(playerId)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">
                              Remove {player.name}
                            </span>
                          </Button>
                        </PlayerCard>
                      </CardContent>
                    </Card>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {isGenerated && (
        <div className="mb-4 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Winners</h2>
              <Button
                variant="outline"
                className="rounded-md bg-green-500 text-white hover:bg-green-600 hover:text-white"
                onClick={addPlayersToEvent}
              >
                Add to event
              </Button>
            </div>
            <Separator className="my-4 bg-green-500" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {generatedPlayers.map((playerId) => {
                const player = availablePlayers.find((p) => p.id === playerId);
                return player ? (
                  <Card key={playerId}>
                    <CardContent className="flex flex-col gap-1 p-3 shadow-none">
                      <PlayerCard player={player} />
                    </CardContent>
                  </Card>
                ) : null;
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold">Waiting List</h2>
            <Separator className="my-4 bg-yellow-500" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {selectedPlayers
                .filter((id) => !generatedPlayers.includes(id))
                .map((playerId) => {
                  const player = availablePlayers.find(
                    (p) => p.id === playerId,
                  );
                  return player ? (
                    <Card key={playerId}>
                      <CardContent className="flex justify-between gap-1 p-3 shadow-none">
                        <PlayerCard player={player}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddPlayer(playerId)}
                          >
                            Add
                          </Button>
                        </PlayerCard>
                      </CardContent>
                    </Card>
                  ) : null;
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
