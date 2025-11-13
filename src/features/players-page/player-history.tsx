import { useMemo, useState } from "react";
import { format } from "date-fns";

import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { CalendarIcon } from "lucide-react";
import PlayerActivityCalendarComponent from "~/components/player-activity-calendar.component";

import { filterDatesByRange } from "~/utils/playerHistory";
import { LotteryResults } from "~/hooks/use-get-player-data";
import { Player } from "~/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { getPlayerCards, type PlayerCard } from "~/utils/playerCards";

interface PlayerHistoryProps {
  playerEventDates: string[];
  lotteryResults: LotteryResults;
  player: Player;
}

export default function PlayerHistory({
  playerEventDates,
  lotteryResults,
  player,
}: PlayerHistoryProps) {
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});

  const filteredDates = useMemo(
    () => filterDatesByRange(playerEventDates, range),
    [playerEventDates, range],
  );

  const filteredWins = filterDatesByRange(
    lotteryResults.wins.map((w) => w.date),
    range,
  );
  const filteredPlayed = filterDatesByRange(
    lotteryResults.played.map((p) => p.date),
    range,
  );

  const { statisticsCards } = getPlayerCards(
    player,
    filteredDates,
    filteredWins.length,
    filteredPlayed.length,
  );

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold">Playing history</h2>
      {playerEventDates.length > 0 && (
        <div className="mb-3 max-w-fit">
          <div className="flex flex-col gap-2 md:flex-row">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={
                    "flex w-full justify-start pl-3 text-base font-normal text-slate-900"
                  }
                >
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                  {range.from && range.to ? (
                    <span>
                      {format(range.from, "dd/MM/yyyy")} —{" "}
                      {format(range.to, "dd/MM/yyyy")}
                    </span>
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={{ from: range.from, to: range.to }}
                  onSelect={(range) =>
                    setRange({ from: range?.from, to: range?.to })
                  }
                />
              </PopoverContent>
            </Popover>
            {range.from && range.to && (
              <Button
                onClick={() => setRange({ from: undefined, to: undefined })}
              >
                Clear date range
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mb-3">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statisticsCards.map((card: PlayerCard) => (
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

      <div className="max-w-fit rounded-lg border border-gray-200 py-4 px-6 shadow-md">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Calendar showing player activity.
          </p>
        </div>
        <PlayerActivityCalendarComponent playerEventDates={filteredDates} />
      </div>
    </div>
  );
}