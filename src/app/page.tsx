"use client"
import { EventsList } from "~/components/events-list";
import { Navbar } from "~/components/navbar";

export default function HomePage() {

  return (
    <div className="mx-auto space-y-4 p-4">
      <div className="space-y-4">
        <Navbar title="Events" />
        <h2 className="text-2xl font-bold">Events</h2>
      </div>
      <EventsList basePath="/event" withBackground type="dashboard" />
    </div>
  );
}
