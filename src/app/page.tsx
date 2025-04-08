import { EventsList } from "~/components/events-list";

export default function HomePage() {
  return (
    <div className="container mx-auto space-y-8 p-4">
      <div className="rounded-lg bg-gradient-to-r from-[#2E2A5D] to-[#7B3C7D] p-6 text-white shadow-lg">
        <h1 className="mb-2 text-3xl font-bold sm:mb-0 sm:text-4xl">Events</h1>
      </div>
      <EventsList basePath="/event" withBackground />
    </div>
  );
}
