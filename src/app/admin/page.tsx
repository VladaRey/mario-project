"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CalendarDays, ChevronRight, List, LogOut, Plus, Shield, SlidersHorizontal, Users } from "lucide-react";
import { withAdminLayout } from "~/components/with-admin-layout";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { Button } from "~/components/ui/button";
import { DefaultAdminValuesOperations, eventOperations, playerOperations, reservationOperations, type DefaultAdminValues } from "~/lib/db";
import { isPenalized } from "~/utils/penalty-util";
import { flattenEvents } from "~/utils/event-view";
import { useI18n } from "~/i18n/i18n-provider";
import { useGetRole } from "~/hooks/use-get-role";
import { cn } from "~/lib/utils";

type Stats = { latest?: string; players: number; reservations: string[]; penalties: number; defaults?: DefaultAdminValues };

function Tile({ href, icon, title, meta, danger, wide }: { href: string; icon: React.ReactNode; title: string; meta: string; danger?: boolean; wide?: boolean }) {
  return (
    <GuardedLink href={href} className={cn("flex gap-3 rounded-2xl border border-line bg-white p-3.5 hover:bg-brand-50/50", wide ? "col-span-2 items-center md:col-span-3" : "flex-col")}>
      <span className={cn("flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl", danger ? "bg-danger-soft text-danger-ink" : "bg-brand-50 text-brand-700")}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-extrabold">{title}</span>
        <span className={cn("block truncate text-xs", danger ? "font-bold text-danger-ink" : "text-muted-foreground")}>{meta}</span>
      </span>
      {wide ? <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" /> : null}
    </GuardedLink>
  );
}

function AdminHub() {
  const { t, fmt } = useI18n();
  const router = useRouter();
  const { logout } = useGetRole();
  const [s, setS] = useState<Stats>({ players: 0, reservations: [], penalties: 0 });

  useEffect(() => {
    void Promise.all([
      eventOperations.getAllEvents(), playerOperations.getAllPlayers(),
      reservationOperations.getAllReservationLists(), DefaultAdminValuesOperations.getDefaultAdminValues(),
    ]).then(([events, players, reservations, defaults]) => setS({
      latest: flattenEvents(events)[0]?.date,
      players: players.length,
      reservations: reservations.map((r) => r.name),
      penalties: players.filter(isPenalized).length,
      defaults,
    })).catch(() => undefined);
  }, []);

  const add = <Button asChild size="sm" className="md:h-11 md:px-4"><GuardedLink href="/admin/event"><Plus />{t("hub.newEvent")}</GuardedLink></Button>;

  return (
    <>
      <ScreenHeader title={t("hub.title")} actions={add} mobileTitleAside={add} />
      <PageBody>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
          <Tile href="/admin/events" icon={<CalendarDays className="h-5 w-5" />} title={t("admin.events")}
            meta={s.latest ? t("hub.eventsMeta", { date: fmt(s.latest, "EEE d MMM") }) : t("hub.noEvents")} />
          <Tile href="/admin/players" icon={<Users className="h-5 w-5" />} title={t("admin.players")} meta={t("hub.playersMeta", { count: s.players })} />
          <Tile href="/admin/reservations" icon={<List className="h-5 w-5" />} title={t("admin.reservations")} meta={s.reservations.join(" · ") || "—"} />
          <Tile href="/admin/penalties" icon={<Ban className="h-5 w-5" />} title={t("admin.penalties")} danger={s.penalties > 0}
            meta={s.penalties ? t("hub.penaltiesMeta", { count: s.penalties }) : t("hub.noPenalties")} />
          <Tile wide href="/admin/defaults" icon={<SlidersHorizontal className="h-5 w-5" />} title={t("hub.defaults")}
            meta={s.defaults ? t("hub.defaultsMeta", { price: s.defaults.price_per_hour, hours: s.defaults.hours, discount: s.defaults.discount_per_usage }) : "—"} />
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-line pt-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-900 text-white"><Shield className="h-4 w-4" /></span>
            <span><span className="block text-sm font-extrabold">{t("account.loggedInAs", { role: t("role.admin") })}</span>
              <span className="text-xs text-muted-foreground">{t("account.onThisDevice")}</span></span>
          </div>
          <Button variant="outline" size="sm" onClick={() => { logout(); router.push("/"); }}><LogOut />{t("account.logout")}</Button>
        </div>
      </PageBody>
    </>
  );
}

export default withAdminLayout(AdminHub);
