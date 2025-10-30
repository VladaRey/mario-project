import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PlayerCard } from "~/components/player-card";
import { Button } from "~/components/ui/button";
import { LotteryAddPlayersInput } from "~/features/lottery/lottery-add-players-input.component";
import { LotteryPlaceInput } from "~/features/lottery/lottery-place-input.component";
import { eventOperations, type Event, type Player } from "~/lib/db";
import { useLotteryService } from "~/services/lottery-service";

interface LotteryFormProps {
  event: Event | null;
  availablePlayers: Player[];
  isWinners: boolean;
  onReset: () => void;
  onLotteryGenerated?: (winners: Player[], waiting: Player[]) => void;
}

export function LotteryForm({
  event,
  availablePlayers,
  isWinners,
  onReset,
  onLotteryGenerated,
}: LotteryFormProps) {

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const [places, setPlaces] = useState<number>(1);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const {
    addToWaitingList,
    addToWinnersList,
    generateRandomPlayers
  } = useLotteryService();

  const handleShuffle = async () => {
    const lotteryPlayer= availablePlayers.filter((player) => selectedPlayers.includes(player.id));
    const {winners, waitingList:waiting} = generateRandomPlayers(lotteryPlayer, places);
    setIsGenerated(true);
    setIsResetting(true);

    try {
      // Update winners
      await addToWinnersList( winners, event?.id || "");

      // Update waiting list
      await addToWaitingList(
        waiting,
        event?.id || "",
      );

      onLotteryGenerated?.(winners, waiting);
      toast.success("Winners and waiting list updated successfully!");
    } catch (error) {
      console.error("Failed to update winners and waiting list:", error);
      toast.error("Failed to update winners and waiting list.");
    }
  };

  const removePlayer = (playerToRemove: string) => {
    setSelectedPlayers((prevPlayers) =>
      prevPlayers.filter((id) => id !== playerToRemove),
    );
  };

  const handleReset = async () => {
    await eventOperations.removeLotteryResults(event?.id || "");
    setIsGenerated(false);
    setIsResetting(false);
    onReset();
  };

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 items-end gap-4 md:grid-cols-3">
        <div className="h-full">
          <LotteryAddPlayersInput
            availablePlayers={availablePlayers}
            selectedPlayers={selectedPlayers}
            onAddPlayers={setSelectedPlayers}
          />
        </div>

        <div className="h-full">
          <LotteryPlaceInput
            selectedPlayers={selectedPlayers}
            places={places}
            setPlaces={setPlaces}
          />
        </div>

        <div className="col-span-2 md:col-span-1">
          <div className="flex w-full flex-col gap-2 md:w-fit md:flex-row">
            <Button
              className="w-full text-base md:w-auto"
              disabled={
                selectedPlayers.length === 0 ||
                places > selectedPlayers.length ||
                places <= 0
              }
              onClick={handleShuffle}
            >
              Play
            </Button>
            <Button
              variant={"destructive"}
              onClick={handleReset}
              className={
                isResetting || isWinners ? "block w-full md:w-auto" : "hidden"
              }
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {selectedPlayers.length > 0 && !isGenerated && (
      <div className="mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {selectedPlayers.map((playerId) => {
              const player = availablePlayers.find((p) => p.id === playerId);
              return player ? (
                <PlayerCard key={player.id} player={player}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() => removePlayer(playerId)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove {player.name}</span>
                </Button>
              </PlayerCard>
              ) : null;
            })}
          </div>
      </div>
        )}
    </div>
  );
}
