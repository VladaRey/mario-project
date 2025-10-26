import { Player } from "~/lib/db";
import {
  Calendar,
  CreditCard,
  User,
  Dices,
  FlagTriangleRight,
} from "lucide-react";

export interface PlayerCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export function getPlayerCards(player: Player, playerEventDates: string[], wins: number, losses: number): PlayerCard[] {
  const lotteryResults = `${wins} / ${losses}`;
  const totalEvents = playerEventDates.length;
  
  return [
    {
      title: "Name",
      value: player.name,
      icon: <User className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Card Type",
      value: player.cardType,
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
    },
    player.created_at && {
      title: "Created",
      value: new Date(player.created_at).toLocaleDateString(),
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Total events",
      value: totalEvents,
      icon: <FlagTriangleRight className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Count of playing / winning lottery",
      value: lotteryResults,
      icon: <Dices className="h-4 w-4 text-muted-foreground" />,
    },
  ].filter(Boolean) as PlayerCard[];
}
    