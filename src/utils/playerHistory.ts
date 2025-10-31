import { format } from "date-fns";


export function filterDatesByRange(
  dates: string[],
  range: { from?: Date; to?: Date },
) {
  if (!range.from && !range.to) return dates;

  return dates.filter((dateStr) => {
    const date = new Date(dateStr).setHours(0, 0, 0, 0);
    const from = range.from ? range.from.setHours(0, 0, 0, 0) : undefined;
    const to = range.to ? range.to.setHours(0, 0, 0, 0) : undefined;

    if (from && to) return date >= from && date <= to;
    return true;
  });
}

export function buildActivityData(playerEventDates: string[]) {
  // Group player events by date
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
}
