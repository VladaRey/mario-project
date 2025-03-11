import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import { Menu } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="mb-2 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mario Group</h1>
        <Button
          variant="ghost"
          className="sm:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="hidden space-x-4 sm:flex">
          <Button asChild variant="ghost">
            <Link href="/admin/players">Players</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/admin/reservations">Reservations</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/admin/">Event</Link>
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="mt-4 flex flex-col space-y-2 sm:hidden">
          <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
            <Link href="/admin/players">Players</Link>
          </Button>
          <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
            <Link href="/admin/reservations">Reservations</Link>
          </Button>
          <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
            <Link href="/admin/">Event</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
