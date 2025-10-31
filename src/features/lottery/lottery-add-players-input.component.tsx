import { Label } from "~/components/ui/label";
import { MultiSelect } from "~/components/multi-select";
import { Player } from "~/lib/db";


interface LotteryAddPlayersInputProps {
    availablePlayers: Player[];
    selectedPlayers: string[];
    onAddPlayers: (players: string[]) => void;
}


export function LotteryAddPlayersInput({availablePlayers, selectedPlayers, onAddPlayers}: LotteryAddPlayersInputProps) {
    const playerOptions = availablePlayers.map((player) => ({
      value: player.id,
      label: player.name,
    }));

  return (
    <div>
      <Label className="text-sm mb-1 block">Add Players</Label>
      <div className="flex gap-2">
        <MultiSelect
          options={playerOptions.filter(
            (option) => !selectedPlayers.includes(option.value),
          )}
          selected={[]}
          onChange={(newPlayers) => {
            onAddPlayers([...selectedPlayers, ...newPlayers]);
          }}
          placeholder="Select players"
        />
      </div>
    </div>
  );
}

