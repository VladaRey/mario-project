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
  confirmLabel = "Confirm",
  title = "Are you sure?",
  open,
  onOpenChange,
  confirmVariant = "default",
}: ConfirmDialogProps) => {
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const confirmClassName =
    confirmVariant === "destructive"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : undefined;

  const content = (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => {
            onConfirm();
            if (isControlled) onOpenChange(false);
          }}
          className={confirmClassName}
        >
          {confirmLabel}
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