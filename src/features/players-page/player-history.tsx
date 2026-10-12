"use client";
import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import PlayerActivityCalendarComponent from "~/components/player-activity-calendar.component";
import { StatTile } from "~/components/ds/stat-tile";
import { SectionLabel } from "~/components/ds/section-label";
import { filterDatesByRange } from "~/utils/playerHistory";
import { LotteryResults } from "~/hooks/use-get-player-data";
import { Player } from "~/lib/db";
import { enGB, pl } from "date-fns/locale";
import { useI18n } from "~/i18n/i18n-provider";

interface PlayerHistoryProps {
  playerEventDates: string[];
  lotteryResults: LotteryResults;
  player: Player;
}

export default function PlayerHistory({ playerEventDates, lotteryResults }: PlayerHistoryProps) {
  const { t, fmt, locale } = useI18n();
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});

  const filteredDates = useMemo(() => filterDatesByRange(playerEventDates, range), [playerEventDates, range]);
  const filteredWins = filterDatesByRange(lotteryResults.wins.map((w) => w.date), range);
  const filteredPlayed = filterDatesByRange(lotteryResults.played.map((p) => p.date), range);
  const hasRange = Boolean(range.from && range.to);

  return (
    <div className="space-y-3 md:space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label={t("profile.eventsPlayed")} value={filteredDates.length} />
        <StatTile label={t("profile.lottery")} value={`${filteredWins.length}`} sub={`/ ${filteredPlayed.length}`} />
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <SectionLabel>{t("profile.activity")}</SectionLabel>
          {playerEventDates.length > 0 && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 opacity-60" aria-hidden="true" />
                    {hasRange ? `${fmt(range.from!, "dd.MM.yyyy")} — ${fmt(range.to!, "dd.MM.yyyy")}` : t("profile.allTime")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0">
                  <Calendar
                    mode="range"
                    locale={locale === "pl" ? pl : enGB}
                    selected={{ from: range.from, to: range.to }}
                    onSelect={(r) => setRange({ from: r?.from, to: r?.to })}
                  />
                </PopoverContent>
              </Popover>
              {hasRange && (
                <Button variant="outline" size="sm" onClick={() => setRange({ from: undefined, to: undefined })}>
                  {t("profile.clearRange")}
                </Button>
              )}
            </div>
          )}
        </div>
        <PlayerActivityCalendarComponent playerEventDates={filteredDates} />
      </div>
    </div>
  );
}
