"use client";

import { CurrentEvent } from "~/features/current-event/current-event.component";
import { useParams } from "next/navigation";

export default function EventPage() {
  const params = useParams();
  const id = params.id as string;

  return <CurrentEvent id={id} />;
}
