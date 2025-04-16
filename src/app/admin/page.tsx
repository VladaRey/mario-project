"use client";

import { useRouter } from "next/navigation";
import { withAdminLayout } from "~/components/with-admin-layout";
import { EventsList } from "~/components/events-list";
import { Button } from "~/components/ui/button";

const AdminPage = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button onClick={() => router.push("/admin/event")}>
          Create New Event
        </Button>
      </div>
      <EventsList basePath="/admin/event" />
    </div>
  );
};

export default withAdminLayout(AdminPage);
