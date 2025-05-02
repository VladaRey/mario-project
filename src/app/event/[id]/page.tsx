"use client";

import { Inter } from "next/font/google";
import { EventBreadcrumbs } from "~/components/event-breadcrumbs.component";
import { CurrentEvent } from "~/features/current-event/current-event.component";
import { useParams } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function EventPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto space-y-4 p-4">
      <EventBreadcrumbs />
      <CurrentEvent id={id}/>     
    </div>
  );
}
