"use client";

import { Input } from "~/components/ui/input";
import { type DefaultAdminValues } from "~/lib/db";

interface Props {
  value: DefaultAdminValues;
  onChange: (value: DefaultAdminValues) => void;
}

export function DefaultAdminValuesForm({ value, onChange }: Props) {
  const updateField = (field: keyof DefaultAdminValues, newValue: string) => {
    onChange({
      ...value,
      [field]: Number(newValue),
    });
  };

  return (
    <div className="space-y-4 pt-6">
      <div className="flex gap-2">
        <div>
          <h2 className="text-sm font-medium">Players per court</h2>
          <Input
            value={value.players_per_court}
            onChange={(e) => updateField("players_per_court", e.target.value)}
            className="border-[#241e2f]"
          />
        </div>

        <div>
          <h2 className="text-sm font-medium">Default hours</h2>
          <Input
            value={value.hours}
            onChange={(e) => updateField("hours", e.target.value)}
            className="border-[#241e2f]"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div>
          <h2 className="text-sm font-medium">Default price per hour</h2>
          <Input
            value={value.price_per_hour}
            onChange={(e) => updateField("price_per_hour", e.target.value)}
            className="border-[#241e2f]"
          />
        </div>

        <div>
          <h2 className="text-sm font-medium">Default fame discount</h2>
          <Input
            value={value.fame_discount}
            onChange={(e) => updateField("fame_discount", e.target.value)}
            className="border-[#241e2f]"
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium">Discount per usage</h2>
        <Input
          value={value.discount_per_usage}
          onChange={(e) => updateField("discount_per_usage", e.target.value)}
          className="border-[#241e2f]"
        />
      </div>
    </div>
  );
}
