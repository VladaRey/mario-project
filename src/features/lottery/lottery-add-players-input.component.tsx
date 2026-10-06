import { MultiSelect } from "~/components/multi-select";
import { SectionLabel } from "~/components/ds/section-label";
import { useT } from "~/i18n/i18n-provider";
import { Player } from "~/lib/db";
import { isPenalized } from "~/utils/penalty-util";


interface LotteryAddPlayersInputProps {
    availablePlayers: Player[];
    selectedPlayers: string[];
    onAddPlayers: (players: string[]) => void;
}


export function LotteryAddPlayersInput({availablePlayers, selectedPlayers, onAddPlayers}: LotteryAddPlayersInputProps) {
  const t = useT();
  const playerOptions = availablePlayers.map((player) => ({
    value: player.id, label: player.name, cardType: player.cardType,
    ...(isPenalized(player) ? { disabled: true, hint: t("penalty.chip") } : {}),
  }));

  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel>{t("lottery.participants", { count: selectedPlayers.length })}</SectionLabel>
      <div className="flex gap-2">
        <MultiSelect
          options={playerOptions.filter(
            (option) => !selectedPlayers.includes(option.value),
          )}
          selected={[]}
          onChange={(newPlayers) => {
            onAddPlayers([...selectedPlayers, ...newPlayers]);
          }}
          placeholder={t("lottery.addPlayers")}
        />
      </div>
    </div>
  );
}
