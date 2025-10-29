"use client"
import { EventsList } from "~/components/events-list";
import { Navbar } from "~/components/navbar";

export default function HomePage() {

  return (
    <div className="mx-auto space-y-6 p-4">
      <div className="space-y-3">
        <Navbar title="Events" />
        <h2 className="text-2xl font-bold">All events</h2>
      </div>
      <EventsList basePath="/event" withBackground type="dashboard" />
    </div>
  );
}
