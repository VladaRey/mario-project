import { Badge } from "./ui/badge";
import { isPenalized } from "~/utils/penalty-util";
import type { Player } from "~/lib/db";

export function PenaltyBadge({ player }: { player: Pick<Player, "penalty_since"> }) {
  if (!isPenalized(player)) return null;
  return (
    <Badge variant="destructive" className="mt-1">
      Penalty
    </Badge>
  );
}
