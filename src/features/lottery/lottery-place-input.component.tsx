import { SectionLabel } from "~/components/ds/section-label";
import { Stepper } from "~/components/ds/stepper";
import { useT } from "~/i18n/i18n-provider";

interface LotteryPlaceInputProps {
    selectedPlayers: string[];
    places: number;
    setPlaces: (places: number) => void;
}

export function LotteryPlaceInput({selectedPlayers, places, setPlaces}: LotteryPlaceInputProps) {
  const t = useT();
  const invalidPlaces = selectedPlayers.length > 0 && places > selectedPlayers.length;

  return (
    <>
      <div className="flex items-center justify-between border-t border-[#F0ECF7] pt-3">
        <SectionLabel>{t("lottery.places")}</SectionLabel>
        <Stepper size="lg" value={places} min={1} onChange={setPlaces} label={t("lottery.places")} />
      </div>
      {invalidPlaces ? <p className="text-sm font-bold text-danger-ink">{t("lottery.tooManyPlaces")}</p> : null}
    </>
  );
}
