"use client"
import { EventsList } from "~/components/events-list";
import { Navbar } from "~/components/navbar";

export default function HomePage() {

  return (
    <div className="space-y-8 p-4 mx-auto">
      <Navbar title="Events" />
      <EventsList basePath="/event" withBackground type="dashboard" />
    </div>
  );
}
