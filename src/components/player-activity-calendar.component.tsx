import { ActivityCalendar } from "react-activity-calendar";
import { useI18n } from "~/i18n/i18n-provider";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import React, { useMemo } from "react";
import { buildActivityData } from "~/utils/playerHistory";

interface PlayerActivityCalendarComponentProps {
  playerEventDates: string[];
}

export default function PlayerActivityCalendarComponent({
  playerEventDates,
}: PlayerActivityCalendarComponentProps) {
  const { t, fmt } = useI18n();
  const data = useMemo(
    () => buildActivityData(playerEventDates || []),
    [playerEventDates],
  );

  // Show empty state if no data (library requires non-empty data)
  if (!data.length) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-line bg-white">
        <p className="text-sm text-muted-foreground">
          {t("profile.noActivity")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative [&_[role='tooltip']]:rounded [&_[role='tooltip']]:bg-[#3B1F6E] [&_[role='tooltip']]:px-2 [&_[role='tooltip']]:py-1 [&_[role='tooltip']]:text-sm [&_[role='tooltip']]:text-white">
        <ActivityCalendar
          data={data}
          colorScheme="light"
          theme={{
            light: ["#ECE7F6", "#C9B3EA", "#8A5CC4", "#5B2D8C", "#3B1F6E"],
            dark: ["#ECE7F6", "#C9B3EA", "#8A5CC4", "#5B2D8C", "#3B1F6E"],
          }}
          labels={{
            totalCount: t("profile.totalCount"),
            legend: {
              less: t("profile.less"),
              more: t("profile.more"),
            },
            months: Array.from({ length: 12 }, (_, m) => fmt(new Date(2026, m, 1), "LLL")),
            // 1 Feb 2026 is a Sunday; the calendar expects Sunday-first
            weekdays: Array.from({ length: 7 }, (_, d) => fmt(new Date(2026, 1, d + 1), "EEEEEE")),
          }}
          showWeekdayLabels={true}
          renderBlock={(block, activity) =>
            React.cloneElement(block, {
              "data-tooltip-id": "react-tooltip",
              "data-tooltip-html": t("profile.tooltip", { count: activity.count, date: fmt(new Date(activity.date), "d MMMM yyyy") }),
            })
          }
          blockSize={14}
        />
        <ReactTooltip id="react-tooltip" />
      </div>
    </div>
  );
}
