"use client";

import { useState } from "react";
import { Users, ChevronDown } from "lucide-react";
import type { Event } from "~/lib/db";
import { getSortedCardTypeCounts } from "~/utils/event-players-util";
import { CardTypeCounts } from "~/components/card-type-counts";

interface PlayersByCardTypeDropdownProps {
  event: Event;
}

export function PlayersByCardTypeDropdown({ event }: PlayersByCardTypeDropdownProps) {
  const [open, setOpen] = useState(false);
  const sortedCardTypeCounts = getSortedCardTypeCounts(event);

  return (
    <div className="w-full rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E2A5D] text-white">
            <Users className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold text-card-foreground">
            {event.players.length} Players
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <CardTypeCounts items={sortedCardTypeCounts} />
          </div>
        </div>
      )}
    </div>
  );
}
