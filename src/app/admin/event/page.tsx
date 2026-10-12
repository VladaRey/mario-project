"use client";

import { EventForm } from "~/components/event-form";
import { eventOperations } from "~/lib/db";
import { withAdminLayout } from "~/components/with-admin-layout";
import { ScreenHeader } from "~/components/shell/screen-header";
import { PageBody } from "~/components/ds/page-body";
import { useT } from "~/i18n/i18n-provider";

function CreateEventPage() {
  const t = useT();
  const handleCreateEvent = async (event: { name: string; date: string; players: string[] }) => {
    await eventOperations.addEvent(event.name, event.date, event.players);
  };
  return (
    <>
      <ScreenHeader title={t("eventForm.createTitle")} adminSection="events" back={{ href: "/admin/events", label: t("admin.events") }}
        crumbs={[{ label: t("hub.title"), href: "/admin" }, { label: t("admin.events"), href: "/admin/events" }, { label: t("eventForm.createTitle") }]} />
      <PageBody><EventForm onSave={handleCreateEvent} mode="create" /></PageBody>
    </>
  );
}

export default withAdminLayout(CreateEventPage);
