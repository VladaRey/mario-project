"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { withAdminLayout } from "~/components/with-admin-layout";
import { MultiSelect } from "~/components/multi-select";
import { ConfirmDialog } from "~/components/confirmation-dialog";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { ListCard, ListRow } from "~/components/ds/list";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { SectionLabel } from "~/components/ds/section-label";
import { EmptyState } from "~/components/ds/empty-state";
import { Button } from "~/components/ui/button";
import { playerOperations, type Player } from "~/lib/db";
import { isPenalized, settleEach } from "~/utils/penalty-util";
import { daysSince } from "~/i18n/translate";
import { useI18n } from "~/i18n/i18n-provider";

function PenaltiesPage() {
  const { t, fmt } = useI18n();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = async () => {
    try {
      setPlayers(await playerOperations.getAllPlayers());
    } catch (error) {
      console.error("Failed to load players:", error);
      toast.error(t("adminPen.loadFailed"));
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const penalized = players.filter(isPenalized);
  const options = players
    .filter((p) => !isPenalized(p))
    .map((p) => ({ value: p.id, label: p.name, cardType: p.cardType }));

  const handleAdd = async () => {
    setIsSaving(true);
    const { succeeded, failed } = await settleEach(selected, (id) =>
      playerOperations.addPenalty(id),
    );
    if (failed.length > 0) {
      toast.error(
        t("adminPen.addedSome", {
          ok: succeeded.length,
          total: selected.length,
          failed: failed.length,
        }),
      );
    } else {
      toast.success(t("adminPen.addedAll", { count: succeeded.length }));
    }
    setSelected(failed);
    await refresh();
    setIsSaving(false);
  };

  const handleRemove = async (player: Player) => {
    try {
      await playerOperations.removePenalty(player.id);
      toast.success(t("adminPen.removed", { name: player.name }));
      await refresh();
    } catch (error) {
      console.error("Failed to remove penalty:", error);
      toast.error(t("adminPen.removeFailed"));
    }
  };

  return (
    <>
      <ScreenHeader title={t("adminPen.title")} adminSection="penalties"
        meta={<GuardedLink href="/penalties" className="font-bold text-brand-700 underline">{t("adminPen.public")}</GuardedLink>} />
      <PageBody>
        <section className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-3.5 md:flex-row md:items-end md:p-[18px]">
          <div className="flex flex-1 flex-col gap-1.5">
            <SectionLabel>{t("adminPen.add")}</SectionLabel>
            <MultiSelect options={options} selected={selected} onChange={setSelected} placeholder={t("picker.placeholder")} />
          </div>
          <Button onClick={handleAdd} disabled={selected.length === 0 || isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : null}{t("adminPen.addButton")}</Button>
        </section>
        {penalized.length === 0 ? <EmptyState title={t("adminPen.empty")} /> : (
          <>
            <SectionLabel>{t("adminPen.onList", { count: penalized.length })}</SectionLabel>
            <ListCard className="md:grid md:grid-cols-2 md:gap-x-8 md:divide-y-0">
              {penalized.map((player) => (
                <ListRow key={player.id} className="md:border-b md:border-[#F0ECF7]"
                  leading={<PlayerAvatar name={player.name} cardType={player.cardType} />}
                  title={player.name}
                  meta={t("adminPen.since", { date: fmt(player.penalty_since!, "dd.MM.yyyy"), days: t("penalties.days", { count: daysSince(player.penalty_since!) }) })}
                  trailing={
                    <ConfirmDialog
                      trigger={<Button size="sm" variant="outline" className="border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]"><Check />{t("adminPen.paid")}</Button>}
                      title={t("adminPen.paidTitle", { name: player.name })} description={t("adminPen.paidText")}
                      confirmLabel={t("adminPen.paidConfirm")} onConfirm={() => void handleRemove(player)} />
                  } />
              ))}
            </ListCard>
          </>
        )}
      </PageBody>
    </>
  );
}

export default withAdminLayout(PenaltiesPage);
