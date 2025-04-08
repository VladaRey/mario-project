"use client"

import { eventOperations, type Event } from "~/lib/db";
import { useEffect, useState } from 'react';
import { Card, CardContent } from "./ui/card";
import Link from "next/link";

interface EventsListProps {
  basePath: string;
  withBackground?: boolean;
}

export function EventsList({ basePath, withBackground }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const refreshEvents = async () => {
    const allEvents = await eventOperations.getAllEvents();
    setEvents(allEvents);
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  const cardVariants = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-yellow-100 text-yellow-800",
    "bg-orange-100 text-slate-800",
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => (
        <Card key={event.id} className={withBackground ? cardVariants[index % cardVariants.length] : "bg-transparent"}>
          <Link href={`${basePath}/${event.id}`}>
            <CardContent className="flex flex-col p-4">
              <div className="text-lg font-medium">{event.name}</div>
              <div className="text-sm text-gray-500">
                {event.players?.length ?? 0} players
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
