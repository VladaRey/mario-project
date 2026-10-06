import Link from "next/link";
import { cn } from "~/lib/utils";

export function ListCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("divide-y divide-[#F0ECF7] rounded-2xl border border-line bg-white px-3 md:px-5", className)}>{children}</div>;
}

type RowProps = { leading?: React.ReactNode; title: React.ReactNode; meta?: React.ReactNode; trailing?: React.ReactNode; href?: string; muted?: boolean; className?: string };

export function ListRow({ leading, title, meta, trailing, href, muted, className }: RowProps) {
  const body = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <div className={cn("truncate text-sm font-bold", muted && "text-muted-foreground")}>{title}</div>
        {meta ? <div className="truncate text-xs text-muted-foreground">{meta}</div> : null}
      </div>
      {trailing}
    </>
  );
  const cls = cn("flex min-h-[52px] items-center gap-3 py-2", className);
  return href ? <Link href={href} className={cn(cls, "-mx-3 px-3 hover:bg-brand-50/60 md:-mx-5 md:px-5")}>{body}</Link> : <div className={cls}>{body}</div>;
}
