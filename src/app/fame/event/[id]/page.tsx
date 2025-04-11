"use client";

import { Inter } from "next/font/google";
import { EventBreadcrumbs } from "~/components/event-breadcrumbs.component";
import { withFameAuth } from "~/components/with-fame-auth";
import { CurrentEvent } from "~/components/current-event.component";
import { useParams } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const FameEventPage = () => {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto space-y-4 p-4">
      <EventBreadcrumbs />
      <CurrentEvent type="fame" id={id} />
    </div>
  );
}

export default withFameAuth(FameEventPage);
