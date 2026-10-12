"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { ResponsiveSheet } from "~/components/ds/responsive-sheet";
import type { AutoParams } from "~/utils/auto-pricing-util";
import {
  PricingParamsForm,
  type PricingParamsFormValue,
} from "./pricing-params-form";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";
import { useT } from "~/i18n/i18n-provider";

interface AutoPricingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  params: AutoParams;
  onParamsChange: (params: AutoParams) => void;
  isDirty: boolean;
  onSave: () => void;
  saving?: boolean;
  /** Kept for compatibility; the sheet never renders its own trigger. */
  showTrigger?: boolean;
  /** Display-only: Fame discount (from calculated statistics). */
  fameDiscount?: string;
  /** Display-only: To be paid (from calculated statistics). */
  priceAfterDiscount?: string;
  eventName: string;
  hints: { courtsAuto: boolean; hoursFromDefaults: boolean; priceFromDefaults: boolean };
  fameCleared: boolean;
  playersCount: number;
  discountPerUsage: number;
}

export function AutoPricingSheet({
  open,
  onOpenChange,
  params,
  onParamsChange,
  isDirty,
  onSave,
  saving = false,
  fameDiscount,
  priceAfterDiscount,
  eventName,
  hints,
  fameCleared,
  playersCount,
  discountPerUsage,
}: AutoPricingSheetProps) {
  const { role } = useGetRole();
  const t = useT();

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

  const footer =
    role === Role.Admin || role === Role.Fame ? (
      <Button variant="accent" className="w-full" onClick={onSave} disabled={!isDirty || saving}>
        {saving ? <Loader2 className="animate-spin" /> : null}
        {t("pricing.apply")}
      </Button>
    ) : (
      <div className="text-center text-xs text-muted-foreground">{t("pricing.readOnly")}</div>
    );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("pricing.title")}
      description={t("pricing.subtitle", { name: eventName, players: t("common.players", { count: playersCount }) })}
      footer={footer}
    >
      <PricingParamsForm
        value={formValue}
        onChange={handleParamsFormChange}
        fameDiscount={fameDiscount}
        priceAfterDiscount={priceAfterDiscount}
        hints={hints}
        fameCleared={fameCleared}
        playersCount={playersCount}
        discountPerUsage={discountPerUsage}
      />
    </ResponsiveSheet>
  );
}
