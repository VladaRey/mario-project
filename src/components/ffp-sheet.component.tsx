import { Calculator } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { FfpForm } from "./ffp-form.component";
import { useCallback, useState } from "react";
import { eventOperations } from "../lib/db";
import { type Statistics } from "~/services/calculation-service";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const FAME_PASSWORD = process.env.NEXT_PUBLIC_FAME_PASSWORD;

interface FfpSheetProps {
  mc: number;
  ms: number;
  msc: number;
  nc: number;
  onRefresh: () => void;
  eventId: string;
}

export function FfpSheet({ mc, ms, msc, nc, onRefresh, eventId }: FfpSheetProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [calculatedStats, setCalculatedStats] = useState<Statistics | null>(
    null,
  );

  const handleCalculation = useCallback((stats: Statistics) => {
    setCalculatedStats(stats);
  }, []);

  const handleApply = async () => {
    const userPassword = prompt("Please enter admin/fame password:");
    if (userPassword === ADMIN_PASSWORD || userPassword === FAME_PASSWORD) {
      setIsAuthenticated(true);

      if (!calculatedStats) {
        alert("Please calculate the amounts first");
        return;
      }

      try {
        const paymentUpdates = {
          Medicover: calculatedStats.medicover,
          Multisport: calculatedStats.MS,
          Classic: calculatedStats.msClassic,
          "No card": calculatedStats.noMs,
        };

        await Promise.all(
          Object.entries(paymentUpdates).map(([cardType, amount]) =>
            eventOperations.updatePlayerPaymentAmount(eventId, cardType, Number(amount || 0)),
          ),
        );

        onRefresh();
        alert("Amounts updated successfully!");
      } catch (error) {
        console.error("Error updating amounts:", error);
        alert("Failed to update amounts.");
      }
    } else {
      alert("Invalid password");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full bg-white text-[#2E2A5D] transition-colors duration-200 hover:bg-gray-100 sm:w-fit">
          <Calculator className="mr-2 h-4 w-4" />
          Calculate
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="pb-8">
          <SheetTitle className="hidden">Calculate payment amounts</SheetTitle>
        </SheetHeader>
        <SheetDescription className="hidden">Apply payment amounts</SheetDescription>
        <FfpForm mc={mc} ms={ms} msc={msc} nc={nc} onCalculate={handleCalculation} theme="light"/>
        <SheetFooter className="pt-4">
          <Button className="w-full" onClick={handleApply}>Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
