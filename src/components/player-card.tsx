import { Player } from "~/lib/db";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { PenaltyBadge } from "./penalty-badge";

interface PlayerCardProps {
  player: Player;
  children?: React.ReactNode;
}

export function PlayerCard({ player, children }: PlayerCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex flex-col">
          <span className="text-lg font-medium">{player.name}</span>
          <div className="flex flex-wrap gap-1">
            <Badge className="mt-1" variant="outline">
              {player.cardType}
            </Badge>
            <PenaltyBadge player={player} />
          </div>
        </div>
        <div>{children}</div>
      </CardContent>
    </Card>
  );
}
