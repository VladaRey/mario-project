"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { EventsList } from "~/components/events-list";
import { Button } from "~/components/ui/button";
import { UserRound } from "lucide-react";
import { useGetRole } from "~/hooks/use-get-role";

export default function HomePage() {
  const [buttonLabel, setButtonLabel] = useState("Login");
  const [buttonHref, setButtonHref] = useState("/login");

  const role = useGetRole();

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
      <div className="rounded-lg bg-gradient-to-r from-[#2E2A5D] to-[#7B3C7D] p-6 text-white shadow-lg flex justify-between sm:items-center">
        <h1 className="mb-2 text-3xl font-bold sm:mb-0 sm:text-4xl">Events</h1>       
          <Button variant="outline" 
          className="px-4 py-2 rounded-full transition-colors bg-white text-purple-800 hover:bg-purple-100" 
          disabled={buttonLabel  === "Fame"}>
          <Link href={buttonHref} className="flex items-center">
            {buttonLabel === "Admin" ? <UserRound className="mr-2 h-4 w-4"/> : null}
            <span className="text-base font-medium">{buttonLabel}</span>
          </Link>
          </Button>           
      </div>
      <EventsList basePath="/event" withBackground type="dashboard"/>
    </div>
  );
}
