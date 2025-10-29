import { ActivityCalendar } from "react-activity-calendar";
import { format } from "date-fns";
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
  const data = useMemo(
    () => buildActivityData(playerEventDates || []),
    [playerEventDates],
  );

  // Show empty state if no data (library requires non-empty data)
  if (!data.length) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No activity recorded 
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative [&_[role='tooltip']]:rounded [&_[role='tooltip']]:bg-[#7B3C7D] [&_[role='tooltip']]:px-2 [&_[role='tooltip']]:py-1 [&_[role='tooltip']]:text-sm [&_[role='tooltip']]:text-white">
        <ActivityCalendar
          data={data}
          theme={{
            light: ["#E5E7EB", "#E0C2E2", "#C586D0", "#9F4AA3", "#7B3C7D"],
            dark: ["#161b22", "#B78DC1", "#9C65AA", "#854B8D", "#6B3075"],
          }}
          labels={{
            legend: {
              less: "No events",
              more: "More events",
            },
            months: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          }}
          showWeekdayLabels={true}
          renderBlock={(block, activity) =>
            React.cloneElement(block, {
              "data-tooltip-id": "react-tooltip",
              "data-tooltip-html": `${activity.count} event(s) on ${format(new Date(activity.date), "MMMM d, yyyy")}`,
            })
          }
          blockSize={14}
        />
        <ReactTooltip id="react-tooltip" />
      </div>
    </div>
  );
}
