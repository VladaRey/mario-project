"use client";
import { EventsList } from "~/components/events-list";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { FfpForm } from "~/components/ffp-form.component";
import { Button } from "~/components/ui/button";
import { Calculator } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-4 px-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Events</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-fit rounded-lg bg-[#7B3C7D] px-4 py-2 text-white transition-colors hover:bg-[#2E2A5D] hover:text-white"
            >
              <Calculator className="h-4 w-4" />
              <span className="text-base font-medium">FFP</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto pt-10">
            <SheetTitle className="hidden">FFP</SheetTitle>
            <SheetDescription className="hidden">
              Calculate payment amounts
            </SheetDescription>
            <FfpForm />
          </SheetContent>
        </Sheet>
      </div>

      <EventsList basePath="/event" withBackground type="dashboard" />
    </div>
  );
}
