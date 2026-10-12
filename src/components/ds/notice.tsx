import { AlertTriangle, Info } from "lucide-react";
import { cn } from "~/lib/utils";

export function Notice({ tone = "warning", children, className }: { tone?: "warning" | "info"; children: React.ReactNode; className?: string }) {
  const warn = tone === "warning";
  const Icon = warn ? AlertTriangle : Info;
  return (
    <div role="status" className={cn("flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[13px] leading-snug",
      warn ? "border-warn-line bg-warn-bg text-warn-ink" : "border-[#E2D6F5] bg-brand-50 text-brand-900", className)}>
      <Icon className={cn("mt-0.5 h-4 w-4 flex-none", warn ? "text-[#C2410C]" : "text-brand-700")} aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
