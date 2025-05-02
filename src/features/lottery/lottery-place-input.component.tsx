import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

interface LotteryPlaceInputProps {
    selectedPlayers: string[];
    places: number;
    setPlaces: (places: number) => void;
}

export function LotteryPlaceInput({selectedPlayers, places, setPlaces}: LotteryPlaceInputProps) {
  const invalidPlaces = selectedPlayers.length > 0 && places > selectedPlayers.length;

  return (
    <div>
      <Label htmlFor="places" className="text-md mb-2 block font-medium">
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
  );
}

