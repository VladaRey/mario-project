import PlayerActivityCalendarComponent from "~/components/player-activity-calendar.component";

interface PlayerHistoryProps {
  playerEventDates: string[];
}

export default function PlayerHistory({ playerEventDates }: PlayerHistoryProps) {
    return (
    <div className="p-2">
      <h2 className="mb-3 text-2xl font-semibold">Playing history</h2>
      <div className="max-w-fit rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Calendar showing player activity.
          </p>
        </div>
        <PlayerActivityCalendarComponent playerEventDates={playerEventDates} />
      </div>
    </div>
  );
}