"use client"

import { eventOperations, type Event } from "~/lib/db";
import { useEffect, useState } from 'react';
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Users } from "lucide-react";

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

  const cardVariants = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-yellow-100 text-yellow-800",
    "bg-orange-100 text-slate-800",
  ];

  const formatDate = (date: string) => format(new Date(date), "dd MMMM, yyyy");

  return (
    <div>
      {sortedDates.map((date) => (
        <div key={date} className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">{formatDate(date)}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupedEvents[date]?.map((event, index) => (
              <Card
                key={event.id}
                className={
                  withBackground
                    ? cardVariants[index % cardVariants.length]
                    : "bg-transparent"
                }
              >
                <CardContent className="flex flex-col items-start gap-2 md:items-center md:justify-between p-4 md:flex-row">
                  <div className="flex flex-col">
                    <div className="text-lg font-medium">{event.name}</div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="mr-2 h-4 w-4" />
                      {event.players?.length ?? 0} players
                    </div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <div>
                      <Link href={`${basePath}/${event.id}`}>
                        <Button variant={"outline"}>
                          <span className="text-base font-medium">
                            {type === "admin" ? "Edit" : "View"}
                          </span>
                        </Button>
                      </Link>
                    </div>
                    <div>
                      <Link href={`/event/${event?.id}/lottery`}>
                        <Button variant={"outline"}>
                          <span className="text-base font-medium">Lottery</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
