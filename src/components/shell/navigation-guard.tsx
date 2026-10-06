"use client";
import Link, { type LinkProps } from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { useT } from "~/i18n/i18n-provider";

type Guard = { setDirty: (v: boolean) => void; confirmLeave: () => boolean };
const GuardContext = createContext<Guard>({ setDirty: () => undefined, confirmLeave: () => true });

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const dirty = useRef(false);
  const setDirty = useCallback((v: boolean) => { dirty.current = v; }, []);
  const confirmLeave = useCallback(() => {
    if (!dirty.current) return true;
    const ok = window.confirm(t("common.leaveUnsaved"));
    if (ok) dirty.current = false;
    return ok;
  }, [t]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return <GuardContext.Provider value={{ setDirty, confirmLeave }}>{children}</GuardContext.Provider>;
}

export const useNavigationGuard = () => useContext(GuardContext);

export function useLeaveGuard(dirty: boolean) {
  const { setDirty } = useNavigationGuard();
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);
}

type GuardedLinkProps = LinkProps & { className?: string; children: React.ReactNode; "aria-label"?: string; "aria-current"?: "page" | undefined };

export function GuardedLink({ children, onClick, ...props }: GuardedLinkProps & { onClick?: React.MouseEventHandler<HTMLAnchorElement> }) {
  const { confirmLeave } = useNavigationGuard();
  return (
    <Link {...props} onClick={(e) => { if (!confirmLeave()) { e.preventDefault(); return; } onClick?.(e); }}>
      {children}
    </Link>
  );
}
