import { cn } from "~/lib/utils";
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-xs font-extrabold uppercase tracking-[0.06em] text-muted-foreground", className)}>{children}</div>;
}
