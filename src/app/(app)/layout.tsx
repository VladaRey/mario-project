"use client";
import { Navbar } from "~/components/navbar";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main className="p-4">
        {children}
      </main>
    </div>
  );
}