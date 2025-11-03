import Link from "next/link";
import { Button } from "~/components/ui/button";
import { UserRound, Users } from "lucide-react";
import { useGetRole } from "~/hooks/use-get-role";
import { useState } from "react";
import { useEffect } from "react";
import { Menu } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="flex flex-col sm:flex-row justify-between bg-gradient-to-r from-[#2E2A5D] to-[#7B3C7D] p-6 text-white shadow-lg">
      <div className="flex justify-between items-center">
        <Link href="/">
          <h1 className="text-3xl font-bold md:text-4xl">Mario Group</h1>
        </Link>
        <Button
          variant="ghost"
          className="hover:bg-transparent hover:text-white sm:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {isMenuOpen && (
        <div className="mt-4 flex flex-col space-y-2 sm:hidden">
          <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
            <Link href="/players">Players</Link>
          </Button>
          <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
            <Link href="/admin">Admin</Link>
          </Button>
        </div>
      )}

      <div className="hidden flex-wrap gap-2 sm:flex md:flex-nowrap">
        <Link href="/players">
          <Button
            variant="outline"
            className="w-full rounded-full bg-white px-4 py-2 text-purple-800 transition-colors hover:bg-purple-100 sm:w-fit"
          >
            <Users className="h-4 w-4" />
            <span className="text-base font-medium">Players</span>
          </Button>
        </Link>

        <Button
          variant="outline"
          className="w-fit rounded-full bg-white px-4 py-2 text-purple-800 transition-colors hover:bg-purple-100 md:w-full"
          disabled={buttonLabel === "Fame"}
        >
          <Link href={buttonHref} className="flex items-center">
            {buttonLabel === "Admin" ? (
              <UserRound className="mr-2 h-4 w-4" />
            ) : null}
            <span className="text-base font-medium">{buttonLabel}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
