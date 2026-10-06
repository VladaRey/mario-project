"use client";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "~/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui/dialog";
import { useIsDesktop } from "~/hooks/use-media-query";
import { useT } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";

type Props = {
  open: boolean; onOpenChange: (open: boolean) => void;
  title: string; description?: string; desktop?: "right" | "dialog";
  footer?: React.ReactNode; children: React.ReactNode;
};

function Header({ title, description, onClose }: { title: string; description?: string; onClose: () => void }) {
  const t = useT();
  return (
    <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-3 md:px-6 md:pt-5">
      <div className="min-w-0">
        <div className="text-[22px] font-extrabold tracking-tight">{title}</div>
        {description ? <div className="mt-0.5 text-[13px] text-muted-foreground">{description}</div> : null}
      </div>
      <button type="button" onClick={onClose} aria-label={t("common.close")}
        className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#ECE7F6] text-ink"><X className="h-[18px] w-[18px]" /></button>
    </div>
  );
}

export function ResponsiveSheet({ open, onOpenChange, title, description, desktop = "right", footer, children }: Props) {
  const isDesktop = useIsDesktop();
  const close = () => onOpenChange(false);
  const body = (
    <>
      <Header title={title} description={description} onClose={close} />
      <div className="flex-1 px-4 pb-4 md:px-6">{children}</div>
      {footer ? <div className="sticky bottom-0 border-t border-line bg-white px-4 py-3 md:px-6">{footer}</div> : null}
    </>
  );

  if (isDesktop && desktop === "dialog") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[88vh] w-[860px] max-w-[calc(100%-32px)] gap-0 overflow-y-auto rounded-3xl bg-background p-0 sm:rounded-3xl [&>button.absolute]:hidden">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {description ? <DialogDescription className="sr-only">{description}</DialogDescription> : null}
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isDesktop ? "right" : "bottom"} className={cn("flex flex-col")}>
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {description ? <SheetDescription className="sr-only">{description}</SheetDescription> : <SheetDescription className="sr-only">{title}</SheetDescription>}
        {!isDesktop ? <div className="flex justify-center pt-2"><span className="h-1 w-10 rounded-full bg-[#D8D2E6]" /></div> : null}
        {body}
      </SheetContent>
    </Sheet>
  );
}
