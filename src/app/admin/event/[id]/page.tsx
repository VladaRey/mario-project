"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EventForm } from "~/components/event-form";
import { eventOperations, type Event } from "~/lib/db";
import { withAdminLayout } from "~/components/with-admin-layout";
import { ScreenHeader } from "~/components/shell/screen-header";
import { PageBody } from "~/components/ds/page-body";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { EmptyState } from "~/components/ds/empty-state";
import { useT } from "~/i18n/i18n-provider";

const EditEventPage = () => {
  const t = useT();
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
    return <PageBody><SkeletonRows count={6} /></PageBody>;
  }

  if (!event) {
    return <PageBody><EmptyState title={t("eventForm.notFound")} /></PageBody>;
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
      throw error;
    }
  };

  return (
    <>
      <ScreenHeader title={t("eventForm.editTitle")} meta={event.name} adminSection="events" back={{ href: "/admin/events", label: t("admin.events") }}
        crumbs={[{ label: t("hub.title"), href: "/admin" }, { label: t("admin.events"), href: "/admin/events" }, { label: event.name }]} />
      <PageBody><EventForm initialEvent={event} onSave={handleSaveEvent} mode="edit" /></PageBody>
    </>
  );
}

export default withAdminLayout(EditEventPage);
