"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EventForm } from "~/components/event-form";
import { eventOperations, type Event } from "~/lib/db";
import { withAdminLayout } from "~/components/with-admin-layout";

const EditEventPage = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const loadEventById = async () => {
      if (id) {
        try {
          const currentEvent = await eventOperations.getEvent(id);
          setEvent(currentEvent);
        } catch (error) {
          console.error("Failed to load event:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadEventById();
  }, [id]);

  if (isLoading) {
    return <div>Loading event...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const handleSaveEvent = async (updatedEvent: {
    id: string;
    name: string;
    date: string;
    players: string[];
  }) => {
    try {
      await eventOperations.updateEvent(
        updatedEvent.id,
        updatedEvent.name,
        updatedEvent.date,
        updatedEvent.players,
      );
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Edit Event 
      </h1>
      <EventForm initialEvent={event} onSave={handleSaveEvent} mode="edit" />
    </div>
  );
}

export default withAdminLayout(EditEventPage);
