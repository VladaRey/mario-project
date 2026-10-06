"use client";
import { CalendarDays, Users, Ban, Shield, LogIn, Star, Calculator } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { Role } from "~/lib/roles";
import { useT } from "~/i18n/i18n-provider";
import { useGetRole } from "~/hooks/use-get-role";
import { usePenaltyCount } from "~/hooks/use-penalty-count";
import { GuardedLink } from "./navigation-guard";
import { useFfp } from "./ffp-launcher";
import { AccountSheet } from "./account-sheet";

export type TabKey = "events" | "players" | "penalties" | "admin" | "login" | "fame";

export function activeTab(pathname: string): TabKey | null {
  if (pathname === "/" || pathname.startsWith("/event")) return "events";
  if (pathname.startsWith("/players")) return "players";
  if (pathname.startsWith("/penalties")) return "penalties";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/login")) return "login";
  return null;
}

const item = "relative flex min-w-0 flex-col items-center gap-1 px-1 text-[11px] font-bold";

export function TabBarView({ role, active, penaltyCount, onFfp, onFame }: {
  role: Role; active: TabKey | null; penaltyCount: number; onFfp: () => void; onFame: () => void;
}) {
  const t = useT();
  const tab = (key: TabKey, href: string, Icon: typeof Users, label: string, badge?: number) => (
    <GuardedLink href={href} aria-current={active === key ? "page" : undefined}
      className={cn(item, active === key ? "text-brand-700" : "text-muted-foreground")}>
      {badge ? <span className="absolute -top-1.5 left-[calc(50%+4px)] rounded-full bg-destructive px-1.5 text-[10px] font-extrabold text-white">{badge}</span> : null}
      <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
      <span className="max-w-full truncate">{label}</span>
    </GuardedLink>
  );
  return (
    <nav aria-label={t("nav.main")}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-center border-t border-line bg-white pb-safe md:hidden"
      style={{ height: "calc(var(--tabbar-h) + env(safe-area-inset-bottom))" }}>
      {tab("events", "/", CalendarDays, t("nav.events"))}
      {tab("players", "/players", Users, t("nav.players"))}
      <button type="button" onClick={onFfp} aria-label={t("nav.ffpCalculator")} className={cn(item, "text-brand-900")}>
        <span className="-mt-[30px] flex h-[54px] w-[54px] items-center justify-center rounded-[18px] border-[3px] border-white bg-brand-900 text-white shadow-[0_6px_16px_rgba(59,31,110,0.35)]">
          <Calculator className="h-6 w-6" aria-hidden="true" />
        </span>
        <span aria-hidden="true">{t("nav.ffp")}</span>
      </button>
      {tab("penalties", "/penalties", Ban, t("nav.penalties"), penaltyCount || undefined)}
      {role === Role.Admin ? tab("admin", "/admin", Shield, t("nav.admin"))
        : role === Role.Fame ? (
          <button type="button" onClick={onFame} className={cn(item, "text-[#B3ACC6]")}>
            <Star className="h-[22px] w-[22px]" aria-hidden="true" /><span className="max-w-full truncate">{t("nav.fame")}</span>
          </button>
        ) : tab("login", "/login", LogIn, t("nav.login"))}
    </nav>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();
  const { role } = useGetRole();
  const penaltyCount = usePenaltyCount();
  const { open } = useFfp();
  const [accountOpen, setAccountOpen] = useState(false);
  return (
    <>
      <TabBarView role={role} active={activeTab(pathname)} penaltyCount={penaltyCount} onFfp={open} onFame={() => setAccountOpen(true)} />
      <AccountSheet open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}
