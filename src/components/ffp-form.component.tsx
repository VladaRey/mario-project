"use client";

import { useState, useEffect } from "react";
import { calculateStatistics } from "~/services/calculation-service";
import { transformState } from "~/utils/util";
import { PerPlayerResults, PinnedTotals, ResultsPanel } from "./ResultsPanel.component";
import { type Statistics } from "~/services/calculation-service";
import { Stepper } from "~/components/ds/stepper";
import { SectionLabel } from "~/components/ds/section-label";
import { useT } from "~/i18n/i18n-provider";
import { useIsDesktop } from "~/hooks/use-media-query";

interface FfpFormProps {
  ml?: number;
  mc?: number;
  ms?: number;
  msc?: number;
  nc?: number;
  onCalculate?: (stats: Statistics) => void;
}

export function FfpForm({ ml = 0, mc = 0, ms = 0, msc = 0, nc = 0, onCalculate }: FfpFormProps) {
  const t = useT();
  const isDesktop = useIsDesktop();
  const playersCount = ml + mc + ms + msc + nc;
  const courtCount = Math.ceil(playersCount / 4);

  const defaultMedicoverUsage = mc * 2;
  const allowedMsUsage = courtCount * 2 * 2;
  const possibleMSUsage = ms * 2 + msc;
  const realMSUsage = Math.min(allowedMsUsage, possibleMSUsage);

  const [courts, setCourts] = useState(String(courtCount));
  const [hours, setHours] = useState("2");
  const [pricePerHour, setPricePerHour] = useState("77");
  const [fameTotal, setFameTotal] = useState("");
  const [medicoverLightOwners, setMedicoverLightOwners] = useState(String(ml));
  const [mCoverOwners, setMCoverOwners] = useState(String(mc));
  const [msOwners, setMSOwners] = useState(String(ms));
  const [msClassicOwners, setMSClassicOwners] = useState(String(msc));
  const [noCard, setNoCard] = useState(String(nc));
  const [mCoverUsage, setMCoverUsage] = useState(String(defaultMedicoverUsage));
  const [msUsage, setMSUsage] = useState(String(realMSUsage));
  const [medicoverLightUsage, setMedicoverLightUsage] = useState(String(ml));

  const statistics = calculateStatistics(
    transformState({
      courts,
      hours,
      pricePerHour,
      fameTotal,
      medicoverLightOwners,
      mCoverOwners,
      msOwners,
      msClassicOwners,
      noCard,
      medicoverLightUsage,
      mCoverUsage,
      msUsage,
    }),
  );

  useEffect(() => {
    onCalculate?.(statistics);
  }, [
    statistics.medicover,
    statistics.MS,
    statistics.msClassic,
    statistics.noMs,
    statistics.totalPrice,
    statistics.medicoverLight,
  ]);

  const num = "w-full rounded-[10px] border border-line px-2.5 py-2 text-center text-[15px] font-extrabold";
  const field = (label: string, value: string, set: (v: string) => void) => (
    <label className="flex flex-col gap-1 text-xs font-bold text-[#4A4361]">
      {label}
      <input inputMode="decimal" aria-label={label} className={num} value={value} onChange={(e) => set(e.target.value)} />
    </label>
  );
  const cardRow = (dot: string, label: string, owners: [string, string, (v: string) => void], usage?: [string, string, (v: string) => void]) => (
    <>
      <span className="flex items-center gap-1.5 text-[13px] font-bold"><span className={`h-2 w-2 rounded-full ${dot}`} />{label}</span>
      <input inputMode="numeric" aria-label={owners[0]} className={num} value={owners[1]} onChange={(e) => owners[2](e.target.value)} />
      {usage ? <input inputMode="numeric" aria-label={usage[0]} className={num} value={usage[1]} onChange={(e) => usage[2](e.target.value)} /> : <span />}
    </>
  );

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-[18px]">
      <div className="flex flex-col gap-3 md:flex-[1_1_420px]">
        <section className="rounded-2xl border border-line bg-white p-3.5">
          <SectionLabel className="mb-2">{t("ffp.court")}</SectionLabel>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="flex flex-col gap-1 text-xs font-bold text-[#4A4361]">{t("ffp.courts")}
              <Stepper value={Number(courts) || 0} min={1} max={5} onChange={(v) => setCourts(String(v))} label={t("ffp.courts")} />
            </div>
            <div className="flex flex-col gap-1 text-xs font-bold text-[#4A4361]">{t("ffp.hours")}
              <Stepper value={Number(hours) || 0} min={1} max={4} step={0.5} onChange={(v) => setHours(String(v))} label={t("ffp.hours")} />
            </div>
            {field(t("ffp.pricePerHour"), pricePerHour, setPricePerHour)}
            {field(t("ffp.fameTotal"), fameTotal, setFameTotal)}
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-white p-3.5">
          <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] items-center gap-x-2 gap-y-1.5">
            <SectionLabel>{t("ffp.cards")}</SectionLabel>
            <span className="text-center text-xs font-bold text-muted-foreground">{t("ffp.owners")}</span>
            <span className="text-center text-xs font-bold text-muted-foreground">{t("ffp.usage")}</span>
            {cardRow("bg-[#1D4ED8]", t("cardType.Medicover"), [t("ffp.medicoverOwners"), mCoverOwners, setMCoverOwners], [t("ffp.medicoverUsage"), mCoverUsage, setMCoverUsage])}
            {cardRow("bg-[#6D28D9]", t("cardType.Medicover Light"), [t("ffp.mlOwners"), medicoverLightOwners, setMedicoverLightOwners], [t("ffp.mlUsage"), medicoverLightUsage, setMedicoverLightUsage])}
            {cardRow("bg-[#15803D]", "MS+", [t("ffp.msOwners"), msOwners, setMSOwners], [t("ffp.msUsage"), msUsage, setMSUsage])}
            {cardRow("bg-[#B45309]", "MS Classic", [t("ffp.msClassicOwners"), msClassicOwners, setMSClassicOwners])}
            {cardRow("bg-[#475569]", t("cardType.No card"), [t("ffp.noCard"), noCard, setNoCard])}
          </div>
        </section>
      </div>
      {isDesktop ? (
        <div className="md:sticky md:top-0 md:flex-[1_1_300px]">
          <ResultsPanel statistics={statistics} />
        </div>
      ) : (
        <>
          <PerPlayerResults statistics={statistics} />
          {/* Pinned to the bottom of the scrolling sheet; -mx/-mb cancel the sheet body padding. */}
          <div className="sticky bottom-0 z-10 -mx-4 -mb-4">
            <PinnedTotals statistics={statistics} />
          </div>
        </>
      )}
    </div>
  );
}
