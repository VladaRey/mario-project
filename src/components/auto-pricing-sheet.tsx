"use client";

import { useMemo } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { type CardType, type Event } from "~/lib/db";
import type { AutoParams } from "~/utils/auto-pricing-util";
import { buildInputDataFromEvent } from "~/utils/auto-pricing-util";
import { calculateStatistics } from "~/services/calculation-service";
import { ResultsPanel } from "./ResultsPanel.component";
import {
  PricingParamsForm,
  type PricingParamsFormValue,
} from "./pricing-params-form";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";

interface AutoPricingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  params: AutoParams;
  onParamsChange: (params: AutoParams) => void;
  event: Event;
  playerUsages: Record<string, number>;
  isDirty: boolean;
  onSave: () => void;
  saving?: boolean;
}

export function AutoPricingSheet({
  open,
  onOpenChange,
  params,
  onParamsChange,
  event,
  playerUsages,
  isDirty,
  onSave,
  saving = false,
}: AutoPricingSheetProps) {
  const { role } = useGetRole();

  const formValue = useMemo(() => {
    const cardTypeCounts = event.players.reduce(
      (acc, player) => {
        acc[player.cardType] = (acc[player.cardType] || 0) + 1;
        return acc;
      },
      {} as Record<CardType, number>
    );
    return {
      courts: params.courts,
      hours: params.hours,
      pricePerHour: params.pricePerHour,
      fameTotal: params.fameTotal,
      medicoverOwners: params.medicoverOwners ?? cardTypeCounts["Medicover"] ?? 0,
      medicoverLightOwners:
        params.medicoverLightOwners ?? cardTypeCounts["Medicover Light"] ?? 0,
      msOwners: params.msOwners ?? cardTypeCounts["Multisport"] ?? 0,
      msClassicOwners: params.msClassicOwners ?? cardTypeCounts["Classic"] ?? 0,
      noCardOwners: params.noCardOwners ?? cardTypeCounts["No card"] ?? 0,
    };
  }, [event.players, params]);

  const handleParamsFormChange = (next: PricingParamsFormValue) => {
    onParamsChange({
      ...params,
      courts: next.courts,
      hours: next.hours,
      pricePerHour: next.pricePerHour,
      fameTotal: next.fameTotal,
      medicoverOwners: next.medicoverOwners,
      medicoverLightOwners: next.medicoverLightOwners,
      msOwners: next.msOwners,
      msClassicOwners: next.msClassicOwners,
      noCardOwners: next.noCardOwners,
    });
  };

  const statistics = useMemo(() => {
    const inputData = buildInputDataFromEvent(event, params, playerUsages);
    return calculateStatistics(inputData);
  }, [event, params, playerUsages]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-fit rounded-lg border-[#7B3C7D] bg-[#7B3C7D] px-4 py-2 text-white transition-colors hover:bg-[#2E2A5D] hover:text-white"
        >
          <Calculator className="h-4 w-4" />
          Calculate
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto">
        <SheetHeader className="pb-8">
          <SheetTitle className="hidden">Live pricing</SheetTitle>
          <SheetDescription className="hidden">
            Set parameters for automatic pricing. Card usage is set on each
            player card.
          </SheetDescription>
        </SheetHeader>
        <div>
          <PricingParamsForm
            value={formValue}
            onChange={handleParamsFormChange}
          />

          <img className="mb-4 mt-2" src="/divider.png" alt="divider" />

          <ResultsPanel statistics={statistics} />
        </div>
        {(role === Role.Admin || role === Role.Fame) && (
        <SheetFooter className="pt-4">
          <Button
            className="w-full"
            onClick={onSave}
            disabled={!isDirty || saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
              Apply
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
