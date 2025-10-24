"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { EventsList } from "~/components/events-list";
import { Button } from "~/components/ui/button";
import { UserRound, Calculator, Users } from "lucide-react";
import { useGetRole } from "~/hooks/use-get-role";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { FfpForm } from "~/components/ffp-form.component";

export default function HomePage() {
  const [buttonLabel, setButtonLabel] = useState("Login");
  const [buttonHref, setButtonHref] = useState("/login");

  const { role } = useGetRole();

  useEffect(() => {
    if (role === "admin") {
      setButtonLabel("Admin");
      setButtonHref("/admin");
    } else if (role === "fame") {
      setButtonLabel("Fame");
    } else {
      setButtonLabel("Login");
      setButtonHref("/login");
    }
  }, [role]);

  return (
    <div className="container mx-auto space-y-8 p-4">
      <div className="flex flex-col md:flex-row justify-between rounded-lg bg-gradient-to-r from-[#2E2A5D] to-[#7B3C7D] p-6 text-white shadow-lg sm:items-center">
        <h1 className="mb-2 text-3xl font-bold sm:mb-0 sm:text-4xl">Events</h1>
        <div className="flex gap-2">
          <Link href="/players">
            <Button
              variant="outline"
              className="rounded-full w-full sm:w-fit bg-white px-4 py-2 text-purple-800 transition-colors hover:bg-purple-100"
            >
              <Users className="h-4 w-4" />
              <span className="text-base font-medium">Players</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-full w-full sm:w-fit bg-white px-4 py-2 text-purple-800 transition-colors hover:bg-purple-100"
            disabled={buttonLabel === "Fame"}
          >
            <Link href={buttonHref} className="flex items-center">
              {buttonLabel === "Admin" ? (
                <UserRound className="mr-2 h-4 w-4" />
              ) : null}
              <span className="text-base font-medium">{buttonLabel}</span>
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full w-full sm:w-fit bg-white px-4 py-2 text-purple-800 transition-colors hover:bg-purple-100"
          >
              <Calculator className="h-4 w-4" />
              <span className="text-base font-medium">FFP</span>
          </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full pt-10">
              <SheetTitle className="hidden">FFP</SheetTitle>
              <SheetDescription className="hidden">Calculate payment amounts</SheetDescription>
              <FfpForm />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <EventsList basePath="/event" withBackground type="dashboard" />
    </div>
  );
}
