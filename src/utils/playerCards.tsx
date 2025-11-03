import { Player } from "~/lib/db";
import { format } from "date-fns";
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

export function getPlayerCards(
  player: Player,
  playerEventDates: string[],
  wins: number,
  played: number,
): { infoCards: PlayerCard[]; statisticsCards: PlayerCard[] } {
  const lotteryResults = `${wins} / ${played}`;
  const totalEvents = playerEventDates.length;

  const infoCards: PlayerCard[] = [
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
      value: format(new Date(player.created_at), "MMM d, yyyy"),
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    },
  ].filter(Boolean) as PlayerCard[];

  const statisticsCards: PlayerCard[] = [
    {
      title: "Total events",
      value: totalEvents,
      icon: <FlagTriangleRight className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Wins / attempts lottery",
      value: lotteryResults,
      icon: <Dices className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return { infoCards, statisticsCards };
}