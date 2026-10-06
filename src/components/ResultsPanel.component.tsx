"use client";
import { type Statistics } from "~/services/calculation-service";
import { SectionLabel } from "~/components/ds/section-label";
import { useT } from "~/i18n/i18n-provider";
import type { MessageKey } from "~/i18n/messages/en";

const ROWS: (keyof Statistics)[] = ["medicover", "medicoverLight", "MS", "msClassic", "noMs", "totalPrice", "discount", "fameDiscount"];

export function ResultsPanel({ statistics }: { statistics: Statistics }) {
  const t = useT();
  const show = (v?: string) => (v ? t("common.pln", { value: v }) : "—");
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-line bg-white px-3.5 py-3">
        <SectionLabel className="mb-1">{t("ffp.perPlayer")}</SectionLabel>
        {ROWS.map((k) => (
          <div key={k} className="flex justify-between border-b border-[#F0ECF7] py-1.5 text-sm last:border-0">
            <span className="text-[#4A4361]">{t(`ffp.r.${k}` as MessageKey)}</span>
            <span className="font-extrabold" data-testid={`ffp-${k}`}>{show(statistics[k])}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-coral px-4 py-3.5 text-ink">
        <span className="text-[15px] font-extrabold">{t("ffp.r.priceAfterDiscount")}</span>
        <span className="text-2xl font-extrabold" data-testid="ffp-priceAfterDiscount">{show(statistics.priceAfterDiscount)}</span>
      </div>
    </div>
  );
}
