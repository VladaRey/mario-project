"use client";
import { type Statistics } from "~/services/calculation-service";
import { SectionLabel } from "~/components/ds/section-label";
import { useT } from "~/i18n/i18n-provider";
import type { MessageKey } from "~/i18n/messages/en";

const PER_PLAYER: (keyof Statistics)[] = ["medicover", "medicoverLight", "MS", "msClassic", "noMs"];
const TOTALS: (keyof Statistics)[] = ["totalPrice", "discount", "fameDiscount"];
const ROWS: (keyof Statistics)[] = [...PER_PLAYER, ...TOTALS];

function useShow() {
  const t = useT();
  return (v?: string) => (v ? t("common.pln", { value: v }) : "—");
}

export function ResultsPanel({ statistics }: { statistics: Statistics }) {
  const t = useT();
  const show = useShow();
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

/** Mobile sheet: per-player amounts scroll with the form. */
export function PerPlayerResults({ statistics }: { statistics: Statistics }) {
  const t = useT();
  const show = useShow();
  return (
    <div className="rounded-2xl border border-line bg-white px-3.5 py-2.5">
      <SectionLabel className="mb-1">{t("ffp.perPlayer")}</SectionLabel>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
        {PER_PLAYER.map((k) => (
          <div key={k} className="contents">
            <span className="text-[#4A4361]">{t(`ffp.r.${k}` as MessageKey)}</span>
            <span className="text-right font-extrabold" data-testid={`ffp-${k}`}>{show(statistics[k])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mobile sheet: totals pinned to the bottom of the sheet (mockup "FFP calculator · sheet"). */
export function PinnedTotals({ statistics }: { statistics: Statistics }) {
  const t = useT();
  const show = useShow();
  return (
    <div className="flex flex-col gap-2.5 bg-brand-900 px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 text-white">
      <div className="grid grid-cols-3 gap-2">
        {TOTALS.map((k) => (
          <div key={k} className="min-w-0">
            <div className="text-[11px] font-bold text-[#D9CCF0]">{t(`ffp.r.${k}` as MessageKey)}</div>
            <div className="text-[15px] font-extrabold" data-testid={`ffp-${k}`}>{show(statistics[k])}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-[14px] bg-coral px-3.5 py-2.5 text-ink">
        <span className="text-sm font-extrabold">{t("ffp.r.priceAfterDiscount")}</span>
        <span className="text-xl font-extrabold" data-testid="ffp-priceAfterDiscount">{show(statistics.priceAfterDiscount)}</span>
      </div>
    </div>
  );
}
