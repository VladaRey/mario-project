"use client";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { Chip } from "~/components/ds/chip";
import { Stepper } from "~/components/ds/stepper";
import type { Player } from "~/lib/db";
import { useT } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";

export function PlayerPaymentRow({ player, paid, canEdit, onPaidChange, amount, usage, onUsageChange }: {
  player: Player; paid: boolean; canEdit: boolean; onPaidChange: (id: string, paid: boolean) => void;
  amount?: number; usage: number; onUsageChange: (id: string, usage: number) => void;
}) {
  const t = useT();
  const hasCard = player.cardType !== "No card";
  const meta = [t(`cardType.${player.cardType}`), amount != null ? t("common.pln", { value: amount }) : null,
    !canEdit && hasCard && usage > 0 ? t("event.cardUse", { count: usage }) : null].filter(Boolean).join(" · ");
  return (
    <div className="flex min-h-[56px] items-center gap-2.5 py-2">
      <PlayerAvatar name={player.name} cardType={player.cardType} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{player.name}</div>
        <div className="truncate text-xs text-muted-foreground">{meta}</div>
      </div>
      {canEdit && hasCard ? (
        <Stepper value={usage} min={0} onChange={(v) => onUsageChange(player.id, v)} label={t("event.cardUsage", { name: player.name })} />
      ) : null}
      {canEdit ? (
        <button type="button" role="switch" aria-checked={paid} aria-label={t("event.paidToggle", { name: player.name })}
          onClick={() => onPaidChange(player.id, !paid)}
          className={cn("relative h-[26px] w-11 flex-none rounded-full transition-colors", paid ? "bg-coral" : "bg-[#D8D2E6]")}>
          <span className={cn("absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all", paid ? "right-[3px]" : "left-[3px]")} />
        </button>
      ) : (
        <Chip tone={paid ? "success" : "warning"}>{paid ? t("event.paid") : t("event.unpaid")}</Chip>
      )}
    </div>
  );
}
