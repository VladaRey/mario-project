import { getCardVariant } from "~/lib/color-util";
import { Button } from "./ui/button";
import { Users } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Event } from "~/lib/db";

interface EventCardProps {
  event: Event;
  withBackground?: boolean;
  index: number;
  basePath: string;
  type?: "admin" | "dashboard";
}

export function EventCard({ event, withBackground, index, basePath, type }: EventCardProps) {
  return (
    <div>
      <Card
        key={event.id}
        className={withBackground ? getCardVariant(index) : "bg-transparent"}
      >
        <CardContent className="flex flex-col items-start gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
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
    </div>
  );
}

