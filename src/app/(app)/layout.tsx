"use client";
import { Toaster } from "sonner";
import { Navbar } from "~/components/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main className="p-4">
        {children}
      </main>
      <Toaster position="top-center" />
    </div>
  );
}