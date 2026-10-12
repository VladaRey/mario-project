import { cn } from "~/lib/utils";

export function StatTile({ label, value, sub, tone = "default", progress, valueClassName }: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "default" | "onDark"; progress?: number; valueClassName?: string;
}) {
  const dark = tone === "onDark";
  return (
    <div className={cn("rounded-xl px-3 py-2.5 md:rounded-2xl md:px-[18px] md:py-4", dark ? "bg-white/[0.12] text-white" : "border border-line bg-white")}>
      <div className={cn("text-[11px] font-extrabold uppercase tracking-[0.06em] md:text-xs", dark ? "text-[#D9CCF0]" : "text-muted-foreground")}>{label}</div>
      <div className={cn("mt-0.5 text-xl font-extrabold md:mt-1 md:text-[30px]", valueClassName)}>
        {value}
        {sub ? <span className={cn("ml-1 text-sm md:text-base", dark ? "text-[#D9CCF0]" : "text-muted-foreground")}>{sub}</span> : null}
      </div>
      {progress !== undefined ? (
        <div className="mt-2 h-1.5 rounded-full bg-[#ECE7F6]" aria-hidden="true">
          <div className="h-full rounded-full bg-coral" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      ) : null}
    </div>
  );
}
