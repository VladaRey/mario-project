"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { DefaultAdminValuesForm } from "./default-admin-values-form.component";
import {
  DefaultAdminValuesOperations,
  type DefaultAdminValues,
} from "~/lib/db"; 
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";


interface DefaultValuesAdminSheetProps {
  triggerButton?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DefaultValuesAdminSheet({
  triggerButton,
  open,
  onOpenChange,
}: DefaultValuesAdminSheetProps) {
  const [formValue, setFormValue] = useState<DefaultAdminValues | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // fetch data
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const data = await DefaultAdminValuesOperations.getDefaultAdminValues();
        setFormValue(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [open]);

  // update data
  const handleApply = async () => {
    if (!formValue) return;

    setIsSaving(true);
    const { id, ...values } = formValue;
    try{
      await DefaultAdminValuesOperations.updateDefaultAdminValues(id, values);
      toast.success("Default values successfully updated!")
    } catch (error) {
      console.error("Error updating player payment amounts:", error);
      toast.error("Failed to update player payment amounts.");
    } finally {
      setIsSaving(false);
    }

    console.log("Updated values:", formValue);
    setTimeout(() => {
      onOpenChange(false);
    }, 900);
  };

  if (!formValue) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger>{triggerButton}</SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle className="hidden">Default values</SheetTitle>
          <SheetDescription className="hidden">
            Default values for calculation pricing
          </SheetDescription>
        </SheetHeader>

        <DefaultAdminValuesForm value={formValue} onChange={setFormValue} />

        <SheetFooter className="pt-4">
          <Button
            className="w-full"
            onClick={handleApply}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
