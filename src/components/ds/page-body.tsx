import { cn } from "~/lib/utils";
export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-4 pt-3 md:gap-5 md:px-8 md:pt-5", className)}>{children}</div>;
}
