"use client"

import { eventOperations, type Event } from "~/lib/db";
import { useEffect, useState } from 'react';
import { format } from "date-fns";
import { EventCard } from "./event-card";

interface EventsListProps {
  basePath: string;
  withBackground?: boolean;
  type?: "admin" | "dashboard";
}

export function EventsList({ basePath, withBackground, type }: EventsListProps) {
  const [groupedEvents, setGroupedEvents] = useState<Record<string, Event[]>>(
    {},
  );

  const refreshEvents = async () => {
    const allGroupedEvents = await eventOperations.getAllEvents();
    setGroupedEvents(allGroupedEvents);
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  const formatDate = (date: string) => format(new Date(date), "dd MMMM, yyyy");

  return (
    <div>
      {sortedDates.map((date) => (
        <div key={date} className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">{formatDate(date)}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupedEvents[date]?.map((event, index) => (
              <div key={event.id}>
                <EventCard event={event} withBackground={withBackground} index={index} basePath={basePath} type={type} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
