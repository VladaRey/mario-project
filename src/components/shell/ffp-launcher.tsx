"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { ResponsiveSheet } from "~/components/ds/responsive-sheet";
import { FfpForm } from "~/components/ffp-form.component";
import { useT } from "~/i18n/i18n-provider";

const FfpContext = createContext<{ open: () => void }>({ open: () => undefined });

export function FfpProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const [isOpen, setOpen] = useState(false);
  const value = useMemo(() => ({ open: () => setOpen(true) }), []);
  return (
    <FfpContext.Provider value={value}>
      {children}
      <ResponsiveSheet open={isOpen} onOpenChange={setOpen} title={t("nav.ffpCalculator")} desktop="dialog">
        {isOpen ? <FfpForm /> : null}
      </ResponsiveSheet>
    </FfpContext.Provider>
  );
}

export const useFfp = () => useContext(FfpContext);
