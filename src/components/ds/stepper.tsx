"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import { useT } from "~/i18n/i18n-provider";

export function Stepper({ value, onChange, min = 0, max = Number.POSITIVE_INFINITY, step = 1, size = "sm", label }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; size?: "sm" | "lg"; label: string;
}) {
  const t = useT();
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const btn = cn("flex items-center justify-center border border-line bg-white text-ink disabled:opacity-40",
    size === "lg" ? "h-10 w-10 rounded-xl" : "h-8 w-8 rounded-lg");
  return (
    <div className={cn("flex items-center font-extrabold", size === "lg" ? "gap-3 text-lg" : "gap-1.5 text-[13px]")} role="group" aria-label={label}>
      <button type="button" className={btn} aria-label={`${t("common.decrease")} ${label}`} disabled={value - step < min}
        onClick={() => onChange(round(value - step))}><Minus className="h-4 w-4" /></button>
      <span className="min-w-[1.5rem] text-center tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={btn} aria-label={`${t("common.increase")} ${label}`} disabled={value + step > max}
        onClick={() => onChange(round(value + step))}><Plus className="h-4 w-4" /></button>
    </div>
  );
}
