import { Badge } from "./ui/badge";
import type { Player } from "../lib/db";

interface PlayerCardProps {
  player: Player;
  children?: React.ReactNode;
}

export function PlayerCard({ player, children }: PlayerCardProps) {
  return (
    <>
      <div className="flex flex-col">
        <span className="text-lg font-medium">{player.name}</span>
        <Badge className="mt-1" variant="outline">
          {player.cardType}
        </Badge>
      </div>
      {children}
    </>
  );
}
