"use client";
import { Stepper } from "~/components/ds/stepper";
import { useT } from "~/i18n/i18n-provider";

export interface PricingParamsFormValue { courts: number; hours: number; pricePerHour: number; fameTotal: number | null; }

type Props = {
  value: PricingParamsFormValue; onChange: (value: PricingParamsFormValue) => void;
  fameDiscount?: string; priceAfterDiscount?: string;
  hints: { courtsAuto: boolean; hoursFromDefaults: boolean; priceFromDefaults: boolean };
  fameCleared: boolean; playersCount: number; discountPerUsage: number;
};

const input = "w-24 rounded-[10px] border border-line px-2.5 py-2 text-right text-[15px] font-extrabold";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#F0ECF7] py-2.5 last:border-0">
      <div><div className="text-sm font-extrabold">{label}</div>{hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}</div>
      {children}
    </div>
  );
}

export function PricingParamsForm({ value, onChange, fameDiscount, priceAfterDiscount, hints, fameCleared, playersCount, discountPerUsage }: Props) {
  const t = useT();
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-line bg-white px-3.5 py-1">
        <Row label={t("pricing.courts")} hint={hints.courtsAuto ? t("pricing.courtsAuto", { count: playersCount }) : undefined}>
          <Stepper value={value.courts} min={1} max={5} onChange={(v) => onChange({ ...value, courts: v })} label={t("pricing.courts")} />
        </Row>
        <Row label={t("pricing.hours")} hint={hints.hoursFromDefaults ? t("pricing.fromDefaults") : undefined}>
          <Stepper value={value.hours} min={1} max={4} step={0.5} onChange={(v) => onChange({ ...value, hours: v })} label={t("pricing.hours")} />
        </Row>
        <Row label={t("pricing.pricePerHour")} hint={`${t("pricing.pln")}${hints.priceFromDefaults ? ` · ${t("pricing.fromDefaults")}` : ""}`}>
          <input inputMode="decimal" aria-label={t("pricing.pricePerHour")} className={input} value={String(value.pricePerHour)}
            onChange={(e) => onChange({ ...value, pricePerHour: Number(e.target.value) || 0 })} />
        </Row>
        <div className="flex flex-col gap-1.5 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div><div className="text-sm font-extrabold">{t("pricing.fameTotal")}</div><div className="text-xs text-muted-foreground">{t("pricing.optional")}</div></div>
            <input inputMode="decimal" aria-label={t("pricing.fameTotal")} placeholder="—" className={input}
              value={value.fameTotal === null || value.fameTotal === undefined ? "" : String(value.fameTotal)}
              onChange={(e) => { const raw = e.target.value.trim(); onChange({ ...value, fameTotal: raw === "" ? null : Number(raw) || 0 }); }} />
          </div>
          {fameCleared && value.fameTotal == null ? <div className="text-xs font-bold text-[#9A3412]">{t("pricing.fameCleared")}</div> : null}
        </div>
      </div>
      <div className="px-1 text-xs text-muted-foreground">{t("pricing.cardUseInfo", { amount: discountPerUsage })}</div>
      {(fameDiscount != null || priceAfterDiscount != null) ? (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-brand-900 p-3.5 text-white">
          <div><div className="text-[11px] font-bold text-[#D9CCF0]">{t("pricing.fameDiscount")}</div><div className="text-base font-extrabold">{fameDiscount ? t("common.pln", { value: fameDiscount }) : "—"}</div></div>
          <div><div className="text-[11px] font-bold text-[#D9CCF0]">{t("pricing.toBePaid")}</div><div className="text-base font-extrabold">{priceAfterDiscount ? t("common.pln", { value: priceAfterDiscount }) : "—"}</div></div>
        </div>
      ) : null}
    </div>
  );
}
