"use client";

import { useT } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";

type ConfirmDialogProps = {
  trigger?: React.ReactNode;
  onConfirm: () => void;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  title?: string;
  /** When set, dialog is controlled by open/onOpenChange instead of trigger */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  confirmVariant?: "default" | "destructive";
};

export const ConfirmDialog = ({
  trigger,
  onConfirm,
  description,
  confirmLabel,
  cancelLabel,
  title,
  open,
  onOpenChange,
  confirmVariant = "default",
}: ConfirmDialogProps) => {
  const t = useT();
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const confirmClassName =
    confirmVariant === "destructive"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : undefined;

  const content = (
    <AlertDialogContent className="w-[calc(100%-32px)] max-w-[400px] rounded-3xl sm:rounded-3xl">
      <AlertDialogHeader>
        <AlertDialogTitle>{title ?? t("common.areYouSure")}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex-row gap-2 sm:space-x-0">
        <AlertDialogCancel className="flex-1 rounded-xl">
          {cancelLabel ?? t("common.cancel")}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={() => {
            onConfirm();
            if (isControlled) onOpenChange(false);
          }}
          className={cn("flex-1 rounded-xl", confirmClassName)}
        >
          {confirmLabel ?? t("common.confirm")}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (isControlled) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {content}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      {content}
    </AlertDialog>
  );
};