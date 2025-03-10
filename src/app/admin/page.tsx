"use client";

import { useState, useEffect } from "react";
import { EventForm } from "~/components/event-form";
import { useRouter } from "next/navigation";
import { withAdminLayout } from "~/components/with-admin-layout";
import {
  eventOperations,
  playerOperations,
  reservationOperations,
  type Event,
} from "~/lib/db";

export function AdminPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadInitialEvent = async () => {
      try {
        const lastEvent = await eventOperations.getLastEvent();
        setEvent(
          lastEvent || { id: "", name: "", players: [], created_at: "" },
        );
      } catch (error) {
        console.error("Failed to load event:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialEvent();
  }, []);

  const handleSaveEvent = async (updatedEvent: {
    name: string;
    players: string[];
  }) => {
    try {
      if (event?.id) {
        await eventOperations.updateEvent(
          event.id,
          updatedEvent.name,
          updatedEvent.players,
        );
      } else {
        await eventOperations.addEvent(updatedEvent.name, updatedEvent.players);
      }
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {event?.name ? "Edit Event" : "Create Event"}
      </h1>
      <EventForm initialEvent={event || undefined} onSave={handleSaveEvent} />
    </div>
  );
}

export default withAdminLayout(AdminPage);
