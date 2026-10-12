"use client";
import { Calculator } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { Role } from "~/lib/roles";
import { useT } from "~/i18n/i18n-provider";
import { useGetRole } from "~/hooks/use-get-role";
import { usePenaltyCount } from "~/hooks/use-penalty-count";
import { activeTab, type TabKey } from "./bottom-tab-bar";
import { GuardedLink } from "./navigation-guard";
import { useFfp } from "./ffp-launcher";
import { LangSwitch } from "./lang-switch";
import { AccountMenu } from "./account-menu";

export function DesktopTopBar() {
  const t = useT();
  const pathname = usePathname();
  const active = activeTab(pathname);
  const { role } = useGetRole();
  const penaltyCount = usePenaltyCount();
  const { open } = useFfp();
  const link = (key: TabKey, href: string, label: string, badge?: number) => (
    <GuardedLink href={href} aria-current={active === key ? "page" : undefined}
      className={cn("flex h-full items-center gap-1.5 whitespace-nowrap px-2.5 lg:px-3.5", active === key ? "text-white shadow-[inset_0_-3px_0_hsl(var(--coral))]" : "text-[#D9CCF0] hover:text-white")}>
      {label}{badge ? <span className="rounded-full bg-destructive px-[7px] text-[11px] text-white">{badge}</span> : null}
    </GuardedLink>
  );
  return (
    <header className="sticky top-0 z-40 hidden bg-brand-900 text-white md:block">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5 lg:gap-10 lg:px-8">
        <GuardedLink href="/" aria-label="Mario Group" className="flex flex-none items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-coral font-extrabold text-ink">M</span>
          <span className="hidden text-[17px] font-extrabold lg:inline">Mario Group</span>
        </GuardedLink>
        <nav aria-label={t("nav.main")} className="flex h-full items-center gap-1 text-sm font-bold">
          {link("events", "/", t("nav.events"))}
          {link("players", "/players", t("nav.players"))}
          {link("penalties", "/penalties", t("nav.penalties"), penaltyCount || undefined)}
          {role === Role.Admin ? link("admin", "/admin", t("nav.admin")) : null}
        </nav>
        <div className="ml-auto flex flex-none items-center gap-2.5">
          <button type="button" onClick={open} aria-label={t("nav.ffpCalculator")}
            className="flex h-10 w-10 items-center justify-center gap-2 rounded-xl bg-coral text-sm font-extrabold text-ink lg:w-auto lg:px-3.5">
            <Calculator className="h-[18px] w-[18px]" /><span className="hidden whitespace-nowrap lg:inline">{t("nav.ffpCalculator")}</span>
          </button>
          <LangSwitch className="h-10 items-center" />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
