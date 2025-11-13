import { Calculator, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
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
import { useGetRole } from "~/hooks/use-get-role";


interface FfpSheetProps {
  ml: number;
  mc: number;
  ms: number;
  msc: number;
  nc: number;
  onRefresh: () => void;
  eventId: string;
}

export function FfpSheet({ ml, mc, ms, msc, nc, onRefresh, eventId }: FfpSheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { role } = useGetRole();
  const [calculatedStats, setCalculatedStats] = useState<Statistics | null>(
    null,
  );

  const handleCalculation = useCallback((stats: Statistics) => {
    setCalculatedStats(stats);
  }, []);

  const handleApply = async () => {
    if (!calculatedStats) {
      toast.error("Please calculate the amounts first");
      return;
    }

    setLoading(true);
    try {
      const paymentUpdates = {
        "Medicover Light": calculatedStats.medicoverLight,
        Medicover: calculatedStats.medicover,
        Multisport: calculatedStats.MS,
        Classic: calculatedStats.msClassic,
        "No card": calculatedStats.noMs,
      };

      await Promise.all(
        Object.entries(paymentUpdates).map(([cardType, amount]) =>
          eventOperations.updatePlayerPaymentAmount(
            eventId,
            cardType,
            Number(amount || 0),
          ),
        ),
      );

      onRefresh();
      setLoading(false);
      toast.success("Amounts updated successfully!");
      setTimeout(() => { 
        setOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating amounts:", error);
      setLoading(false);
      toast.error("Failed to update amounts.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-fit rounded-lg bg-[#7B3C7D] transition-colors px-4 py-2 text-white hover:bg-[#2E2A5D]">
          <Calculator className="h-4 w-4" />
          Calculate
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto">
        <SheetHeader className="pb-8">
          <Toaster position="top-right" />
          <SheetTitle className="hidden">Calculate payment amounts</SheetTitle>
        </SheetHeader>
        <SheetDescription className="hidden">
          Apply payment amounts
        </SheetDescription>
        <FfpForm
          ml={ml}
          mc={mc}
          ms={ms}
          msc={msc}
          nc={nc}
          onCalculate={handleCalculation}
        />
        <SheetFooter className="pt-4">
          {(role === "admin" || role === "fame") && (
            <Button className="w-full" onClick={handleApply} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Apply
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
