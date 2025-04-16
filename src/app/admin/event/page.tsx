"use client";

import { EventForm } from "~/components/event-form";
import { eventOperations } from "~/lib/db";
import { withAdminLayout } from "~/components/with-admin-layout";

const CreateEventPage = () => {
  const handleCreateEvent = async (event: { name: string; date: string; players: string[] }) => {
    await eventOperations.addEvent(event.name, event.date, event.players);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Create New Event
      </h1>
      <EventForm onSave={handleCreateEvent} mode="create" />
    </div>
  );
}

export default withAdminLayout(CreateEventPage);

