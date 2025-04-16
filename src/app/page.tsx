"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { EventsList } from "~/components/events-list";
import { Button } from "~/components/ui/button";
import { UserRound } from "lucide-react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
   useEffect(() => {
     const adminPassword = localStorage.getItem("admin-password");
     if (adminPassword === ADMIN_PASSWORD) {
       setIsAuthenticated(true);
     }
   }, []);

  return (
    <div className="container mx-auto space-y-8 p-4">
      <div className="rounded-lg bg-gradient-to-r from-[#2E2A5D] to-[#7B3C7D] p-6 text-white shadow-lg flex justify-between sm:items-center">
        <h1 className="mb-2 text-3xl font-bold sm:mb-0 sm:text-4xl">Events</h1>       
          <Button variant="outline" 
          className="px-4 py-2 rounded-full transition-colors bg-white text-purple-800 hover:bg-purple-100" 
          disabled={!isAuthenticated}>
          <Link href="/admin" className="flex items-center">
            <UserRound className="mr-2 h-4 w-4"/>
            <span className="text-base font-medium">Admin</span>
          </Link>
          </Button>           
      </div>
      <EventsList basePath="/event" withBackground />
    </div>
  );
}
