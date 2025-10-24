import { ActivityCalendar } from "react-activity-calendar";
import { format } from "date-fns";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import React, { useMemo} from "react";

interface PlayerActivityCalendarComponentProps {
  playerEventDates: string[];
}

export default function PlayerActivityCalendarComponent({
  playerEventDates,
}: PlayerActivityCalendarComponentProps) {
  // If no dates provided, show empty calendar
  if (!playerEventDates?.length) {
    return null;
  }

  // Convert dates to activity data
  const data = useMemo(() => {
    const grouped = playerEventDates.reduce<Record<string, number>>(
      (acc, date) => {
        const key = format(new Date(date), "yyyy-MM-dd");
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {},
    );

    return Object.entries(grouped)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, count]) => ({
        date,
        count,
        level: Math.min(count, 4),
        title: `${count} event(s) — ${format(new Date(date), "MMMM d, yyyy")}`,
      }));
  }, [playerEventDates]);

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
