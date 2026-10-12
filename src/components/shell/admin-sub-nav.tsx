"use client";
import { cn } from "~/lib/utils";
import { useT } from "~/i18n/i18n-provider";
import { GuardedLink } from "./navigation-guard";

export type AdminSection = "events" | "players" | "reservations" | "penalties" | "defaults";
const ITEMS: { key: AdminSection; href: string }[] = [
  { key: "events", href: "/admin/events" }, { key: "players", href: "/admin/players" },
  { key: "reservations", href: "/admin/reservations" }, { key: "penalties", href: "/admin/penalties" },
  { key: "defaults", href: "/admin/defaults" },
];

export function AdminSubNav({ active }: { active?: AdminSection }) {
  const t = useT();
  return (
    <div className="border-b border-line bg-white">
      <nav aria-label={t("admin.nav")} className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-3 py-2 text-[13px] font-bold md:px-[18px] md:py-0 md:text-sm">
        {ITEMS.map((i) => (
          <GuardedLink key={i.key} href={i.href} aria-current={active === i.key ? "page" : undefined}
            className={cn("whitespace-nowrap rounded-full px-3 py-[7px] md:rounded-none md:px-3.5 md:py-3",
              active === i.key ? "bg-brand-50 text-brand-700 md:bg-transparent md:shadow-[inset_0_-2px_0_#5B2D8C]" : "text-muted-foreground")}>
            {t(`admin.${i.key}`)}
          </GuardedLink>
        ))}
      </nav>
    </div>
  );
}
