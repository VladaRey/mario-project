"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { playerOperations, type Player } from "~/lib/db";
import { isPenalized } from "~/utils/penalty-util";
import { daysSince } from "~/i18n/translate";
import { useI18n } from "~/i18n/i18n-provider";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { ListCard, ListRow } from "~/components/ds/list";
import { Chip } from "~/components/ds/chip";
import { SectionLabel } from "~/components/ds/section-label";
import { EmptyState } from "~/components/ds/empty-state";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { Button } from "~/components/ui/button";

export default function PenaltiesPage() {
  const { t, fmt } = useI18n();
  const { role } = useGetRole();
  const [players, setPlayers] = useState<Player[] | null>(null);

  useEffect(() => {
    playerOperations.getAllPlayers()
      .then((ps) => setPlayers(ps.filter(isPenalized).sort((a, b) => (b.penalty_since ?? "").localeCompare(a.penalty_since ?? ""))))
      .catch(() => setPlayers([]));
  }, []);

  const manage = role === Role.Admin
    ? <Button asChild size="sm" className="md:h-11"><GuardedLink href="/admin/penalties"><Shield />{t("penalties.manage")}</GuardedLink></Button>
    : undefined;

  const explanation = (
    <section className="flex gap-3 rounded-2xl border border-warn-line bg-warn-bg p-3.5 text-warn-ink md:flex-col md:p-5">
      <AlertTriangle className="mt-0.5 h-[22px] w-[22px] flex-none text-[#C2410C]" aria-hidden="true" />
      <div className="flex flex-col gap-1.5 text-sm leading-relaxed">
        <h2 className="text-[15px] font-extrabold text-[#9A3412] md:text-[17px]">{t("penalties.whatTitle")}</h2>
        <p>{t("penalties.what1")}</p>
        <p>{t("penalties.what2")}</p>
      </div>
    </section>
  );

  return (
    <>
      <ScreenHeader title={t("penalties.title")} actions={manage} mobileTitleAside={manage} />
      <PageBody>
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:gap-5">
          <div className="md:sticky md:top-24 md:flex-[1_1_360px]">{explanation}</div>
          <div className="flex flex-col gap-2 md:flex-[999_1_520px]">
            {players === null ? <SkeletonRows count={3} /> : players.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="h-8 w-8 text-[#16A34A]" />} title={t("penalties.emptyTitle")} text={t("penalties.emptyText")} />
            ) : (
              <>
                <SectionLabel>{t("penalties.count", { count: players.length })}</SectionLabel>
                <ListCard>
                  {players.map((p) => (
                    <ListRow key={p.id} href={`/players/player/${p.id}`}
                      title={p.name}
                      meta={t("penalties.since", { date: fmt(p.penalty_since!, "dd.MM.yyyy") })}
                      trailing={<Chip tone="danger" className="text-xs">{t("penalties.days", { count: daysSince(p.penalty_since!) })}</Chip>} />
                  ))}
                </ListCard>
              </>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}
