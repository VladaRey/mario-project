"use client";
import { cn } from "~/lib/utils";

export function Segmented<T extends string>({ value, onChange, options, ariaLabel, className, fit = false }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; ariaLabel: string; className?: string;
  /** Share the width by label length (for long labels such as "Rezerwowi · 4" at 360px) instead of equal segments. */
  fit?: boolean;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("rounded-xl bg-[#ECE7F6] p-[3px] text-[13px] font-bold", fit ? "flex" : "grid", className)}
      style={fit ? undefined : { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="tab" aria-selected={on} onClick={() => onChange(o.value)}
            className={cn("min-h-9 min-w-0 rounded-[10px] py-2", fit ? "flex-auto text-balance px-1.5 leading-tight" : "truncate px-2",
              on ? "bg-white text-ink shadow-sm" : "text-muted-foreground")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
