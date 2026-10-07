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
  // Mobile: two lines (avatar · name · paid / meta · stepper under the name). md+: one line.
  return (
    <div className="grid min-h-[56px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5 py-2 md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:gap-y-0">
      <div className="col-start-1 row-start-1 md:row-end-3">
        <PlayerAvatar name={player.name} cardType={player.cardType} />
      </div>
      <div className="col-start-2 row-start-1 truncate text-sm font-bold md:self-end">{player.name}</div>
      <div className="col-start-2 row-start-2 break-words text-xs text-muted-foreground md:self-start">{meta}</div>
      {canEdit && hasCard ? (
        <div className="col-start-3 row-start-2 justify-self-end md:row-start-1 md:row-end-3">
          <Stepper value={usage} min={0} onChange={(v) => onUsageChange(player.id, v)} label={t("event.cardUsage", { name: player.name })} />
        </div>
      ) : null}
      <div className="col-start-3 row-start-1 flex justify-self-end md:col-start-4 md:row-end-3">
        {canEdit ? (
          <button type="button" role="switch" aria-checked={paid} aria-label={t("event.paidToggle", { name: player.name })}
            onClick={() => onPaidChange(player.id, !paid)}
            // 44×26 visual, 44×40 touch area: 8px up into the row padding, 6px down into the row gap.
            className={cn("relative h-[26px] w-11 flex-none rounded-full transition-colors after:absolute after:inset-x-0 after:-bottom-1.5 after:-top-2 after:content-['']",
              paid ? "bg-coral" : "bg-[#D8D2E6]")}>
            <span className={cn("absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all", paid ? "right-[3px]" : "left-[3px]")} />
          </button>
        ) : (
          <Chip tone={paid ? "success" : "warning"}>{paid ? t("event.paid") : t("event.unpaid")}</Chip>
        )}
      </div>
    </div>
  );
}
