"use client";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type DefaultAdminValues } from "~/lib/db";
import { useT } from "~/i18n/i18n-provider";

interface Props {
  value: DefaultAdminValues;
  onChange: (value: DefaultAdminValues) => void;
}

export function DefaultAdminValuesForm({ value, onChange }: Props) {
  const t = useT();
  const updateField = (field: keyof DefaultAdminValues, newValue: string) => {
    onChange({
      ...value,
      [field]: Number(newValue),
    });
  };

  const fields = [
    { field: "price_per_hour", label: t("defaults.price"), hint: t("defaults.priceHint") },
    { field: "hours", label: t("defaults.hours"), hint: t("defaults.hoursHint") },
    { field: "discount_per_usage", label: t("defaults.discount"), hint: t("defaults.discountHint") },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      {fields.map(({ field, label, hint }) => (
        <div key={field} className="flex flex-col gap-1.5">
          <Label htmlFor={`default-${field}`}>{label}</Label>
          <Input
            id={`default-${field}`}
            inputMode="decimal"
            value={value[field]}
            onChange={(e) => updateField(field, e.target.value)}
            className="h-12 rounded-xl"
          />
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      ))}
    </div>
  );
}
