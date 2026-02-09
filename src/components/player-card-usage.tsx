"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";

const MAX_USAGE = 10;

interface PlayerCardUsageProps {
  usage: number;
  playerId: string;
  onUsageChange: (playerId: string, usage: number) => void;
}

export function PlayerCardUsage({
  usage,
  playerId,
  onUsageChange,
}: PlayerCardUsageProps) {
  const { role } = useGetRole();
  const canEdit = role === Role.Admin || role === Role.Fame;

  return (
    <div className="mt-2 flex flex-col md:flex-row items-center text-center gap-1">
      <span className="text-sm font-medium text-gray-500">Card usage:</span>
      <div className="flex items-center gap-1">
        {canEdit ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
              onClick={() =>
                onUsageChange(playerId, Math.max(0, usage - 1))
              }
              disabled={usage <= 0}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-5 text-center font-semibold text-foreground">
              {usage}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
              onClick={() =>
                onUsageChange(playerId, Math.min(MAX_USAGE, usage + 1))
              }
              disabled={usage >= MAX_USAGE}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <span className="text-sm font-bold">{usage}</span>
        )}
      </div>
    </div>
  );
}
