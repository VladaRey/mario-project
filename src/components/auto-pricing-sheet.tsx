"use client";

import { useMemo } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

/** Standalone trigger button to open the pricing sheet (use with AutoPricingSheet showTrigger={false} for one sheet, multiple triggers). */
export function AutoPricingSheetTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-fit rounded-lg border-[#7B3C7D] bg-[#7B3C7D] px-4 py-2 text-white transition-colors hover:bg-[#2E2A5D] hover:text-white"
      onClick={onOpen}
    >
      <Calculator className="h-4 w-4" />
      Calculate
    </Button>
  );
}
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import type { AutoParams } from "~/utils/auto-pricing-util";
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
  isDirty: boolean;
  onSave: () => void;
  saving?: boolean;
  /** When false, no trigger is rendered; use for a single sheet with external triggers (e.g. one for mobile, one for desktop). */
  showTrigger?: boolean;
  /** Display-only: Fame discount (from calculated statistics). */
  fameDiscount?: string;
  /** Display-only: To be paid (from calculated statistics). */
  priceAfterDiscount?: string;
}

export function AutoPricingSheet({
  open,
  onOpenChange,
  params,
  onParamsChange,
  isDirty,
  onSave,
  saving = false,
  showTrigger = true,
  fameDiscount,
  priceAfterDiscount,
}: AutoPricingSheetProps) {
  const { role } = useGetRole();

  const formValue = useMemo(
    () => ({
      courts: params.courts,
      hours: params.hours,
      pricePerHour: params.pricePerHour,
      fameTotal: params.fameTotal,
    }),
    [params.courts, params.hours, params.pricePerHour, params.fameTotal],
  );

  const handleParamsFormChange = (next: PricingParamsFormValue) => {
    onParamsChange({
      ...params,
      courts: next.courts,
      hours: next.hours,
      pricePerHour: next.pricePerHour,
      fameTotal: next.fameTotal,
    });
  };

  const triggerButton = (
    <Button
      type="button"
      variant="outline"
      className="w-fit rounded-lg border-[#7B3C7D] bg-[#7B3C7D] px-4 py-2 text-white transition-colors hover:bg-[#2E2A5D] hover:text-white"
      onClick={() => onOpenChange(true)}
    >
      <Calculator className="h-4 w-4" />
      Calculate
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {showTrigger ? (
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
      ) : null}
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
            fameDiscount={fameDiscount}
            priceAfterDiscount={priceAfterDiscount}
          />
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
