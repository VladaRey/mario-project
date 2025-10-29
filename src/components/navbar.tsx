import Link from "next/link";
import { Button } from "~/components/ui/button";
import { UserRound, Calculator, Users } from "lucide-react";
import { useGetRole } from "~/hooks/use-get-role";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { FfpForm } from "~/components/ffp-form.component";
import { useState } from "react";
import { useEffect } from "react";

interface NavbarProps {
  title: string;
  children?: React.ReactNode;
}


export function Navbar({ title, children }: NavbarProps) {
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
    <div className="flex flex-col gap-2 rounded-lg bg-gradient-to-r from-[#2E2A5D] to-[#7B3C7D] p-6 text-white shadow-lg md:flex-row md:justify-between">
      <Link href="/">
        <h1 className="mb-2 text-3xl font-bold sm:mb-0 sm:text-4xl">
          Mario Group
        </h1>
      </Link>
      <div className="flex flex-wrap gap-2 md:flex-nowrap">
        <Link href="/players">
          <Button
            variant="outline"
            className="w-full rounded-full bg-white px-4 py-2 text-purple-800 transition-colors hover:bg-purple-100 sm:w-fit"
          >
            <Users className="h-4 w-4" />
            <span className="text-base font-medium">Players</span>
          </Button>
        </Link>
        
        {children ? children : (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-fit rounded-full bg-white px-4 py-2 text-purple-800 transition-colors hover:bg-purple-100 md:w-full"
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
        )}
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