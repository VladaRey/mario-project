"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Dices, Pencil, Plus } from "lucide-react";
import { eventOperations, type Event } from "~/lib/db";
import { Role } from "~/lib/roles";
import { useGetRole } from "~/hooks/use-get-role";
import { useI18n } from "~/i18n/i18n-provider";
import { Button } from "~/components/ui/button";
import { Chip } from "~/components/ds/chip";
import { DateTile } from "~/components/ds/date-tile";
import { EmptyState } from "~/components/ds/empty-state";
import { SectionLabel } from "~/components/ds/section-label";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { flattenEvents, paidSummary } from "~/utils/event-view";

export function EventsList({ variant }: { variant: "public" | "admin" }) {
  const { t, fmt } = useI18n();
  const { role } = useGetRole();
  const canSeePaid = role === Role.Admin || role === Role.Fame;
  const [events, setEvents] = useState<Event[] | null>(null);

  useEffect(() => {
    eventOperations.getAllEvents().then((g) => setEvents(flattenEvents(g))).catch(() => setEvents([]));
  }, []);

  if (!events) return <SkeletonRows count={4} />;

  if (!events.length) {
    return (
      <EmptyState icon={<CalendarDays className="h-8 w-8" />} title={t("home.emptyTitle")} text={t("home.emptyText")}
        action={role === Role.Admin ? <Button asChild size="sm"><GuardedLink href="/admin/event"><Plus />{t("home.newEvent")}</GuardedLink></Button> : undefined} />
    );
  }

  const paidChips = (e: Event, onDark = false) => {
    if (!canSeePaid) return null;
    const s = paidSummary(e.players);
    return (
      <>
        <Chip tone={onDark ? "onDark" : "success"}>{t("home.paidOf", { paid: s.paid, total: s.total })}</Chip>
        {s.unpaid > 0 ? <Chip tone={onDark ? "onDark" : "warning"}>{t("home.unpaid", { count: s.unpaid })}</Chip> : null}
      </>
    );
  };

  const row = (e: Event) => (
    <div key={e.id} className="flex flex-col gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 md:rounded-2xl md:px-4 md:py-3.5">
      <GuardedLink href={variant === "admin" ? `/admin/event/${e.id}` : `/event/${e.id}`} className="flex items-center gap-3">
        <DateTile date={e.date} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold">{e.name}</div>
          <div className="text-xs text-muted-foreground">{t("common.players", { count: e.players.length })}</div>
        </div>
        <span className="hidden gap-1.5 sm:flex">{paidChips(e)}</span>
        {variant === "public" ? <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" /> : null}
      </GuardedLink>
      {variant === "admin" ? (
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1"><GuardedLink href={`/admin/event/${e.id}`}><Pencil />{t("common.edit")}</GuardedLink></Button>
          <Button asChild variant="outline" size="sm" className="flex-1"><GuardedLink href={`/event/${e.id}/lottery`}><Dices />{t("home.lottery")}</GuardedLink></Button>
        </div>
      ) : null}
    </div>
  );

  if (variant === "admin") return <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">{events.map(row)}</div>;

  const [latest, ...earlier] = events;
  return (
    <div className="flex flex-col gap-3 md:gap-5">
      {latest ? (
        <section className="flex flex-col gap-3 rounded-[20px] bg-brand-900 p-[18px] text-white md:flex-row md:items-center md:gap-6 md:border md:border-line md:bg-white md:p-6 md:text-ink">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#D9CCF0] md:text-xs md:font-extrabold md:text-brand-700">
              {t("home.latest", { date: fmt(latest.date, "EEE d MMM") })}
            </div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">{latest.name}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip tone="onDark" className="md:bg-brand-50 md:text-brand-700">{t("common.players", { count: latest.players.length })}</Chip>
              <span className="contents md:hidden">{paidChips(latest, true)}</span>
              <span className="hidden gap-1.5 md:flex">{paidChips(latest)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 border-white/40 bg-transparent text-white hover:bg-white/10 md:flex-none md:border-line md:bg-white md:text-ink">
              <GuardedLink href={`/event/${latest.id}/lottery`}><Dices />{t("home.lottery")}</GuardedLink>
            </Button>
            <Button asChild className="flex-1 bg-white text-brand-900 hover:bg-white/90 md:flex-none md:bg-brand-900 md:text-white">
              <GuardedLink href={`/event/${latest.id}`}>{t("home.open")}</GuardedLink>
            </Button>
          </div>
        </section>
      ) : null}
      {earlier.length ? (
        <>
          <SectionLabel className="mt-1">{t("home.earlier")}</SectionLabel>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3 lg:grid-cols-3">{earlier.map(row)}</div>
        </>
      ) : null}
    </div>
  );
}
