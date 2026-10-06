"use client";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export function MoreMenu({ label, items, triggerClassName }: {
  label: string; items: { label: string; onSelect: () => void; destructive?: boolean; icon?: React.ReactNode }[]; triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={label}
          className={cn("flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-line bg-white text-muted-foreground", triggerClassName)}>
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 rounded-2xl p-1.5" role="menu">
        {items.map((it) => (
          <button key={it.label} type="button" role="menuitem"
            onClick={() => { setOpen(false); it.onSelect(); }}
            className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold hover:bg-brand-50",
              it.destructive ? "text-danger-ink" : "text-ink")}>
            {it.icon}{it.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
