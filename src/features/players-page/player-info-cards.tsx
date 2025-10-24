import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Player } from "~/lib/db";
import { getPlayerCards, type PlayerCard } from "~/utils/playerCards";

interface PlayerInfoCardsProps {
  player: Player;
  playerEventDates: string[];
}

export default function PlayerInfoCards({
  player,
  playerEventDates,
}: PlayerInfoCardsProps) {
  const cards = getPlayerCards(player, playerEventDates);

  return (
    <div className="p-2">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card: PlayerCard) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
