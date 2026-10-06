"use client";
import { cn } from "~/lib/utils";

export function Segmented<T extends string>({ value, onChange, options, ariaLabel, className }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; ariaLabel: string; className?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("grid rounded-xl bg-[#ECE7F6] p-[3px] text-[13px] font-bold", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="tab" aria-selected={on} onClick={() => onChange(o.value)}
            className={cn("min-h-9 truncate rounded-[10px] px-2 py-2", on ? "bg-white text-ink shadow-sm" : "text-muted-foreground")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
